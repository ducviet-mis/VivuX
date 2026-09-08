import type { User } from '@/features/auth/types';
import type { AccountTier } from './types';

export function getEffectiveAccountTier(user: User | null | undefined): AccountTier {
  if (!user) return 'flygo';
  if (user.accountTier === 'flyinfinity') return 'flyinfinity';

  if (user.accountTier === 'flymax') {
    if (!user.subscriptionExpiresAt) return 'flymax';
    return new Date(user.subscriptionExpiresAt).getTime() > Date.now() ? 'flymax' : 'flygo';
  }

  return 'flygo';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export function formatExpiryDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function createTransferCode(userId?: string): string {
  const suffix = userId ? userId.replace(/-/g, '').slice(0, 8).toUpperCase() : 'DANGNHAP';
  return `FLYDO ${suffix}`;
}
