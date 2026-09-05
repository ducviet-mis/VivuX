'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { cn } from '@/lib/utils';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const pathname = usePathname();
  useEffect(() => { initAuth(); }, [initAuth]);

  const isImmersiveMode = pathname?.match(/^\/mock-exams\/[a-zA-Z0-9-]+$/) ||
    (pathname?.match(/^\/practice\/[a-zA-Z0-9-]+$/) && !pathname.match(/\/saved|\/wrong/));

  return (
    <AuthGuard>
      <div className="flex min-h-dvh flex-col bg-background">
        <a href="#main-content" className="vivux-skip-link">Đến nội dung chính</a>
        <div className={cn(isImmersiveMode ? "hidden md:block" : "block")}><Navbar /></div>
        <main id="main-content" tabIndex={-1} className={cn(
          "min-w-0 flex-1 focus-visible:outline-none",
          isImmersiveMode ? "w-full md:vivux-page" : "vivux-page"
        )}>
          {children}
        </main>
        <div className={cn(isImmersiveMode ? "hidden md:block" : "block")}><Footer /></div>
      </div>
    </AuthGuard>
  );
}
