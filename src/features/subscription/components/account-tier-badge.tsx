import { Crown, Infinity as InfinityIcon, PlaneTakeoff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCOUNT_TIER_META } from '../config';
import type { AccountTier } from '../types';

interface AccountTierBadgeProps {
  tier: AccountTier;
  className?: string;
  compact?: boolean;
}

const TIER_STYLE: Record<AccountTier, string> = {
  flygo: 'border-border bg-muted text-foreground',
  flymax: 'border-primary/25 bg-primary-soft text-primary',
  flyinfinity: 'border-special/30 bg-special-soft text-special',
};

export function AccountTierBadge({ tier, className, compact = false }: AccountTierBadgeProps) {
  const Icon = tier === 'flyinfinity' ? InfinityIcon : tier === 'flymax' ? Crown : PlaneTakeoff;

  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold leading-none',
        TIER_STYLE[tier],
        className,
      )}
      aria-label={`Loại tài khoản: ${ACCOUNT_TIER_META[tier].name}`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {compact ? ACCOUNT_TIER_META[tier].name.replace('Fly', '') : ACCOUNT_TIER_META[tier].name}
    </span>
  );
}
