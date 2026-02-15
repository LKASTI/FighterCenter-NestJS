/**
 * Thrown when Buckler returns 403 or redirects to login page,
 * indicating the session cookies have expired.
 */
export class CookieExpiredError extends Error {
    constructor(
        public readonly page?: number,
        message?: string,
    ) {
        super(message || `Buckler cookies have expired${page ? ` (detected on page ${page})` : ""}`);
        this.name = "CookieExpiredError";
    }
}

/**
 * Thrown when the Buckler HTML page structure doesn't match
 * the expected CSS selectors. Indicates Capcom may have
 * updated their page layout.
 */
export class HTMLParsingError extends Error {
    constructor(
        public readonly page?: number,
        message?: string,
    ) {
        super(message || `HTML parsing failed${page ? ` on page ${page}` : ""} - expected elements not found`);
        this.name = "HTMLParsingError";
    }
}
