'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Grade } from '../types';
import { Skeleton } from '@/components/ui/skeleton';

interface GradeSelectorProps {
  grades: Grade[];
  loading?: boolean;
}

export function GradeSelector({ grades, loading }: GradeSelectorProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {grades.map((grade) => (
        <Card 
          key={grade.id} 
          className="cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 border-l-4 border-l-teal-500 rounded-2xl bg-card"
          onClick={() => router.push(`/practice?grade=${grade.id}`)}
        >
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">{grade.id}</div>
            <div className="text-lg font-semibold text-card-foreground">{grade.label}</div>
            <div className="text-sm text-muted-foreground mt-1">{grade.chapters.length} chuyên đề</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
