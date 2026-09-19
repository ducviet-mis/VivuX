'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import {
  DEFAULT_FLYTIEE_PROFILE,
  FLYTIEE_ACCESSORIES,
  FLYTIEE_METADATA_KEY,
  FLYTIEE_STORAGE_PREFIX,
  normalizeFlytieeProfile,
  xpNeededForLevel,
} from './config';
import type { FlytieeMission, FlytieeProfile } from './types';

const SATIETY_LOSS_PER_HOUR = 4;

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function startOfTodayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function createDefaultProfile(): FlytieeProfile {
  return { ...DEFAULT_FLYTIEE_PROFILE, satietyUpdatedAt: new Date().toISOString(), equipped: {} };
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
  const [profile, setProfile] = useState<FlytieeProfile>(createDefaultProfile);
  const [missions, setMissions] = useState<FlytieeMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [clock, setClock] = useState(Date.now());
  const profileRef = useRef(profile);
  const userId = user?.id;
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
    const since = startOfTodayIso();
    const [practiceResult, mockResult] = await Promise.all([
      supabase.from('practice_progress').select('is_correct').eq('user_id', userId).gte('answered_at', since),
      supabase.from('mock_exam_attempts').select('id').eq('user_id', userId).gte('created_at', since),
    ]);

    const practiceRows = practiceResult.data ?? [];
    const answered = practiceRows.length;
    const correct = practiceRows.filter((row: { is_correct: boolean }) => row.is_correct).length;
    const accuracy = answered > 0 ? Math.round(correct / answered * 100) : 0;
    const mockAttempts = mockResult.data?.length ?? 0;

    setMissions([
      { id: 'practice-5', title: 'Khởi động trí não', description: 'Hoàn thành 5 câu tự luyện hôm nay', current: Math.min(answered, 5), target: 5, xp: 20, coins: 20 },
      { id: 'practice-15', title: 'Chăm chỉ mỗi ngày', description: 'Hoàn thành 15 câu tự luyện hôm nay', current: Math.min(answered, 15), target: 15, xp: 35, coins: 35 },
      { id: 'accuracy-80', title: 'Đôi cánh chính xác', description: 'Đạt ít nhất 80% sau 10 câu hôm nay', current: answered >= 10 ? Math.min(accuracy, 80) : 0, target: 80, xp: 30, coins: 30 },
      { id: 'mock-exam-1', title: 'Dũng cảm thử sức', description: 'Hoàn thành 1 bài thi thử hôm nay', current: Math.min(mockAttempts, 1), target: 1, xp: 45, coins: 45 },
    ]);
  }, [userId]);

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
      void refreshMissions();
    }
    void load();
    return () => { cancelled = true; };
  }, [persist, refreshMissions, storageKey, userId]);

  const satiety = useMemo(() => calculateSatiety(profile, clock), [clock, profile]);
  const xpNeeded = xpNeededForLevel(profile.level);

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

  const buyOrEquip = useCallback((accessoryId: string) => {
    const item = FLYTIEE_ACCESSORIES.find((entry) => entry.id === accessoryId);
    if (!item) return false;
    const current = profileRef.current;
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

  const clearMessage = useCallback(() => setMessage(''), []);

  return {
    profile,
    satiety,
    xpNeeded,
    missions,
    loading,
    saving,
    message,
    feed,
    rename,
    claimMission,
    buyOrEquip,
    refreshMissions,
    clearMessage,
  };
}
