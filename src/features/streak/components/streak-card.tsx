'use client';

import { Flame } from 'lucide-react';
import { useStreak } from '../hooks/use-streak';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StreakCard() {
  const { currentStreak, bestStreak } = useStreak();

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full gap-2">
        <div className={cn("p-4 rounded-full bg-orange-100 dark:bg-orange-900/30", currentStreak > 0 && "animate-pulse")}>
          <Flame className={cn("w-10 h-10 text-orange-500", currentStreak > 0 && "drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]")} />
        </div>
        <div className="mt-2">
          <span className="text-4xl font-bold text-foreground">{currentStreak}</span>
          <p className="text-muted-foreground font-medium">ngày liên tiếp</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2 bg-muted px-2 py-1 rounded-full">
          Kỷ lục: {bestStreak} ngày
        </p>
      </CardContent>
    </Card>
  );
}
