import { UnauthorizedException } from '@nestjs/common';

/**
 * Validates that the user session has the required startggUserID field
 * Throws UnauthorizedException if the field is missing
 *
 * @param req - The request object containing the user session
 * @returns The validated startggUserID
 * @throws UnauthorizedException if startggUserID is missing
 */
export function validateUserSession(req: any): string {
  const startggUserID = req.user?.startggUserID;

  if (!startggUserID) {
    throw new UnauthorizedException(
      'Your session is missing required user information. Please log out and log back in to refresh your session.',
    );
  }

  return startggUserID;
}
