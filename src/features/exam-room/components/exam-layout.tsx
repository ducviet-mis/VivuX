'use client';

import { useExamStore } from '../stores/exam-store';
import { PdfViewer } from './pdf-viewer';
import { AnswerSheet } from './answer-sheet';
import { ExamTimer } from './exam-timer';
import { SubmitDialog } from './submit-dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/auth-store';

interface ExamLayoutProps {
  onSubmit: () => void;
}

export function ExamLayout({ onSubmit }: ExamLayoutProps) {
  const { examConfig } = useExamStore();
  const { user } = useAuthStore();

  if (!examConfig) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Sticky Header */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center truncate mr-4">
          <h1 className="font-bold text-base sm:text-lg truncate">{examConfig.title}</h1>
        </div>

        {/* Student name - center */}
        <div className="hidden sm:flex items-center justify-center flex-1">
          <span className="text-sm font-medium text-muted-foreground">
            Thí sinh: <span className="text-foreground font-semibold">{user?.name || 'Chưa đăng nhập'}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <ExamTimer />
          <SubmitDialog onSubmit={onSubmit}>
            <Button variant="default" size="sm" className="font-semibold shadow-md">
              Nộp bài
            </Button>
          </SubmitDialog>
        </div>
      </header>

      {/* Mobile: student name */}
      <div className="sm:hidden border-b px-4 py-1.5 bg-card text-center text-sm text-muted-foreground">
        Thí sinh: <span className="text-foreground font-semibold">{user?.name || 'Chưa đăng nhập'}</span>
      </div>

      {/* Main Content Split View */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-0">
        {/* Left panel - PDF */}
        <div className="flex-1 min-h-0 lg:h-full overflow-hidden border-r border-border">
          <PdfViewer pdfUrl={examConfig.pdfUrl} />
        </div>
        
        {/* Right panel - Answer Sheet - SCROLLABLE */}
        <div className="h-[45vh] lg:h-full lg:w-[400px] xl:w-[440px] shrink-0 overflow-y-auto">
          <AnswerSheet />
        </div>
      </div>
    </div>
  );
}
