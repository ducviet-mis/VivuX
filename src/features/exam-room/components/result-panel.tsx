'use client';

import { ExamResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Flag, Clock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ExamConfig } from '@/features/exam-setup/types';

interface ResultPanelProps {
  result: ExamResult;
  examConfig: ExamConfig;
}

export function ResultPanel({ result, examConfig }: ResultPanelProps) {
  const router = useRouter();
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-500';
    if (percentage >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-t-4 border-t-primary shadow-md">
        <CardContent className="pt-8 pb-8 text-center flex flex-col items-center">
          <Trophy className={cn("w-16 h-16 mb-4", getScoreColor(result.percentage))} />
          <h2 className="text-2xl font-bold mb-2">Kết quả bài thi</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mt-8">
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
              <span className="text-muted-foreground text-sm mb-1">Điểm số</span>
              <span className={cn("text-4xl font-bold", getScoreColor(result.percentage))}>
                {result.score}<span className="text-2xl text-muted-foreground">/{result.total}</span>
              </span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
              <span className="text-muted-foreground text-sm mb-1">Tỷ lệ đúng</span>
              <span className={cn("text-3xl font-bold mt-1", getScoreColor(result.percentage))}>
                {result.percentage.toFixed(0)}%
              </span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
              <span className="text-muted-foreground text-sm mb-1">Thời gian làm bài</span>
              <div className="flex items-center text-foreground font-semibold mt-2 text-lg">
                <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
                {formatTime(result.timeTaken)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết đáp án</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 font-medium text-sm">
              <div className="col-span-2 text-center">Câu</div>
              <div className="col-span-3 text-center">Đ/a của bạn</div>
              <div className="col-span-3 text-center">Đ/a đúng</div>
              <div className="col-span-2 text-center">Kết quả</div>
              <div className="col-span-2 text-center">Hỏi gia sư</div>
            </div>
            
            <div className="divide-y max-h-[400px] overflow-auto">
              {examConfig.answerKeys.map(key => {
                const studentAns = result.answers.find(a => a.questionNumber === key.questionNumber);
                const sAns = studentAns?.answer || '';
                const isCorrect = sAns.trim().toLowerCase() === key.answer.trim().toLowerCase();
                const isFlagged = studentAns?.isFlagged || false;
                
                return (
                  <div key={key.questionNumber} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-muted/30">
                    <div className="col-span-2 text-center font-medium">{key.questionNumber}</div>
                    <div className="col-span-3 text-center">
                      <span className={cn("inline-block px-2 py-1 rounded text-sm", 
                        !sAns ? "text-muted-foreground italic" : 
                        isCorrect ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30" : 
                        "bg-red-100 text-red-800 dark:bg-red-900/30"
                      )}>
                        {sAns || 'Bỏ trống'}
                      </span>
                    </div>
                    <div className="col-span-3 text-center font-medium text-primary">
                      {key.answer}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {isFlagged && <Flag className="w-4 h-4 text-red-500 fill-current" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {result.flaggedQuestions.length > 0 && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
              <Flag className="w-5 h-5 mr-2" />
              Các câu cần gia sư giải đáp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">Bạn đã đánh dấu {result.flaggedQuestions.length} câu hỏi. Hãy đưa danh sách này cho gia sư trong buổi học tiếp theo.</p>
            <div className="flex flex-wrap gap-2">
              {result.flaggedQuestions.map(qNum => (
                <div key={qNum} className="w-10 h-10 rounded-full bg-background border-2 border-red-200 dark:border-red-900 flex items-center justify-center font-bold text-red-600 dark:text-red-400">
                  {qNum}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={() => router.push(`/classroom/${examConfig.classId}`)}>
          Quay lại lớp học
        </Button>
      </div>
    </div>
  );
}
