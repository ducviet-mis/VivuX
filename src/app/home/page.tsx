'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
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
    <div className="w-full">
      <div className="flex flex-col xl:flex-row gap-10">
        
        {/* MAIN CONTENT AREA (Left/Center) */}
        <div className="flex-1">
          
          <div className="mb-10">
            <h1 className="text-[32px] font-extrabold text-[#1e1b4b] dark:text-white tracking-tight mb-2">
              {getGreeting()}, {user?.name || 'Bạn'}!
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium">Sẵn sàng cho buổi học hôm nay chưa?</p>
          </div>

            {/* Daily Goal (Mục tiêu hàng ngày) - Wide layout */}
            <div className="mb-8">
              <GoalRing />
            </div>

            {/* Stats Overview - Wide layout */}
            <div className="mb-8">
              <StatsOverviewCard />
            </div>

            {/* Main Cards (Grades - Tự luyện theo chuyên đề) */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#1e1b4b] dark:text-white mb-4 uppercase tracking-wider">Tự luyện theo chuyên đề</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grades.map((grade, i) => (
                  <Link key={grade.id} href={`/practice?grade=${grade.id}`} className="block">
                    <Card className="hover:-translate-y-1 hover:shadow-[0_16px_40px_-10px_rgba(200,180,220,0.4)] transition-all duration-300 cursor-pointer group h-full">
                      <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${['bg-yellow-100', 'bg-fuchsia-100', 'bg-emerald-100', 'bg-blue-100'][i%4]}`}>
                          <BookOpen className={`w-7 h-7 ${['text-yellow-500', 'text-fuchsia-500', 'text-emerald-500', 'text-blue-500'][i%4]}`} />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-[18px] font-bold text-[#1e1b4b] dark:text-white group-hover:text-fuchsia-600 transition-colors">{grade.title}</h3>
                          <p className="text-xs text-slate-400 font-medium mt-1">Toán học {grade.title.toLowerCase()}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 hidden sm:flex items-center justify-center text-slate-400 group-hover:bg-fuchsia-50 group-hover:text-fuchsia-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR (Widgets & Reminders) */}
          <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-6">
            
            <div className="w-full">
              <QuoteCarousel />
            </div>

            <div className="w-full">
              <CountdownCard />
            </div>

            <div className="w-full">
              <WrongNotebookCard />
            </div>
            
        </div>
      </div>
    </div>
  );
}
