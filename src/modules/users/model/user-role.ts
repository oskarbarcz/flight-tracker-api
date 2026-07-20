export const UserRole = {
  CabinCrew: 'CabinCrew',
  Operations: 'Operations',
  Admin: 'Admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
