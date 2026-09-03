export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}
