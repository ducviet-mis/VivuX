import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStreak {
  currentStreak: number;
  lastLoginDate: string | null;
  bestStreak: number;
}

interface StreakState {
  users: Record<string, UserStreak>;
  checkIn: (userId: string) => void;
  getStreak: (userId: string) => UserStreak;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      users: {},
      getStreak: (userId: string) => {
        let userStreak = get().users[userId];
        const today = new Date().toISOString().split('T')[0];
        
        if (!userStreak || (userStreak.currentStreak === 1 && userStreak.lastLoginDate === today)) {
          try {
            const v1DataStr = typeof window !== 'undefined' ? localStorage.getItem('edu-tutor-streak') : null;
            if (v1DataStr) {
              const v1Data = JSON.parse(v1DataStr).state;
              if (v1Data && typeof v1Data.currentStreak === 'number' && v1Data.currentStreak > 1) {
                return {
                  currentStreak: v1Data.currentStreak,
                  lastLoginDate: v1Data.lastLoginDate,
                  bestStreak: v1Data.bestStreak
                };
              }
            }
          } catch (e) {
            // ignore
          }
        }
        return userStreak || { currentStreak: 0, lastLoginDate: null, bestStreak: 0 };
      },
      checkIn: (userId: string) => {
        const today = new Date().toISOString().split('T')[0];
        let userStreak = get().users[userId];

        // MIGRATION: If user has no streak in v2, OR just got reset to 1 today due to the bug, check v1
        if (!userStreak || (userStreak.currentStreak === 1 && userStreak.lastLoginDate === today)) {
          try {
            const v1DataStr = localStorage.getItem('edu-tutor-streak');
            if (v1DataStr) {
              const v1Data = JSON.parse(v1DataStr).state;
              if (v1Data && typeof v1Data.currentStreak === 'number' && v1Data.currentStreak > 1) {
                userStreak = {
                  currentStreak: v1Data.currentStreak,
                  lastLoginDate: v1Data.lastLoginDate,
                  bestStreak: v1Data.bestStreak
                };
              }
            }
          } catch (e) {
            console.error('Failed to migrate streak', e);
          }
        }
        
        userStreak = userStreak || { currentStreak: 0, lastLoginDate: null, bestStreak: 0 };
        const { lastLoginDate, currentStreak, bestStreak } = userStreak;

        if (lastLoginDate === today) {
          // If we just migrated (or overwrote), we still need to save it to v2 state!
          if (!get().users[userId] || get().users[userId].currentStreak !== currentStreak) {
            set((state) => ({
              users: { ...state.users, [userId]: userStreak }
            }));
          }
          return; // Already checked in today
        }

        let newStreak = currentStreak;
        if (lastLoginDate) {
          const lastDate = new Date(lastLoginDate);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        set((state) => ({
          users: {
            ...state.users,
            [userId]: {
              currentStreak: newStreak,
              lastLoginDate: today,
              bestStreak: Math.max(bestStreak, newStreak)
            }
          }
        }));
      },
    }),
    {
      name: 'edu-tutor-streaks-v2', // Changed name to avoid conflict with old format
    }
  )
);
