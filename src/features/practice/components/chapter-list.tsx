'use client';

import React, { useState } from 'react';
import { Chapter } from '../types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LessonList } from './lesson-list';

interface ChapterListProps {
  chapters: Chapter[];
  progress: Record<string, { answered: number, total: number }>;
  wrongCounts?: Record<string, number>;
  savedCounts?: Record<string, number>;
}

export function ChapterList({ chapters, progress, wrongCounts, savedCounts }: ChapterListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleChapter = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => {
        const isExpanded = expandedId === chapter.id;
        return (
          <div key={chapter.id} className="border border-border rounded-xl bg-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              onClick={() => toggleChapter(chapter.id)}
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="w-5 h-5 text-teal-600" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                <span className="font-semibold text-card-foreground text-left">{chapter.title}</span>
              </div>
              <Badge variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                {chapter.lessons.length} bài học
              </Badge>
            </button>
            
            {isExpanded && (
              <div className="p-4 pt-0 border-t border-border bg-background/50">
                <LessonList lessons={chapter.lessons} progress={progress} wrongCounts={wrongCounts} savedCounts={savedCounts} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
