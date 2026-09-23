import { useEffect } from 'react';
import { useLearningStreakStore } from '../stores/learning-streak-store';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export function useStreak() {
  const userId = useAuthStore((state) => state.user?.id);
  const checkIn = useLearningStreakStore((state) => state.checkIn);
  const streakData = useLearningStreakStore((state) => userId ? state.users[userId] : undefined);
  const ready = useLearningStreakStore((state) => userId ? Boolean(state.ready[userId]) : false);
  const error = useLearningStreakStore((state) => state.error);

  useEffect(() => {
    if (!userId) return;
    void checkIn(userId);
    const nextMidnight = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return window.setTimeout(() => {
        void checkIn(userId);
        midnightTimer = nextMidnight();
      }, next.getTime() - now.getTime() + 1000);
    };
    let midnightTimer = nextMidnight();
    const onVisible = () => { if (document.visibilityState === 'visible') void checkIn(userId); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearTimeout(midnightTimer); document.removeEventListener('visibilitychange', onVisible); };
  }, [checkIn, userId]);

  return {
    currentStreak: streakData?.currentStreak ?? 0,
    bestStreak: streakData?.bestStreak ?? 0,
    claimedMilestones: streakData?.claimedMilestones ?? [],
    discountExpiresAt: streakData?.discountExpiresAt ?? null,
    ready,
    error,
    refreshStreak: () => userId ? checkIn(userId) : Promise.resolve(),
  };
}
