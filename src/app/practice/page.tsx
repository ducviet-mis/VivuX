'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePracticeData } from '@/features/practice/hooks/use-practice-data';
import { LessonList } from '@/features/practice/components/lesson-list';
import { MobileGradePicker } from '@/components/layout/mobile-grade-picker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, BookOpen, WandSparkles } from 'lucide-react';
import { StudyHeading } from '@/components/shared/study-heading';

function PracticeContent() {
  const searchParams = useSearchParams();
  const gradeQuery = searchParams?.get('grade');
  const { grades, loading, progress, wrongCounts, savedCounts } = usePracticeData();

  const selectedGrade = gradeQuery ? grades.find(g => g.id === parseInt(gradeQuery)) : null;

  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Auto-select first chapter when grade changes
  useEffect(() => {
    if (selectedGrade && selectedGrade.chapters.length > 0) {
      if (!activeChapterId || !selectedGrade.chapters.find(c => c.id === activeChapterId)) {
        setActiveChapterId(selectedGrade.chapters[0].id);
      }
    } else {
      setActiveChapterId(null);
    }
  }, [selectedGrade, activeChapterId]);

  if (loading) {
    return <div className="container py-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  if (!selectedGrade) {
    return (
      <div className="container max-w-6xl py-12 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Vui lòng chọn Lớp</h2>
        <p className="text-muted-foreground">Chọn lớp để bắt đầu luyện tập.</p>
        <div className="mx-auto mt-6 max-w-md text-left"><MobileGradePicker allSizes grades={grades.length ? grades.map((grade) => grade.id) : [6, 7, 8, 9]} hrefForGrade={(grade) => `/practice?grade=${grade}`} /></div>
        <Button asChild variant="outline" className="mt-5 md:hidden"><Link href="/personal-exams?source=practice"><WandSparkles className="h-4 w-4" aria-hidden="true" />Tạo đề cá nhân</Link></Button>
      </div>
    );
  }

  const activeChapter = selectedGrade.chapters.find(c => c.id === activeChapterId);

  return (
    <div className="study-page">
      <StudyHeading eyebrow="Tự luyện · Vững từng bước" title={`Toán ${selectedGrade.label}`} description="Chọn một bài học, luyện theo mức độ và hiểu rõ từng lời giải.">
        <Button asChild variant="outline"><Link href="/personal-exams?source=practice"><WandSparkles className="h-4 w-4" aria-hidden="true" />Tạo đề cá nhân</Link></Button>
      </StudyHeading>
      <div className="mb-5 md:hidden"><MobileGradePicker currentGrade={selectedGrade.id} grades={grades.map((grade) => grade.id)} hrefForGrade={(grade) => `/practice?grade=${grade}`} /></div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Sidebar - Chapters */}
        <div className="w-full md:w-[240px] shrink-0 flex flex-row md:flex-col gap-2 md:gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:sticky md:top-24 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="hidden md:flex font-bold text-foreground mb-4 items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Nội dung học
          </div>
          {selectedGrade.chapters.map(chapter => {
            const isActive = chapter.id === activeChapterId;
            return (
              <button
                key={chapter.id}
                aria-pressed={isActive}
                onClick={() => setActiveChapterId(chapter.id)}
                className={cn(
                  "study-chapter-button w-auto md:w-full shrink-0 snap-start text-left px-4 py-3 rounded-lg transition-colors border font-medium hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="whitespace-nowrap md:whitespace-normal text-sm leading-6">{chapter.title}</span>
                  {isActive && <ChevronRight className="hidden md:block w-5 h-5 opacity-80 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content - Lessons */}
        <div className="flex-1 min-w-0">
          {activeChapter ? (
            <LessonList
              lessons={activeChapter.lessons}
              progress={progress}
              wrongCounts={wrongCounts}
              savedCounts={savedCounts}
            />
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground font-medium">Chưa có bài học nào trong chương này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="container py-8">Đang tải...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
