'use client';

import { useEffect, useState } from 'react';
import { useDailyGoal } from '../hooks/use-daily-goal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoalSettingDialog } from './goal-setting-dialog';

function ProgressCircle({ percent, color, bgColor, label }: { percent: number; color: string; bgColor: string; label: string }) {
  const size = 90;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, percent) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex justify-center items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={bgColor} />
          <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{percent}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function GlowBar({ current, target, label, suffix, color, glowColor }: {
  current: number; target: number; label: string; suffix: string; color: string; glowColor: string;
}) {
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-semibold">{current}/{target} {suffix}</span>
      </div>
      <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{
            width: `${percent}%`,
            boxShadow: percent > 0 ? `0 0 12px ${glowColor}, 0 0 4px ${glowColor}` : 'none'
          }}
        />
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
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold">Mục tiêu hằng ngày</CardTitle>
        <GoalSettingDialog />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* 3 circles */}
          <div className="flex items-center justify-center gap-4 shrink-0">
            <ProgressCircle percent={percentages.study} color="text-teal-500 dark:text-teal-400" bgColor="text-teal-500/15" label="Thời gian" />
            <ProgressCircle percent={percentages.questions} color="text-emerald-500 dark:text-emerald-400" bgColor="text-emerald-500/15" label="Câu hỏi" />
            <ProgressCircle percent={currentAccuracy} color="text-amber-500 dark:text-amber-400" bgColor="text-amber-500/15" label="Chính xác" />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-20 bg-border shrink-0" />
          <div className="md:hidden w-full h-px bg-border" />

          {/* 3 glow bars */}
          <div className="w-full flex-1 space-y-3">
            <GlowBar
              label="Thời gian học" current={progress.studyMinutes} target={goals.studyMinutes}
              suffix="phút" color="bg-teal-500" glowColor="rgba(20,184,166,0.5)"
            />
            <GlowBar
              label="Số câu hoàn thành" current={progress.questionsCount} target={goals.questionsCount}
              suffix="câu" color="bg-emerald-500" glowColor="rgba(16,185,129,0.5)"
            />
            <GlowBar
              label="Tỉ lệ chính xác" current={currentAccuracy} target={100}
              suffix="%" color="bg-amber-500" glowColor="rgba(245,158,11,0.5)"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
