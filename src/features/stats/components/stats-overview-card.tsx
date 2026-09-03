'use client';

import { useState } from 'react';
import { Target, Clock, ActivitySquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeFilterTabs } from './time-filter-tabs';
import { AccuracyPieChart } from './accuracy-pie-chart';
import { useStats } from '../hooks/use-stats';
import { TimeFilter } from '../types';

export function StatsOverviewCard() {
  const [filter, setFilter] = useState<TimeFilter>('week');
  const stats = useStats(filter);

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 lg:col-span-2">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
        <CardTitle className="text-base font-bold">Tổng quan học tập</CardTitle>
        <TimeFilterTabs value={filter} onChange={setFilter} />
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="grid grid-rows-3 gap-3">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Tổng câu hỏi</p>
              <p className="text-xl font-bold">{stats.totalQuestions} câu</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Thời gian học</p>
              <p className="text-xl font-bold">{stats.totalMinutes} phút</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <ActivitySquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Câu làm đúng</p>
              <p className="text-xl font-bold">{stats.correctCount} câu</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-xl p-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Tỷ lệ chính xác</h4>
          <AccuracyPieChart correct={stats.correctCount} wrong={stats.wrongCount} accuracy={stats.accuracy} />
        </div>
      </CardContent>
    </Card>
  );
}
