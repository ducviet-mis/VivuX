'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StreakCard } from '@/features/streak/components/streak-card';
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
  { id: 6, title: 'Lớp 6' },
  { id: 7, title: 'Lớp 7' },
  { id: 8, title: 'Lớp 8' },
  { id: 9, title: 'Lớp 9' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title={`${getGreeting()}, ${user?.name || 'Bạn'}!`} 
        description="Sẵn sàng cho buổi học hôm nay chưa?" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StreakCard />
        </div>
        <div className="lg:col-span-2">
          <CountdownCard />
        </div>
      </div>

      <div className="w-full">
        <GoalRing />
      </div>

      <div className="w-full">
        <StatsOverviewCard />
      </div>

      <div className="w-full">
        <WrongNotebookCard />
      </div>

      <div className="pt-6">
        <h2 className="text-xl font-bold mb-4">Tự luyện theo chuyên đề</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {grades.map((grade) => (
            <Link key={grade.id} href={`/practice?grade=${grade.id}`}>
              <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-lg">{grade.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
