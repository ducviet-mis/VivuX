export type UserRole = 'teacher' | 'student';
export type AccountTier = 'flygo' | 'flymax' | 'flyinfinity';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  role: UserRole;
  avatarUrl?: string;
  accountTier: AccountTier;
  subscriptionStartedAt?: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
}
