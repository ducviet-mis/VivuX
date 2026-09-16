'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, GripVertical, Loader2, RefreshCcw, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MathRenderer } from '@/features/practice/components/math-renderer';
import type { DragFillData, TheoryLesson, TheoryQuestion, TrueFalseData } from '@/features/theory/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type TrueFalseAnswers = Record<string, Record<number, boolean>>;
type DragAnswers = Record<string, Record<number, string>>;

function questionKey(question: TheoryQuestion, index: number) {
  return question.id ?? String(index);
}

export default function TheoryQuizPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const [lesson, setLesson] = useState<TheoryLesson | null>(null);
  const [questions, setQuestions] = useState<TheoryQuestion[]>([]);
  const [trueFalseAnswers, setTrueFalseAnswers] = useState<TrueFalseAnswers>({});
  const [dragAnswers, setDragAnswers] = useState<DragAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadQuiz() {
      const supabase = getSupabaseClient();
      const [{ data: lessonData, error: lessonError }, { data: questionData, error: questionError }] = await Promise.all([
        supabase.from('theory_lessons').select('*').eq('id', lessonId).single(),
        supabase.from('theory_questions').select('*').eq('lesson_id', lessonId).order('order_index', { ascending: true }),
      ]);
      if (!mounted) return;
      if (lessonError || questionError || !lessonData) setError('Không thể tải bài kiểm tra lý thuyết này.');
      else {
        setLesson(lessonData as TheoryLesson);
        setQuestions((questionData ?? []) as TheoryQuestion[]);
      }
      setLoading(false);
    }
    if (lessonId) loadQuiz();
    return () => { mounted = false; };
  }, [lessonId]);

  const answered = useMemo(() => questions.every((question, index) => {
    const key = questionKey(question, index);
    if (question.question_type === 'true_false') return Object.keys(trueFalseAnswers[key] ?? {}).length === (question.data as TrueFalseData).statements.length;
    return Object.keys(dragAnswers[key] ?? {}).length === (question.data as DragFillData).answers.length;
  }), [questions, trueFalseAnswers, dragAnswers]);

  const correctness = useMemo(() => questions.map((question, index) => {
    const key = questionKey(question, index);
    if (question.question_type === 'true_false') {
      return (question.data as TrueFalseData).statements.every((statement, statementIndex) => trueFalseAnswers[key]?.[statementIndex] === statement.answer);
    }
    return (question.data as DragFillData).answers.every((answer, answerIndex) => dragAnswers[key]?.[answerIndex] === answer);
  }), [questions, trueFalseAnswers, dragAnswers]);

  const score = correctness.filter(Boolean).length;

  function chooseTrueFalse(key: string, statementIndex: number, value: boolean) {
    if (submitted) return;
    setTrueFalseAnswers((current) => ({ ...current, [key]: { ...(current[key] ?? {}), [statementIndex]: value } }));
  }

  function placeToken(key: string, slotIndex: number, token: string) {
    if (submitted) return;
    setDragAnswers((current) => {
      const questionAnswers = { ...(current[key] ?? {}) };
      Object.keys(questionAnswers).forEach((slot) => {
        if (questionAnswers[Number(slot)] === token) delete questionAnswers[Number(slot)];
      });
      questionAnswers[slotIndex] = token;
      return { ...current, [key]: questionAnswers };
    });
  }

  function placeInFirstEmpty(key: string, token: string, totalSlots: number) {
    const answers = dragAnswers[key] ?? {};
    const firstEmpty = Array.from({ length: totalSlots }, (_, index) => index).find((index) => !answers[index]);
    if (firstEmpty !== undefined) placeToken(key, firstEmpty, token);
  }

  function resetQuiz() {
    setTrueFalseAnswers({});
    setDragAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) return <div className="container flex min-h-[420px] items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải bài kiểm tra...</div>;
  if (error || !lesson) return <div className="container max-w-3xl py-16 text-center"><p className="font-semibold text-destructive">{error}</p><Button asChild variant="outline" className="mt-5"><Link href="/theory"><ArrowLeft className="h-4 w-4" />Về trang Lý thuyết</Link></Button></div>;

  return (
    <div className="container max-w-4xl px-3 py-6 sm:px-6 md:py-10">
      <Button asChild variant="ghost" className="mb-4 -ml-3 min-h-11"><Link href={'/theory/' + lesson.id}><ArrowLeft className="h-4 w-4" />Quay lại bài học</Link></Button>
      <div className="mb-7 rounded-3xl border border-border bg-gradient-to-br from-primary-soft via-card to-card p-6 sm:p-8">
        <Badge className="mb-3 bg-primary text-primary-foreground">Kiểm tra lý thuyết</Badge>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{lesson.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">Hoàn thành {questions.length} câu. Trên điện thoại, chạm vào đáp án để tự điền vào ô trống.</p>
      </div>

      {questions.length === 0 ? <Card className="rounded-2xl"><CardContent className="py-14 text-center text-muted-foreground">Bài này chưa có câu hỏi kiểm tra.</CardContent></Card> : (
        <div className="space-y-5">
          {questions.map((question, index) => {
            const key = questionKey(question, index);
            const questionCorrect = correctness[index];
            return (
              <Card key={key} className={cn('rounded-2xl border-border bg-card', submitted && (questionCorrect ? 'border-success/50' : 'border-destructive/50'))}>
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline" className="border-primary/30 bg-primary-soft text-primary">Câu {index + 1}</Badge><span className="text-xs font-medium text-muted-foreground">{question.question_type === 'true_false' ? 'Đúng / Sai' : 'Kéo thả điền khuyết'}</span></div>
                  <div className="font-semibold leading-7 text-foreground"><MathRenderer content={question.prompt} /></div>

                  {question.question_type === 'true_false' ? (
                    <div className="space-y-3">
                      {(question.data as TrueFalseData).statements.map((statement, statementIndex) => {
                        const selected = trueFalseAnswers[key]?.[statementIndex];
                        return (
                          <div key={statementIndex} className="rounded-xl border border-border bg-muted/25 p-4">
                            <div className="mb-3 leading-6 text-foreground"><MathRenderer content={statement.text} /></div>
                            <div className="grid grid-cols-2 gap-2">
                              {[true, false].map((value) => (
                                <button key={String(value)} type="button" disabled={submitted} onClick={() => chooseTrueFalse(key, statementIndex, value)} className={cn('min-h-11 rounded-lg border px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted', submitted && value === statement.answer && 'border-success bg-success-soft text-success', submitted && selected === value && value !== statement.answer && 'border-destructive bg-destructive-soft text-destructive')}>
                                  {value ? 'Đúng' : 'Sai'}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-x-1 gap-y-3 rounded-xl border border-border bg-muted/25 p-4 leading-8 text-foreground">
                        {(question.data as DragFillData).template.split(/(\{\{\d+\}\})/g).map((part, partIndex) => {
                          const match = part.match(/^\{\{(\d+)\}\}$/);
                          if (!match) return <span key={partIndex}><MathRenderer content={part} /></span>;
                          const slotIndex = Number(match[1]) - 1;
                          const value = dragAnswers[key]?.[slotIndex];
                          const correctValue = (question.data as DragFillData).answers[slotIndex];
                          return (
                            <button key={partIndex} type="button" disabled={submitted && !value} onClick={() => !submitted && value && setDragAnswers((current) => ({ ...current, [key]: Object.fromEntries(Object.entries(current[key] ?? {}).filter(([slot]) => Number(slot) !== slotIndex)) }))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => placeToken(key, slotIndex, event.dataTransfer.getData('text/plain'))} className={cn('mx-1 inline-flex min-h-11 min-w-24 items-center justify-center rounded-lg border-2 border-dashed px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', value ? 'border-primary bg-primary-soft text-primary' : 'border-primary/50 bg-card text-muted-foreground', submitted && value === correctValue && 'border-success bg-success-soft text-success', submitted && value !== correctValue && 'border-destructive bg-destructive-soft text-destructive')} aria-label={value ? 'Ô ' + (slotIndex + 1) + ': ' + value : 'Ô trống ' + (slotIndex + 1)}>
                              {value || 'Ô ' + (slotIndex + 1)}
                            </button>
                          );
                        })}
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kho đáp án — kéo hoặc chạm để điền</p>
                        <div className="flex flex-wrap gap-2">
                          {(question.data as DragFillData).options.map((option) => {
                            const used = Object.values(dragAnswers[key] ?? {}).includes(option);
                            return <button key={option} type="button" draggable={!submitted && !used} disabled={submitted || used} onDragStart={(event) => event.dataTransfer.setData('text/plain', option)} onClick={() => placeInFirstEmpty(key, option, (question.data as DragFillData).answers.length)} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-primary/35 bg-primary-soft px-4 py-2 text-sm font-bold text-primary transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"><GripVertical className="h-4 w-4" />{option}</button>;
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {submitted && <div className={cn('rounded-xl border p-4 text-sm leading-6', questionCorrect ? 'border-success/30 bg-success-soft' : 'border-destructive/30 bg-destructive-soft')}><div className={cn('mb-2 flex items-center gap-2 font-bold', questionCorrect ? 'text-success' : 'text-destructive')}>{questionCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}{questionCorrect ? 'Chính xác' : 'Chưa chính xác'}</div>{question.solution && <div className="text-foreground"><MathRenderer content={question.solution} variant="solution" /></div>}</div>}
                </CardContent>
              </Card>
            );
          })}

          {submitted ? (
            <Card className="rounded-2xl border-primary/30 bg-primary-soft"><CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">{score}/{questions.length}</div><div><h2 className="text-xl font-bold text-foreground">Bạn đã hoàn thành bài kiểm tra</h2><p className="mt-1 text-muted-foreground">Xem lại lời giải ở từng câu hoặc thử lại để ghi nhớ tốt hơn.</p></div><div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"><Button variant="outline" onClick={resetQuiz} className="min-h-11"><RefreshCcw className="h-4 w-4" />Làm lại</Button><Button asChild className="min-h-11"><Link href={'/theory?grade=' + lesson.grade}>Chọn bài khác</Link></Button></div></CardContent></Card>
          ) : <Button type="button" size="lg" disabled={!answered} onClick={() => setSubmitted(true)} className="min-h-12 w-full">{answered ? 'Nộp bài và xem kết quả' : 'Hãy hoàn thành tất cả câu hỏi'}</Button>}
        </div>
      )}
    </div>
  );
}
