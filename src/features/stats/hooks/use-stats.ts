'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export type TimeFilter = 'today' | 'week' | 'month' | 'all';

export type StatsData = {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  totalMinutes: number;
  accuracy: number;
};

export function useStats(filter: TimeFilter): StatsData {
  const [data, setData] = useState<StatsData>({
    totalQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    totalMinutes: 0,
    accuracy: 0,
  });
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('practice_progress')
        .select('is_correct')
        .eq('user_id', user.id);

      if (filter !== 'all') {
        const date = new Date();
        if (filter === 'today') {
          date.setHours(0, 0, 0, 0);
        } else if (filter === 'week') {
          date.setDate(date.getDate() - 7);
        } else if (filter === 'month') {
          date.setDate(date.getDate() - 30);
        }
        query = query.gte('answered_at', date.toISOString());
      }

      const { data: progressData } = await query;
      
      if (progressData) {
        const totalQuestions = progressData.length;
        const correctCount = progressData.filter((row: { is_correct: boolean }) => row.is_correct).length;
        const wrongCount = totalQuestions - correctCount;
        const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const totalMinutes = totalQuestions * 2;

        setData({
          totalQuestions,
          correctCount,
          wrongCount,
          totalMinutes,
          accuracy,
        });
      }
    };

    fetchStats();
  }, [filter, user?.id]);

  return data;
}
