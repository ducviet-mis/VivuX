'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useStreak } from '@/features/streak/hooks/use-streak';
import { localStudyDate, studyDayBounds, useOnlineStudyStore } from '@/features/daily-goal/stores/online-study-store';
import {
  DEFAULT_FLYTIEE_PROFILE,
  FLYTIEE_ACCESSORIES,
  FLYTIEE_SETS,
  FLYTIEE_SKINS,
  FLYTIEE_METADATA_KEY,
  FLYTIEE_STORAGE_PREFIX,
  normalizeFlytieeProfile,
  xpNeededForLevel,
} from './config';
import {
  BIRDIE_MAIL_CODES,
  CHEST_COIN_POOLS,
  CHEST_LABELS,
  STUDY_MILESTONES,
  rewardForStreakDay,
} from './event-config';
import type {
  FlytieeChestTier,
  FlytieeDailyEventState,
  FlytieeEventStats,
  FlytieeMission,
  FlytieeProfile,
  FlytieeRewardResult,
} from './types';

const SATIETY_LOSS_PER_HOUR = 4;

function todayKey() {
  return localStudyDate();
}

function createDefaultProfile(): FlytieeProfile {
  return {
    ...DEFAULT_FLYTIEE_PROFILE,
    satietyUpdatedAt: new Date().toISOString(),
    equipped: {},
    chests: { ...DEFAULT_FLYTIEE_PROFILE.chests },
    dailyEvent: { ...DEFAULT_FLYTIEE_PROFILE.dailyEvent, studyClaimedMilestones: [] },
  };
}

function dailyEventForToday(profile: FlytieeProfile): FlytieeDailyEventState {
  if (profile.dailyEvent.date === todayKey()) return profile.dailyEvent;
  return {
    date: todayKey(),
    streakClaimed: false,
    studyClaimedMilestones: [],
    practiceCoinsClaimed: 0,
    completionChestClaimed: false,
  };
}

function randomItem<T>(items: T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)];
}

function grantReward(profile: FlytieeProfile, reward: FlytieeRewardResult) {
  if (reward.kind === 'coins') return { ...profile, coins: profile.coins + (reward.amount ?? 0) };
  if (reward.kind === 'chest' && reward.chestTier) {
    return { ...profile, chests: { ...profile.chests, [reward.chestTier]: profile.chests[reward.chestTier] + 1 } };
  }
  if (reward.kind === 'accessory' && reward.itemId && !profile.ownedAccessoryIds.includes(reward.itemId)) {
    return { ...profile, ownedAccessoryIds: [...profile.ownedAccessoryIds, reward.itemId] };
  }
  if (reward.kind === 'skin' && reward.itemId && !profile.ownedSkinIds.includes(reward.itemId)) {
    return { ...profile, ownedSkinIds: [...profile.ownedSkinIds, reward.itemId] };
  }
  if (reward.kind === 'set' && reward.itemId && !profile.ownedSetIds.includes(reward.itemId)) {
    return { ...profile, ownedSetIds: [...profile.ownedSetIds, reward.itemId] };
  }
  return profile;
}

function calculateSatiety(profile: FlytieeProfile, now = Date.now()) {
  const elapsedHours = Math.max(0, now - Date.parse(profile.satietyUpdatedAt)) / 3_600_000;
  return Math.max(0, Math.round(profile.satiety - elapsedHours * SATIETY_LOSS_PER_HOUR));
}

function addReward(profile: FlytieeProfile, xpReward: number, coinReward: number) {
  let level = profile.level;
  let xp = profile.xp + xpReward;
  let needed = xpNeededForLevel(level);
  while (xp >= needed) {
    xp -= needed;
    level += 1;
    needed = xpNeededForLevel(level);
  }
  return { ...profile, level, xp, coins: profile.coins + coinReward };
}

export function useFlytiee() {
  const user = useAuthStore((state) => state.user);
  const { currentStreak } = useStreak();
  const [profile, setProfile] = useState<FlytieeProfile>(createDefaultProfile);
  const [missions, setMissions] = useState<FlytieeMission[]>([]);
  const [eventStats, setEventStats] = useState<FlytieeEventStats>({
    streak: 0,
    studyMinutes: 0,
    correctByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
    practiceCoinsEarned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [clock, setClock] = useState(Date.now());
  const profileRef = useRef(profile);
  const userId = user?.id;
  const online = useOnlineStudyStore();
  const studyDay = online.userId === userId && online.date ? online.date : localStudyDate(new Date(clock));
  const studyMinutes = online.userId === userId && online.date === todayKey()
    ? Math.floor(online.seconds / 60)
    : 0;
  const currentEventStats = useMemo(() => ({ ...eventStats, studyMinutes }), [eventStats, studyMinutes]);
  const storageKey = userId ? `${FLYTIEE_STORAGE_PREFIX}:${userId}` : '';

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const persist = useCallback(async (next: FlytieeProfile) => {
    if (!userId) return;
    try {
      window.localStorage.setItem(`${FLYTIEE_STORAGE_PREFIX}:${userId}`, JSON.stringify(next));
    } catch {
      // Supabase remains the primary persistence layer when local storage is unavailable.
    }

    setSaving(true);
    const { error } = await getSupabaseClient().auth.updateUser({
      data: { [FLYTIEE_METADATA_KEY]: next },
    });
    setSaving(false);
    if (error) setMessage('Đã lưu trên thiết bị. FlyTiee sẽ đồng bộ lại khi mạng ổn định.');
  }, [userId]);

  const commit = useCallback((update: (current: FlytieeProfile) => FlytieeProfile, successMessage?: string) => {
    const next = normalizeFlytieeProfile(update(profileRef.current));
    profileRef.current = next;
    setProfile(next);
    if (successMessage) setMessage(successMessage);
    void persist(next);
    return next;
  }, [persist]);

  const refreshMissions = useCallback(async () => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    const { start, end } = studyDayBounds(studyDay);
    const [practiceResult, mockResult] = await Promise.all([
      supabase.from('practice_progress').select('is_correct, difficulty_level').eq('user_id', userId).gte('answered_at', start).lt('answered_at', end),
      supabase.from('mock_exam_attempts').select('id').eq('user_id', userId).gte('created_at', start).lt('created_at', end),
    ]);

    const practiceRows = practiceResult.data ?? [];
    const answered = practiceRows.length;
    const correct = practiceRows.filter((row: { is_correct: boolean }) => row.is_correct).length;
    const accuracy = answered > 0 ? Math.round(correct / answered * 100) : 0;
    const mockAttempts = mockResult.data?.length ?? 0;
    const correctByLevel: FlytieeEventStats['correctByLevel'] = { 1: 0, 2: 0, 3: 0, 4: 0 };
    practiceRows.forEach((row: { is_correct: boolean; difficulty_level?: number }) => {
      if (!row.is_correct) return;
      const level = Math.max(1, Math.min(4, Math.floor(Number(row.difficulty_level) || 1))) as 1 | 2 | 3 | 4;
      correctByLevel[level] += 1;
    });
    const practiceCoinsEarned = Math.min(100, Object.entries(correctByLevel)
      .reduce((sum: number, [level, count]) => sum + Number(level) * count, 0));
    setEventStats({ streak: currentStreak, studyMinutes: 0, correctByLevel, practiceCoinsEarned });

    setMissions([
      { id: 'practice-5', title: 'Khởi động trí não', description: 'Hoàn thành 5 câu tự luyện hôm nay', current: Math.min(answered, 5), target: 5, xp: 20, coins: 20 },
      { id: 'practice-15', title: 'Chăm chỉ mỗi ngày', description: 'Hoàn thành 15 câu tự luyện hôm nay', current: Math.min(answered, 15), target: 15, xp: 35, coins: 35 },
      { id: 'accuracy-80', title: 'Đôi cánh chính xác', description: 'Đạt ít nhất 80% sau 10 câu hôm nay', current: answered >= 10 ? Math.min(accuracy, 80) : 0, target: 80, xp: 30, coins: 30 },
      { id: 'mock-exam-1', title: 'Dũng cảm thử sức', description: 'Hoàn thành 1 bài thi thử hôm nay', current: Math.min(mockAttempts, 1), target: 1, xp: 45, coins: 45 },
    ]);
  }, [currentStreak, studyDay, userId]);

  useEffect(() => { void refreshMissions(); }, [refreshMissions]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const localProfile = (() => {
      try {
        const localRaw = window.localStorage.getItem(storageKey);
        return localRaw ? normalizeFlytieeProfile(JSON.parse(localRaw)) : null;
      } catch {
        return null;
      }
    })();
    if (localProfile) {
      profileRef.current = localProfile;
      setProfile(localProfile);
    }

    async function load() {
      const { data } = await getSupabaseClient().auth.getUser();
      if (cancelled) return;
      const remoteValue = data.user?.user_metadata?.[FLYTIEE_METADATA_KEY];
      const next = remoteValue ? normalizeFlytieeProfile(remoteValue) : localProfile ?? createDefaultProfile();
      profileRef.current = next;
      setProfile(next);
      setLoading(false);
      if (!remoteValue) void persist(next);
    }
    void load();
    return () => { cancelled = true; };
  }, [persist, storageKey, userId]);

  useEffect(() => {
    if (!userId) return;
    const syncStreakReward = async () => {
      const { data } = await getSupabaseClient().auth.getUser();
      const remote = data.user?.user_metadata?.[FLYTIEE_METADATA_KEY];
      if (!remote) return;
      const next = normalizeFlytieeProfile(remote);
      profileRef.current = next;
      setProfile(next);
      try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Supabase remains the source. */ }
    };
    window.addEventListener('flytiee:streak-reward', syncStreakReward);
    return () => window.removeEventListener('flytiee:streak-reward', syncStreakReward);
  }, [storageKey, userId]);

  const satiety = useMemo(() => calculateSatiety(profile, clock), [clock, profile]);
  const xpNeeded = xpNeededForLevel(profile.level);
  const dailyEvent = useMemo(() => dailyEventForToday(profile), [profile, clock]);

  const rename = useCallback((name: string) => {
    const cleaned = name.trim().replace(/\s+/g, ' ').slice(0, 20);
    if (cleaned.length < 2) return false;
    commit((current) => ({ ...current, name: cleaned }), `Từ giờ mình tên là ${cleaned}!`);
    return true;
  }, [commit]);

  const feed = useCallback(() => {
    commit((current) => ({ ...current, satiety: 100, satietyUpdatedAt: new Date().toISOString() }), 'Măm măm… no bụng rồi!');
  }, [commit]);

  const claimMission = useCallback((mission: FlytieeMission) => {
    const claimId = `${todayKey()}:${mission.id}`;
    if (mission.current < mission.target || profileRef.current.claimedMissionIds.includes(claimId)) return;
    commit((current) => {
      const rewarded = addReward(current, mission.xp, mission.coins);
      return { ...rewarded, claimedMissionIds: [...rewarded.claimedMissionIds, claimId].slice(-120) };
    }, `Đã nhận ${mission.xp} EXP và ${mission.coins} xu!`);
  }, [commit]);

  const claimStreakReward = useCallback((): FlytieeRewardResult | null => {
    const daily = dailyEventForToday(profileRef.current);
    if (daily.streakClaimed || currentStreak < 1) return null;
    const cycleDay = (currentStreak - 1) % 7 + 1;
    const reward = rewardForStreakDay(cycleDay);
    commit((current) => {
      const rewarded = grantReward(current, reward);
      return { ...rewarded, dailyEvent: { ...dailyEventForToday(rewarded), streakClaimed: true } };
    }, reward.description);
    return reward;
  }, [commit, currentStreak]);

  const claimStudyReward = useCallback((minutes: number): FlytieeRewardResult | null => {
    const milestone = STUDY_MILESTONES.find((entry) => entry.minutes === minutes);
    const daily = dailyEventForToday(profileRef.current);
    if (!milestone || currentEventStats.studyMinutes < minutes || daily.studyClaimedMilestones.includes(minutes)) return null;
    const reward: FlytieeRewardResult = milestone.reward.kind === 'coins'
      ? { kind: 'coins', title: `Học đủ ${minutes} phút`, description: `Bạn nhận ${milestone.reward.amount} xu cho sự tập trung hôm nay!`, amount: milestone.reward.amount }
      : { kind: 'chest', title: `Học đủ ${minutes} phút`, description: 'Rương bạc đã được chuyển vào kho rương.', chestTier: milestone.reward.chestTier };
    commit((current) => {
      const rewarded = grantReward(current, reward);
      const currentDaily = dailyEventForToday(rewarded);
      return {
        ...rewarded,
        dailyEvent: {
          ...currentDaily,
          studyClaimedMilestones: [...currentDaily.studyClaimedMilestones, minutes],
        },
      };
    }, reward.description);
    return reward;
  }, [commit, currentEventStats.studyMinutes]);

  const claimPracticeCoins = useCallback((): FlytieeRewardResult | null => {
    const daily = dailyEventForToday(profileRef.current);
    const available = Math.max(0, eventStats.practiceCoinsEarned - daily.practiceCoinsClaimed);
    if (available < 1) return null;
    const reward: FlytieeRewardResult = {
      kind: 'coins',
      title: 'Thưởng câu đúng',
      description: `Bạn nhận ${available} xu từ các câu trả lời đúng hôm nay!`,
      amount: available,
    };
    commit((current) => {
      const rewarded = grantReward(current, reward);
      return {
        ...rewarded,
        dailyEvent: {
          ...dailyEventForToday(rewarded),
          practiceCoinsClaimed: eventStats.practiceCoinsEarned,
        },
      };
    }, reward.description);
    return reward;
  }, [commit, eventStats.practiceCoinsEarned]);

  const claimDailyCompletionChest = useCallback((): FlytieeRewardResult | null => {
    const daily = dailyEventForToday(profileRef.current);
    const studyComplete = [15, 45, 90].every((minutes) => daily.studyClaimedMilestones.includes(minutes));
    const practiceComplete = daily.practiceCoinsClaimed >= 100;
    if (!studyComplete || !practiceComplete || daily.completionChestClaimed) return null;
    const reward: FlytieeRewardResult = {
      kind: 'chest',
      title: 'Hoàn thành trọn vẹn!',
      description: 'Bạn đã hoàn thành cả hai sự kiện ngày và nhận 1 Rương vàng.',
      chestTier: 'gold',
    };
    commit((current) => {
      const rewarded = grantReward(current, reward);
      return {
        ...rewarded,
        dailyEvent: { ...dailyEventForToday(rewarded), completionChestClaimed: true },
      };
    }, reward.description);
    return reward;
  }, [commit]);

  const openChest = useCallback((tier: FlytieeChestTier): FlytieeRewardResult | null => {
    const current = profileRef.current;
    if (current.chests[tier] < 1) return null;
    const coinFallback = () => {
      const amount = randomItem(CHEST_COIN_POOLS[tier]) ?? CHEST_COIN_POOLS[tier][0];
      return { kind: 'coins', title: `${CHEST_LABELS[tier]} đã mở!`, description: `Bên trong có ${amount} xu.`, amount } as FlytieeRewardResult;
    };
    let reward = coinFallback();

    if (tier === 'silver' && Math.floor(Math.random() * 6) === 5) {
      const item = randomItem(FLYTIEE_ACCESSORIES.filter((entry) => !current.ownedAccessoryIds.includes(entry.id)));
      if (item) reward = { kind: 'accessory', title: 'Phụ kiện mới!', description: `${item.name} đã được thêm vào tủ đồ.`, itemId: item.id };
    }
    if (tier === 'gold') {
      const outcome = Math.floor(Math.random() * 7);
      if (outcome === 4) {
        const item = randomItem(FLYTIEE_ACCESSORIES.filter((entry) => !current.ownedAccessoryIds.includes(entry.id)));
        if (item) reward = { kind: 'accessory', title: 'Phụ kiện hiếm!', description: `${item.name} đã được thêm vào tủ đồ.`, itemId: item.id };
      } else if (outcome === 5) {
        const skin = randomItem(FLYTIEE_SKINS.filter((entry) => entry.id !== 'classic' && !current.ownedSkinIds.includes(entry.id)));
        if (skin) reward = { kind: 'skin', title: 'Skin mới!', description: `${skin.name} đã được thêm vào tủ đồ.`, itemId: skin.id };
      } else if (outcome === 6) {
        const set = randomItem(FLYTIEE_SETS.filter((entry) => !entry.exclusiveMilestone && !current.ownedSetIds.includes(entry.id)));
        if (set) reward = { kind: 'set', title: 'Set sự kiện!', description: `${set.name} đã được mở khóa.`, itemId: set.id };
      }
    }

    commit((value) => {
      const consumed = { ...value, chests: { ...value.chests, [tier]: Math.max(0, value.chests[tier] - 1) } };
      return grantReward(consumed, reward);
    }, reward.description);
    return reward;
  }, [commit]);

  const redeemBirdieMail = useCallback(async (rawCode: string): Promise<FlytieeRewardResult | null> => {
    const code = rawCode.trim().toUpperCase().replace(/\s+/g, '-');
    if (!code) return null;

    // Birdie Mail phát hành chính thức được kiểm tra trên Supabase. Điều này
    // tránh việc mã quà, số lượt nhận và phần thưởng bị sửa ở trình duyệt.
    const { data, error } = await getSupabaseClient().rpc('redeem_flytiee_gift_code', { p_code: code });
    if (!error && data?.ok) {
      const remoteReward = data as {
        kind: FlytieeRewardResult['kind'];
        title: string;
        description: string;
        amount?: number | null;
        chestTier?: FlytieeChestTier | null;
        itemId?: string | null;
      };
      const reward: FlytieeRewardResult = {
        kind: remoteReward.kind,
        title: remoteReward.title,
        description: remoteReward.description,
        ...(remoteReward.amount != null ? { amount: remoteReward.amount } : {}),
        ...(remoteReward.chestTier ? { chestTier: remoteReward.chestTier } : {}),
        ...(remoteReward.itemId ? { itemId: remoteReward.itemId } : {}),
      };
      commit((current) => {
        const rewarded = grantReward(current, reward);
        return { ...rewarded, redeemedMailCodes: [...rewarded.redeemedMailCodes, code].slice(-100) };
      }, reward.description);
      return reward;
    }

    // Các mã mẫu cũ vẫn dùng được nếu migration Birdie Mail chưa chạy. Mã mới
    // trong bảng flytiee_gift_codes chỉ hoạt động qua RPC ở phía trên.
    const mailReward = BIRDIE_MAIL_CODES[code];
    if (!mailReward) {
      if (error?.code === 'PGRST202') {
        setMessage('Hệ thống Birdie Mail chưa được cài trên Supabase. Hãy chạy đầy đủ file flytiee-events-schema.sql.');
      } else {
        setMessage(error?.message || 'Birdie Mail không hợp lệ hoặc đã hết hạn. Hãy kiểm tra lại mã.');
      }
      return null;
    }
    if (profileRef.current.redeemedMailCodes.includes(code)) {
      setMessage('Birdie Mail này đã được nhận trên tài khoản của bạn.');
      return null;
    }

    let reward: FlytieeRewardResult;
    if (mailReward.kind === 'coins') {
      reward = { kind: 'coins', title: 'Thư quà từ Birdie!', description: `Bạn nhận ${mailReward.amount} xu.`, amount: mailReward.amount };
    } else if (mailReward.kind === 'chest') {
      reward = { kind: 'chest', title: 'Thư quà từ Birdie!', description: `${CHEST_LABELS[mailReward.chestTier]} đã được chuyển vào kho.`, chestTier: mailReward.chestTier };
    } else if (mailReward.kind === 'accessory') {
      const item = FLYTIEE_ACCESSORIES.find((entry) => entry.id === mailReward.itemId);
      reward = { kind: 'accessory', title: 'Thư quà từ Birdie!', description: `${item?.name ?? 'Phụ kiện'} đã được thêm vào tủ đồ.`, itemId: mailReward.itemId };
    } else if (mailReward.kind === 'skin') {
      const item = FLYTIEE_SKINS.find((entry) => entry.id === mailReward.itemId);
      reward = { kind: 'skin', title: 'Thư quà từ Birdie!', description: `${item?.name ?? 'Skin'} đã được thêm vào tủ đồ.`, itemId: mailReward.itemId };
    } else {
      const item = FLYTIEE_SETS.find((entry) => entry.id === mailReward.itemId);
      reward = { kind: 'set', title: 'Thư quà từ Birdie!', description: `${item?.name ?? 'Set sự kiện'} đã được mở khóa.`, itemId: mailReward.itemId };
    }

    commit((current) => {
      const rewarded = grantReward(current, reward);
      return { ...rewarded, redeemedMailCodes: [...rewarded.redeemedMailCodes, code].slice(-100) };
    }, reward.description);
    return reward;
  }, [commit]);

  const buyOrEquip = useCallback((accessoryId: string) => {
    const item = FLYTIEE_ACCESSORIES.find((entry) => entry.id === accessoryId);
    if (!item) return false;
    const current = profileRef.current;
    if (current.equippedSetId) {
      setMessage('Hãy tháo Set sự kiện trước khi phối phụ kiện riêng.');
      return false;
    }
    const owned = current.ownedAccessoryIds.includes(item.id);
    if (!owned && current.coins < item.price) {
      setMessage(`Cần thêm ${item.price - current.coins} xu để mua ${item.name}.`);
      return false;
    }
    commit((value) => {
      const alreadyEquipped = value.equipped[item.slot] === item.id;
      const equipped = { ...value.equipped };
      if (alreadyEquipped) delete equipped[item.slot];
      else equipped[item.slot] = item.id;
      return {
        ...value,
        coins: owned ? value.coins : value.coins - item.price,
        ownedAccessoryIds: owned ? value.ownedAccessoryIds : [...value.ownedAccessoryIds, item.id],
        equipped,
      };
    }, owned ? `${item.name} đã được thay đổi.` : `Đã mua và mặc ${item.name}!`);
    return true;
  }, [commit]);

  const equipSet = useCallback((setId: string) => {
    const item = FLYTIEE_SETS.find((entry) => entry.id === setId);
    if (!item) return false;
    const current = profileRef.current;
    if (!current.ownedSetIds.includes(item.id)) {
      setMessage(`${item.name} chỉ có thể nhận khi tham gia ${item.eventName}.`);
      return false;
    }
    const removing = current.equippedSetId === item.id;
    commit((value) => ({
      ...value,
      equippedSetId: removing ? null : item.id,
      equipped: removing ? value.equipped : {},
    }), removing ? `Đã tháo ${item.name}.` : `Đã mặc trọn bộ ${item.name}!`);
    return true;
  }, [commit]);

  const buyOrEquipSkin = useCallback((skinId: string) => {
    const skin = FLYTIEE_SKINS.find((entry) => entry.id === skinId);
    if (!skin) return false;
    const current = profileRef.current;
    const owned = current.ownedSkinIds.includes(skin.id);
    if (!owned && current.coins < skin.price) {
      setMessage(`Cần thêm ${skin.price - current.coins} xu để mua ${skin.name}.`);
      return false;
    }
    if (current.equippedSkinId === skin.id) {
      setMessage(`${skin.name} đang được sử dụng.`);
      return true;
    }
    commit((value) => ({
      ...value,
      coins: owned ? value.coins : value.coins - skin.price,
      ownedSkinIds: owned ? value.ownedSkinIds : [...value.ownedSkinIds, skin.id],
      equippedSkinId: skin.id,
    }), owned ? `Đã đổi sang ${skin.name}.` : `Đã mua và sử dụng ${skin.name}!`);
    return true;
  }, [commit]);

  const clearMessage = useCallback(() => setMessage(''), []);

  const reloadProfile = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await getSupabaseClient().auth.getUser();
    if (error || !data.user) return;
    const remote = data.user.user_metadata?.[FLYTIEE_METADATA_KEY];
    if (!remote) return;
    const next = normalizeFlytieeProfile(remote);
    profileRef.current = next;
    setProfile(next);
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Remote profile is authoritative. */ }
  }, [storageKey, userId]);

  return {
    profile,
    satiety,
    xpNeeded,
    missions,
    eventStats: currentEventStats,
    dailyEvent,
    loading,
    saving,
    message,
    feed,
    rename,
    claimMission,
    claimStreakReward,
    claimStudyReward,
    claimPracticeCoins,
    claimDailyCompletionChest,
    openChest,
    redeemBirdieMail,
    buyOrEquip,
    equipSet,
    buyOrEquipSkin,
    refreshMissions,
    clearMessage,
    reloadProfile,
  };
}
