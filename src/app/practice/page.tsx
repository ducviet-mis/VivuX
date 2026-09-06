'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePracticeData } from '@/features/practice/hooks/use-practice-data';
import { LessonList } from '@/features/practice/components/lesson-list';
import { cn } from '@/lib/utils';
import { ChevronRight, BookOpen } from 'lucide-react';

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
        <p className="text-muted-foreground">Sử dụng menu "Tự luyện" phía trên để chọn Lớp bạn muốn luyện tập.</p>
      </div>
    );
  }

  const activeChapter = selectedGrade.chapters.find(c => c.id === activeChapterId);

  return (
    <div className="container max-w-[1400px] py-4 md:py-8 px-2 md:px-4">
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Toán {selectedGrade.label}
        </h1>
        <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base hidden md:block">Chọn chuyên đề bên trái để bắt đầu luyện tập</p>
        <p className="text-muted-foreground mt-1 text-sm md:hidden">Chọn chuyên đề để bắt đầu luyện tập</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Sidebar - Chapters */}
        <div className="w-full md:w-[240px] shrink-0 flex flex-row md:flex-col gap-2 md:gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:sticky md:top-24 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="hidden md:flex font-bold text-foreground mb-4 items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            CHƯƠNG
          </div>
          {selectedGrade.chapters.map(chapter => {
            const isActive = chapter.id === activeChapterId;
            return (
              <button
                key={chapter.id}
                onClick={() => setActiveChapterId(chapter.id)}
                className={cn(
                  "w-auto md:w-full shrink-0 snap-start text-left px-4 py-2 md:px-5 md:py-4 rounded-full md:rounded-xl transition-all border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-card font-bold"
                    : "bg-card border-transparent text-muted-foreground hover:bg-muted hover:border-border font-medium md:font-semibold shadow-soft md:shadow-none"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="whitespace-nowrap md:whitespace-normal line-clamp-1 md:line-clamp-2 text-sm md:text-base">{chapter.title}</span>
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
