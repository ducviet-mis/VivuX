'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Clipboard, Code2, FileText, GraduationCap, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MathRenderer, formatOptionMath } from '@/features/practice/components/math-renderer';
import { buildAiPrompt, parseQuestionJson, type ImportedQuestion, type ImportTarget } from '@/features/question-import/json-import';

type LessonOption = { id: string; grade: number; chapter: string; title: string };
type ExamOption = { id: string; grade: number; title: string };

const isAdminEmail = (email?: string | null) => email === 'vietdang293.vn@gmail.com' || email === 'vietdang293@gmail.com';

function PreviewQuestion({ question, index }: { question: ImportedQuestion; index: number }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-soft sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">Câu {index + 1}</Badge>
        {question.diagram && <Badge variant="outline" className="border-border text-muted-foreground">Có dữ liệu hình học</Badge>}
      </div>
      <div className="text-base font-semibold leading-7 text-foreground sm:text-lg"><MathRenderer content={question.content} /></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {question.options.map((option, optionIndex) => {
          const isCorrect = optionIndex === question.correct_answer;
          return (
            <div key={`${option}-${optionIndex}`} className={`flex min-h-11 items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${isCorrect ? 'border-success/60 bg-success-soft text-success' : 'border-border bg-muted/40 text-foreground'}`}>
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card text-xs font-bold">{String.fromCharCode(65 + optionIndex)}</span>
              <div className="min-w-0 leading-6"><MathRenderer content={formatOptionMath(option)} /></div>
              {isCorrect && <CheckCircle2 aria-label="Đáp án đúng" className="ml-auto mt-0.5 h-4 w-4 shrink-0" />}
            </div>
          );
        })}
      </div>
      {question.solution && <div className="mt-5 border-t border-border pt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Lời giải</p><div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground"><MathRenderer content={question.solution} variant="solution" /></div></div>}
    </article>
  );
}

export default function JsonQuestionImportPage() {
  const router = useRouter();
  const { user, initialized, isLoading } = useAuthStore();
  const [target, setTarget] = useState<ImportTarget>('practice');
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [lessonId, setLessonId] = useState('');
  const [examId, setExamId] = useState('');
  const [level, setLevel] = useState('1');
  const [jsonText, setJsonText] = useState('');
  const [questions, setQuestions] = useState<ImportedQuestion[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialized && !isLoading && (!user || !isAdminEmail(user.email))) router.replace('/home');
  }, [initialized, isLoading, router, user]);

  useEffect(() => {
    if (!user || !isAdminEmail(user.email)) return;
    const loadDestinations = async () => {
      const supabase = getSupabaseClient();
      const [lessonsResult, examsResult] = await Promise.all([
        supabase.from('practice_lessons').select('id, grade, chapter, title').order('grade').order('chapter').order('id'),
        supabase.from('mock_exams').select('id, grade, title').order('created_at', { ascending: false }),
      ]);
      if (lessonsResult.error) setErrors(['Không tải được danh sách bài tự luyện. Hãy kiểm tra Supabase.']);
      if (examsResult.error) setErrors((current) => [...current, 'Không tải được danh sách đề thi thử. Hãy kiểm tra Supabase.']);
      setLessons((lessonsResult.data || []) as LessonOption[]);
      setExams((examsResult.data || []) as ExamOption[]);
      setLoadingDestinations(false);
    };
    void loadDestinations();
  }, [user]);

  const destinationName = useMemo(() => {
    if (target === 'practice') {
      const lesson = lessons.find((item) => item.id === lessonId);
      return lesson ? `Lớp ${lesson.grade} · ${lesson.title}` : 'bài tự luyện đã chọn';
    }
    const exam = exams.find((item) => item.id === examId);
    return exam ? `Lớp ${exam.grade} · ${exam.title}` : 'đề thi thử đã chọn';
  }, [examId, exams, lessonId, lessons, target]);

  const handlePreview = () => {
    const result = parseQuestionJson(jsonText);
    setQuestions(result.questions);
    setErrors(result.errors);
    setPreviewIndex(0);
    setMessage(result.errors.length ? '' : `Đã kiểm tra ${result.questions.length} câu hỏi. Hãy xem trước rồi duyệt nhập.`);
  };

  const handleCopyPrompt = async () => {
    const prompt = buildAiPrompt(target, destinationName, target === 'practice' ? level : undefined);
    try {
      await navigator.clipboard.writeText(prompt);
      setMessage('Đã sao chép prompt. Hãy gửi prompt cho AI rồi dán JSON nhận được vào đây.');
    } catch {
      setMessage('Không thể tự sao chép. Bạn có thể xem prompt trong bảng hướng dẫn bên dưới.');
    }
  };

  const handleImport = async () => {
    if (target === 'practice' && !lessonId) {
      setErrors(['Hãy chọn bài tự luyện trước khi nhập.']);
      return;
    }
    if (target === 'mock_exam' && !examId) {
      setErrors(['Hãy chọn đề thi thử trước khi nhập.']);
      return;
    }
    const result = parseQuestionJson(jsonText);
    setQuestions(result.questions);
    setErrors(result.errors);
    if (result.errors.length || result.questions.length === 0) return;
    if (!window.confirm(`Xác nhận nhập ${result.questions.length} câu vào ${destinationName}? Các câu sẽ được thêm sau những câu đã có.`)) return;

    setSaving(true);
    setMessage('Đang lưu toàn bộ câu hỏi...');
    const { data, error } = await getSupabaseClient().rpc('import_questions_json', {
      p_target: target,
      p_lesson_id: target === 'practice' ? lessonId : null,
      p_exam_id: target === 'mock_exam' ? examId : null,
      p_level: target === 'practice' ? Number(level) : null,
      p_questions: result.questions,
    });

    if (error) {
      setErrors([`Không thể nhập đề: ${error.message}. Hãy chắc rằng bạn đã chạy tệp SQL của tính năng Nhập đề JSON.`]);
      setMessage('');
    } else {
      setErrors([]);
      setMessage(`Đã nhập thành công ${data ?? result.questions.length} câu vào ${destinationName}.`);
      setJsonText('');
      setQuestions([]);
      setPreviewIndex(0);
    }
    setSaving(false);
  };

  if (!initialized || isLoading || loadingDestinations) return <div className="py-20 text-center animate-pulse">Đang chuẩn bị trình nhập đề...</div>;
  if (!user || !isAdminEmail(user.email)) return null;

  const currentPreview = questions[previewIndex];
  const canPreview = target === 'practice' ? Boolean(lessonId) : Boolean(examId);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-2xl border-primary shadow-float dark:shadow-none">
        <CardHeader className="border-b border-border bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-xl"><UploadCloud className="h-5 w-5 text-primary" />Nhập đề bằng JSON</CardTitle>
          <CardDescription>Dán JSON AI tạo, kiểm tra cách hiển thị công thức rồi duyệt để lưu hàng loạt vào đúng nơi đã chọn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="content-target">1. Loại nội dung</Label><Select value={target} onValueChange={(value) => { setTarget(value as ImportTarget); setQuestions([]); setErrors([]); setMessage(''); }}><SelectTrigger id="content-target" className="h-11 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="practice">Tự luyện</SelectItem><SelectItem value="mock_exam">Thi thử</SelectItem></SelectContent></Select></div>
            {target === 'practice' ? <><div className="space-y-2"><Label htmlFor="lesson-target">2. Bài tự luyện</Label><Select value={lessonId} onValueChange={setLessonId}><SelectTrigger id="lesson-target" className="h-11 bg-surface"><SelectValue placeholder="Chọn bài để thêm câu hỏi" /></SelectTrigger><SelectContent>{lessons.map((lesson) => <SelectItem key={lesson.id} value={lesson.id}>Lớp {lesson.grade} · {lesson.chapter} · {lesson.title}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="practice-level">3. Level câu hỏi</Label><Select value={level} onValueChange={setLevel}><SelectTrigger id="practice-level" className="h-11 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{[['1', 'Level 1 · Nhận biết'], ['2', 'Level 2 · Thông hiểu'], ['3', 'Level 3 · Vận dụng'], ['4', 'Level 4 · Vận dụng cao']].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></> : <div className="space-y-2"><Label htmlFor="exam-target">2. Đề thi thử</Label><Select value={examId} onValueChange={setExamId}><SelectTrigger id="exam-target" className="h-11 bg-surface"><SelectValue placeholder="Chọn đề để thêm câu hỏi" /></SelectTrigger><SelectContent>{exams.map((exam) => <SelectItem key={exam.id} value={exam.id}>Lớp {exam.grade} · {exam.title}</SelectItem>)}</SelectContent></Select></div>}
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary-soft/40 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><p className="font-bold text-foreground">Tạo JSON với AI theo mẫu FlyDo</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Hệ thống tự gắn bài/đề và Level bạn đã chọn; AI không cần tạo ID hay mã đề.</p></div></div><Button type="button" variant="outline" onClick={handleCopyPrompt} disabled={!canPreview} className="h-11 shrink-0 border-primary text-primary hover:bg-primary-soft"><Clipboard className="mr-2 h-4 w-4" />Sao chép prompt</Button></div></div>

          <div className="space-y-2"><Label htmlFor="question-json">4. Dán JSON câu hỏi</Label><Textarea id="question-json" value={jsonText} onChange={(event) => { setJsonText(event.target.value); setMessage(''); }} placeholder={'{\n  "questions": [\n    {\n      "content": "...",\n      "options": ["A", "B", "C", "D"],\n      "correct_answer": 0,\n      "solution": "..."\n    }\n  ]\n}'} className="min-h-72 resize-y bg-surface font-mono text-sm leading-6" spellCheck={false} /></div>
          <div className="flex flex-col gap-3 sm:flex-row"><Button type="button" onClick={handlePreview} disabled={!canPreview} className="h-11 bg-primary text-primary-foreground"><Code2 className="mr-2 h-4 w-4" />Kiểm tra và xem trước</Button><Button type="button" variant="outline" onClick={() => { setJsonText(''); setQuestions([]); setErrors([]); setMessage(''); }} disabled={!jsonText && !questions.length} className="h-11">Xóa bản nháp</Button></div>
        </CardContent>
      </Card>

      {(message || errors.length > 0) && <div role={errors.length ? 'alert' : 'status'} aria-live="polite" className={`rounded-xl border p-4 ${errors.length ? 'border-destructive/50 bg-destructive-soft text-destructive' : 'border-success/50 bg-success-soft text-success'}`}><div className="flex gap-3">{errors.length ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}<div><p className="font-bold">{errors.length ? 'Cần sửa trước khi nhập' : 'Sẵn sàng'}</p>{errors.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">{errors.map((error) => <li key={error}>{error}</li>)}</ul> : <p className="mt-1 text-sm leading-6">{message}</p>}</div></div></div>}

      {currentPreview && <Card className="rounded-2xl border-border shadow-soft"><CardHeader className="flex flex-col gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Xem trước nội dung</CardTitle><CardDescription className="mt-1">Đáp án đúng hiển thị màu xanh chỉ để Admin kiểm tra, học sinh sẽ không thấy trạng thái này.</CardDescription></div><Badge variant="outline" className="w-fit border-primary bg-primary-soft px-3 py-1 text-primary">{questions.length} câu hợp lệ</Badge></CardHeader><CardContent className="p-5 sm:p-6"><div className="mb-4 flex flex-wrap gap-2">{questions.map((_, index) => <Button key={index} type="button" variant={index === previewIndex ? 'default' : 'outline'} onClick={() => setPreviewIndex(index)} className="h-11 min-w-11 px-3" aria-label={`Xem trước câu ${index + 1}`}>{index + 1}</Button>)}</div><PreviewQuestion question={currentPreview} index={previewIndex} /><div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Đề sẽ được thêm sau các câu đã có tại <span className="font-semibold text-foreground">{destinationName}</span>.</p><Button type="button" onClick={handleImport} disabled={saving} className="h-11 bg-primary px-6 font-bold text-primary-foreground">{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang nhập...</> : <><UploadCloud className="mr-2 h-4 w-4" />Duyệt và nhập {questions.length} câu</>}</Button></div></CardContent></Card>}

      <Card className="rounded-2xl border-border bg-muted/30"><CardContent className="flex gap-3 p-5 text-sm leading-6 text-muted-foreground"><GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p>Chấp nhận JSON là mảng <code>[…]</code> hoặc dạng <code>{'{ "questions": […] }'}</code>. Đáp án đúng có thể là <code>0–3</code>, <code>A–D</code> hoặc nguyên văn phương án. Với công thức, dùng <code>$…$</code> cho công thức trong dòng và <code>$$…$$</code> cho công thức riêng dòng.</p></CardContent></Card>
    </div>
  );
}
