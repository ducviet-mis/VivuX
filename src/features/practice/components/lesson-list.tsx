'use client';

import React, { useState } from 'react';
import { Lesson } from '../types';
import { CheckCircle2, RotateCcw, ShoppingBasket, Trash2, Loader2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { cn } from '@/lib/utils';
import { MixModeDialog } from './mix-mode-dialog';

interface LessonListProps {
  lessons: Lesson[];
  progress: Record<string, { answered: number, total: number }>;
  wrongCounts?: Record<string, number>;
  savedCounts?: Record<string, number>;
  onProgressReset?: () => void;
}

const LEVELS = [
  { id: 1, name: 'Nhận biết' },
  { id: 2, name: 'Thông hiểu' },
  { id: 3, name: 'Vận dụng' },
  { id: 4, name: 'Vận dụng cao' },
];

export function LessonList({ lessons, progress, wrongCounts = {}, savedCounts = {}, onProgressReset }: LessonListProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [resettingId, setResettingId] = useState<string | null>(null);

  const handleReset = async (e: React.MouseEvent, lessonId: string, level?: number) => {
    e.stopPropagation();
    if (!user?.id) return;
    
    const msg = level 
      ? `Xóa toàn bộ tiến độ Level ${level} của bài này?` 
      : `Xóa toàn bộ tiến độ bài này?`;

    const confirmed = window.confirm(msg);
    if (!confirmed) return;
    
    const resetKey = level ? `${lessonId}_${level}` : lessonId;
    setResettingId(resetKey);
    const supabase = getSupabaseClient();
    
    try {
      let progQuery = supabase.from('practice_progress').delete().eq('user_id', user.id).eq('lesson_id', lessonId);
      let savedQuery = supabase.from('saved_questions').delete().eq('user_id', user.id).eq('lesson_id', lessonId);

      if (level) {
        progQuery = progQuery.eq('difficulty_level', level);
        savedQuery = savedQuery.eq('difficulty_level', level);
      }

      await progQuery;
      await savedQuery;

      if (onProgressReset) onProgressReset();
      router.refresh();
      window.location.reload();
    } catch (err) {
      console.error('Reset progress error:', err);
      alert('Lỗi khi xóa tiến độ');
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div className="space-y-12">
      {lessons.map((lesson) => {
        return (
          <div key={lesson.id} className="w-full">
            {/* Tên bài học */}
            <h3 className="text-xl font-bold text-[#1e1b4b] dark:text-white mb-6 border-b border-slate-200 dark:border-white/10 pb-2">
              {lesson.title}
            </h3>

            {/* Danh sách 4 Level (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {LEVELS.map(level => {
                const levelKey = `${lesson.id}_${level.id}`;
                const levelProg = progress[levelKey] || { answered: 0, total: 0 };
                const wrongCount = wrongCounts[levelKey] || 0;
                const savedCount = savedCounts[levelKey] || 0;
                const isCompleted = levelProg.answered === levelProg.total && levelProg.total > 0;
                const hasProgress = levelProg.answered > 0;
                const correctCount = levelProg.answered - wrongCount;
                
                const isResetting = resettingId === levelKey;

                return (
                  <div 
                    key={level.id} 
                    className="flex flex-col justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-fuchsia-200 dark:hover:border-fuchsia-800 transition-all group"
                  >
                    <div className="mb-4">
                      <div className="font-bold text-[#1e1b4b] dark:text-white flex items-center gap-2 mb-1">
                        Level {level.id} - {level.name}
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="text-sm font-medium text-slate-500">
                        {levelProg.answered}/{levelProg.total} câu
                      </div>
                      
                      {hasProgress && (
                        <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3.5 h-3.5" /> {correctCount} đúng
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <X className="w-3.5 h-3.5" /> {wrongCount} sai
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-auto pt-2">
                      <Button 
                        onClick={() => router.push(`/practice/${lesson.id}?level=${level.id}`)}
                        className="w-full rounded-xl h-10 bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:opacity-90 text-white font-bold shadow-md shadow-fuchsia-500/20 transition-all"
                      >
                        Luyện tập
                      </Button>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="Làm lại câu sai"
                          disabled={wrongCount === 0}
                          onClick={(e) => { e.stopPropagation(); router.push(`/practice/wrong/${lesson.id}?level=${level.id}`); }}
                          className="w-full h-9 rounded-xl bg-red-50/50 text-red-500 border-red-100 hover:bg-red-100 hover:text-red-600 dark:bg-red-900/20 dark:border-red-800/30 dark:hover:bg-red-900/40 disabled:opacity-40"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="Hộp lưu câu"
                          disabled={savedCount === 0}
                          onClick={(e) => { e.stopPropagation(); router.push(`/practice/saved/${lesson.id}?level=${level.id}`); }}
                          className="w-full h-9 rounded-xl bg-teal-50/50 text-teal-600 border-teal-100 hover:bg-teal-100 hover:text-teal-700 dark:bg-teal-900/20 dark:border-teal-800/30 dark:hover:bg-teal-900/40 disabled:opacity-40"
                        >
                          <ShoppingBasket className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="Xóa tiến độ"
                          disabled={!hasProgress || isResetting}
                          onClick={(e) => handleReset(e, lesson.id, level.id)}
                          className="w-full h-9 rounded-xl bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-red-600 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 disabled:opacity-40"
                        >
                          {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trộn câu */}
            <div className="flex justify-end mt-2">
              <MixModeDialog 
                lessonId={lesson.id} 
                lessonTitle={lesson.title} 
                totalQuestions={progress[lesson.id]?.total || 0} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
