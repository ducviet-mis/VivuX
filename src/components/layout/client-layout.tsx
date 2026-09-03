'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useAuthStore } from '@/features/auth/stores/auth-store';

import { cn } from '@/lib/utils';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const pathname = usePathname();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // If we are taking an exam or practicing, hide layout elements to maximize screen space on MOBILE ONLY
  const isImmersiveMode = pathname?.match(/^\/mock-exams\/[a-zA-Z0-9-]+$/) || 
                          (pathname?.match(/^\/practice\/[a-zA-Z0-9-]+$/) && !pathname.match(/\/saved|\/wrong/));

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col relative overflow-hidden bg-[#f7f5fa] dark:bg-[#110c18]">
        
        {/* --- GLOBAL VIBRANT PASTEL BACKGROUND BLOBS (Optimized with radial gradients) --- */}
        <div className={cn(
          "absolute inset-0 overflow-hidden pointer-events-none fixed opacity-90",
          isImmersiveMode ? "hidden md:block" : ""
        )}>
          {/* Dark mode */}
          <div className="hidden dark:block absolute inset-0">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(23,40,70,0.8) 0%, rgba(23,40,70,0) 70%)' }} />
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(58,25,60,0.8) 0%, rgba(58,25,60,0) 70%)' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(90,42,34,0.8) 0%, rgba(90,42,34,0) 70%)' }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(42,26,74,0.8) 0%, rgba(42,26,74,0) 70%)' }} />
          </div>
          {/* Light mode */}
          <div className="block dark:hidden absolute inset-0">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(210,237,249,0.9) 0%, rgba(210,237,249,0) 70%)' }} />
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(251,223,243,0.9) 0%, rgba(251,223,243,0) 70%)' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(254,218,209,0.9) 0%, rgba(254,218,209,0) 70%)' }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(227,213,255,0.8) 0%, rgba(227,213,255,0) 70%)' }} />
          </div>
        </div>

        <div className={cn(isImmersiveMode ? "hidden md:block" : "block")}>
          <Navbar />
        </div>
        
        <main className={cn(
          "flex-1 relative z-10 flex flex-col",
          isImmersiveMode ? "p-0 md:p-8" : "p-0 sm:p-4 md:p-8"
        )}>
          <div className={cn(
            "mx-auto w-full max-w-[1400px] flex-1 backdrop-blur-xl saturate-[1.1]",
            isImmersiveMode 
              ? "bg-[#fefdff] dark:bg-[#110c18] md:bg-white/90 md:dark:bg-[#1e1b2e]/90 border-0 md:border md:border-white/80 md:dark:border-white/10 rounded-none md:rounded-[40px] p-0 md:p-10 shadow-none md:shadow-[0_10px_40px_-10px_rgba(200,150,200,0.2)] md:dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)]"
              : "bg-white/90 dark:bg-[#1e1b2e]/90 border-x-0 sm:border-x border-y sm:border-y border-white/80 dark:border-white/10 rounded-none sm:rounded-[24px] md:rounded-[40px] p-3 sm:p-6 md:p-10 shadow-none sm:shadow-[0_10px_40px_-10px_rgba(200,150,200,0.2)] dark:sm:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)]"
          )}>
            {children}
          </div>
        </main>
        
        <div className={cn(isImmersiveMode ? "hidden md:block" : "block")}>
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}
