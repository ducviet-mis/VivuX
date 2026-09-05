'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MathRenderer, formatOptionMath } from './math-renderer';

interface AnswerOptionsProps {
  options: string[];
  selectedAnswer: number | null;
  correctAnswer: number;
  onSelect: (index: number) => void;
}

export function AnswerOptions({ options, selectedAnswer, correctAnswer, onSelect }: AnswerOptionsProps) {
  const letters = ['A', 'B', 'C', 'D'];
  const isAnswered = selectedAnswer !== null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-6">
      {options.map((option, idx) => {
        const isSelected = selectedAnswer === idx;
        const isCorrect = correctAnswer === idx;
        
        let stateClass = "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 shadow-sm";
        let letterClass = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-bold";

        if (isAnswered) {
          if (isCorrect) {
            stateClass = "bg-emerald-50 border-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20";
            letterClass = "bg-emerald-500 text-white font-bold";
          } else if (isSelected && !isCorrect) {
            stateClass = "bg-red-50 border-red-400 dark:bg-red-900/30 dark:border-red-500 shadow-sm";
            letterClass = "bg-red-500 text-white font-bold";
          } else {
            stateClass = "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-50 grayscale-[0.5]";
          }
        }

        return (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={isAnswered}
            className={cn(
              "flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all duration-200 text-left group",
              stateClass,
              !isAnswered && "hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            <div className={cn(
              "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-sm transition-colors",
              letterClass,
              !isAnswered && "group-hover:bg-fuchsia-100 dark:group-hover:bg-fuchsia-900 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300"
            )}>
              {letters[idx]}
            </div>
            <div className="flex-1 text-[#1e1b4b] dark:text-slate-200">
              <MathRenderer content={formatOptionMath(option)} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
