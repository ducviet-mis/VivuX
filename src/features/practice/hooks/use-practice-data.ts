'use client';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Grade, Lesson } from '../types';
import { LESSON_META, GRADE_LABELS } from '../data/practice-data';

export function usePracticeData() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, { answered: number; total: number }>>({});
  const [wrongCounts, setWrongCounts] = useState<Record<string, number>>({});
  const [savedCounts, setSavedCounts] = useState<Record<string, number>>({});
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data: questions, error } = await supabase
        .from('practice_questions')
        .select('lesson_id, id, difficulty_level')
        .order('lesson_id');
      
      if (error || !questions) {
        setLoading(false);
        return;
      }

      const lessonMap = new Map<string, number>();
      const levelMap = new Map<string, number>(); // key: `${lesson_id}_${level}`

      questions.forEach((q: { lesson_id: string; id: string; difficulty_level?: number }) => {
        const level = q.difficulty_level || 1;
        lessonMap.set(q.lesson_id, (lessonMap.get(q.lesson_id) || 0) + 1);
        const levelKey = `${q.lesson_id}_${level}`;
        levelMap.set(levelKey, (levelMap.get(levelKey) || 0) + 1);
      });

      const lessonProgress: Record<string, { answered: number; total: number }> = {};
      const newWrongCounts: Record<string, number> = {};
      const newSavedCounts: Record<string, number> = {};
      
      if (user?.id) {
        const { data: progressData } = await supabase
          .from('practice_progress')
          .select('lesson_id, question_id, is_correct, difficulty_level')
          .eq('user_id', user.id);
          
        const progressCount = new Map<string, Set<string>>();
        const wrongCountMap = new Map<string, number>();

        (progressData || []).forEach((p: { lesson_id: string; question_id: string; is_correct: boolean; difficulty_level?: number }) => {
          const level = p.difficulty_level || 1;
          const levelKey = `${p.lesson_id}_${level}`;

          // Track for whole lesson
          if (!progressCount.has(p.lesson_id)) progressCount.set(p.lesson_id, new Set());
          progressCount.get(p.lesson_id)!.add(p.question_id);
          
          // Track for level
          if (!progressCount.has(levelKey)) progressCount.set(levelKey, new Set());
          progressCount.get(levelKey)!.add(p.question_id);

          if (p.is_correct === false) {
             wrongCountMap.set(p.lesson_id, (wrongCountMap.get(p.lesson_id) || 0) + 1);
             wrongCountMap.set(levelKey, (wrongCountMap.get(levelKey) || 0) + 1);
          }
        });
        
        // Fetch saved questions
        const { data: savedData } = await supabase
          .from('saved_questions')
          .select('lesson_id, question_id, difficulty_level')
          .eq('user_id', user.id);

        const savedCountMap = new Map<string, number>();
        (savedData || []).forEach((s: { lesson_id: string; question_id: string; difficulty_level?: number }) => {
           const level = s.difficulty_level || 1;
           const levelKey = `${s.lesson_id}_${level}`;
           savedCountMap.set(s.lesson_id, (savedCountMap.get(s.lesson_id) || 0) + 1);
           savedCountMap.set(levelKey, (savedCountMap.get(levelKey) || 0) + 1);
        });

        // Populate state for both lessonId and lessonId_level
        const allKeys = new Set([...Array.from(lessonMap.keys()), ...Array.from(levelMap.keys())]);
        allKeys.forEach((key) => {
          const isLevelKey = key.includes('_');
          const total = (isLevelKey ? levelMap.get(key) : lessonMap.get(key)) || 0;
          lessonProgress[key] = {
            answered: progressCount.get(key)?.size || 0,
            total
          };
          newWrongCounts[key] = wrongCountMap.get(key) || 0;
          newSavedCounts[key] = savedCountMap.get(key) || 0;
        });

      } else {
        const allKeys = new Set([...Array.from(lessonMap.keys()), ...Array.from(levelMap.keys())]);
        allKeys.forEach((key) => {
          const isLevelKey = key.includes('_');
          const total = (isLevelKey ? levelMap.get(key) : lessonMap.get(key)) || 0;
          lessonProgress[key] = { answered: 0, total };
          newWrongCounts[key] = 0;
          newSavedCounts[key] = 0;
        });
      }

      let dbLessons: Record<string, { grade: number; chapter: string; title: string }> = {};
      try {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('practice_lessons')
          .select('*');
        if (lessonsData && !lessonsError) {
          lessonsData.forEach((l: any) => {
            dbLessons[l.id] = { grade: l.grade, chapter: l.chapter, title: l.title };
          });
        }
      } catch (err) {
        console.warn('Could not fetch practice_lessons table, falling back to local metadata.');
      }

      // Add dbLessons to lessonMap even if they have 0 questions
      Object.keys(dbLessons).forEach(lessonId => {
        if (!lessonMap.has(lessonId)) {
          lessonMap.set(lessonId, 0);
          lessonProgress[lessonId] = { answered: 0, total: 0 };
          newWrongCounts[lessonId] = 0;
          newSavedCounts[lessonId] = 0;
        }
      });

      const gradeMap = new Map<number, Map<string, Lesson[]>>();
      
      Array.from(lessonMap.entries()).forEach(([lessonId]) => {
        const meta = dbLessons[lessonId] || LESSON_META[lessonId];
        
        // Nếu không có thông tin (đã bị xóa ở ADMIN), bỏ qua không hiển thị
        if (!meta) return;
        
        const gradeNum = meta.grade;
        const chapterTitle = (meta.chapter || 'Chuyên đề khác').trim();
        
        if (!gradeMap.has(gradeNum)) gradeMap.set(gradeNum, new Map<string, Lesson[]>());
        const chapters = gradeMap.get(gradeNum)!;
        if (!chapters.has(chapterTitle)) chapters.set(chapterTitle, []);
        
        chapters.get(chapterTitle)!.push({ id: lessonId, title: meta.title });
      });

      const gradeArray: Grade[] = Array.from(gradeMap.entries())
        .filter(([gradeNum]) => gradeNum > 0)
        .sort(([a], [b]) => a - b)
        .map(([gradeNum, chapterMap]) => ({
          id: gradeNum,
          label: GRADE_LABELS[gradeNum] || `Lớp ${gradeNum}`,
          chapters: Array.from(chapterMap.entries()).map(([chTitle, lessons]) => ({
            id: `c${gradeNum}-${chTitle}`,
            title: chTitle,
            lessons,
          })),
        }));

      setGrades(gradeArray);
      setProgress(lessonProgress);
      setWrongCounts(newWrongCounts);
      setSavedCounts(newSavedCounts);
      setLoading(false);
    }

    fetchData();
  }, [user?.id]);

  return { grades, loading, progress, wrongCounts, savedCounts };
}
