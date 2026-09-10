'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Gift, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { canRedeemReferralCode } from '../utils';

export function ReferralHomePrompt() {
  const { user } = useAuthStore();
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const canRedeem = canRedeemReferralCode(user, now);
  const dismissKey = user ? `flydo-referral-welcome-dismissed:${user.id}` : '';
  const remainingHours = useMemo(() => {
    if (!user?.referralEligibleUntil) return 0;
    return Math.max(0, Math.ceil((new Date(user.referralEligibleUntil).getTime() - now) / (60 * 60 * 1000)));
  }, [now, user?.referralEligibleUntil]);

  useEffect(() => {
    if (!canRedeem || !dismissKey) return;
    if (window.localStorage.getItem(dismissKey) !== 'true') setOpen(true);
  }, [canRedeem, dismissKey]);

  useEffect(() => {
    if (!user?.referralEligibleUntil || !canRedeem) return;
    const delay = new Date(user.referralEligibleUntil).getTime() - Date.now();
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(0, delay) + 150);
    return () => window.clearTimeout(timer);
  }, [canRedeem, user?.referralEligibleUntil]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (dismissKey) window.localStorage.setItem(dismissKey, 'true');
      setSuccessMessage(null);
    }
    setOpen(nextOpen);
  };

  if (!canRedeem && !successMessage) return null;

  return (
    <>
      <Dialog open={open || Boolean(successMessage)} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md overflow-hidden p-0">
          {successMessage ? (
            <div className="p-6 text-center sm:p-7">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success-soft text-success"><CheckCircle2 aria-hidden="true" className="h-6 w-6" /></div>
              <DialogTitle className="mt-4 text-xl">Đã nhận ưu đãi</DialogTitle>
              <p role="status" className="mt-2 leading-relaxed text-muted-foreground">{successMessage}</p>
              <Button type="button" className="mt-6 w-full" onClick={() => { setSuccessMessage(null); setOpen(false); }}>Tiếp tục học</Button>
            </div>
          ) : (
            <>
              <DialogHeader className="border-b border-border bg-hero px-5 py-5 sm:px-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft"><Sparkles aria-hidden="true" className="h-5 w-5" /></div>
                <DialogTitle className="pt-3 text-xl">Bạn được bạn bè mời đến FlyDo?</DialogTitle>
                <DialogDescription className="pt-1">Nhập mã giới thiệu để cả hai cùng nhận ưu đãi học tập.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft/45 p-3.5 text-sm">
                  <Gift aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="leading-relaxed text-foreground"><span className="font-bold">Nhận tối đa 3 ngày FlyMax và thêm 5% ưu đãi.</span> Mã chỉ dùng được một lần.</p>
                </div>
                <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Clock3 aria-hidden="true" className="h-4 w-4 text-primary" /> Bạn còn {remainingHours} giờ để nhập mã.</p>
                <ReferralCodeEntryForm onSuccess={setSuccessMessage} />
                <button type="button" onClick={() => handleOpenChange(false)} className="min-h-11 w-full rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  Để sau
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {canRedeem && !open && !successMessage && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-4 z-40 flex min-h-12 items-center gap-2 rounded-full border border-primary/25 bg-surface px-4 py-2.5 text-left shadow-float transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transform-none sm:right-6"
          aria-label="Mở phần nhập mã giới thiệu"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Gift aria-hidden="true" className="h-4 w-4" /></span>
          <span className="pr-1"><span className="block text-sm font-bold text-foreground">Có mã bạn bè?</span><span className="block text-xs text-muted-foreground">Nhập trong {remainingHours} giờ</span></span>
        </button>
      )}
    </>
  );
}

function ReferralCodeEntryForm({ onSuccess }: { onSuccess: (message: string) => void }) {
  const { user, refreshUser } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    setMessage(null);

    if (!normalizedCode) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mã giới thiệu.' });
      return;
    }
    if (!user) return;

    setLoading(true);
    const { data, error } = await getSupabaseClient().rpc('redeem_referral_code', { p_code: normalizedCode });
    if (error) {
      const isMissingFunction = error.message.toLowerCase().includes('function') || error.code === 'PGRST202';
      setMessage({ type: 'error', text: isMissingFunction ? 'Tính năng này chưa được cấu hình trên Supabase.' : error.message });
      setLoading(false);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.success) {
      setMessage({ type: 'error', text: result?.message || 'Mã giới thiệu không hợp lệ.' });
      setLoading(false);
      return;
    }

    onSuccess(result.message || 'Đã áp dụng mã giới thiệu thành công.');
    await refreshUser();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="welcome-referral-code">Mã giới thiệu</Label>
        <Input
          id="welcome-referral-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Ví dụ: FLYA1B2C3D4"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          disabled={loading}
          aria-describedby={message ? 'welcome-referral-message' : undefined}
          className="h-12 bg-surface font-semibold uppercase tracking-wide"
        />
      </div>
      <Button type="submit" size="lg" disabled={loading || !code.trim()} className="w-full">
        {loading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Gift aria-hidden="true" className="h-4 w-4" />}
        {loading ? 'Đang áp dụng' : 'Nhận ưu đãi'}
      </Button>
      {message && <p id="welcome-referral-message" role="alert" className="flex items-center gap-2 text-sm font-medium text-destructive"><AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />{message.text}</p>}
    </form>
  );
}
