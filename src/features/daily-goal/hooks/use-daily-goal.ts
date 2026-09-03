'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useGoalStore } from '../stores/goal-store';

export function useDailyGoal() {
  const [progress, setProgress] = useState({
    studyMinutes: 0,
    questionsCount: 0,
    correctCount: 0
  });
  
  const goals = useGoalStore((state) => state.goals);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;

    const fetchTodayProgress = async () => {
      const supabase = getSupabaseClient();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('practice_progress')
        .select('is_correct')
        .eq('user_id', user.id)
        .gte('answered_at', today.toISOString());

      if (data) {
        const questionsCount = data.length;
        const correctCount = data.filter((row: { is_correct: boolean }) => row.is_correct).length;
        const studyMinutes = questionsCount * 2;

        setProgress({
          studyMinutes,
          questionsCount,
          correctCount
        });
      }
    };

    fetchTodayProgress();
  }, [user?.id]);

  const currentAccuracy = progress.questionsCount > 0 
    ? Math.round((progress.correctCount / progress.questionsCount) * 100) 
    : 0;

  const percentages = {
    study: Math.min(100, Math.round((progress.studyMinutes / goals.studyMinutes) * 100)) || 0,
    questions: Math.min(100, Math.round((progress.questionsCount / goals.questionsCount) * 100)) || 0,
    accuracy: Math.min(100, Math.round((currentAccuracy / goals.accuracy) * 100)) || 0,
    overall: 0
  };
  
  percentages.overall = Math.round((percentages.study + percentages.questions + percentages.accuracy) / 3) || 0;

  return {
    progress,
    goals,
    currentAccuracy,
    percentages
  };
}
