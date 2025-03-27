/**
 * Validates the token format.
 * @param token - The token to validate.
 * @returns True if the token is valid, false otherwise.
 */
export function isValidToken(token: string): boolean {
  // This regex checks if it's a valid UUID.
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token); // Returns true if the token matches the UUID pattern
}
