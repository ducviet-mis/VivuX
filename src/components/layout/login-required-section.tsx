import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoginRequiredSection({ sectionName }: { sectionName: string }) {
  return (
    <section className="container flex min-h-[440px] items-center justify-center px-4 py-12 md:py-16">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-center shadow-soft sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <LockKeyhole aria-hidden="true" className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Vui lòng đăng nhập</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Đăng nhập để xem {sectionName} và tiếp tục học tập trên FlyDo.
        </p>
        <Button asChild className="mt-7 min-h-11 px-6">
          <Link href="/login">Đăng nhập <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </Button>
      </div>
    </section>
  );
}
