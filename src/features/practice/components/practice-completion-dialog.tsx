'use client';

import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PracticeCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonTitle: string;
  totalQuestions: number;
  onChooseAnother: () => void;
}

export function PracticeCompletionDialog({
  open,
  onOpenChange,
  lessonTitle,
  totalQuestions,
  onChooseAnother,
}: PracticeCompletionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl text-center sm:max-w-md">
        <DialogHeader className="items-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
            <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
          </div>
          <DialogTitle className="text-2xl">Hoàn thành bài tự luyện!</DialogTitle>
          <DialogDescription className="max-w-sm text-center text-base leading-relaxed">
            Bạn đã làm xong {totalQuestions} câu của bài <span className="font-semibold text-foreground">{lessonTitle}</span>. Hãy chọn một bài khác để tiếp tục nhé.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-3 sm:justify-center">
          <Button type="button" onClick={onChooseAnother} className="h-11 w-full rounded-md bg-primary px-6 font-bold text-primary-foreground sm:w-auto">
            Chọn bài khác <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
