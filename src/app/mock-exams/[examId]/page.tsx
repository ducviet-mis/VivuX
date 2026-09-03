'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Button } from '@/components/ui/button';
import { MathRenderer } from '@/features/practice/components/math-renderer';
import { ArrowLeft, ArrowRight, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function MockExamRoomPage({ params }: { params: { examId: string } }) {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadExam() {
      const supabase = getSupabaseClient();
      
      const { data: examData } = await supabase
        .from('mock_exams')
        .select('*')
        .eq('id', params.examId)
        .single();
        
      if (examData) {
        setExam(examData);
        setTimeLeft(examData.duration * 60);
        
        const { data: qData } = await supabase
          .from('mock_exam_questions')
          .select('*')
          .eq('exam_id', params.examId)
          .order('order_index');
          
        if (qData) {
          setQuestions(qData);
        }
      }
    }
    loadExam();
  }, [params.examId]);

  // Timer logic
  useEffect(() => {
    if (exam && !isSubmitting && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam, isSubmitting]);

  const handleSubmit = async () => {
    if (!user || !exam) return;
    setIsSubmitting(true);
    
    const durationUsed = exam.duration * 60 - timeLeft;
    let correctCount = 0;
    
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });
    
    const score = questions.length > 0 ? (10 / questions.length) * correctCount : 0;
    
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('mock_exam_attempts').insert({
      user_id: user.id,
      exam_id: exam.id,
      score: score,
      correct_count: correctCount,
      total_questions: questions.length,
      answers: answers,
      duration_used: durationUsed
    }).select().single();
    
    if (!error && data) {
      router.push(`/mock-exams/${exam.id}/result?attemptId=${data.id}`);
    } else {
      console.error(error);
      alert('Có lỗi xảy ra khi nộp bài!');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!initialized || !exam) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#15121e] animate-pulse">Đang tải đề thi...</div>;
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-[#15121e]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1a1625]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-slate-800 dark:text-slate-100 hidden sm:block">{exam.title}</h1>
            <h1 className="font-bold text-slate-800 dark:text-slate-100 sm:hidden">Thi thử</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full font-bold font-mono text-lg transition-colors",
            timeLeft < 300 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          )}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          
          <Button 
            onClick={() => setShowConfirm(true)}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-full px-6 shadow-md shadow-fuchsia-500/20"
          >
            Nộp bài
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Content (Question) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            {currentQuestion && (
              <div className="bg-white dark:bg-[#1e1a2b] rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                  Câu {currentIndex + 1}:
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none mb-8 text-lg text-slate-700 dark:text-slate-300">
                  <MathRenderer content={currentQuestion.content} />
                </div>
                
                <div className="space-y-4">
                  {(currentQuestion.options as string[]).map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: idx }))}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left group",
                          isSelected 
                            ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 shadow-md ring-2 ring-fuchsia-500/20" 
                            : "border-slate-200 dark:border-white/10 hover:border-fuchsia-300 dark:hover:border-fuchsia-700 hover:bg-slate-50 dark:hover:bg-white/5 bg-white dark:bg-transparent"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                          isSelected 
                            ? "bg-fuchsia-500 text-white" 
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-fuchsia-100 dark:group-hover:bg-fuchsia-900/50 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400"
                        )}>
                          {['A', 'B', 'C', 'D'][idx]}
                        </div>
                        <div className={cn(
                          "flex-1",
                          isSelected ? "text-fuchsia-900 dark:text-fuchsia-100 font-medium" : "text-slate-700 dark:text-slate-300"
                        )}>
                          <MathRenderer content={(!opt.includes('$') && (opt.includes('\\') || opt.includes('^') || opt.includes('_'))) ? `$${opt}$` : opt} />
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-100 dark:border-white/10">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                    disabled={currentIndex === 0}
                    className="rounded-xl px-6 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                  </Button>
                  <Button 
                    onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="rounded-xl px-6 bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900"
                  >
                    Câu tiếp theo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar (Grid) */}
        <aside className="w-full md:w-80 bg-white dark:bg-[#1a1625] border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 flex flex-col h-64 md:h-auto shrink-0 shadow-lg">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center">
            <span>Danh sách câu hỏi</span>
            <span className="text-sm font-normal text-fuchsia-600 dark:text-fuchsia-400">
              Đã làm: {Object.keys(answers).length} / {questions.length}
            </span>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentIndex === idx;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                      isCurrent 
                        ? "ring-2 ring-fuchsia-500 ring-offset-2 dark:ring-offset-[#1a1625]" 
                        : "hover:bg-slate-100 dark:hover:bg-white/5",
                      isAnswered 
                        ? "bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20" 
                        : "bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-white/5"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-3xl border-slate-200 dark:border-white/10 dark:bg-[#1e1a2b]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Xác nhận nộp bài?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-600 dark:text-slate-400">
              Bạn đã làm {Object.keys(answers).length} / {questions.length} câu. Bạn có chắc chắn muốn nộp bài ngay bây giờ? Thời gian còn lại sẽ không được bảo lưu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-white/10">Tiếp tục làm bài</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
              Nộp bài ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
