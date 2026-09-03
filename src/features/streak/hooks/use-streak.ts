import { useEffect } from 'react';
import { useStreakStore } from '../stores/streak-store';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export function useStreak() {
  const { user } = useAuthStore();
  const { checkIn, getStreak } = useStreakStore();

  useEffect(() => {
    if (user?.id) {
      checkIn(user.id);
    }
  }, [checkIn, user?.id]);

  const streakData = user?.id ? getStreak(user.id) : { currentStreak: 0, bestStreak: 0 };

  return {
    currentStreak: streakData.currentStreak,
    bestStreak: streakData.bestStreak
  };
}
