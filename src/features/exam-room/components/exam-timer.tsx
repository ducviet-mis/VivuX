'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamTimer } from '../hooks/use-exam-timer';
import { Progress } from '@/components/ui/progress';
import { useExamStore } from '../stores/exam-store';

export function ExamTimer() {
  const { formatted, isLow, isDanger } = useExamTimer();
  const { examConfig, timeRemaining } = useExamStore();

  const totalSeconds = (examConfig?.durationMinutes || 0) * 60;
  const progress = totalSeconds > 0 ? (timeRemaining / totalSeconds) * 100 : 0;

  return (
    <div className="flex flex-col w-48 shrink-0">
      <div className={cn(
        "flex items-center justify-center space-x-2 py-2 px-4 rounded-t-xl font-mono text-2xl font-bold bg-card border-x border-t",
        isDanger ? "text-destructive animate-pulse" :
        isLow ? "text-warning" :
        "text-primary"
      )}>
        <Clock className="w-6 h-6" />
        <span>{formatted}</span>
      </div>
      <Progress
        value={progress}
        className={cn("h-2 rounded-none rounded-b-xl border-x border-b",
          isDanger ? "bg-destructive-soft [&>div]:bg-destructive" :
          isLow ? "bg-warning-soft [&>div]:bg-warning" :
          "[&>div]:bg-primary"
        )}
      />
    </div>
  );
}
