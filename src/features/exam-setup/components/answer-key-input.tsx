'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AnswerType } from '../types';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

interface AnswerKeyInputProps {
  answerType: AnswerType;
  setAnswerType: (type: AnswerType) => void;
  answerInput: string;
  setAnswerInput: (text: string) => void;
  parseAnswers: () => void;
  error: string | null;
}

export function AnswerKeyInput({
  answerType,
  setAnswerType,
  answerInput,
  setAnswerInput,
  parseAnswers,
  error
}: AnswerKeyInputProps) {
  const handleTabChange = (value: string) => {
    setAnswerType(value as AnswerType);
    // Removed setAnswerInput(''); so it doesn't clear the input when switching tabs
  };

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileQuestion className="w-5 h-5 text-primary" />
          Nhập đáp án
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={answerType} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mcq">Trắc nghiệm ABCD</TabsTrigger>
            <TabsTrigger value="tf">Đúng / Sai</TabsTrigger>
            <TabsTrigger value="short">Điền đáp án</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mcq" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Nhập đáp án: số câu + chữ cái (A, B, C, D). Ví dụ: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">1A 2B 3C 4D</code>
            </p>
            <Textarea 
              value={answerInput} 
              onChange={(e) => setAnswerInput(e.target.value)} 
              placeholder="1A 2B 3C 4D 5A 6B 7C 8D..." 
              className="min-h-[180px] font-mono bg-background" 
            />
          </TabsContent>
          
          <TabsContent value="tf" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Nhập đáp án: số câu + D (Đúng) hoặc S (Sai). Ví dụ: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">1D 2S 3D 4S</code>
            </p>
            <Textarea 
              value={answerInput} 
              onChange={(e) => setAnswerInput(e.target.value)} 
              placeholder="1D 2S 3D 4S 5D 6S..." 
              className="min-h-[180px] font-mono bg-background" 
            />
          </TabsContent>
          
          <TabsContent value="short" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Nhập đáp án: số câu + đáp án. Ví dụ: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">1 15 2 23,21 3 4/5</code>
            </p>
            <Textarea 
              value={answerInput} 
              onChange={(e) => setAnswerInput(e.target.value)} 
              placeholder="1 15 2 23,21 3 4/5 4 -3..." 
              className="min-h-[180px] font-mono bg-background" 
            />
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={parseAnswers} className="w-full">Tách đáp án</Button>
      </CardContent>
    </Card>
  );
}
