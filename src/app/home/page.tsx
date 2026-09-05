'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowUpRight } from 'lucide-react';
import { QuoteCarousel } from '@/features/dashboard/components/quote-carousel';
import { CountdownCard } from '@/features/countdown/components/countdown-card';
import { GoalRing } from '@/features/daily-goal/components/goal-ring';
import { StatsOverviewCard } from '@/features/stats/components/stats-overview-card';
import { WrongNotebookCard } from '@/features/wrong-notebook/components/wrong-notebook-card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

const grades = [
  { id: 6, title: 'Lớp 6', tone: 'bg-primary-soft text-primary' },
  { id: 7, title: 'Lớp 7', tone: 'bg-info-soft text-info' },
  { id: 8, title: 'Lớp 8', tone: 'bg-special-soft text-special' },
  { id: 9, title: 'Lớp 9', tone: 'bg-success-soft text-success' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="space-y-7">
      <header className="relative overflow-hidden rounded-xl border border-border bg-hero px-5 py-7 sm:px-8 sm:py-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-primary">Không gian học tập</p>
        <h1 className="max-w-4xl text-[28px] font-bold leading-tight text-foreground sm:text-[36px]">{getGreeting()}, {user?.name || 'Bạn'}!</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">Sẵn sàng cho buổi học hôm nay chưa?</p>
      </header>
      <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <GoalRing />
          <StatsOverviewCard />
          <section aria-labelledby="practice-heading">
            <div className="mb-4">
              <h2 id="practice-heading" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Tự luyện theo chuyên đề</h2>
              <p className="mt-1 text-sm text-muted-foreground">Chọn lớp để tiếp tục hành trình học Toán.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {grades.map(grade => (
                <Link key={grade.id} href={`/practice?grade=${grade.id}`} className="group block rounded-lg">
                  <Card level="compact" className="h-full rounded-lg hover:border-primary/40 hover:shadow-card">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${grade.tone}`}><BookOpen aria-hidden="true" className="h-5 w-5" /></div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{grade.title}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">Toán học {grade.title.toLowerCase()}</p>
                      </div>
                      <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
        <aside aria-label="Thông tin học tập bổ trợ" className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-1">
          <CountdownCard />
          <QuoteCarousel />
          <WrongNotebookCard />
        </aside>
      </div>
    </div>
  );
}
