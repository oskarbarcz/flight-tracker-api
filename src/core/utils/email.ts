/**
 * Email addresses are compared case-insensitively everywhere, so they are also
 * stored in one canonical form — otherwise an address accepted by a uniqueness
 * check could not be found again by a lookup.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
