'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { usePractice } from '@/features/practice/hooks/use-practice';
import { useQuestionNav } from '@/features/practice/hooks/use-question-nav';
import { QuestionCard } from '@/features/practice/components/question-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Question } from '@/features/practice/types';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { LESSON_META, GRADE_LABELS } from '@/features/practice/data/practice-data';
import { useSavedQuestions } from '@/features/practice/hooks/use-saved-questions';

export default function LessonPracticePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lessonId = params?.lessonId as string;
  
  const levelStr = searchParams.get('level');
  const level = levelStr ? parseInt(levelStr) : null;
  const mode = searchParams.get('mode');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbLessonMeta, setDbLessonMeta] = useState<{grade: number, chapter: string, title: string} | null>(null);
  
  const supabase = getSupabaseClient();
  const { user } = useAuthStore();
  const { savedIds, toggleSave } = useSavedQuestions(lessonId);

  const lessonInfo = useMemo(() => {
    const meta = dbLessonMeta || LESSON_META[lessonId];
    if (meta) {
      return {
        grade: { id: meta.grade, label: GRADE_LABELS[meta.grade] || `Lớp ${meta.grade}` },
        chapter: { title: meta.chapter },
        lesson: { title: meta.title }
      };
    }
    // Fallback if not in meta
    return {
      grade: { id: parseInt(lessonId.match(/\d+/)?.[0] || '0'), label: 'Lớp' },
      chapter: { title: 'Chuyên đề' },
      lesson: { title: `Bài học ${lessonId}` }
    };
  }, [lessonId, dbLessonMeta]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      let query = supabase
        .from('practice_questions')
        .select('*')
        .eq('lesson_id', lessonId);
        
      if (level) {
        query = query.eq('difficulty_level', level);
      }

      const { data, error } = await query;
        
      // Fetch lesson metadata from DB
      const { data: lessonData } = await supabase
        .from('practice_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
        
      if (lessonData) {
        setDbLessonMeta({
          grade: lessonData.grade,
          chapter: lessonData.chapter,
          title: lessonData.title
        });
      }
        
      if (data && !error) {
        let finalData = data;

        // Trộn câu theo tỉ lệ
        if (mode === 'mix') {
          const count = parseInt(searchParams.get('count') || '20');
          const l1Ratio = parseInt(searchParams.get('l1') || '40');
          const l2Ratio = parseInt(searchParams.get('l2') || '30');
          const l3Ratio = parseInt(searchParams.get('l3') || '20');
          
          const byLevel: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [] };
          data.forEach((q: any) => {
            const lvl = q.difficulty_level || 1;
            if (byLevel[lvl]) byLevel[lvl].push(q);
          });
          
          const l1Count = Math.floor(count * l1Ratio / 100);
          const l2Count = Math.floor(count * l2Ratio / 100);
          const l3Count = Math.floor(count * l3Ratio / 100);
          const l4Count = count - l1Count - l2Count - l3Count;

          const shuffle = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random());
          
          const picked = [
            ...shuffle(byLevel[1]).slice(0, l1Count),
            ...shuffle(byLevel[2]).slice(0, l2Count),
            ...shuffle(byLevel[3]).slice(0, l3Count),
            ...shuffle(byLevel[4]).slice(0, l4Count),
          ];

          finalData = shuffle(picked);
        } else {
          // Normal mode, sort by order_index
          finalData = finalData.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
        }

        const mappedQuestions: Question[] = finalData.map((q: any) => ({
          id: q.id,
          content: q.content,
          options: q.options as string[],
          correctAnswer: q.correct_answer,
          solution: q.solution || '',
          hasMath: q.has_math,
          difficultyLevel: q.difficulty_level || 1
        }));
        setQuestions(mappedQuestions);
      }

      if (user?.id && mode !== 'mix') {
        let progQuery = supabase
          .from('practice_progress')
          .select('question_id')
          .eq('lesson_id', lessonId)
          .eq('user_id', user.id);
          
        if (level) {
          progQuery = progQuery.eq('difficulty_level', level);
        }

        const { data: progressData } = await progQuery;
          
        if (progressData) {
          setAnsweredIds(progressData.map((p: { question_id: string }) => p.question_id));
        }
      } else if (mode === 'mix') {
        setAnsweredIds([]);
      }
      setIsLoading(false);
    }
    
    if (lessonId) {
      loadData();
    }
  }, [lessonId, level, mode, searchParams, supabase, user?.id]);

  const {
    currentQuestionIndex,
    currentQuestion,
    selectedAnswer,
    isAnswered,
    isCorrect,
    showSolution,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    progress
  } = usePractice(questions, lessonId, mode === 'mix' ? [] : answeredIds, mode !== 'mix');

  const handleNext = () => {
    if (currentQuestionIndex === questions.length - 1) {
      router.push('/practice');
    } else {
      nextQuestion();
    }
  };

  useQuestionNav({
    onNext: handleNext,
    onPrev: prevQuestion,
    onSelect: selectAnswer,
    isAnswered
  });

  if (!lessonInfo) {
    return <div className="container py-12 text-center text-card-foreground">Không tìm thấy bài học!</div>;
  }

  const { lesson, chapter, grade } = lessonInfo;

  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      <div className="flex items-start md:items-center gap-3 md:gap-4 mb-6 md:mb-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full shrink-0 bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 shadow-sm border border-slate-200/50 dark:border-slate-800/50 mt-1 md:mt-0">
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-700 dark:text-slate-300" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-2xl font-bold text-[#1e1b4b] dark:text-white leading-tight truncate md:whitespace-normal">
            {lesson.title}
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
            {mode === 'mix' ? 'Luyện tập' : `${chapter.title} • ${grade.label}`}
          </p>
        </div>
        {mode !== 'mix' && (
          <div className="shrink-0 text-xs md:text-sm font-bold bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl shadow-sm border border-fuchsia-200/50 dark:border-fuchsia-800/50 flex flex-col md:flex-row items-center md:gap-1 mt-1 md:mt-0">
            <span className="hidden md:inline">Tiến độ:</span> 
            <span>{progress.answered}/{progress.total}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500 mb-4" />
          <p className="text-slate-500 font-medium">Đang tải bài tập...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1625] rounded-[32px] p-12 text-center text-slate-500 border border-slate-100 dark:border-white/5 shadow-sm">
          Chưa có câu hỏi nào cho bài học này.
        </div>
      ) : (
        <QuestionCard
          question={currentQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          selectedAnswer={selectedAnswer}
          isCorrect={isCorrect}
          showSolution={showSolution}
          onSelectAnswer={selectAnswer}
          onNext={handleNext}
          isSaved={mode === 'mix' ? false : savedIds.includes(currentQuestion.id)}
          onToggleSave={mode === 'mix' ? undefined : () => toggleSave(currentQuestion.id, lessonId, currentQuestion.difficultyLevel || 1)}
        />
      )}
    </div>
  );
}
