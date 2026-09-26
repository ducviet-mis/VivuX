'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookCheck, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TheoryReader } from '@/features/theory/components/theory-reader';
import type { TheoryLesson } from '@/features/theory/types';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function TheoryLessonPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const [lesson, setLesson] = useState<TheoryLesson | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadLesson() {
      const supabase = getSupabaseClient();
      const [{ data, error: lessonError }, { count }] = await Promise.all([
        supabase.from('theory_lessons').select('*').eq('id', lessonId).single(),
        supabase.from('theory_questions').select('id', { count: 'exact', head: true }).eq('lesson_id', lessonId),
      ]);
      if (!mounted) return;
      if (lessonError || !data) setError('Không tìm thấy bài lý thuyết này hoặc bài chưa được xuất bản.');
      else setLesson(data as TheoryLesson);
      setQuestionCount(count ?? 0);
      setLoading(false);
    }
    if (lessonId) loadLesson();
    return () => { mounted = false; };
  }, [lessonId]);

  if (loading) return <div className="container flex min-h-[420px] items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang mở bài học...</div>;
  if (error || !lesson) return <div className="container max-w-3xl py-16 text-center"><p className="font-semibold text-destructive">{error}</p><Button asChild variant="outline" className="mt-5"><Link href="/theory"><ArrowLeft className="h-4 w-4" />Về trang Lý thuyết</Link></Button></div>;

  return (
    <div className="study-page">
      <Button asChild variant="ghost" className="mb-5 -ml-3 min-h-11"><Link href={'/theory?grade=' + lesson.grade}><ArrowLeft className="h-4 w-4" />Lý thuyết lớp {lesson.grade}</Link></Button>
      <TheoryReader title={lesson.title} summary={lesson.summary} grade={lesson.grade} chapter={lesson.chapter} content={lesson.content} />

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5">
        <div className="mb-3 flex items-center gap-3 sm:mb-0"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><BookOpen className="h-5 w-5" /></div><div><p className="font-bold text-foreground">Đã đọc xong bài?</p><p className="text-sm text-muted-foreground">Làm {questionCount} câu để tự kiểm tra mức độ ghi nhớ.</p></div></div>
        {questionCount > 0 ? <Button asChild className="min-h-11 w-full sm:w-auto"><Link href={'/theory/' + lesson.id + '/quiz'}><BookCheck className="h-4 w-4" />Kiểm tra lý thuyết</Link></Button> : <Button disabled className="min-h-11 w-full sm:w-auto">Chưa có câu hỏi</Button>}
      </div>
    </div>
  );
}
