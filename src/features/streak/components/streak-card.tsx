'use client';

import { useState } from 'react';
import { Check, Gift, LockKeyhole, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { FLYTIEE_SETS } from '@/features/flytiee/config';
import { useStreak } from '../hooks/use-streak';
import { StreakFlame } from './streak-flame';
import styles from './streak-card.module.css';

const MILESTONES = [
  { day: 10, reward: '50 xu FlyTiee' },
  { day: 30, reward: '5 Rương bạc FlyTiee' },
  { day: 50, reward: '5 Rương vàng FlyTiee' },
  { day: 80, reward: 'Giảm 50% gói 6 tháng, 1 năm hoặc FlyInfinity · hạn 30 ngày' },
  { day: 100, reward: 'Rương chọn 1 Set FlyTiee' },
  { day: 150, reward: 'FlyMax 1 năm' },
  { day: 200, reward: 'Set FlyTiee hiếm · sắp ra mắt' },
] as const;

export function StreakCard() {
  const { currentStreak, bestStreak, claimedMilestones, discountExpiresAt, ready, error, refreshStreak } = useStreak();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [open, setOpen] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState(FLYTIEE_SETS[0].id);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const unclaimedCount = ready && !error
    ? MILESTONES.filter((item) => item.day !== 200 && item.day <= currentStreak && !claimedMilestones.includes(item.day)).length
    : 0;

  const claim = async (milestone: number) => {
    if (claiming !== null) return;
    setClaiming(milestone);
    setFeedback(null);
    try {
      const { data, error: claimError } = await getSupabaseClient().rpc('claim_learning_streak_milestone', {
        p_milestone: milestone,
        p_set_id: milestone === 100 ? selectedSetId : null,
      });
      if (claimError || !data?.ok) {
        setFeedback({ type: 'error', text: claimError?.message || data?.message || 'Chưa thể nhận quà. Hãy thử lại.' });
        return;
      }
      await refreshStreak();
      if (milestone === 150) await refreshUser();
      if ([10, 30, 50, 100].includes(milestone)) window.dispatchEvent(new Event('flytiee:streak-reward'));
      setFeedback({ type: 'success', text: data.message || 'Phần thưởng đã được thêm vào tài khoản!' });
    } catch {
      setFeedback({ type: 'error', text: 'Không thể kết nối để nhận quà. Hãy kiểm tra mạng và thử lại.' });
    } finally {
      setClaiming(null);
    }
  };

  return (
    <>
      <button type="button" className={styles.cardButton} onClick={() => setOpen(true)} aria-label={`Mở hành trình streak, ${currentStreak} ngày liên tiếp${unclaimedCount ? `, có ${unclaimedCount} phần thưởng chưa nhận` : ''}`}>
        {unclaimedCount > 0 && <span className={styles.notification} aria-hidden="true" />}
        <StreakFlame days={currentStreak} />
        <span className={styles.count}>{ready ? currentStreak : '…'}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-2xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-5 py-5 pr-12">
            <DialogTitle className="flex items-center gap-3 text-xl"><StreakFlame days={currentStreak} small /> Hành trình ngọn lửa</DialogTitle>
            <DialogDescription>Đăng nhập mỗi ngày để giữ chuỗi. Một ngày chỉ cộng một lần; bỏ lỡ một ngày sẽ bắt đầu lại từ 1.</DialogDescription>
          </DialogHeader>
          <div className={styles.dialogBody}>
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-warning/25 bg-warning-soft/50 p-4">
              <strong className="text-3xl tabular-nums text-foreground">{currentStreak}/200</strong>
              <span className="text-sm text-muted-foreground">ngày liên tiếp · kỷ lục {bestStreak} ngày</span>
            </div>
            {error && <p role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive-soft p-3 text-sm text-destructive">{error}</p>}
            {feedback && <p role={feedback.type === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-xl border p-3 text-sm font-semibold ${feedback.type === 'error' ? 'border-destructive/30 bg-destructive-soft text-destructive' : 'border-success/30 bg-success-soft text-success'}`}>{feedback.text}</p>}
            <div className="space-y-3">
              {MILESTONES.map((item) => {
                const reached = currentStreak >= item.day;
                const claimed = claimedMilestones.includes(item.day);
                const upcoming = item.day === 200;
                return (
                  <article key={item.day} className={styles.milestone} data-state={claimed ? 'claimed' : reached && !upcoming ? 'ready' : 'locked'}>
                    <StreakFlame days={item.day} small />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-extrabold text-foreground">Mốc {item.day} ngày</h3><span className="text-xs font-bold text-muted-foreground">{claimed ? 'Đã nhận' : upcoming ? 'Sắp ra mắt' : reached ? 'Đã mở khóa' : `Còn ${item.day - currentStreak} ngày`}</span></div>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.reward}</p>
                      {item.day === 80 && claimed && <p className="mt-1 text-xs font-semibold text-warning">{discountExpiresAt ? `Có hiệu lực đến ${new Date(discountExpiresAt).toLocaleDateString('vi-VN')}` : 'Ưu đãi đã hết hạn hoặc đã sử dụng'}</p>}
                      {item.day === 100 && reached && !claimed && <label className="mt-3 block text-sm font-semibold text-foreground">Chọn Set yêu thích<select className={`mt-1 ${styles.select}`} value={selectedSetId} onChange={(event) => setSelectedSetId(event.target.value)}>{FLYTIEE_SETS.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}</select></label>}
                      {reached && !claimed && !upcoming && <Button type="button" size="sm" className={`mt-3 ${styles.rewardButton}`} disabled={claiming !== null || Boolean(error)} onClick={() => void claim(item.day)}><Gift aria-hidden="true" className="h-4 w-4" />{claiming === item.day ? 'Đang nhận…' : 'Nhận quà'}</Button>}
                    </div>
                    {claimed ? <Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-success" /> : upcoming ? <Sparkles aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-special" /> : !reached ? <LockKeyhole aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" /> : null}
                  </article>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
