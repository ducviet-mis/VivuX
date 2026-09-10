'use client';

import React, { useState } from 'react';
import { Lesson } from '../types';
import { CheckCircle2, RotateCcw, ShoppingBasket, Trash2, Loader2, Check, X, Play, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { cn } from '@/lib/utils';
import { MixModeDialog } from './mix-mode-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <div className="space-y-8 md:space-y-12">
      {lessons.map((lesson) => {
        return (
          <div key={lesson.id} className="w-full">
            {/* Tên bài học */}
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6 border-b border-border pb-2">
              {lesson.title}
            </h3>

            {/* Danh sách 4 Level (List on mobile, Grid on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
              {LEVELS.map(level => {
                const levelKey = `${lesson.id}_${level.id}`;
                const levelProg = progress[levelKey] || { answered: 0, total: 0 };
                const wrongCount = Math.min(wrongCounts[levelKey] || 0, levelProg.answered);
                const savedCount = savedCounts[levelKey] || 0;
                const isCompleted = levelProg.answered === levelProg.total && levelProg.total > 0;
                const hasProgress = levelProg.answered > 0;
                const correctCount = Math.max(0, levelProg.answered - wrongCount);
                const completionPercent = levelProg.total > 0 ? Math.round((levelProg.answered / levelProg.total) * 100) : 0;
                const accuracyPercent = hasProgress ? Math.round((correctCount / levelProg.answered) * 100) : 0;

                const isResetting = resettingId === levelKey;

                return (
                  <div
                    key={level.id}
                    className="flex flex-col p-3 md:p-4 bg-card rounded-xl md:rounded-2xl border border-border shadow-soft hover:shadow-card hover:border-primary transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 font-bold leading-snug text-foreground text-sm md:text-base">
                          Level {level.id} - {level.name}
                          {isCompleted && (
                            <>
                              <CheckCircle2 aria-hidden="true" className="ml-1.5 inline h-4 w-4 align-[-2px] text-success" />
                              <span className="sr-only">Đã hoàn thành</span>
                            </>
                          )}
                        </div>
                        <span className="shrink-0 text-xs font-bold tabular-nums text-primary">{completionPercent}%</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                          <span>Tiến độ</span>
                          <span className="shrink-0 tabular-nums text-foreground">{levelProg.answered}/{levelProg.total} câu</span>
                        </div>
                        <div
                          role="progressbar"
                          aria-label={`Tiến độ Level ${level.id}`}
                          aria-valuemin={0}
                          aria-valuemax={levelProg.total}
                          aria-valuenow={levelProg.answered}
                          className="h-2 overflow-hidden rounded-full bg-track"
                        >
                          <div className="h-full rounded-full bg-primary transition-[width] duration-220 ease-out" style={{ width: `${completionPercent}%` }} />
                        </div>
                      </div>

                      {hasProgress ? (
                        <div className="rounded-xl border border-border/70 bg-muted/45 px-3 py-2.5">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-medium text-muted-foreground">Độ chính xác</span>
                            <span className="font-bold tabular-nums text-foreground">{accuracyPercent}%</span>
                          </div>
                          <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-border" aria-label={`${correctCount} câu đúng, ${wrongCount} câu sai`}>
                            <div className="bg-success transition-[width] duration-220 ease-out" style={{ width: `${(correctCount / levelProg.answered) * 100}%` }} />
                            <div className="bg-destructive transition-[width] duration-220 ease-out" style={{ width: `${(wrongCount / levelProg.answered) * 100}%` }} />
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold tabular-nums">
                            <span className="inline-flex items-center gap-1 text-success"><Check aria-hidden="true" className="h-3.5 w-3.5" />{correctCount} đúng</span>
                            <span className="inline-flex items-center gap-1 text-destructive"><X aria-hidden="true" className="h-3.5 w-3.5" />{wrongCount} sai</span>
                          </div>
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">Chưa có dữ liệu làm bài</p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        onClick={() => router.push(`/practice/${lesson.id}?level=${level.id}`)}
                        className="flex-1 rounded-md h-11 bg-primary hover:opacity-90 text-primary-foreground font-bold shadow-card transition-all"
                      >
                        <Play className="w-4 h-4 mr-1.5 hidden md:block" />
                        Luyện tập
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" aria-label="Các lựa chọn luyện tập" className="w-11 h-11 rounded-md shrink-0 text-muted-foreground border-border hover:bg-muted">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-card border-border shadow-float">
                          <DropdownMenuItem
                            disabled={wrongCount === 0}
                            onClick={(e) => { e.stopPropagation(); router.push(`/practice/wrong/${lesson.id}?level=${level.id}`); }}
                            className="flex items-center gap-2 p-3 rounded-xl cursor-pointer hover:bg-destructive-soft focus:bg-destructive-soft text-destructive font-medium"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Thi lại câu sai ({wrongCount})</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={savedCount === 0}
                            onClick={(e) => { e.stopPropagation(); router.push(`/practice/saved/${lesson.id}?level=${level.id}`); }}
                            className="flex items-center gap-2 p-3 rounded-xl cursor-pointer hover:bg-primary-soft focus:bg-primary-soft text-primary font-medium mt-1"
                          >
                            <ShoppingBasket className="w-4 h-4" />
                            <span>Câu hỏi đã lưu ({savedCount})</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-2 bg-muted" />

                          <DropdownMenuItem
                            disabled={!hasProgress || isResetting}
                            onClick={(e) => handleReset(e, lesson.id, level.id)}
                            className="flex items-center gap-2 p-3 rounded-xl cursor-pointer hover:bg-muted focus:bg-muted text-muted-foreground font-medium"
                          >
                            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            <span>Xóa tiến độ Level này</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
