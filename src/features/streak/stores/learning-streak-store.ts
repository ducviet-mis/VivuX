import { create } from 'zustand';
import { getSupabaseClient } from '@/lib/supabase/client';

export interface LearningStreak {
  currentStreak: number;
  bestStreak: number;
  lastLoginDate: string | null;
  claimedMilestones: number[];
  discountExpiresAt: string | null;
}

interface LearningStreakState {
  users: Record<string, LearningStreak>;
  ready: Record<string, boolean>;
  error: string | null;
  checkIn: (userId: string) => Promise<void>;
}

const pending = new Map<string, Promise<void>>();

export const useLearningStreakStore = create<LearningStreakState>()((set) => ({
  users: {},
  ready: {},
  error: null,
  checkIn: (userId) => {
    const running = pending.get(userId);
    if (running) return running;
    const request = (async () => {
      const { data, error } = await getSupabaseClient().rpc('check_in_learning_streak');
      if (error || !data?.ok) {
        set((state) => ({
          ready: { ...state.ready, [userId]: true },
          error: error?.code === 'PGRST202'
            ? 'Cần chạy SQL learning-streak-rewards.sql trên Supabase để bật streak.'
            : error?.message || data?.message || 'Không thể đồng bộ streak. Vui lòng thử lại.',
        }));
        return;
      }
      set((state) => ({
        users: {
          ...state.users,
          [userId]: {
            currentStreak: Number(data.current_streak) || 0,
            bestStreak: Number(data.best_streak) || 0,
            lastLoginDate: data.last_checkin_date ?? null,
            claimedMilestones: Array.isArray(data.claimed_milestones) ? data.claimed_milestones.map(Number) : [],
            discountExpiresAt: data.discount_expires_at ?? null,
          },
        },
        ready: { ...state.ready, [userId]: true },
        error: null,
      }));
    })().catch(() => {
      set((state) => ({
        ready: { ...state.ready, [userId]: true },
        error: 'Không thể kết nối để điểm danh. Hãy kiểm tra mạng và thử lại.',
      }));
    }).finally(() => pending.delete(userId));
    pending.set(userId, request);
    return request;
  },
}));
