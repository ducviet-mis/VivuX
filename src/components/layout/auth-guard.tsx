'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/', '/home', '/login', '/register', '/practice', '/mock-exams'];

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    // Only redirect AFTER auth has been initialized
    if (initialized && !user && !isPublicPath) {
      router.replace('/login');
    }
  }, [user, initialized, isPublicPath, router]);

  // Public pages: always render immediately
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Still initializing auth → show loading spinner (don't redirect yet!)
  if (!initialized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  // Initialized but no user → will redirect via useEffect, show loading in meantime
  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    );
  }

  return <>{children}</>;
}
