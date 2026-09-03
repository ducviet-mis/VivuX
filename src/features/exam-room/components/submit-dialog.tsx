'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle2, Flag } from 'lucide-react';
import { useExamAnswers } from '../hooks/use-exam-answers';
import { useExamTimer } from '../hooks/use-exam-timer';
import { useState } from 'react';

interface SubmitDialogProps {
  onSubmit: () => void;
  children: React.ReactNode;
}

export function SubmitDialog({ onSubmit, children }: SubmitDialogProps) {
  const [open, setOpen] = useState(false);
  const { answeredCount, totalQuestions, flaggedCount } = useExamAnswers();
  const { formatted } = useExamTimer();

  const handleConfirm = () => {
    setOpen(false);
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <AlertTriangle className="w-6 h-6 text-amber-500 mr-2" />
            Xác nhận nộp bài
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-foreground">
            Bạn có chắc chắn muốn nộp bài? Bài làm sau khi nộp sẽ không thể chỉnh sửa.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-3 rounded-lg flex flex-col items-center justify-center space-y-1">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Đã trả lời</span>
              <span className="font-bold text-lg">{answeredCount} / {totalQuestions}</span>
            </div>
            
            <div className="bg-muted p-3 rounded-lg flex flex-col items-center justify-center space-y-1">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">Thời gian còn lại</span>
              <span className="font-bold text-lg">{formatted}</span>
            </div>
          </div>
          
          {flaggedCount > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50">
              <Flag className="w-4 h-4 text-red-500" />
              <span>Bạn có <strong>{flaggedCount}</strong> câu hỏi đã đánh dấu để hỏi gia sư.</span>
            </div>
          )}
          
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Quay lại làm tiếp
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              Nộp bài ngay
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
