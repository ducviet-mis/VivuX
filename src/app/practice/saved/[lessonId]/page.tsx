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

export default function SavedLessonPracticePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lessonId = params?.lessonId as string;
  
  const levelStr = searchParams.get('level');
  const level = levelStr ? parseInt(levelStr) : null;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = getSupabaseClient();
  const { user } = useAuthStore();
  const { savedIds, toggleSave } = useSavedQuestions(lessonId);

  const lessonInfo = useMemo(() => {
    const meta = LESSON_META[lessonId];
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
  }, [lessonId]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      let savedQuery = supabase
        .from('saved_questions')
        .select('question_id')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id);

      if (level) {
        savedQuery = savedQuery.eq('difficulty_level', level);
      }

      const { data: savedData } = await savedQuery;

      if (!savedData || savedData.length === 0) {
        setQuestions([]);
        setIsLoading(false);
        return;
      }

      const questionIds = savedData.map((s: { question_id: string }) => s.question_id);

      const { data, error } = await supabase
        .from('practice_questions')
        .select('*')
        .in('id', questionIds)
        .order('order_index');
        
      if (data && !error) {
        const mappedQuestions: Question[] = data.map((q: any) => ({
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

      setIsLoading(false);
    }
    
    if (lessonId) {
      loadData();
    }
  }, [lessonId, supabase, user?.id]);

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
  } = usePractice(questions, lessonId, []); // empty array so user can redo them

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
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-card-foreground">Câu hỏi đã lưu: {lesson.title}</h1>
            <p className="text-sm text-muted-foreground">{chapter.title} • {grade.label}</p>
          </div>
          <div className="ml-auto text-sm font-medium bg-card px-4 py-2 rounded-full border border-border shadow-sm">
            Tiến độ: <span className="text-teal-600">{progress.answered}/{progress.total}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải câu hỏi...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 border border-border text-center text-muted-foreground">
            Bạn chưa lưu câu hỏi nào trong bài học này.
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-4 md:p-8 border border-border">
            <QuestionCard
              question={currentQuestion}
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              selectedAnswer={selectedAnswer}
              isCorrect={isCorrect}
              showSolution={showSolution}
              onSelectAnswer={selectAnswer}
              onNext={handleNext}
              isSaved={savedIds.includes(currentQuestion.id)}
              onToggleSave={() => toggleSave(currentQuestion.id, lessonId, currentQuestion.difficultyLevel || 1)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
