'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Clock3,
  Coins,
  Flame,
  Gift,
  Mail,
  PackageOpen,
  RefreshCw,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CHEST_LABELS, STREAK_REWARDS, STUDY_MILESTONES } from './event-config';
import type { FlytieeChestTier, FlytieeRewardResult } from './types';
import type { useFlytiee } from './use-flytiee';
import styles from './flytiee-events.module.css';

type FlytieeController = ReturnType<typeof useFlytiee>;

const CHEST_TONES: Record<FlytieeChestTier, { shell: string; trim: string; light: string; card: string }> = {
  bronze: { shell: '#a96945', trim: '#e1a26e', light: '#ffd0a8', card: 'border-[#a96945]/35 bg-[#a96945]/10' },
  silver: { shell: '#8f9bb3', trim: '#dce4f2', light: '#ffffff', card: 'border-info/30 bg-info-soft' },
  gold: { shell: '#d89e24', trim: '#ffe49a', light: '#fff9d8', card: 'border-warning/35 bg-warning-soft' },
};

function ChestArt({ tier, opening = false, className }: { tier: FlytieeChestTier; opening?: boolean; className?: string }) {
  const tone = CHEST_TONES[tier];
  return (
    <svg
      viewBox="0 0 160 140"
      className={cn(className, opening && styles.chestOpening, tier === 'gold' && styles.chestGlow)}
      aria-hidden="true"
    >
      <ellipse cx="80" cy="125" rx="54" ry="9" fill="rgb(var(--color-foreground) / .12)" />
      <path d="M27 57c0-25 19-43 53-43s53 18 53 43v14H27V57Z" fill={tone.shell} stroke={tone.trim} strokeWidth="6" />
      <path d="M39 54c4-17 18-27 41-27s37 10 41 27" fill="none" stroke={tone.light} strokeLinecap="round" strokeWidth="7" opacity=".55" />
      <path d="M22 65h116v55a9 9 0 0 1-9 9H31a9 9 0 0 1-9-9V65Z" fill={tone.shell} stroke={tone.trim} strokeWidth="6" />
      <path d="M22 69h116" stroke={tone.light} strokeWidth="7" opacity=".55" />
      <path d="M70 61h20v42H70z" fill={tone.trim} />
      <rect x="66" y="83" width="28" height="28" rx="7" fill={tone.light} stroke={tone.trim} strokeWidth="5" />
      <circle cx="80" cy="96" r="4" fill={tone.shell} />
      {tier === 'gold' && <g fill={tone.light}><path d="m18 36 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" /><path d="m142 23 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" /></g>}
    </svg>
  );
}

function RewardOverlay({ reward, openingTier, onClose }: {
  reward: FlytieeRewardResult | null;
  openingTier: FlytieeChestTier | null;
  onClose: () => void;
}) {
  const actionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!reward) return;
    actionRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose, reward]);

  if (!reward && !openingTier) return null;
  const tier = openingTier ?? reward?.chestTier ?? 'gold';
  return (
    <Dialog open onOpenChange={(open) => {
      if (!open && !openingTier) onClose();
    }}>
      <DialogContent
        className={cn('z-[70] w-full max-w-sm overflow-hidden border-primary/30 p-0 text-center [&>button]:hidden', styles.rewardCard)}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="relative p-6">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            {reward && Array.from({ length: 10 }, (_, index) => <span key={index} className={styles.confetti} />)}
          </div>
          {openingTier ? (
            <DialogHeader className="relative items-center text-center">
              <ChestArt tier={tier} opening className="mx-auto h-44 w-44" />
              <DialogTitle className="text-xl font-bold">Đang mở {CHEST_LABELS[tier]}…</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">Một phần quà bất ngờ đang bay tới!</DialogDescription>
            </DialogHeader>
          ) : (
            <div className="relative">
              <button type="button" onClick={onClose} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Đóng thông báo phần thưởng"><X aria-hidden="true" className="h-5 w-5" /></button>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-warning-soft text-warning shadow-card"><Sparkles aria-hidden="true" className="h-10 w-10" /></div>
              <DialogHeader className="mt-4 items-center text-center">
                <DialogDescription className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Phần thưởng đã nhận</DialogDescription>
                <DialogTitle className="mt-2 text-2xl font-bold">{reward?.title}</DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">{reward?.description}</DialogDescription>
              </DialogHeader>
              <Button ref={actionRef} type="button" className="mt-6 w-full" onClick={onClose}>Tuyệt quá!</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FlytieeEvents({ flytiee }: { flytiee: FlytieeController }) {
  const [mailOpen, setMailOpen] = useState(false);
  const [mailCode, setMailCode] = useState('');
  const [reward, setReward] = useState<FlytieeRewardResult | null>(null);
  const [openingTier, setOpeningTier] = useState<FlytieeChestTier | null>(null);
  const cycleDay = Math.max(1, (flytiee.eventStats.streak - 1) % 7 + 1);
  const studyProgress = Math.min(100, flytiee.eventStats.studyMinutes / 90 * 100);
  const practiceProgress = Math.min(100, flytiee.eventStats.practiceCoinsEarned);
  const availablePracticeCoins = Math.max(0, flytiee.eventStats.practiceCoinsEarned - flytiee.dailyEvent.practiceCoinsClaimed);
  const studyComplete = [15, 45, 90].every((minutes) => flytiee.dailyEvent.studyClaimedMilestones.includes(minutes));
  const practiceComplete = flytiee.dailyEvent.practiceCoinsClaimed >= 100;
  const completionReady = studyComplete && practiceComplete;
  const totalChests = Object.values(flytiee.profile.chests).reduce((sum, count) => sum + count, 0);
  const correctTotal = useMemo(() => Object.values(flytiee.eventStats.correctByLevel).reduce((sum, count) => sum + count, 0), [flytiee.eventStats.correctByLevel]);

  const reveal = (result: FlytieeRewardResult | null) => {
    if (result) setReward(result);
  };

  const handleOpenChest = (tier: FlytieeChestTier) => {
    if (flytiee.profile.chests[tier] < 1 || openingTier) return;
    setReward(null);
    setOpeningTier(tier);
    window.setTimeout(() => {
      const result = flytiee.openChest(tier);
      setOpeningTier(null);
      if (result) setReward(result);
    }, 850);
  };

  const submitMail = (event: React.FormEvent) => {
    event.preventDefault();
    const result = flytiee.redeemBirdieMail(mailCode);
    if (result) {
      setMailCode('');
      setMailOpen(false);
      reveal(result);
    }
  };

  return (
    <div className="space-y-5">
      <RewardOverlay reward={reward} openingTier={openingTier} onClose={() => setReward(null)} />

      <section className="overflow-hidden rounded-2xl border border-primary/25 bg-hero">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card"><Mail aria-hidden="true" className="h-6 w-6" /></div>
            <div className="min-w-0"><h3 className="font-bold">Birdie Mail</h3><p className="text-sm text-muted-foreground">Có thư quà? Nhập giftcode để nhận xu, phụ kiện hoặc Set.</p></div>
          </div>
          <Button type="button" variant={mailOpen ? 'secondary' : 'default'} onClick={() => setMailOpen((value) => !value)} aria-expanded={mailOpen} aria-controls="birdie-mail-form"><Mail aria-hidden="true" className="h-4 w-4" />{mailOpen ? 'Đóng thư' : 'Nhập Birdie Mail'}</Button>
        </div>
        {mailOpen && <form id="birdie-mail-form" onSubmit={submitMail} className="border-t border-border bg-card/60 p-4 sm:p-5"><Label htmlFor="birdie-mail-code">Mã Birdie Mail</Label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><Input id="birdie-mail-code" value={mailCode} onChange={(event) => setMailCode(event.target.value.toUpperCase())} placeholder="VD: BIRDIE-WELCOME" autoComplete="off" className="h-11 uppercase" /><Button type="submit" className="h-11 sm:min-w-32" disabled={!mailCode.trim()}>Nhận quà</Button></div><p className="mt-2 text-xs text-muted-foreground">Mỗi mã chỉ nhận một lần trên mỗi tài khoản.</p></form>}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-lg font-bold">Sự kiện mỗi ngày</h3><p className="text-sm text-muted-foreground">Tiến độ được làm mới lúc 00:00 mỗi ngày.</p></div>
        <Button type="button" variant="outline" size="sm" onClick={() => void flytiee.refreshMissions()}><RefreshCw aria-hidden="true" className="h-4 w-4" />Cập nhật tiến độ</Button>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5" aria-labelledby="streak-event-title">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-soft text-warning"><Flame aria-hidden="true" className="h-6 w-6" /></div><div><h4 id="streak-event-title" className="font-bold">Điểm danh theo streak</h4><p className="text-sm text-muted-foreground">Streak hiện tại: <span className="font-bold text-warning">{flytiee.eventStats.streak} ngày</span></p></div></div><Button type="button" onClick={() => reveal(flytiee.claimStreakReward())} disabled={flytiee.dailyEvent.streakClaimed || flytiee.eventStats.streak < 1}>{flytiee.dailyEvent.streakClaimed ? <><Check aria-hidden="true" className="h-4 w-4" />Đã điểm danh</> : `Nhận quà ngày ${cycleDay}`}</Button></div>
        <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {STREAK_REWARDS.map((item) => {
            const active = item.day === cycleDay;
            const passed = item.day < cycleDay;
            return <div key={item.day} className={cn('relative flex min-h-[92px] flex-col items-center justify-center rounded-xl border p-2 text-center', active ? 'border-warning bg-warning-soft ring-2 ring-warning/15' : passed ? 'border-success/25 bg-success-soft' : 'border-border bg-muted/45')}><span className="text-xs font-semibold text-muted-foreground">Ngày {item.day}</span>{item.kind === 'coins' ? <Coins aria-hidden="true" className={cn('my-1 h-5 w-5', active ? 'text-warning' : 'text-primary')} /> : <Gift aria-hidden="true" className={cn('my-1 h-5 w-5', item.chestTier === 'gold' ? 'text-warning' : 'text-info')} />}<span className="text-xs font-bold">{item.label}</span>{passed && <Check aria-label="Đã qua" className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-success" />}</div>;
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5" aria-labelledby="study-event-title">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info-soft text-info"><Clock3 aria-hidden="true" className="h-6 w-6" /></div><div><h4 id="study-event-title" className="font-bold">Tích lũy phút học</h4><p className="text-sm text-muted-foreground"><span className="font-bold text-info">{flytiee.eventStats.studyMinutes}</span>/90 phút hôm nay</p></div></div></div>
          <Progress value={studyProgress} className="mt-4" />
          <div className="mt-4 space-y-2">
            {STUDY_MILESTONES.map((milestone) => {
              const reached = flytiee.eventStats.studyMinutes >= milestone.minutes;
              const claimed = flytiee.dailyEvent.studyClaimedMilestones.includes(milestone.minutes);
              return <div key={milestone.minutes} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/45 p-3"><div className="min-w-0"><p className="text-sm font-bold">{milestone.minutes} phút · {milestone.label}</p><p className="text-xs text-muted-foreground">{milestone.reward.kind === 'coins' ? `${milestone.reward.amount} xu` : '1 Rương bạc'}</p></div><Button type="button" size="sm" variant={claimed ? 'secondary' : reached ? 'default' : 'outline'} disabled={!reached || claimed} onClick={() => reveal(flytiee.claimStudyReward(milestone.minutes))}>{claimed ? <><Check aria-hidden="true" className="h-4 w-4" />Đã nhận</> : reached ? 'Nhận' : `${Math.max(0, milestone.minutes - flytiee.eventStats.studyMinutes)}p nữa`}</Button></div>;
            })}
          </div>
        </section>

        <section className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5" aria-labelledby="practice-event-title">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-soft text-success"><Trophy aria-hidden="true" className="h-6 w-6" /></div><div><h4 id="practice-event-title" className="font-bold">Xu từ câu đúng</h4><p className="text-sm text-muted-foreground"><span className="font-bold text-success">{flytiee.eventStats.practiceCoinsEarned}</span>/100 xu · {correctTotal} câu đúng</p></div></div>
          <Progress value={practiceProgress} className="mt-4" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {([1, 2, 3, 4] as const).map((level) => <div key={level} className="rounded-xl border border-border bg-muted/45 p-3"><p className="text-xs font-semibold text-muted-foreground">Level {level}</p><p className="mt-1 text-sm font-bold">{flytiee.eventStats.correctByLevel[level]} câu · +{level} xu/câu</p></div>)}
          </div>
          <div className="mt-auto pt-4"><p className="mb-2 text-xs leading-5 text-muted-foreground">Tối đa 100 xu mỗi ngày. Câu đúng được tính theo Level tại thời điểm làm bài.</p><Button type="button" className="w-full" disabled={availablePracticeCoins < 1} onClick={() => reveal(flytiee.claimPracticeCoins())}><Coins aria-hidden="true" className="h-4 w-4" />{availablePracticeCoins > 0 ? `Nhận ${availablePracticeCoins} xu` : flytiee.dailyEvent.practiceCoinsClaimed >= 100 ? 'Đã nhận đủ 100 xu' : 'Chưa có xu mới'}</Button></div>
        </section>
      </div>

      <section className={cn('rounded-2xl border p-4 sm:p-5', completionReady ? 'border-warning/40 bg-warning-soft' : 'border-border bg-card')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning text-warning-foreground"><Sparkles aria-hidden="true" className="h-6 w-6" /></div><div><h4 className="font-bold">Thưởng hoàn thành kép</h4><p className="text-sm text-muted-foreground">Hoàn tất 90 phút học và nhận đủ 100 xu câu đúng để nhận 1 Rương vàng.</p><div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold"><span className={cn('rounded-full px-2.5 py-1', studyComplete ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground')}>{studyComplete ? '✓' : '○'} Phút học</span><span className={cn('rounded-full px-2.5 py-1', practiceComplete ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground')}>{practiceComplete ? '✓' : '○'} Câu đúng</span></div></div></div><Button type="button" disabled={!completionReady || flytiee.dailyEvent.completionChestClaimed} onClick={() => reveal(flytiee.claimDailyCompletionChest())}><Gift aria-hidden="true" className="h-4 w-4" />{flytiee.dailyEvent.completionChestClaimed ? 'Đã nhận Rương vàng' : 'Nhận Rương vàng'}</Button></div>
      </section>

      <section aria-labelledby="chest-inventory-title">
        <div className="mb-3 flex items-end justify-between gap-3"><div><h3 id="chest-inventory-title" className="text-lg font-bold">Kho rương</h3><p className="text-sm text-muted-foreground">Mở rương để nhận phần quà ngẫu nhiên.</p></div><span className="text-sm font-bold text-primary">{totalChests} rương</span></div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(['bronze', 'silver', 'gold'] as FlytieeChestTier[]).map((tier) => <article key={tier} className={cn('rounded-2xl border p-4 text-center', CHEST_TONES[tier].card)}><ChestArt tier={tier} className="mx-auto h-28 w-28" /><h4 className="font-bold">{CHEST_LABELS[tier]}</h4><p className="mt-1 text-sm text-muted-foreground">Đang có <span className="font-bold text-foreground">{flytiee.profile.chests[tier]}</span></p><Button type="button" className="mt-3 w-full" variant={flytiee.profile.chests[tier] > 0 ? 'default' : 'outline'} disabled={flytiee.profile.chests[tier] < 1 || Boolean(openingTier)} onClick={() => handleOpenChest(tier)}><PackageOpen aria-hidden="true" className="h-4 w-4" />{flytiee.profile.chests[tier] > 0 ? 'Mở rương' : 'Chưa có rương'}</Button></article>)}
        </div>
      </section>
    </div>
  );
}
