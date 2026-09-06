'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Button } from '@/components/ui/button';
import { MathRenderer, formatOptionMath } from '@/features/practice/components/math-renderer';
import { ArrowLeft, ArrowRight, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { LayoutGrid } from 'lucide-react';

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
          const sanitized = qData.map((q: any) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options.map(formatOptionMath) : q.options
          }));
          setQuestions(sanitized);
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
    return <div className="py-32 flex flex-col items-center justify-center animate-pulse text-muted-foreground font-medium">Đang tải đề thi...</div>;
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-3 py-3 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-md shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="font-bold text-foreground">{exam.title}</h1>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden flex items-center gap-1.5 rounded-md border-border px-3">
                <LayoutGrid className="w-4 h-4" />
                <span className="font-bold">{currentIndex + 1}/{questions.length}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-xl p-0 flex flex-col bg-card border-border">
              <SheetHeader className="p-4 border-b border-border text-left">
                <SheetTitle className="text-lg font-bold flex justify-between items-center">
                  Danh sách câu
                  <span className="text-sm font-bold text-primary bg-primary-soft px-3 py-1 rounded-full">
                    Đã làm: {Object.keys(answers).length} / {questions.length}
                  </span>
                </SheetTitle>
                <SheetDescription className="hidden">Question list</SheetDescription>
              </SheetHeader>
              <div className="p-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-6 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = currentIndex === idx;
                    return (
                      <SheetTrigger asChild key={q.id}>
                        <button
                          onClick={() => setCurrentIndex(idx)}
                          className={cn(
                            "aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                            isCurrent
                              ? "ring-2 ring-primary ring-offset-2"
                              : "hover:bg-muted",
                            isAnswered
                              ? "bg-primary text-primary-foreground shadow-card"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {idx + 1}
                        </button>
                      </SheetTrigger>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold font-mono text-sm sm:text-lg transition-colors",
            timeLeft < 300 ? "bg-destructive-soft text-destructive animate-pulse" : "bg-muted text-foreground"
          )}>
            <Clock className="w-4 h-4 shrink-0" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <Button
            onClick={() => setShowConfirm(true)}
            size="sm"
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-md px-4 shadow-card"
          >
            <span className="hidden sm:inline">Nộp bài</span>
            <span className="sm:hidden">Nộp</span>
            <Send className="w-4 h-4 ml-1 sm:ml-2 shrink-0" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-6">
        {/* Main Content (Question) */}
        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-3xl mx-auto">
            {currentQuestion && (
              <div className="bg-card rounded-none md:rounded-xl p-4 md:p-8 shadow-none md:shadow-float dark:shadow-none border-y md:border border-border">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">
                  Câu {currentIndex + 1}:
                </h2>
                <div className="prose vivux-prose max-w-none mb-8 text-lg text-foreground">
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
                            ? "border-primary bg-primary-soft shadow-card ring-2 ring-primary/20"
                            : "border-border hover:border-primary hover:bg-muted bg-card dark:bg-transparent"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary-soft group-hover:text-primary"
                        )}>
                          {['A', 'B', 'C', 'D'][idx]}
                        </div>
                        <div className={cn(
                          "flex-1",
                          isSelected ? "text-primary font-medium" : "text-foreground"
                        )}>
                          <MathRenderer content={formatOptionMath(opt)} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                    disabled={currentIndex === 0}
                    className="rounded-md px-6 border-border text-muted-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                  </Button>
                  <Button
                    onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="rounded-md px-6 bg-muted hover:bg-muted text-foreground"
                  >
                    Câu tiếp theo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar (Grid) */}
        <aside className="hidden md:block w-80 shrink-0">
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden md:sticky md:top-40">
            <div className="p-4 border-b border-border font-bold text-foreground flex justify-between items-center bg-muted/50">
              <span>Danh sách câu</span>
              <span className="text-sm font-bold text-primary bg-primary-soft px-3 py-1 rounded-full">
                {Object.keys(answers).length} / {questions.length}
              </span>
            </div>
            <div className="p-4 max-h-[40vh] md:max-h-[calc(100vh-300px)] overflow-y-auto">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-5 gap-2">
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
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:bg-muted",
                        isAnswered
                          ? "bg-primary text-primary-foreground shadow-card"
                          : "bg-muted text-muted-foreground border border-border"
                      )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Xác nhận nộp bài?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              Bạn đã làm {Object.keys(answers).length} / {questions.length} câu. Bạn có chắc chắn muốn nộp bài ngay bây giờ? Thời gian còn lại sẽ không được bảo lưu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-md border-border">Tiếp tục làm bài</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="rounded-md bg-primary hover:bg-primary-hover text-primary-foreground">
              Nộp bài ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
