'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { SingleSessionMonitor } from '@/features/auth/components/single-session-monitor';
import { cn } from '@/lib/utils';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const pathname = usePathname();
  useEffect(() => { initAuth(); }, [initAuth]);

  const isMockExamRoom = Boolean(pathname?.match(/^\/mock-exams\/[a-zA-Z0-9-]+$/));
  const isPracticeRoom = Boolean(
    pathname?.match(/^\/practice\/[a-zA-Z0-9-]+$/) && !pathname.match(/\/saved|\/wrong/)
  );
  const isImmersiveMode = isMockExamRoom || isPracticeRoom;

  return (
    <AuthGuard>
      <SingleSessionMonitor />
      <div className="flex min-h-dvh flex-col bg-background">
        <a href="#main-content" className="vivux-skip-link">Đến nội dung chính</a>
        <div className={cn(
          isMockExamRoom ? "hidden" : isPracticeRoom ? "hidden md:block" : "block"
        )}>
          <Navbar />
          <div aria-hidden="true" className="h-[72px]" />
        </div>
        <main id="main-content" tabIndex={-1} className={cn(
          "min-w-0 flex-1 focus-visible:outline-none",
          isMockExamRoom ? "w-full" : isImmersiveMode ? "w-full md:vivux-page" : "vivux-page"
        )}>
          {children}
        </main>
        <div className={cn(
          isMockExamRoom ? "hidden" : isPracticeRoom ? "hidden md:block" : "block"
        )}><Footer /></div>
      </div>
    </AuthGuard>
  );
}
