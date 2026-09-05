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
    <Card level="compact">
      <CardContent className="p-6 flex flex-col gap-5">
        
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-md bg-special-soft shrink-0">
            <BookX className="w-5 h-5 text-special" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-end gap-1.5">
              <span className="text-3xl leading-none font-bold tabular-nums text-foreground">
                {loading ? '...' : totalCount}
              </span>
              <span className="text-sm font-bold text-muted-foreground mb-1">câu sai</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">cần làm lại</span>
          </div>
        </div>

        {!loading && totalCount === 0 && (
          <div className="px-4 py-3 bg-success-soft rounded-md">
            <p className="text-sm font-medium text-success">Tuyệt vời! Bạn không có câu hỏi nào bị sai.</p>
          </div>
        )}
        
        {!loading && totalCount > 0 && (
          <div className="px-4 py-3 bg-muted rounded-md border border-border">
            <p className="text-sm font-medium text-muted-foreground line-clamp-2">
              {wrongQuestions[0]?.content}
            </p>
          </div>
        )}
        
        <Button 
          disabled={totalCount === 0} 
          variant="outline" className="w-full"
          onClick={handleClick}
        >
          Luyện lại ngay <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
