'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export function useSavedQuestions(lessonId?: string) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const supabase = getSupabaseClient();

  const fetchSavedIds = useCallback(async (lesson: string) => {
    if (!user) return [];
    const { data } = await supabase
      .from('saved_questions')
      .select('question_id')
      .eq('lesson_id', lesson)
      .eq('user_id', user.id);
    
    return data?.map((s: { question_id: string }) => s.question_id) || [];
  }, [supabase, user]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (lessonId && user) {
        const ids = await fetchSavedIds(lessonId);
        setSavedIds(ids);
      }
      setLoading(false);
    }
    load();
  }, [lessonId, user, fetchSavedIds]);

  const toggleSave = async (questionId: string, currentLessonId: string, difficultyLevel: number = 1) => {
    if (!user) return;

    const isCurrentlySaved = savedIds.includes(questionId);

    if (isCurrentlySaved) {
      // Optimistic update
      setSavedIds(prev => prev.filter(id => id !== questionId));
      
      const { error } = await supabase
        .from('saved_questions')
        .delete()
        .match({ user_id: user.id, question_id: questionId });
        
      if (error) {
        // Revert on error
        setSavedIds(prev => [...prev, questionId]);
      }
    } else {
      // Optimistic update
      setSavedIds(prev => [...prev, questionId]);
      
      const { error } = await supabase
        .from('saved_questions')
        .insert({
          user_id: user.id,
          question_id: questionId,
          lesson_id: currentLessonId,
          difficulty_level: difficultyLevel
        });
        
      if (error) {
        // Revert on error
        setSavedIds(prev => prev.filter(id => id !== questionId));
      }
    }
  };

  const fetchAllSavedCount = async () => {
    if (!user) return 0;
    const { count } = await supabase
      .from('saved_questions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    return count || 0;
  };

  const fetchSavedByLesson = async () => {
    if (!user) return {};
    const { data } = await supabase
      .from('saved_questions')
      .select('lesson_id')
      .eq('user_id', user.id);
      
    const counts: Record<string, number> = {};
    (data || []).forEach((s: { lesson_id: string }) => {
      counts[s.lesson_id] = (counts[s.lesson_id] || 0) + 1;
    });
    return counts;
  };

  return {
    savedIds,
    loading,
    toggleSave,
    fetchSavedIds,
    fetchAllSavedCount,
    fetchSavedByLesson
  };
}
