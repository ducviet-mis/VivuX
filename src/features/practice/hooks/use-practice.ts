'use client';

import { useState, useMemo, useEffect } from 'react';
import { Question } from '../types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export function usePractice(questions: Question[], lessonId: string, initialAnsweredIds: string[] = [], saveProgress: boolean = true) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  
  const supabase = getSupabaseClient();
  const { user } = useAuthStore();

  // Memoize initialAnsweredIds to avoid re-triggering on every render
  const answeredCount = initialAnsweredIds.length;
  const answeredIdsStr = initialAnsweredIds.join(',');

  useEffect(() => {
    if (questions.length > 0) {
      const ids = answeredIdsStr ? answeredIdsStr.split(',') : [];
      const firstUnansweredIndex = questions.findIndex(q => !ids.includes(q.id));
      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex);
      } else {
        setCurrentQuestionIndex(0);
      }
    }
    // Reset answers when questions change
    setAnswers({});
    setShowSolution({});
  }, [questions, answeredIdsStr]);

  const currentQuestion = questions[currentQuestionIndex];
  
  const selectedAnswer = answers[currentQuestion?.id] ?? null;
  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered ? selectedAnswer === currentQuestion?.correctAnswer : null;
  const isShowingSolution = !!showSolution[currentQuestion?.id];

  const selectAnswer = async (index: number) => {
    if (isAnswered) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: index }));
    setShowSolution(prev => ({ ...prev, [currentQuestion.id]: true }));
    
    if (user?.id && currentQuestion && saveProgress) {
      const isAnsCorrect = index === currentQuestion.correctAnswer;
      try {
        const { error } = await supabase.from('practice_progress').upsert({
          user_id: user.id,
          question_id: currentQuestion.id,
          lesson_id: lessonId,
          difficulty_level: currentQuestion.difficultyLevel || 1,
          selected_answer: index,
          is_correct: isAnsCorrect,
          answered_at: new Date().toISOString()
        }, { onConflict: 'user_id,question_id' });
        
        if (error) {
          console.error('Save progress error:', error);
          // Fallback: try insert instead
          const { error: insertErr } = await supabase.from('practice_progress').insert({
            user_id: user.id,
            question_id: currentQuestion.id,
            lesson_id: lessonId,
            difficulty_level: currentQuestion.difficultyLevel || 1,
            selected_answer: index,
            is_correct: isAnsCorrect
          });
          if (insertErr) {
            console.error('Insert fallback error:', insertErr);
          }
        }
      } catch (e) {
        console.error('Save progress exception:', e);
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const progress = useMemo(() => {
    const ids = answeredIdsStr ? answeredIdsStr.split(',') : [];
    let answered = ids.length;
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        if (!ids.includes(q.id)) {
          answered++;
        }
        if (answers[q.id] === q.correctAnswer) correct++;
      }
    });
    return { answered, total: questions.length, correct };
  }, [answers, questions, answeredIdsStr]);

  return {
    currentQuestionIndex,
    currentQuestion,
    selectedAnswer,
    isAnswered,
    isCorrect,
    showSolution: isShowingSolution,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    progress
  };
}
