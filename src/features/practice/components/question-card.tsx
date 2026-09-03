'use client';

import React from 'react';
import { Question } from '../types';
import { MathRenderer } from './math-renderer';
import { AnswerOptions } from './answer-options';
import { SolutionDisplay } from './solution-display';
import { Progress } from '@/components/ui/progress';
import { ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  showSolution: boolean;
  onSelectAnswer: (idx: number) => void;
  onNext: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isCorrect,
  showSolution,
  onSelectAnswer,
  onNext,
  isSaved,
  onToggleSave
}: QuestionCardProps) {
  const progressPercent = ((currentIndex) / totalQuestions) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-bold shadow-sm border border-blue-200/50 dark:border-blue-800/50">
          Câu {currentIndex + 1} / {totalQuestions}
        </div>
        
        {onToggleSave && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSave}
            className={`rounded-full transition-colors ${isSaved ? 'text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-900/50 dark:text-fuchsia-400' : 'text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20'}`}
            title={isSaved ? "Bỏ lưu câu hỏi" : "Lưu câu hỏi"}
          >
            <ShoppingBasket className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>
      
      <Progress value={progressPercent} className="h-3 mb-10 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-fuchsia-500 [&>div]:to-pink-500" />
      
      <div className="bg-white dark:bg-[#1a1625] rounded-[32px] shadow-sm border border-slate-100 dark:border-white/5 p-8 md:p-12">
        <div className="text-xl md:text-2xl font-bold text-[#1e1b4b] dark:text-white leading-relaxed mb-10">
          <MathRenderer content={question.content} />
        </div>
        
        <AnswerOptions 
          options={question.options}
          selectedAnswer={selectedAnswer}
          correctAnswer={question.correctAnswer}
          onSelect={onSelectAnswer}
        />
        
        {showSolution && (
          <SolutionDisplay 
            isCorrect={isCorrect!}
            correctAnswer={question.correctAnswer}
            solution={question.solution}
            onNext={onNext}
            isLastQuestion={currentIndex === totalQuestions - 1}
          />
        )}
      </div>
    </div>
  );
}
