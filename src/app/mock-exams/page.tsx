'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client';
import { FileText, Clock, Trophy, Play, RotateCcw, Eye, History, ArrowRight, CheckCircle2, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MockExamAttempt {
  id: string;
  exam_id: string;
  score: number;
  correct_count: number;
  total_questions: number;
  duration_used: number;
  created_at: string;
}

function MockExamsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const grade = searchParams.get('grade') || '8';
  const { user } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [attemptsByExam, setAttemptsByExam] = useState<Record<string, MockExamAttempt[]>>({});
  const [selectedExamForHistory, setSelectedExamForHistory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      // Fetch exams for current grade
      const { data: examsData } = await supabase
        .from('mock_exams')
        .select('*')
        .eq('grade', parseInt(grade))
        .order('created_at', { ascending: false });
        
      if (examsData) {
        setExams(examsData);
        
        // Fetch all attempts for this user for these exams
        if (user) {
          const examIds = examsData.map((e: any) => e.id);
          const { data: attemptsData } = await supabase
            .from('mock_exam_attempts')
            .select('id, exam_id, score, correct_count, total_questions, duration_used, created_at')
            .eq('user_id', user.id)
            .in('exam_id', examIds)
            .order('created_at', { ascending: false });
            
          if (attemptsData) {
            const grouped: Record<string, MockExamAttempt[]> = {};
            attemptsData.forEach((a: any) => {
              if (!grouped[a.exam_id]) {
                grouped[a.exam_id] = [];
              }
              grouped[a.exam_id].push(a as MockExamAttempt);
            });
            setAttemptsByExam(grouped);
          }
        }
      }
      setLoading(false);
    }
    
    loadExams();
  }, [grade, user]);

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      if (diffHour < 24) return `${diffHour} giờ trước`;
      if (diffDay < 7) return `${diffDay} ngày trước`;
      return format(date, 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'HH:mm - dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} giây`;
    return `${m}p ${s}s`;
  };

  const selectedAttempts = selectedExamForHistory ? (attemptsByExam[selectedExamForHistory.id] || []) : [];
  const selectedBestScore = selectedAttempts.length > 0 ? Math.max(...selectedAttempts.map(a => a.score)) : 0;

  return (
    <div className="container max-w-5xl py-4 md:py-8">
      <PageHeader 
        title={`Thi thử Lớp ${grade}`} 
        description="Làm các bài thi thử trắc nghiệm tính giờ để đánh giá năng lực của bạn."
      />

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-500">Đang tải danh sách đề thi...</div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20 mt-8 bg-white dark:bg-[#1a1625] rounded-3xl border border-dashed border-slate-200 dark:border-white/5 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Hiện tại chưa có đề thi thử nào cho Lớp {grade}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {exams.map(exam => {
            const examAttempts = attemptsByExam[exam.id] || [];
            const hasAttempt = examAttempts.length > 0;
            const bestScore = hasAttempt ? Math.max(...examAttempts.map(a => a.score)) : 0;
            const latestAttempt = examAttempts[0];

            return (
              <Card key={exam.id} className="overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-fuchsia-200 dark:hover:border-fuchsia-800 transition-all rounded-[24px] group">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 px-3 py-1 text-xs">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {exam.duration} phút
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 leading-tight group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                      {exam.title}
                    </h3>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 p-4 sm:p-5 flex items-center justify-between gap-3 mt-auto">
                    {hasAttempt ? (
                      <div className="flex flex-col min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm sm:text-base">
                          <Trophy className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 fill-amber-500/20 shrink-0" />
                          <span className="truncate">Điểm cao nhất: {bestScore.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          <span>Đã thi {examAttempts.length} lần</span>
                          <span>•</span>
                          <span>{formatTimeAgo(latestAttempt.created_at)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-1.5">
                        <FileText className="w-4 h-4 opacity-60 shrink-0" />
                        <span>Chưa làm bài</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {hasAttempt ? (
                        <>
                          {/* Nút Thi lại */}
                          <Link href={`/mock-exams/${exam.id}`}>
                            <Button className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white font-bold shadow-sm shadow-fuchsia-500/20 gap-1.5 h-10 px-4">
                              <RotateCcw className="w-4 h-4" />
                              <span>Thi lại</span>
                            </Button>
                          </Link>

                          {/* Menu 3 gạch gom các tùy chọn xem lại & lịch sử */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
                                title="Tùy chọn khác"
                              >
                                <Menu className="w-4 h-4" />
                                <span className="sr-only">Tùy chọn khác</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-lg border-slate-200 dark:border-white/10">
                              <DropdownMenuItem
                                onClick={() => router.push(`/mock-exams/${exam.id}/result?attemptId=${latestAttempt.id}`)}
                                className="rounded-xl px-3 py-2.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-200 focus:bg-fuchsia-50 focus:text-fuchsia-600 dark:focus:bg-fuchsia-950/30 dark:focus:text-fuchsia-300 gap-2.5 text-sm"
                              >
                                <Eye className="w-4 h-4 text-fuchsia-500" />
                                <span>Xem lại lần thi gần nhất</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setSelectedExamForHistory(exam)}
                                className="rounded-xl px-3 py-2.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-200 focus:bg-fuchsia-50 focus:text-fuchsia-600 dark:focus:bg-fuchsia-950/30 dark:focus:text-fuchsia-300 gap-2.5 text-sm"
                              >
                                <History className="w-4 h-4 text-slate-500" />
                                <span>Lịch sử các lần thi ({examAttempts.length})</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      ) : (
                        /* Nút Bắt đầu làm bài khi chưa thi lần nào */
                        <Link href={`/mock-exams/${exam.id}`}>
                          <Button className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white font-bold shadow-sm shadow-fuchsia-500/20 gap-1.5 h-10 px-4">
                            <Play className="w-4 h-4 fill-current" />
                            <span>Bắt đầu làm bài</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Lịch sử làm bài */}
      <Dialog open={!!selectedExamForHistory} onOpenChange={(open) => !open && setSelectedExamForHistory(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <History className="w-5 h-5 text-fuchsia-500" />
              Lịch sử làm bài
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {selectedExamForHistory?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {selectedAttempts.map((attempt, idx) => {
              const attemptNum = selectedAttempts.length - idx;
              const isLatest = idx === 0;
              const isBest = attempt.score === selectedBestScore;

              return (
                <div
                  key={attempt.id}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                    isLatest 
                      ? "bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-900/40 shadow-xs"
                      : "bg-slate-50/60 dark:bg-white/5 border-slate-200/80 dark:border-white/10"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        Lượt thi #{attemptNum}
                      </span>
                      {isLatest && (
                        <Badge className="bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300 border-0 text-[10px] px-2 py-0.5">
                          Mới nhất
                        </Badge>
                      )}
                      {isBest && (
                        <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-0 text-[10px] px-2 py-0.5">
                          Điểm cao nhất
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatDateTime(attempt.created_at)}</span>
                      <span>•</span>
                      <span>{formatDuration(attempt.duration_used)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-white/5">
                    <div className="text-left sm:text-right">
                      <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                        {attempt.score.toFixed(2)}<span className="text-xs text-slate-400 font-normal">/10</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {attempt.correct_count}/{attempt.total_questions} câu đúng
                      </div>
                    </div>

                    <Link href={`/mock-exams/${selectedExamForHistory.id}/result?attemptId=${attempt.id}`}>
                      <Button size="sm" className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs h-9 px-3 gap-1.5 shadow-xs">
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MockExamsPage() {
  return (
    <Suspense fallback={<div className="container max-w-5xl py-8"><p>Đang tải danh sách bài thi...</p></div>}>
      <MockExamsContent />
    </Suspense>
  );
}
