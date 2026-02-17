import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { CookieExpiredError } from "../types/buckler.types";

const BUCKLER_BASE_URL = "https://www.streetfighter.com/6/buckler";

const BROWSER_HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "dnt": "1",
    "sec-ch-ua": '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
};

/** Default delay between requests in milliseconds */
const DEFAULT_RATE_LIMIT_MS = 1000;

/** Retry config for transient errors (502, 503) */
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 5000;
const RETRYABLE_STATUS_CODES = [502, 503];

@Injectable()
export class BucklerHttpService {
    private readonly logger = new Logger(BucklerHttpService.name);
    private lastRequestTime = 0;

    constructor(
        private readonly httpService: HttpService,
    ) {}

    /**
     * Fetch a page from the Buckler website with authentication cookies.
     *
     * Handles rate limiting (default 1s between requests), cookie expiry
     * detection, and retry with exponential backoff for transient errors
     * (502, 503). Retries up to 3 times with 5s/10s/20s delays.
     *
     * @param path - URL path relative to Buckler base (e.g., "/ranking/master")
     * @param cookies - Authentication cookies from BucklerAuthService
     * @param params - Optional query parameters
     * @param rateLimitMs - Delay between requests (default 1000ms)
     * @returns Raw HTML string of the page
     * @throws CookieExpiredError if the response indicates expired cookies
     */
    async fetchPage(
        path: string,
        cookies: Record<string, string>,
        params?: Record<string, string>,
        rateLimitMs: number = DEFAULT_RATE_LIMIT_MS,
    ): Promise<string> {
        const url = `${BUCKLER_BASE_URL}${path}`;
        const cookieHeader = Object.entries(cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join("; ");

        let lastError: any;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            // Rate limiting: wait if we're requesting too fast
            const timeSinceLastRequest = Date.now() - this.lastRequestTime;
            if (timeSinceLastRequest < rateLimitMs) {
                const waitTime = rateLimitMs - timeSinceLastRequest;
                await new Promise((resolve) => setTimeout(resolve, waitTime));
            }

            try {
                const response = await firstValueFrom(
                    this.httpService.get<string>(url, {
                        headers: {
                            ...BROWSER_HEADERS,
                            cookie: cookieHeader,
                        },
                        params,
                        maxRedirects: 0,
                        validateStatus: (status) => status < 400,
                        responseType: "text",
                    }),
                );

                this.lastRequestTime = Date.now();
                return response.data;
            } catch (error) {
                this.lastRequestTime = Date.now();
                lastError = error;

                // Re-throw CookieExpiredError as-is (not retryable)
                if (error instanceof CookieExpiredError) {
                    throw error;
                }

                // 403: cookie expiry (not retryable)
                if (error?.response?.status === 403) {
                    throw new CookieExpiredError(
                        undefined,
                        `Buckler returned 403 Forbidden for ${path}`,
                    );
                }

                // Redirect to login (not retryable)
                if (error?.response?.status === 302 || error?.response?.status === 301) {
                    const location = error.response.headers?.location || "";
                    if (location.includes("auth") || location.includes("login")) {
                        throw new CookieExpiredError(
                            undefined,
                            `Buckler redirected to ${location}`,
                        );
                    }
                }

                // Retry on transient errors (502, 503)
                if (attempt < MAX_RETRIES && RETRYABLE_STATUS_CODES.includes(error?.response?.status)) {
                    const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
                    this.logger.warn(
                        `Buckler returned ${error.response.status} for ${path} (attempt ${attempt + 1}/${MAX_RETRIES + 1}). Retrying in ${delay / 1000}s...`,
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }

                throw error;
            }
        }

        throw lastError;
    }
}
