"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type MobileGradePickerProps = {
  currentGrade?: number;
  hrefForGrade: (grade: number) => string;
  grades?: number[];
  allSizes?: boolean;
};

export function MobileGradePicker({ currentGrade, hrefForGrade, grades = [6, 7, 8, 9], allSizes = false }: MobileGradePickerProps) {
  return (
    <nav aria-label="Chọn lớp" className={allSizes ? undefined : 'md:hidden'}>
      <p className="mb-2 text-sm font-semibold text-foreground">Chọn lớp</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {grades.map((grade) => (
          <Link
            key={grade}
            href={hrefForGrade(grade)}
            aria-current={currentGrade === grade ? "page" : undefined}
            className={cn(
              "flex min-h-11 min-w-16 flex-1 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              currentGrade === grade
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            Lớp {grade}
          </Link>
        ))}
      </div>
    </nav>
  );
}
