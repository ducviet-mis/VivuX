'use client';

import { PageHeader } from '@/components/shared/page-header';
import { useExamSetup } from '@/features/exam-setup/hooks/use-exam-setup';
import { ExamUploadForm } from '@/features/exam-setup/components/exam-upload-form';
import { TimeSetting } from '@/features/exam-setup/components/time-setting';
import { AnswerKeyInput } from '@/features/exam-setup/components/answer-key-input';
import { AnswerPreview } from '@/features/exam-setup/components/answer-preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CreateExamPage() {
  const router = useRouter();
  const {
    step,
    examConfig,
    pdfFile,
    setPdfFile,
    setDuration,
    answerInput,
    setAnswerInput,
    parseAnswers,
    answerType,
    setAnswerType,
    parsedAnswers,
    parseError,
    createExam,
    nextStep,
    prevStep
  } = useExamSetup();

  const handleCreate = () => {
    const newExam = createExam();
    console.log('Exam created:', newExam);
    // In real app, make API call to save
    router.push('/teacher/dashboard');
  };

  const steps = [
    { num: 1, title: 'Tải đề thi' },
    { num: 2, title: 'Thời gian' },
    { num: 3, title: 'Đáp án' }
  ];

  return (
    <div className="container max-w-4xl py-8">
      <PageHeader 
        title="Tạo đề thi mới" 
        description="Thiết lập đề thi từ file PDF và cấu hình đáp án"
      />
      
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center relative flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-medium z-10 transition-colors",
                step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                step === s.num && "ring-4 ring-primary/20"
              )}>
                {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
              </div>
              <span className={cn(
                "text-sm mt-2 font-medium absolute -bottom-6 w-24 text-center",
                step >= s.num ? "text-foreground" : "text-muted-foreground"
              )}>
                {s.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-1 mx-4 -mt-6",
                step > s.num ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>{steps[step - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <ExamUploadForm pdfFile={pdfFile} setPdfFile={setPdfFile} />
            )}
            
            {step === 2 && (
              <TimeSetting 
                duration={examConfig.durationMinutes || 45} 
                setDuration={setDuration} 
              />
            )}
            
            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <AnswerKeyInput 
                    answerType={answerType || 'mcq'}
                    setAnswerType={setAnswerType}
                    answerInput={answerInput}
                    setAnswerInput={setAnswerInput}
                    parseAnswers={parseAnswers}
                    error={parseError}
                  />
                </div>
                <div>
                  {parsedAnswers.length > 0 ? (
                    <AnswerPreview answers={parsedAnswers} onConfirm={handleCreate} />
                  ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl p-6 text-center text-muted-foreground">
                      Nhập và tách đáp án để xem trước
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={step === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        
        {step < 3 && (
          <Button onClick={nextStep} disabled={step === 1 && !pdfFile}>
            Tiếp tục
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
