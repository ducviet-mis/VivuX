'use client';

import React from 'react';
import { MathRenderer } from './math-renderer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface SolutionDisplayProps {
  isCorrect: boolean;
  correctAnswer: number;
  solution: string;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function SolutionDisplay({ isCorrect, correctAnswer, solution, onNext, isLastQuestion }: SolutionDisplayProps) {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className={cn(
      "mt-6 rounded-xl border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300",
      isCorrect ? "border-emerald-200 dark:border-emerald-800/50" : "border-red-200 dark:border-red-800/50"
    )}>
      <div className={cn(
        "px-4 py-3 flex items-center gap-2 font-medium",
        isCorrect 
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" 
          : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
      )}>
        {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        {isCorrect ? 'Chính xác!' : 'Chưa chính xác!'}
        <span className="ml-auto font-semibold">
          Đáp án đúng: {letters[correctAnswer]}
        </span>
      </div>
      
      <div className="p-6 bg-slate-50 dark:bg-[#110c18]/50 text-[#1e1b4b] dark:text-slate-200">
        <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Lời giải chi tiết</h4>
        <div className="text-base leading-relaxed">
          <MathRenderer content={solution} />
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button onClick={onNext} className="gap-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl shadow-md shadow-fuchsia-500/20">
            {isLastQuestion ? 'Hoàn thành' : 'Câu tiếp theo'}
            {!isLastQuestion && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
