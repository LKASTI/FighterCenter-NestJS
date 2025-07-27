export interface StartggRefreshTokenResponse {
    encryptedAccessToken: string;
    encryptedRefreshToken: string;
    expiresIn: number;
}