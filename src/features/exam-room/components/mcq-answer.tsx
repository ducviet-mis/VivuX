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
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-surface hover:border-primary/30 transition-colors">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">
        {questionNumber}
      </div>

      <div className="flex-1 flex justify-center gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            aria-label={`Câu ${questionNumber}, đáp án ${opt}`}
            aria-pressed={value === opt}
            className={cn(
              "w-11 h-11 rounded-md border-2 font-medium transition-colors text-sm",
              value === opt
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
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
