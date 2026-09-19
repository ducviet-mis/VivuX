'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Coins,
  Edit3,
  Gift,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { ACCESSORY_SLOT_LABELS, FLYTIEE_ACCESSORIES } from './config';
import { FlytieeBird } from './flytiee-bird';
import type { FlytieeAccessorySlot, FlytieeMood } from './types';
import { useFlytiee } from './use-flytiee';

const IDLE_ACTIONS: Array<{ mood: FlytieeMood; line: string; duration: number }> = [
  { mood: 'idle', line: 'Chớp chớp… tớ vẫn ở đây nhé!', duration: 2600 },
  { mood: 'sway', line: 'Trong đầu tớ đang có nhạc!', duration: 4200 },
  { mood: 'look', line: 'Ủa… bên kia có gì thế?', duration: 4600 },
  { mood: 'feet', line: 'Hai cái chân này… là của tớ à?', duration: 4400 },
  { mood: 'fly', line: 'Một, hai… bay được một tí rồi!', duration: 4100 },
  { mood: 'sneeze', line: 'Hắt… xì! Hihi, nhột mũi quá.', duration: 2800 },
  { mood: 'scratch', line: 'Hmm… hôm nay học gì nhỉ?', duration: 4000 },
];

const ACCESSORY_TONES: Record<string, string> = {
  coral: 'bg-destructive-soft text-destructive', navy: 'bg-primary-soft text-primary',
  indigo: 'bg-special-soft text-special', cyan: 'bg-info-soft text-info',
  red: 'bg-destructive-soft text-destructive', mint: 'bg-success-soft text-success',
  yellow: 'bg-warning-soft text-warning', green: 'bg-success-soft text-success',
};

function levelTitle(level: number) {
  if (level >= 20) return 'Bạn học siêu sao';
  if (level >= 10) return 'Chim thông thái';
  if (level >= 5) return 'Chim chăm học';
  return 'Chim non';
}

function claimedToday(claimedIds: string[], missionId: string) {
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}:${missionId}`;
  return claimedIds.includes(key);
}

export function FlytieeWidget() {
  const user = useAuthStore((state) => state.user);
  const flytiee = useFlytiee();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('home');
  const [mood, setMood] = useState<FlytieeMood>('idle');
  const [speech, setSpeech] = useState('Học cùng tớ nhé?');
  const [draftName, setDraftName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [selectedAccessoryId, setSelectedAccessoryId] = useState(FLYTIEE_ACCESSORIES[0].id);
  const [shopSlot, setShopSlot] = useState<FlytieeAccessorySlot>('head');

  const isHungry = flytiee.satiety <= 35;
  const selectedAccessory = FLYTIEE_ACCESSORIES.find((item) => item.id === selectedAccessoryId) ?? FLYTIEE_ACCESSORIES[0];
  const previewProfile = useMemo(() => ({
    ...flytiee.profile,
    equipped: { ...flytiee.profile.equipped, [selectedAccessory.slot]: selectedAccessory.id },
  }), [flytiee.profile, selectedAccessory]);

  useEffect(() => {
    setDraftName(flytiee.profile.name);
  }, [flytiee.profile.name]);

  useEffect(() => {
    if (mood === 'eat') return;
    if (isHungry) {
      setMood('hungry');
      setSpeech('Ục ục… tớ hơi đói rồi!');
    } else if (mood === 'hungry') {
      setMood('idle');
      setSpeech('Học cùng tớ nhé?');
    }
  }, [isHungry, mood]);

  useEffect(() => {
    if (mood === 'hungry' || mood === 'eat') return;
    if (mood !== 'idle') {
      const action = IDLE_ACTIONS.find((item) => item.mood === mood);
      const timer = window.setTimeout(() => {
        setMood('idle');
        setSpeech('Học cùng tớ nhé?');
      }, action?.duration ?? 3600);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      const choices = IDLE_ACTIONS.filter((item) => item.mood !== 'idle');
      const action = choices[Math.floor(Math.random() * choices.length)];
      setMood(action.mood);
      setSpeech(action.line);
    }, 9_000 + Math.random() * 9_000);
    return () => window.clearTimeout(timer);
  }, [mood]);

  useEffect(() => {
    if (!flytiee.message) return;
    const timer = window.setTimeout(flytiee.clearMessage, 4500);
    return () => window.clearTimeout(timer);
  }, [flytiee.clearMessage, flytiee.message]);

  const handleFeed = () => {
    flytiee.feed();
    setMood('eat');
    setSpeech('Măm măm… ngon quá!');
    window.setTimeout(() => {
      setMood('idle');
      setSpeech('No bụng rồi! Cảm ơn bạn nhé.');
    }, 3300);
  };

  const saveName = () => {
    if (flytiee.rename(draftName)) setEditingName(false);
  };

  const changeTab = (value: string) => {
    setTab(value);
    if (value === 'missions') void flytiee.refreshMissions();
  };

  if (!user) return null;

  if (flytiee.loading) {
    return <div className="h-[172px] animate-pulse rounded-xl border border-border bg-card" aria-label="Đang gọi FlyTiee" />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group grid min-h-[172px] w-full grid-cols-[132px_minmax(0,1fr)] items-center overflow-hidden rounded-xl border border-border bg-card p-4 text-left shadow-soft hover:border-primary/50 hover:shadow-card focus-visible:ring-2 focus-visible:ring-primary sm:grid-cols-[145px_minmax(0,1fr)]"
          aria-label={`Mở cửa sổ của ${flytiee.profile.name}`}
        >
          <div className="h-[138px] w-[138px] self-end sm:h-[150px] sm:w-[150px]">
            <FlytieeBird mood={mood} profile={flytiee.profile} />
          </div>
          <div className="relative z-10 min-w-0 pl-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="truncate text-lg font-bold text-foreground">{flytiee.profile.name}</span>
              {isHungry && <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">Đang đói</span>}
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{speech}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
              <span className="text-primary">Cấp {flytiee.profile.level}</span>
              <span className="flex items-center gap-1 text-warning"><Coins aria-hidden="true" className="h-3.5 w-3.5" />{flytiee.profile.coins} xu</span>
            </div>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Chơi cùng FlyTiee
            </span>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-5xl gap-0 overflow-y-auto p-0 sm:max-h-[calc(100dvh-3rem)]">
        <DialogHeader className="border-b border-border px-5 py-5 sm:px-7">
          <DialogTitle className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl">
            Nhà của {flytiee.profile.name}
            {flytiee.saving && <RefreshCw aria-label="Đang lưu" className="h-4 w-4 animate-spin text-muted-foreground" />}
          </DialogTitle>
          <DialogDescription>Nuôi bạn đồng hành bằng những tiến bộ nhỏ mỗi ngày.</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={changeTab} className="min-w-0">
          <div className="border-b border-border px-4 py-3 sm:px-7">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="home">Chăm sóc</TabsTrigger>
              <TabsTrigger value="missions">Nhiệm vụ</TabsTrigger>
              <TabsTrigger value="shop">Cửa hàng</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-7">
            {flytiee.message && <div role="status" aria-live="polite" className="mb-4 rounded-lg border border-primary/25 bg-primary-soft px-4 py-3 text-sm font-medium text-primary">{flytiee.message}</div>}

            <TabsContent value="home" className="mt-0">
              <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(280px,.9fr)]">
                <section className="relative min-h-[390px] overflow-hidden rounded-xl border border-border bg-hero p-4 sm:min-h-[440px]">
                  <div className="mx-auto flex max-w-sm justify-center rounded-full bg-card/90 px-4 py-2 text-center text-sm font-medium text-foreground shadow-soft">{speech}</div>
                  <FlytieeBird mood={mood} profile={flytiee.profile} className="mx-auto h-[330px] max-w-md sm:h-[380px]" />
                </section>

                <section className="space-y-5">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Người bạn của bạn</p>
                        {!editingName ? <h3 className="mt-1 truncate text-xl font-bold">{flytiee.profile.name}</h3> : null}
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setEditingName((value) => !value)} aria-label="Đổi tên FlyTiee"><Edit3 aria-hidden="true" className="h-4 w-4" /></Button>
                    </div>
                    {editingName && <div className="mt-3 space-y-2"><Label htmlFor="flytiee-name">Tên mới</Label><div className="flex gap-2"><Input id="flytiee-name" maxLength={20} value={draftName} onChange={(event) => setDraftName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && saveName()} /><Button type="button" onClick={saveName}>Lưu</Button></div><p className="text-xs text-muted-foreground">Từ 2–20 ký tự.</p></div>}
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Cấp {flytiee.profile.level} · {levelTitle(flytiee.profile.level)}</p><p className="text-xs text-muted-foreground">{flytiee.profile.xp}/{flytiee.xpNeeded} EXP tới cấp tiếp theo</p></div><Sparkles aria-hidden="true" className="h-5 w-5 text-primary" /></div>
                    <Progress value={flytiee.profile.xp / flytiee.xpNeeded * 100} className="mt-3" />
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Độ no</p><p className="text-xs text-muted-foreground">Thức ăn luôn miễn phí.</p></div><span className={cn('text-sm font-bold tabular-nums', isHungry ? 'text-warning' : 'text-success')}>{flytiee.satiety}%</span></div>
                    <Progress value={flytiee.satiety} className="mt-3" />
                    <Button type="button" className="mt-4 w-full" onClick={handleFeed} disabled={mood === 'eat'}><Utensils aria-hidden="true" className="h-4 w-4" />{mood === 'eat' ? 'Đang ăn…' : 'Cho ăn miễn phí'}</Button>
                  </div>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="missions" className="mt-0">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">Nhiệm vụ hôm nay</h3><p className="text-sm text-muted-foreground">Làm bài trên FlyDo rồi quay lại nhận thưởng.</p></div><Button type="button" variant="outline" size="sm" onClick={() => void flytiee.refreshMissions()}><RefreshCw aria-hidden="true" className="h-4 w-4" />Cập nhật</Button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {flytiee.missions.map((mission) => {
                  const complete = mission.current >= mission.target;
                  const claimed = claimedToday(flytiee.profile.claimedMissionIds, mission.id);
                  return <article key={mission.id} className="flex min-h-[190px] flex-col rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><Gift aria-hidden="true" className="h-5 w-5" /></div><span className="text-xs font-bold text-primary">+{mission.xp} EXP · +{mission.coins} xu</span></div>
                    <h4 className="mt-3 font-bold">{mission.title}</h4><p className="mt-1 text-sm text-muted-foreground">{mission.description}</p>
                    <div className="mt-auto pt-4"><div className="mb-2 flex justify-between text-xs font-semibold"><span>{mission.current}/{mission.target}</span><span>{Math.round(mission.current / mission.target * 100)}%</span></div><Progress value={mission.current / mission.target * 100} /><Button type="button" className="mt-3 w-full" variant={claimed ? 'secondary' : complete ? 'default' : 'outline'} disabled={!complete || claimed} onClick={() => flytiee.claimMission(mission)}>{claimed ? <><Check aria-hidden="true" className="h-4 w-4" />Đã nhận</> : complete ? 'Nhận thưởng' : 'Chưa hoàn thành'}</Button></div>
                  </article>;
                })}
              </div>
            </TabsContent>

            <TabsContent value="shop" className="mt-0">
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(260px,.75fr)_minmax(0,1.25fr)]">
                <section className="rounded-xl border border-border bg-hero p-4 lg:sticky lg:top-0">
                  <p className="text-center text-sm font-semibold">{selectedAccessory.name}</p>
                  <FlytieeBird mood="idle" profile={previewProfile} className="mx-auto h-[290px] max-w-sm" />
                  <div className="rounded-lg bg-card p-3 text-center shadow-soft"><p className="text-sm font-semibold">Xem thử trên {flytiee.profile.name}</p><p className="mt-1 text-xs text-muted-foreground">Chọn món không làm mất xu.</p></div>
                </section>

                <section className="min-w-0">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">Cửa hàng học đường</h3><p className="text-sm text-muted-foreground">Mua một lần, dùng mãi.</p></div><span className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-warning-soft px-4 text-sm font-bold text-warning"><Coins aria-hidden="true" className="h-4 w-4" />{flytiee.profile.coins} xu</span></div>
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="Loại phụ kiện">{(Object.keys(ACCESSORY_SLOT_LABELS) as FlytieeAccessorySlot[]).map((slot) => <Button key={slot} type="button" size="sm" variant={shopSlot === slot ? 'default' : 'outline'} onClick={() => { setShopSlot(slot); const first = FLYTIEE_ACCESSORIES.find((item) => item.slot === slot); if (first) setSelectedAccessoryId(first.id); }}>{ACCESSORY_SLOT_LABELS[slot]}</Button>)}</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {FLYTIEE_ACCESSORIES.filter((item) => item.slot === shopSlot).map((item) => {
                      const owned = flytiee.profile.ownedAccessoryIds.includes(item.id);
                      const equipped = flytiee.profile.equipped[item.slot] === item.id;
                      const selected = selectedAccessoryId === item.id;
                      return <button key={item.id} type="button" aria-pressed={selected} onClick={() => setSelectedAccessoryId(item.id)} className={cn('min-h-[150px] rounded-xl border p-4 text-left transition-colors', selected ? 'border-primary bg-primary-soft ring-2 ring-primary/15' : 'border-border bg-card hover:border-primary/50')}>
                        <span className={cn('flex h-11 w-11 items-center justify-center rounded-lg', ACCESSORY_TONES[item.tone])}><ShoppingBag aria-hidden="true" className="h-5 w-5" /></span>
                        <strong className="mt-3 block text-sm">{item.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.description}</span><span className="mt-2 block text-xs font-bold text-primary">{equipped ? 'Đang mặc' : owned ? 'Đã sở hữu' : `${item.price} xu`}</span>
                      </button>;
                    })}
                  </div>
                  <div className="mt-4 rounded-xl border border-border bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><p className="font-bold">{selectedAccessory.name}</p><p className="text-sm text-muted-foreground">{flytiee.profile.ownedAccessoryIds.includes(selectedAccessory.id) ? 'Món này đã có trong tủ đồ.' : `${selectedAccessory.price} xu`}</p></div><Button type="button" onClick={() => flytiee.buyOrEquip(selectedAccessory.id)} disabled={!flytiee.profile.ownedAccessoryIds.includes(selectedAccessory.id) && flytiee.profile.coins < selectedAccessory.price}>{flytiee.profile.equipped[selectedAccessory.slot] === selectedAccessory.id ? 'Tháo ra' : flytiee.profile.ownedAccessoryIds.includes(selectedAccessory.id) ? 'Mặc ngay' : 'Mua & mặc'}</Button></div></div>
                </section>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
