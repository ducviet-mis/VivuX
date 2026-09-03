'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { MathRenderer } from '@/features/practice/components/math-renderer';
import { ArrowLeft, CheckCircle2, XCircle, Clock, RotateCcw, Target, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MockExamResultPage({ params }: { params: { examId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      if (!attemptId) return;
      const supabase = getSupabaseClient();
      
      const { data: attemptData } = await supabase
        .from('mock_exam_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();
        
      if (!attemptData) return;
      setAttempt(attemptData);
      
      const { data: examData } = await supabase
        .from('mock_exams')
        .select('*')
        .eq('id', params.examId)
        .single();
        
      if (examData) setExam(examData);
      
      const { data: qData } = await supabase
        .from('mock_exam_questions')
        .select('*')
        .eq('exam_id', params.examId)
        .order('order_index');
        
      if (qData) setQuestions(qData);
      
      setLoading(false);
    }
    loadResult();
  }, [params.examId, attemptId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  if (loading || !exam || !attempt) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#15121e] animate-pulse">Đang tải kết quả...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#15121e] py-8">
      <div className="container max-w-4xl">
        <Button variant="ghost" onClick={() => router.push(`/mock-exams?grade=${exam.grade}`)} className="mb-6 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Về danh sách đề
        </Button>
        
        {/* Banner */}
        <div className="bg-gradient-to-br from-fuchsia-600 to-pink-600 rounded-[32px] p-8 text-white shadow-xl shadow-pink-500/20 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold opacity-90 mb-6">{exam.title}</h1>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <div className="text-center">
                <p className="text-fuchsia-200 font-medium mb-2">ĐIỂM SỐ</p>
                <div className="text-6xl font-extrabold tracking-tighter drop-shadow-lg">
                  {attempt.score.toFixed(2)}<span className="text-2xl opacity-70">/10</span>
                </div>
              </div>
              
              <div className="flex flex-row gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                    <Target className="w-6 h-6 text-emerald-300" />
                  </div>
                  <p className="text-2xl font-bold">{attempt.correct_count}/{attempt.total_questions}</p>
                  <p className="text-xs text-fuchsia-200 uppercase tracking-widest mt-1">Câu đúng</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                    <Clock className="w-6 h-6 text-blue-300" />
                  </div>
                  <p className="text-2xl font-bold">{formatTime(attempt.duration_used)}</p>
                  <p className="text-xs text-fuchsia-200 uppercase tracking-widest mt-1">Thời gian</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Solutions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
            Đáp án chi tiết
          </h2>
          
          {questions.map((q, idx) => {
            const studentAns = attempt.answers[q.id];
            const isCorrect = studentAns === q.correct_answer;
            const isSkipped = studentAns === undefined;
            
            return (
              <div key={q.id} className="bg-white dark:bg-[#1e1a2b] rounded-3xl p-6 shadow-md border border-slate-100 dark:border-white/5 relative overflow-hidden">
                {/* Status indicator strip */}
                <div className={cn(
                  "absolute top-0 left-0 w-2 h-full",
                  isCorrect ? "bg-emerald-500" : isSkipped ? "bg-slate-300 dark:bg-slate-700" : "bg-red-500"
                )}></div>
                
                <div className="pl-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      Câu {idx + 1}:
                      {isCorrect ? (
                        <span className="text-emerald-500 flex items-center text-sm bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Đúng
                        </span>
                      ) : isSkipped ? (
                        <span className="text-slate-500 flex items-center text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          Chưa làm
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center text-sm bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">
                          <XCircle className="w-4 h-4 mr-1" /> Sai
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  <div className="prose prose-slate dark:prose-invert max-w-none mb-6 text-slate-700 dark:text-slate-300">
                    <MathRenderer content={q.content} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {(q.options as string[]).map((opt, optIdx) => {
                      const isStudentChoice = studentAns === optIdx;
                      const isActualCorrect = q.correct_answer === optIdx;
                      
                      let btnClass = "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#15121e]/50 opacity-70";
                      let indicatorClass = "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
                      
                      if (isActualCorrect) {
                        btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500 opacity-100";
                        indicatorClass = "bg-emerald-500 text-white";
                      } else if (isStudentChoice && !isActualCorrect) {
                        btnClass = "border-red-400 bg-red-50 dark:bg-red-900/20 opacity-100";
                        indicatorClass = "bg-red-500 text-white";
                      }

                      return (
                        <div key={optIdx} className={cn("flex items-center gap-3 p-3 rounded-2xl border-2 transition-all", btnClass)}>
                          <div className={cn("w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold", indicatorClass)}>
                            {['A', 'B', 'C', 'D'][optIdx]}
                          </div>
                          <div className={cn("flex-1", isActualCorrect ? "font-semibold text-emerald-900 dark:text-emerald-100" : isStudentChoice ? "text-red-900 dark:text-red-100" : "text-slate-600 dark:text-slate-400")}>
                            <MathRenderer content={(!opt.includes('$') && (opt.includes('\\') || opt.includes('^') || opt.includes('_'))) ? `$${opt}$` : opt} />
                          </div>
                          {isActualCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                          {isStudentChoice && !isActualCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                  
                  {q.solution && (
                    <div className="mt-6 p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Lời giải chi tiết
                      </h4>
                      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                        <MathRenderer content={q.solution} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center">
          <Link href={`/mock-exams?grade=${exam.grade}`}>
            <Button size="lg" className="rounded-full bg-slate-800 hover:bg-slate-900 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 px-8 font-bold">
              Hoàn thành <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
