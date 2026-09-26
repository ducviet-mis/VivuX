'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Play } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { getSupabaseClient } from '@/lib/supabase/client';
import { LESSON_META } from '@/features/practice/data/practice-data';
import { Button } from '@/components/ui/button';
import { StudyGeometry } from '@/components/shared/study-heading';

type RecentLesson = { id: string; title: string; grade: number; level: number; answered: number; total: number };

export function ContinueLearning() {
  const user = useAuthStore((state) => state.user);
  const [recent, setRecent] = useState<RecentLesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setRecent(null);
    setLoading(true);
    async function load() {
      if (!user?.id) { if (active) setLoading(false); return; }
      try {
        const db = getSupabaseClient();
        const { data: rows, error } = await db.from('practice_progress')
          .select('lesson_id, difficulty_level').eq('user_id', user.id)
          .order('answered_at', { ascending: false, nullsFirst: false }).limit(1);
        const row = rows?.[0];
        if (error || !row?.lesson_id) return;
        const level = row.difficulty_level || 1;
        const [{ data: lesson }, { count: answered }, { count: total }] = await Promise.all([
          db.from('practice_lessons').select('title, grade').eq('id', row.lesson_id).maybeSingle(),
          level === 1
            ? db.from('practice_progress').select('id', { head: true, count: 'exact' }).eq('user_id', user.id).eq('lesson_id', row.lesson_id).or('difficulty_level.eq.1,difficulty_level.eq.0,difficulty_level.is.null')
            : db.from('practice_progress').select('id', { head: true, count: 'exact' }).eq('user_id', user.id).eq('lesson_id', row.lesson_id).eq('difficulty_level', level),
          level === 1
            ? db.from('practice_questions').select('id', { head: true, count: 'exact' }).eq('lesson_id', row.lesson_id).or('difficulty_level.eq.1,difficulty_level.eq.0,difficulty_level.is.null')
            : db.from('practice_questions').select('id', { head: true, count: 'exact' }).eq('lesson_id', row.lesson_id).eq('difficulty_level', level),
        ]);
        const meta = lesson || LESSON_META[row.lesson_id];
        if (active && meta && total) setRecent({ id: row.lesson_id, title: meta.title, grade: meta.grade, level, answered: Math.min(answered || 0, total), total });
      } catch { /* The class picker remains available if recent activity cannot load. */ }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [user?.id]);

  const complete = recent && recent.answered >= recent.total;
  return (
    <section className="study-resume" aria-labelledby="resume-heading" aria-busy={loading}>
      <StudyGeometry />
      <div className="relative z-[1]">
        <p className="study-eyebrow"><BookOpen className="h-4 w-4" aria-hidden="true" />Buổi học của bạn</p>
        <h2 id="resume-heading" className="mt-3 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
          {loading ? 'Sẵn sàng cho một bước tiến mới?' : recent ? recent.title : 'Bắt đầu từ một bài học nhỏ.'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {recent ? `Toán lớp ${recent.grade} · Level ${recent.level} · ${complete ? 'Bạn đã hoàn thành bài luyện này.' : 'Tiếp nối buổi tự luyện gần nhất.'}` : 'Chọn lớp bên dưới để khám phá kiến thức và luyện tập theo từng bài.'}
        </p>
        {recent && <div className="mt-5 max-w-sm">
          <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground"><span>Tiến độ bài luyện</span><span className="tabular-nums">{recent.answered}/{recent.total} câu</span></div>
          <div role="progressbar" aria-label="Tiến độ bài luyện gần nhất" aria-valuemin={0} aria-valuemax={recent.total} aria-valuenow={recent.answered} className="h-1.5 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-primary" style={{ width: `${recent.answered / recent.total * 100}%` }} /></div>
        </div>}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {recent ? <Button asChild className="h-12 gap-2 px-5"><Link href={complete ? `/practice?grade=${recent.grade}` : `/practice/${recent.id}?level=${recent.level}`}><Play className="h-4 w-4" aria-hidden="true" />{complete ? 'Chọn bài tiếp theo' : 'Tiếp tục học'}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
            : <Button asChild className="h-12 px-5"><a href="#practice-heading">Chọn lớp để bắt đầu<ArrowRight className="h-4 w-4" aria-hidden="true" /></a></Button>}
          {recent && <Link href={`/theory?grade=${recent.grade}`} className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-muted-foreground hover:text-primary">Ôn lại lý thuyết</Link>}
        </div>
      </div>
    </section>
  );
}
