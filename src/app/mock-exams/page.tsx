'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client';
import { FileText, Clock, Hash, Trophy, ArrowRight, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Suspense } from 'react';

function MockExamsContent() {
  const searchParams = useSearchParams();
  const grade = searchParams.get('grade') || '8';
  const { user } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      // Fetch exams
      const { data: examsData } = await supabase
        .from('mock_exams')
        .select('*')
        .eq('grade', parseInt(grade))
        .order('created_at', { ascending: false });
        
      if (examsData) {
        setExams(examsData);
        
        // Fetch highest scores for this user
        if (user) {
          const examIds = examsData.map((e: any) => e.id);
          const { data: attemptsData } = await supabase
            .from('mock_exam_attempts')
            .select('exam_id, score')
            .eq('user_id', user.id)
            .in('exam_id', examIds);
            
          if (attemptsData) {
            const bestScores: Record<string, number> = {};
            attemptsData.forEach((a: any) => {
              if (!bestScores[a.exam_id] || a.score > bestScores[a.exam_id]) {
                bestScores[a.exam_id] = a.score;
              }
            });
            setAttempts(bestScores);
          }
        }
      }
      setLoading(false);
    }
    
    loadExams();
  }, [grade, user]);

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
            const bestScore = attempts[exam.id];
            const hasAttempt = bestScore !== undefined;

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
                  
                  <div className="bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 p-4 flex items-center justify-between mt-auto">
                    {hasAttempt ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Trophy className="w-5 h-5" />
                        <span>Điểm cao nhất: {bestScore.toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Chưa làm bài
                      </div>
                    )}
                    
                    <Link href={`/mock-exams/${exam.id}`}>
                      <Button className="rounded-xl bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold shadow-md shadow-fuchsia-500/20 gap-2 px-6">
                        {hasAttempt ? 'Thi lại' : 'Bắt đầu làm bài'}
                        <Play className="w-4 h-4 fill-current" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
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
