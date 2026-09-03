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
    return <div className="container py-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  if (!selectedGrade) {
    return (
      <div className="container max-w-6xl py-12 text-center">
        <h2 className="text-2xl font-bold text-[#1e1b4b] dark:text-white mb-4">Vui lòng chọn Lớp</h2>
        <p className="text-slate-500">Sử dụng menu "Tự luyện" phía trên để chọn Lớp bạn muốn luyện tập.</p>
      </div>
    );
  }

  const activeChapter = selectedGrade.chapters.find(c => c.id === activeChapterId);

  return (
    <div className="container max-w-[1400px] py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1e1b4b] dark:text-white">
          Toán {selectedGrade.label}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Chọn chuyên đề bên trái để bắt đầu luyện tập</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar - Chapters */}
        <div className="w-full md:w-[240px] shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:sticky md:top-24 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="hidden md:flex font-bold text-[#1e1b4b] dark:text-white mb-4 items-center gap-2">
            <BookOpen className="w-5 h-5 text-fuchsia-500" />
            CHƯƠNG
          </div>
          {selectedGrade.chapters.map(chapter => {
            const isActive = chapter.id === activeChapterId;
            return (
              <button
                key={chapter.id}
                onClick={() => setActiveChapterId(chapter.id)}
                className={cn(
                  "w-[200px] md:w-full shrink-0 snap-start text-left px-4 py-3 md:px-5 md:py-4 rounded-[20px] transition-all duration-300 border",
                  isActive 
                    ? "bg-fuchsia-500 text-white border-fuchsia-500 shadow-md shadow-fuchsia-500/20 font-bold" 
                    : "bg-white dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-200 dark:hover:border-white/10 font-semibold"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="line-clamp-2 text-sm md:text-base">{chapter.title}</span>
                  {isActive && <ChevronRight className="w-4 h-4 md:w-5 md:h-5 opacity-80 shrink-0" />}
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
            <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-[32px] border border-white/50 dark:border-white/5">
              <p className="text-slate-500 font-medium">Chưa có bài học nào trong chương này.</p>
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
