'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useAuthStore } from '@/features/auth/stores/auth-store';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col relative overflow-hidden bg-[#f7f5fa] dark:bg-[#110c18]">
        
        {/* --- GLOBAL VIBRANT PASTEL BACKGROUND BLOBS (Optimized with radial gradients) --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none fixed opacity-90">
          {/* Dark mode */}
          <div className="hidden dark:block absolute inset-0">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(30,58,95,0.8) 0%, rgba(30,58,95,0) 70%)' }} />
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(74,26,71,0.8) 0%, rgba(74,26,71,0) 70%)' }} />
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

        <Navbar />
        <main className="flex-1 relative z-10 flex flex-col p-4 sm:p-8">
          <div className="mx-auto w-full max-w-[1400px] flex-1 bg-[#fefdff]/85 dark:bg-[#1e1b2e]/85 backdrop-blur-lg saturate-[1.1] border border-white/80 dark:border-white/10 rounded-[40px] p-6 md:p-10 shadow-[0_10px_40px_-10px_rgba(200,150,200,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)]">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
