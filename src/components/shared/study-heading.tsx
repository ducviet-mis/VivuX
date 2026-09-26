import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Decorative geometry stays vector sharp and inherits the current theme. */
export function StudyGeometry({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 180" fill="none" aria-hidden="true" className={cn('study-geometry', className)}>
      <path d="M20 140H280M60 20V165" stroke="currentColor" opacity=".12" />
      <path d="M60 140L150 32L250 140H60Z" stroke="currentColor" strokeWidth="1.5" opacity=".45" />
      <circle cx="160" cy="100" r="58" stroke="currentColor" strokeWidth="1.5" opacity=".3" />
      <path d="M60 140Q156 145 250 38M150 32V140" stroke="currentColor" strokeDasharray="4 6" opacity=".25" />
      <path d="M140 140V130H150" stroke="currentColor" opacity=".5" />
      <circle cx="150" cy="32" r="5" fill="currentColor" />
      <circle cx="60" cy="140" r="4" fill="currentColor" opacity=".6" />
      <circle cx="250" cy="140" r="4" fill="currentColor" opacity=".6" />
      <circle cx="218" cy="100" r="3" fill="currentColor" opacity=".5" />
    </svg>
  );
}

export function StudyHeading({ eyebrow, title, description, children }: {
  eyebrow: string; title: string; description: string; children?: ReactNode;
}) {
  return (
    <header className="study-heading">
      <div className="relative z-[1] min-w-0">
        <p className="study-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="study-description">{description}</p>
        {children && <div className="mt-5 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
      <StudyGeometry />
    </header>
  );
}
