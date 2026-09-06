'use client';

import { cn } from '@/lib/utils';
import { FlagButton } from './flag-button';

interface TrueFalseAnswerProps {
  questionNumber: number;
  value: string;
  onChange: (value: string) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
}

export function TrueFalseAnswer({ questionNumber, value, onChange, isFlagged, onToggleFlag }: TrueFalseAnswerProps) {
  const options = [
    { label: 'Đúng', val: 'D' },
    { label: 'Sai', val: 'S' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-surface hover:border-primary/30 transition-colors">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">
        {questionNumber}
      </div>

      <div className="flex-1 flex justify-center gap-2">
        {options.map(opt => (
          <button
            key={opt.val}
            onClick={() => onChange(opt.val)}
            aria-label={`Câu ${questionNumber}, ${opt.label}`}
            aria-pressed={value === opt.val}
            className={cn(
              "px-4 h-11 rounded-md border-2 font-medium transition-colors",
              value === opt.val
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-muted-foreground/30 text-foreground hover:border-primary/50"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="shrink-0">
        <FlagButton isActive={isFlagged} onClick={onToggleFlag} />
      </div>
    </div>
  );
}
