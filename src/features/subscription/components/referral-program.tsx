'use client';

import { useState } from 'react';
import { Copy, Gift, Percent, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { clampReferralDiscount } from '../utils';

export function ReferralProgram() {
  const user = useAuthStore((state) => state.user);
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const rewardDays = Math.min(30, Math.max(0, user.referralRewardDays || 0));
  const discountPercent = clampReferralDiscount(user.referralDiscountPercent);

  const copyReferralCode = async () => {
    if (!user.referralCode) return;
    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary-soft/35 p-4 sm:p-5" aria-labelledby="referral-heading">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
          <UsersRound aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h3 id="referral-heading" className="font-bold text-foreground">Mời bạn bè cùng học</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Chia sẻ mã của bạn để cả hai cùng nhận tối đa 3 ngày FlyMax và thêm 5% ưu đãi cho mỗi lượt giới thiệu hợp lệ.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="rounded-xl border border-border bg-surface p-4">
          <Label htmlFor="my-referral-code" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mã giới thiệu của bạn</Label>
          <p id="my-referral-code" className="mt-1 break-all font-mono text-lg font-bold tracking-[0.12em] text-foreground">
            {user.referralCode || 'Đang tạo mã...'}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={copyReferralCode} disabled={!user.referralCode} className="min-h-11 sm:self-end">
          <Copy aria-hidden="true" className="h-4 w-4" />
          {copied ? 'Đã sao chép' : 'Sao chép mã'}
        </Button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <RewardMetric icon={Gift} label="Ngày FlyMax từ giới thiệu" value={`${rewardDays}/30 ngày`} progress={rewardDays / 30} />
        <RewardMetric icon={Percent} label="Ưu đãi đang tích lũy" value={`${discountPercent}/20%`} progress={discountPercent / 20} />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Ngày FlyMax thưởng từ giới thiệu được cộng tối đa 30 ngày cho mỗi tài khoản. Ưu đãi vẫn tiếp tục cộng 5% mỗi lượt, đến mức tối đa 20%.
      </p>
    </section>
  );
}

function RewardMetric({ icon: Icon, label, value, progress }: { icon: typeof Gift; label: string; value: string; progress: number }) {
  const width = `${Math.min(100, Math.max(0, progress * 100))}%`;

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-muted-foreground"><Icon aria-hidden="true" className="h-4 w-4 text-primary" />{label}</span>
        <span className="shrink-0 font-bold tabular-nums text-foreground">{value}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div className="h-full rounded-full bg-primary" style={{ width }} /></div>
    </div>
  );
}
