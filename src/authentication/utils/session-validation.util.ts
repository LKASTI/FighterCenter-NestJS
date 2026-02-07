import { UnauthorizedException } from '@nestjs/common';

/**
 * Validates that the user session has the required userId field
 * Throws UnauthorizedException if the field is missing
 *
 * @param req - The request object containing the user session
 * @returns The validated userId
 * @throws UnauthorizedException if userId is missing
 */
export function validateUserSession(req: any): string {
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedException(
      'Your session is missing required user information. Please log out and log back in to refresh your session.',
    );
  }

  return userId;
}
