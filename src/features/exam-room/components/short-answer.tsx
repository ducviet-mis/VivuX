'use client';

import { FlagButton } from './flag-button';
import { Input } from '@/components/ui/input';

interface ShortAnswerProps {
  questionNumber: number;
  value: string;
  onChange: (value: string) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
}

export function ShortAnswer({ questionNumber, value, onChange, isFlagged, onToggleFlag }: ShortAnswerProps) {
  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg border bg-background hover:border-primary/30 transition-colors">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">
        {questionNumber}
      </div>
      
      <div className="flex-1">
        <Input 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập đáp án..."
          className="w-full font-medium"
        />
      </div>
      
      <div className="shrink-0">
        <FlagButton isActive={isFlagged} onClick={onToggleFlag} />
      </div>
    </div>
  );
}
