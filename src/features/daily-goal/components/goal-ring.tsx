'use client';

import { useEffect, useState } from 'react';
import { Clock3, ListChecks, Target, type LucideIcon } from 'lucide-react';
import { useDailyGoal } from '../hooks/use-daily-goal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoalSettingDialog } from './goal-setting-dialog';

function GoalMetric({ percent, current, target, label, suffix, tone, icon: Icon }: {
  percent: number; current: number; target: number; label: string; suffix: string; tone: string; icon: LucideIcon;
}) {
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - Math.min(100, percent) / 100 * circumference;
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-lg bg-muted/50 p-4 sm:flex-col sm:items-start sm:gap-3">
      <div className={`relative h-[76px] w-[76px] shrink-0 ${tone}`} role="img" aria-label={`${label}: ${current}/${target} ${suffix}, ${percent}%`}>
        <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="38" cy="38" r={radius} fill="none" stroke="currentColor" strokeWidth="5" className="text-track" />
          <circle cx="38" cy="38" r={radius} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-[stroke-dashoffset] duration-220" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-bold tabular-nums text-foreground">{percent}%</span>
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />{label}</p>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-1.5"><span className="vivux-stat-number text-2xl">{current}</span><span className="text-sm text-muted-foreground">/ {target} {suffix}</span></p>
      </div>
    </div>
  );
}

export function GoalRing() {
  const { percentages, progress, goals, currentAccuracy } = useDailyGoal();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-5">
        <div><CardTitle>Mục tiêu hằng ngày</CardTitle><p className="mt-1 text-sm text-muted-foreground">Từng bước nhỏ, tiến bộ mỗi ngày.</p></div>
        <GoalSettingDialog />
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <GoalMetric label="Thời gian học" icon={Clock3} percent={percentages.study} current={progress.studyMinutes} target={goals.studyMinutes} suffix="phút" tone="text-primary" />
        <GoalMetric label="Câu hoàn thành" icon={ListChecks} percent={percentages.questions} current={progress.questionsCount} target={goals.questionsCount} suffix="câu" tone="text-info" />
        <GoalMetric label="Chính xác" icon={Target} percent={currentAccuracy} current={currentAccuracy} target={100} suffix="%" tone="text-special" />
      </CardContent>
    </Card>
  );
}
