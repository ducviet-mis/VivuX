'use client';

import { BookX, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWrongNotebook } from '../hooks/use-wrong-notebook';
import { useRouter } from 'next/navigation';

export function WrongNotebookCard() {
  const { wrongQuestions, totalCount, loading } = useWrongNotebook();
  const router = useRouter();

  const handleClick = () => {
    if (totalCount === 0) return;
    const firstLessonId = wrongQuestions[0]?.lessonId;
    if (firstLessonId) {
      router.push(`/practice/wrong/${firstLessonId}`);
    }
  };

  return (
    <Card className="rounded-[32px] border-none bg-white dark:bg-[#2a2438] shadow-[0_12px_40px_-10px_rgba(200,180,220,0.25)] dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.4)] transition-all duration-300">
      <CardContent className="p-6 flex flex-col gap-5">
        
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-[20px] bg-red-50 dark:bg-red-900/20 shrink-0 shadow-inner">
            <BookX className="w-8 h-8 text-red-500" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-end gap-1.5">
              <span className="text-[32px] leading-none font-extrabold text-[#1e1b4b] dark:text-white">
                {loading ? '...' : totalCount}
              </span>
              <span className="text-sm font-bold text-slate-400 mb-1">câu sai</span>
            </div>
            <span className="text-sm font-medium text-slate-500">cần làm lại</span>
          </div>
        </div>

        {!loading && totalCount === 0 && (
          <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-2xl">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Tuyệt vời! Bạn không có câu hỏi nào bị sai.</p>
          </div>
        )}
        
        {!loading && totalCount > 0 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-2">
              {wrongQuestions[0]?.content}
            </p>
          </div>
        )}
        
        <Button 
          disabled={totalCount === 0} 
          className="w-full h-12 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-red-500/25 transition-all"
          onClick={handleClick}
        >
          Luyện lại ngay <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
