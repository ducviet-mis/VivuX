'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExamStore } from '@/features/exam-room/stores/exam-store';
import { useExamGrading } from '@/features/exam-room/hooks/use-exam-grading';
import { ExamLayout } from '@/features/exam-room/components/exam-layout';
import { ResultPanel } from '@/features/exam-room/components/result-panel';
import { useClassroomStore } from '@/features/classroom/stores/classroom-store';
import { ExamResult } from '@/features/exam-room/types';
import { Loader2 } from 'lucide-react';

export default function ExamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { examState, startExam, submitExam, examConfig, studentAnswers, reset } = useExamStore();
  const { exams } = useClassroomStore();
  const { gradeExam } = useExamGrading();
  const [result, setResult] = useState<ExamResult | null>(null);

  // Initialize exam
  useEffect(() => {
    const examId = params.examId as string;
    const config = exams.find(e => e.id === examId);
    
    if (config) {
      // Start fresh if: waiting, or different exam
      if (examState === 'waiting' || (examConfig && examConfig.id !== examId)) {
        reset();
        startExam(config);
      }
    }
  }, [params.examId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (examState === 'in-progress') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examState]);

  const handleSubmit = () => {
    const partialResult = submitExam();
    if (partialResult && examConfig) {
      // Grade the exam
      const finalResult = gradeExam(
        examConfig.id, 
        partialResult.answers, 
        examConfig.answerKeys, 
        partialResult.timeTaken
      );
      setResult(finalResult);
    }
  };

  if (examState === 'waiting') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Đang tải đề thi...</p>
      </div>
    );
  }

  if (examState === 'submitted' && result && examConfig) {
    return (
      <div className="container py-8 min-h-screen">
        <ResultPanel result={result} examConfig={examConfig} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <ExamLayout onSubmit={handleSubmit} />
    </div>
  );
}
