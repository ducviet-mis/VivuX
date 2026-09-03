'use client';

import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized && !isLoading) {
      if (!user || (user.email !== 'vietdang293.vn@gmail.com' && user.email !== 'vietdang293@gmail.com')) {
        router.replace('/home');
      }
    }
  }, [user, isLoading, initialized, router]);

  if (!initialized || isLoading) return <div className="container py-20 text-center animate-pulse">Đang tải...</div>;
  if (!user || (user.email !== 'vietdang293.vn@gmail.com' && user.email !== 'vietdang293@gmail.com')) return null;

  return (
    <div className="container max-w-6xl py-8">
      <PageHeader 
        title="Quản trị viên (ADMIN)" 
        description="Quản lý dữ liệu hệ thống, chuyên đề tự luyện và các đề thi thử."
      />
      
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            <Link href="/admin/practice">
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap",
                pathname?.includes('/admin/practice')
                  ? "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}>
                <BookOpen className="w-5 h-5" />
                Quản lý Tự luyện
              </div>
            </Link>
            
            <Link href="/admin/mock-exams">
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap",
                pathname?.includes('/admin/mock-exams')
                  ? "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}>
                <FileText className="w-5 h-5" />
                Quản lý Thi thử
              </div>
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
