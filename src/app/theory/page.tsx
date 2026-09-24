'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookCheck, BookOpen, ChevronRight, ClipboardCheck, LibraryBig, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { TheoryLesson } from '@/features/theory/types';

type LessonWithCount = TheoryLesson & { questionCount: number };

function TheoryContent() {
  const searchParams = useSearchParams();
  const grade = Number(searchParams.get('grade'));
  const validGrade = [6, 7, 8, 9].includes(grade);
  const [lessons, setLessons] = useState<LessonWithCount[]>([]);
  const [activeChapter, setActiveChapter] = useState('');
  const [loading, setLoading] = useState(validGrade);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!validGrade) return;
    let mounted = true;

    async function loadLessons() {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();
      const { data: lessonRows, error: lessonError } = await supabase
        .from('theory_lessons')
        .select('*')
        .eq('grade', grade)
        .eq('is_published', true)
        .order('chapter_sort_order', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (!mounted) return;
      if (lessonError) {
        setError('Chưa thể tải lý thuyết. Hãy kiểm tra đã chạy tệp SQL Lý thuyết trên Supabase.');
        setLessons([]);
        setLoading(false);
        return;
      }

      const typedLessons = (lessonRows ?? []) as TheoryLesson[];
      const ids = typedLessons.map((lesson) => lesson.id);
      let counts: Record<string, number> = {};
      if (ids.length) {
        const { data: questionRows } = await supabase
          .from('theory_questions')
          .select('lesson_id')
          .in('lesson_id', ids);
        const typedQuestions = (questionRows ?? []) as Array<{ lesson_id: string }>;
        counts = typedQuestions.reduce((result: Record<string, number>, row: { lesson_id: string }) => {
          result[row.lesson_id] = (result[row.lesson_id] ?? 0) + 1;
          return result;
        }, {});
      }

      if (!mounted) return;
      setLessons(typedLessons.map((lesson) => ({ ...lesson, questionCount: counts[lesson.id] ?? 0 })));
      setLoading(false);
    }

    loadLessons();
    return () => { mounted = false; };
  }, [grade, validGrade]);

  const chapters = useMemo(() => Array.from(new Set(lessons.map((lesson) => lesson.chapter))), [lessons]);

  useEffect(() => {
    if (!chapters.length) {
      setActiveChapter('');
      return;
    }
    if (!chapters.includes(activeChapter)) setActiveChapter(chapters[0]);
  }, [chapters, activeChapter]);

  if (!validGrade) {
    return (
      <div className="container max-w-5xl py-16 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary"><LibraryBig className="h-7 w-7" /></div>
        <h1 className="text-2xl font-bold text-foreground">Vui lòng chọn lớp</h1>
        <p className="mt-3 text-muted-foreground">Mở menu “Lý thuyết” phía trên và chọn lớp bạn muốn học.</p>
      </div>
    );
  }

  if (loading) return <div className="container flex min-h-[360px] items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải lý thuyết...</div>;

  const visibleLessons = lessons.filter((lesson) => lesson.chapter === activeChapter);

  return (
    <div className="container max-w-[1400px] px-3 py-6 sm:px-6 md:py-8">
      <div className="mb-7">
        <Badge variant="outline" className="mb-3 border-primary/30 bg-primary-soft text-primary"><LibraryBig className="mr-1.5 h-3.5 w-3.5" />Kho kiến thức</Badge>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Lý thuyết Toán lớp {grade}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">Đọc kiến thức trọng tâm và kiểm tra nhanh ngay sau từng bài.</p>
      </div>

      {error ? <div className="rounded-2xl border border-destructive/30 bg-destructive-soft p-5 text-destructive">{error}</div> : lessons.length === 0 ? (
        <Card className="rounded-2xl"><CardContent className="py-16 text-center"><BookOpen className="mx-auto mb-4 h-9 w-9 text-muted-foreground" /><p className="font-semibold">Chưa có bài lý thuyết cho lớp {grade}.</p><p className="mt-2 text-sm text-muted-foreground">Admin có thể thêm bài trong mục Quản lý Lý thuyết.</p></CardContent></Card>
      ) : (
        <div className="flex flex-col items-start gap-6 md:flex-row md:gap-8">
          <aside className="w-full shrink-0 md:sticky md:top-24 md:w-[240px]">
            <div className="mb-4 hidden items-center gap-2 font-bold text-foreground md:flex"><BookOpen className="h-5 w-5 text-primary" />CHƯƠNG</div>
            <div className="flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-col md:overflow-visible md:pb-0">
              {chapters.map((chapter) => {
                const active = chapter === activeChapter;
                return (
                  <button key={chapter} type="button" onClick={() => setActiveChapter(chapter)} className={cn('flex min-h-11 shrink-0 snap-start items-center justify-between gap-2 rounded-full border px-4 py-2 text-left text-sm font-semibold transition-colors md:w-full md:rounded-xl md:px-5 md:py-4 md:text-base', active ? 'border-primary bg-primary text-primary-foreground shadow-card' : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground')}>
                    <span className="max-w-[240px] truncate md:line-clamp-2 md:whitespace-normal">{chapter}</span>
                    {active && <ChevronRight className="hidden h-5 w-5 shrink-0 md:block" />}
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">{activeChapter}</h2>
              <Badge variant="outline">{visibleLessons.length} bài</Badge>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {visibleLessons.map((lesson, index) => (
                <Card key={lesson.id} className="group rounded-2xl border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card">
                  <CardContent className="flex h-full flex-col p-5 sm:p-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft font-bold text-primary">{index + 1}</div>
                      <Badge variant="outline" className="border-border bg-muted text-muted-foreground"><ClipboardCheck className="mr-1 h-3.5 w-3.5" />{lesson.questionCount} câu</Badge>
                    </div>
                    <h3 className="text-lg font-bold leading-snug text-foreground">{lesson.title}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">{lesson.summary || 'Kiến thức trọng tâm và ví dụ minh họa của bài học.'}</p>
                    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Button asChild variant="outline" className="min-h-11"><Link href={'/theory/' + lesson.id}><BookOpen className="h-4 w-4" />Đọc lý thuyết</Link></Button>
                      {lesson.questionCount > 0 ? <Button asChild className="min-h-11"><Link href={'/theory/' + lesson.id + '/quiz'}><BookCheck className="h-4 w-4" />Kiểm tra</Link></Button> : <Button disabled className="min-h-11"><BookCheck className="h-4 w-4" />Chưa có câu hỏi</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default function TheoryPage() {
  return <Suspense fallback={<div className="container py-12 text-center text-muted-foreground">Đang tải...</div>}><TheoryContent /></Suspense>;
}
