'use client';

import { cn } from '@/lib/utils';
import { FlagButton } from './flag-button';

interface McqAnswerProps {
  questionNumber: number;
  value: string;
  onChange: (value: string) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
}

export function McqAnswer({ questionNumber, value, onChange, isFlagged, onToggleFlag }: McqAnswerProps) {
  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg border bg-background hover:border-primary/30 transition-colors">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">
        {questionNumber}
      </div>
      
      <div className="flex-1 flex justify-center space-x-2 sm:space-x-4">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "w-10 h-10 rounded-full border-2 font-medium transition-all text-sm sm:text-base",
              value === opt 
                ? "border-primary bg-primary text-primary-foreground scale-110 shadow-sm" 
                : "border-muted-foreground/30 text-foreground hover:border-primary/50"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      
      <div className="shrink-0">
        <FlagButton isActive={isFlagged} onClick={onToggleFlag} />
      </div>
    </div>
  );
}
