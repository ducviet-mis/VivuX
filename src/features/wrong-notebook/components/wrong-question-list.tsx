'use client';

import { Check, X } from 'lucide-react';
import { useWrongNotebook } from '../hooks/use-wrong-notebook';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function WrongQuestionList() {
  const { wrongQuestions, loading } = useWrongNotebook();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (wrongQuestions.length === 0) {
    return (
      <div className="text-center p-12 bg-muted/30 rounded-2xl border border-dashed">
        <p className="text-muted-foreground">Không có câu hỏi nào cần sửa lại.</p>
        <p className="text-sm font-medium mt-2">Tuyệt vời! Bạn đang làm rất tốt. 🎉</p>
      </div>
    );
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-4">
      {wrongQuestions.map((q) => (
        <Card key={q.id} className="overflow-hidden transition-all">
          <div className="p-4 sm:p-6 border-l-4 border-red-500 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium text-foreground line-clamp-2">{q.content}</p>
              <Link href={`/practice/${q.lessonId}`}>
                <Badge variant="outline" className="shrink-0 cursor-pointer hover:bg-primary/10">
                  Làm lại
                </Badge>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400">
                <span className="flex items-center gap-1 font-semibold text-xs opacity-70"><X className="w-3 h-3"/> Bạn chọn:</span>
                <span>{letters[q.selectedAnswer] || q.selectedAnswer}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                <span className="flex items-center gap-1 font-semibold text-xs opacity-70"><Check className="w-3 h-3"/> Đáp án đúng:</span>
                <span>{letters[q.correctAnswer] || q.correctAnswer}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
