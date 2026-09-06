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
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary-soft text-primary text-sm font-bold shadow-soft border border-primary/50">
          Câu {currentIndex + 1} / {totalQuestions}
        </div>

        {onToggleSave && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSave}
            className={`rounded-full transition-colors ${isSaved ? 'text-primary bg-primary-soft' : 'text-muted-foreground hover:text-primary hover:bg-primary-soft'}`}
            title={isSaved ? "Bỏ lưu câu hỏi" : "Lưu câu hỏi"}
            aria-label={isSaved ? "Bỏ lưu câu hỏi" : "Lưu câu hỏi"}
            aria-pressed={!!isSaved}
          >
            <ShoppingBasket className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>

      <Progress value={progressPercent} aria-label="Tiến độ làm bài" className="h-2 md:h-3 mb-6 md:mb-10 bg-muted rounded-full overflow-hidden [&>div]:bg-primary" />

      <div className="bg-card rounded-none md:rounded-xl shadow-none md:shadow-soft border-y md:border border-border p-4 md:p-12">
        <div className="text-lg md:text-2xl font-bold text-foreground leading-relaxed mb-6 md:mb-10">
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
