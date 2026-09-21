import type { User } from '../types';

const STORAGE_KEY = 'flydo-remembered-accounts-v1';
const MAX_REMEMBERED_ACCOUNTS = 4;

export interface RememberedAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  lastUsedAt: string;
}

function isRememberedAccount(value: unknown): value is RememberedAccount {
  if (!value || typeof value !== 'object') return false;
  const account = value as Partial<RememberedAccount>;
  return Boolean(
    account.id
    && account.name
    && account.email
    && typeof account.id === 'string'
    && typeof account.name === 'string'
    && typeof account.email === 'string',
  );
}

export function getRememberedAccounts(): RememberedAccount[] {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRememberedAccount).slice(0, MAX_REMEMBERED_ACCOUNTS);
  } catch {
    return [];
  }
}

export function rememberAccount(user: User): RememberedAccount[] {
  if (typeof window === 'undefined') return [];

  const account: RememberedAccount = {
    id: user.id,
    name: user.name || user.email.split('@')[0],
    email: user.email,
    avatarUrl: user.avatarUrl || undefined,
    lastUsedAt: new Date().toISOString(),
  };
  const next = [
    account,
    ...getRememberedAccounts().filter((item) => item.id !== account.id && item.email !== account.email),
  ].slice(0, MAX_REMEMBERED_ACCOUNTS);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function forgetRememberedAccount(accountId: string): RememberedAccount[] {
  if (typeof window === 'undefined') return [];
  const next = getRememberedAccounts().filter((item) => item.id !== accountId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

