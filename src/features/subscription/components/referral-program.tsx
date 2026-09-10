'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Gift, Loader2, Percent, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { clampReferralDiscount } from '../utils';

export function ReferralProgram() {
  const { user, refreshUser } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  const rewardDays = Math.min(30, Math.max(0, user.referralRewardDays || 0));
  const discountPercent = clampReferralDiscount(user.referralDiscountPercent);
  const hasRedeemed = Boolean(user.referralRedeemedAt);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    setMessage(null);

    if (!normalizedCode) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mã giới thiệu.' });
      return;
    }

    setLoading(true);
    const { data, error } = await getSupabaseClient().rpc('redeem_referral_code', { p_code: normalizedCode });

    if (error) {
      const isMissingFunction = error.message.toLowerCase().includes('function') || error.code === 'PGRST202';
      setMessage({
        type: 'error',
        text: isMissingFunction ? 'Tính năng mã giới thiệu chưa được cấu hình trên Supabase.' : error.message,
      });
      setLoading(false);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.success) {
      setMessage({ type: 'error', text: result?.message || 'Mã giới thiệu không hợp lệ.' });
      setLoading(false);
      return;
    }

    await refreshUser();
    setCode('');
    setMessage({ type: 'success', text: result.message || 'Đã áp dụng mã giới thiệu.' });
    setLoading(false);
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
            Mỗi lượt giới thiệu hợp lệ cộng tối đa 3 ngày FlyMax và 5% ưu đãi cho cả hai bạn. Ưu đãi dùng cho FlyMax 6 tháng, 1 năm hoặc FlyInfinity.
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

      {hasRedeemed ? (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-success-soft px-3 py-3 text-sm font-medium text-success">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
          Bạn đã dùng mã giới thiệu. Hãy chia sẻ mã của mình để mời thêm bạn bè.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 border-t border-primary/15 pt-5">
          <Label htmlFor="referral-code" className="font-semibold text-foreground">Bạn có mã từ bạn bè?</Label>
          <p className="mt-1 text-sm text-muted-foreground">Mỗi tài khoản chỉ nhập một mã giới thiệu, vì vậy hãy kiểm tra kỹ trước khi xác nhận.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              id="referral-code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="Ví dụ: FLYA1B2C3D4"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              disabled={loading}
              aria-describedby={message ? 'referral-message' : undefined}
              className="h-12 min-w-0 bg-surface font-semibold uppercase tracking-wide"
            />
            <Button type="submit" size="lg" disabled={loading || !code.trim()} className="sm:min-w-40">
              {loading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Gift aria-hidden="true" className="h-4 w-4" />}
              {loading ? 'Đang áp dụng' : 'Nhận ưu đãi'}
            </Button>
          </div>
        </form>
      )}

      {message && (
        <p id="referral-message" role={message.type === 'error' ? 'alert' : 'status'} className={message.type === 'success' ? 'mt-3 flex items-center gap-2 text-sm font-medium text-success' : 'mt-3 flex items-center gap-2 text-sm font-medium text-destructive'}>
          {message.type === 'success' ? <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" /> : <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />}
          {message.text}
        </p>
      )}
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
