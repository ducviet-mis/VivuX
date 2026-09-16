'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Clipboard, Code2, Edit3, Eye, Loader2, Plus, Save, Sparkles, Trash2, UploadCloud, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/features/handbook/components/rich-text-editor';
import { TheoryQuestionPreview } from '@/features/theory/components/theory-question-preview';
import { buildTheoryAiPrompt, parseTheoryQuestionJson, THEORY_JSON_EXAMPLE } from '@/features/theory/theory-import';
import type { TheoryLesson, TheoryQuestion } from '@/features/theory/types';
import { getSupabaseClient } from '@/lib/supabase/client';

type LessonForm = {
  grade: string;
  chapter: string;
  title: string;
  summary: string;
  content: string;
  isPublished: boolean;
};

const EMPTY_FORM: LessonForm = { grade: '8', chapter: '', title: '', summary: '', content: '', isPublished: true };
const NEW_CHAPTER_VALUE = '__new_chapter__';

export default function AdminTheoryPage() {
  const [lessons, setLessons] = useState<TheoryLesson[]>([]);
  const [form, setForm] = useState<LessonForm>(EMPTY_FORM);
  const [chapterChoice, setChapterChoice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState<TheoryQuestion[]>([]);
  const [previewErrors, setPreviewErrors] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [importing, setImporting] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  const loadLessons = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await getSupabaseClient()
      .from('theory_lessons')
      .select('*')
      .order('grade', { ascending: true })
      .order('chapter_sort_order', { ascending: true })
      .order('sort_order', { ascending: true });
    if (loadError) setError('Không tải được dữ liệu. Hãy chạy tệp theory-schema.sql trên Supabase trước.');
    else {
      setLessons((data ?? []) as TheoryLesson[]);
      setError('');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadLessons(); }, [loadLessons]);

  const selectedLesson = useMemo(() => lessons.find((lesson) => lesson.id === selectedLessonId), [lessons, selectedLessonId]);
  const availableChapters = useMemo(() => {
    const byName = new Map<string, { name: string; order: number }>();
    lessons
      .filter((lesson) => lesson.grade === Number(form.grade))
      .forEach((lesson) => {
        const key = lesson.chapter.trim().toLocaleLowerCase('vi');
        if (!byName.has(key)) byName.set(key, { name: lesson.chapter, order: lesson.chapter_sort_order });
      });
    return Array.from(byName.values()).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'vi'));
  }, [lessons, form.grade]);
  const groupedLessons = useMemo(() => lessons.reduce<Record<string, TheoryLesson[]>>((groups, lesson) => {
    const key = 'Lớp ' + lesson.grade + ' · ' + lesson.chapter;
    if (!groups[key]) groups[key] = [];
    groups[key].push(lesson);
    return groups;
  }, {}), [lessons]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setChapterChoice('');
    setEditingId(null);
  }

  function changeGrade(value: string) {
    setForm((current) => ({ ...current, grade: value, chapter: '' }));
    setChapterChoice('');
  }

  function changeChapter(value: string) {
    setChapterChoice(value);
    setForm((current) => ({ ...current, chapter: value === NEW_CHAPTER_VALUE ? '' : value }));
  }

  async function saveLesson() {
    setNotice('');
    setError('');
    if (!form.chapter.trim() || !form.title.trim() || !form.content.trim() || form.content === '<p></p>') {
      setError('Hãy nhập đủ chương, tên bài và nội dung lý thuyết.');
      return;
    }

    setSaving(true);
    const supabase = getSupabaseClient();
    const grade = Number(form.grade);
    let chapterSortOrder = 0;
    let sortOrder = 0;

    if (!editingId) {
      const sameChapter = lessons.filter((lesson) => lesson.grade === grade && lesson.chapter.trim().toLowerCase() === form.chapter.trim().toLowerCase());
      if (sameChapter.length) {
        chapterSortOrder = sameChapter[0].chapter_sort_order;
        sortOrder = Math.max(...sameChapter.map((lesson) => lesson.sort_order), -1) + 1;
      } else {
        chapterSortOrder = Math.max(...lessons.filter((lesson) => lesson.grade === grade).map((lesson) => lesson.chapter_sort_order), -1) + 1;
      }
    } else {
      const current = lessons.find((lesson) => lesson.id === editingId);
      chapterSortOrder = current?.chapter_sort_order ?? 0;
      sortOrder = current?.sort_order ?? 0;
    }

    const payload = {
      grade,
      chapter: form.chapter.trim(),
      title: form.title.trim(),
      summary: form.summary.trim(),
      content: form.content,
      is_published: form.isPublished,
      chapter_sort_order: chapterSortOrder,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    };
    const result = editingId
      ? await supabase.from('theory_lessons').update(payload).eq('id', editingId)
      : await supabase.from('theory_lessons').insert(payload);

    if (result.error) setError('Không thể lưu bài lý thuyết: ' + result.error.message);
    else {
      setNotice(editingId ? 'Đã cập nhật bài lý thuyết.' : 'Đã tạo bài lý thuyết mới.');
      resetForm();
      await loadLessons();
    }
    setSaving(false);
  }

  function editLesson(lesson: TheoryLesson) {
    setEditingId(lesson.id);
    setChapterChoice(lesson.chapter);
    setForm({ grade: String(lesson.grade), chapter: lesson.chapter, title: lesson.title, summary: lesson.summary, content: lesson.content, isPublished: lesson.is_published });
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteLesson(lesson: TheoryLesson) {
    if (!window.confirm('Xóa bài “' + lesson.title + '” và toàn bộ câu hỏi kiểm tra của bài?')) return;
    const { error: deleteError } = await getSupabaseClient().from('theory_lessons').delete().eq('id', lesson.id);
    if (deleteError) setError('Không thể xóa bài: ' + deleteError.message);
    else {
      if (selectedLessonId === lesson.id) setSelectedLessonId('');
      setNotice('Đã xóa bài lý thuyết.');
      await loadLessons();
    }
  }

  async function copyText(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(successMessage);
      window.setTimeout(() => setCopyStatus(''), 2500);
    } catch {
      setCopyStatus('Trình duyệt chưa cho phép sao chép.');
    }
  }

  function previewJson() {
    const result = parseTheoryQuestionJson(jsonText);
    setPreviewQuestions(result.questions);
    setPreviewErrors(result.errors);
    setPreviewIndex(0);
    setNotice('');
  }

  async function importQuestions() {
    if (!selectedLessonId || previewQuestions.length === 0 || previewErrors.length) return;
    setImporting(true);
    setError('');
    const { data, error: importError } = await getSupabaseClient().rpc('import_theory_questions_json', {
      p_lesson_id: selectedLessonId,
      p_questions: previewQuestions,
    });
    if (importError) setError('Không thể nhập câu hỏi: ' + importError.message);
    else {
      setNotice('Đã nhập thành công ' + String(data ?? previewQuestions.length) + ' câu hỏi vào “' + (selectedLesson?.title ?? 'bài đã chọn') + '”.');
      setJsonText('');
      setPreviewQuestions([]);
      setPreviewErrors([]);
      setPreviewIndex(0);
    }
    setImporting(false);
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-muted p-1">
          <TabsTrigger value="lessons" className="min-h-11"><BookOpen className="mr-2 h-4 w-4" />Soạn lý thuyết</TabsTrigger>
          <TabsTrigger value="questions" className="min-h-11"><UploadCloud className="mr-2 h-4 w-4" />Nhập câu hỏi</TabsTrigger>
        </TabsList>

        {(notice || error) && <Alert variant={error ? 'destructive' : 'default'} className={error ? 'mt-5' : 'mt-5 border-success/40 bg-success-soft'}>{error ? <X className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-success" />}<AlertTitle>{error ? 'Cần kiểm tra lại' : 'Hoàn tất'}</AlertTitle><AlertDescription>{error || notice}</AlertDescription></Alert>}

        <TabsContent value="lessons" className="mt-6 space-y-6">
          <Card className="rounded-2xl border-border">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl">{editingId ? <Edit3 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}{editingId ? 'Sửa bài lý thuyết' : 'Tạo bài lý thuyết mới'}</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid items-start gap-4 sm:grid-cols-[140px_1fr]">
                <div className="space-y-2"><Label htmlFor="theory-grade">Lớp</Label><Select value={form.grade} onValueChange={changeGrade}><SelectTrigger id="theory-grade"><SelectValue /></SelectTrigger><SelectContent>{[6, 7, 8, 9].map((grade) => <SelectItem key={grade} value={String(grade)}>Lớp {grade}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2">
                  <Label htmlFor="theory-chapter-select">Chương</Label>
                  <Select value={chapterChoice} onValueChange={changeChapter}>
                    <SelectTrigger id="theory-chapter-select"><SelectValue placeholder="Chọn chương hoặc tạo chương mới" /></SelectTrigger>
                    <SelectContent>
                      {availableChapters.map((chapter) => <SelectItem key={chapter.name} value={chapter.name}>{chapter.name}</SelectItem>)}
                      <SelectItem value={NEW_CHAPTER_VALUE}>＋ Tạo chương mới</SelectItem>
                    </SelectContent>
                  </Select>
                  {chapterChoice === NEW_CHAPTER_VALUE && <div className="space-y-2 rounded-xl border border-primary/25 bg-primary-soft/40 p-3"><Label htmlFor="theory-new-chapter" className="text-sm text-primary">Tên chương mới</Label><Input id="theory-new-chapter" value={form.chapter} onChange={(event) => setForm((current) => ({ ...current, chapter: event.target.value }))} placeholder="VD: CHƯƠNG 3 - TAM GIÁC" autoFocus /><p className="text-xs text-muted-foreground">Chương mới sẽ được thêm sau các chương hiện có của lớp {form.grade}.</p></div>}
                  {chapterChoice !== NEW_CHAPTER_VALUE && availableChapters.length === 0 && <p className="text-xs text-muted-foreground">Lớp {form.grade} chưa có chương. Chọn “Tạo chương mới” để bắt đầu.</p>}
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="theory-title">Tên bài lý thuyết</Label><Input id="theory-title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="VD: Định lý Pythagore" /></div>
              <div className="space-y-2"><Label htmlFor="theory-summary">Mô tả ngắn</Label><Textarea id="theory-summary" value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Nội dung trọng tâm học sinh sẽ nắm được..." className="min-h-24" /></div>
              <div className="space-y-2"><Label>Nội dung lý thuyết</Label><p className="text-xs text-muted-foreground">Có thể dùng công thức LaTeX trong dấu $...$ hoặc $$...$$.</p><RichTextEditor key={editingId ?? 'new-theory'} content={form.content} onChange={(content) => setForm((current) => ({ ...current, content }))} /></div>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/30 px-4"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))} className="h-4 w-4 accent-primary" /><span className="text-sm font-semibold">Xuất bản để học sinh nhìn thấy ngay</span></label>
              <div className="flex flex-col gap-2 sm:flex-row"><Button onClick={saveLesson} disabled={saving} className="min-h-11">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{editingId ? 'Lưu thay đổi' : 'Thêm bài lý thuyết'}</Button>{editingId && <Button variant="outline" onClick={resetForm} className="min-h-11"><X className="h-4 w-4" />Hủy sửa</Button>}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardHeader><CardTitle className="text-xl">Danh sách bài lý thuyết ({lessons.length})</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải...</div> : lessons.length === 0 ? <p className="py-10 text-center text-muted-foreground">Chưa có bài lý thuyết nào.</p> : (
                <div className="space-y-6">{Object.entries(groupedLessons).map(([group, rows]) => <section key={group}><h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">{group}</h3><div className="space-y-2">{rows.map((lesson) => <div key={lesson.id} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-foreground">{lesson.title}</p><Badge variant="outline" className={lesson.is_published ? 'border-success/30 bg-success-soft text-success' : ''}>{lesson.is_published ? 'Đã xuất bản' : 'Bản nháp'}</Badge></div>{lesson.summary && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{lesson.summary}</p>}</div><div className="flex gap-2"><Button variant="outline" size="icon" onClick={() => editLesson(lesson)} aria-label={'Sửa ' + lesson.title} className="h-11 w-11"><Edit3 className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => deleteLesson(lesson)} aria-label={'Xóa ' + lesson.title} className="h-11 w-11 text-destructive hover:bg-destructive-soft hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></div></div>)}</div></section>)}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="mt-6 space-y-6">
          <Card className="rounded-2xl border-border">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5 text-primary" />Nhập câu hỏi kiểm tra bằng JSON</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2"><Label>1. Chọn bài lý thuyết</Label><Select value={selectedLessonId} onValueChange={setSelectedLessonId}><SelectTrigger><SelectValue placeholder="Chọn bài để thêm câu hỏi" /></SelectTrigger><SelectContent>{lessons.map((lesson) => <SelectItem key={lesson.id} value={lesson.id}>Lớp {lesson.grade} · {lesson.title}</SelectItem>)}</SelectContent></Select></div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button type="button" variant="outline" disabled={!selectedLesson} onClick={() => selectedLesson && copyText(buildTheoryAiPrompt(selectedLesson.title), 'Đã sao chép prompt tạo câu hỏi cho AI.')} className="min-h-11"><Clipboard className="h-4 w-4" />Sao chép prompt cho AI</Button>
                <Button type="button" variant="outline" onClick={() => copyText(THEORY_JSON_EXAMPLE, 'Đã sao chép mẫu JSON.')} className="min-h-11"><Code2 className="h-4 w-4" />Sao chép mẫu JSON</Button>
              </div>
              {copyStatus && <p role="status" className="text-sm font-medium text-success">{copyStatus}</p>}

              <div className="rounded-xl border border-primary/25 bg-primary-soft p-4 text-sm leading-6 text-foreground"><p className="font-bold text-primary">Hai dạng được hỗ trợ</p><p>• <code>true_false</code>: một câu gồm 2–6 nhận định Đúng/Sai.</p><p>• <code>drag_fill</code>: dùng <code>{'{{1}}'}</code>, <code>{'{{2}}'}</code>… để đánh dấu từng chỗ trống.</p></div>

              <div className="space-y-2"><div className="flex items-center justify-between gap-3"><Label htmlFor="theory-json">2. Dán JSON câu hỏi</Label><Button type="button" variant="ghost" size="sm" onClick={() => setJsonText(THEORY_JSON_EXAMPLE)}>Điền mẫu</Button></div><Textarea id="theory-json" value={jsonText} onChange={(event) => { setJsonText(event.target.value); setPreviewQuestions([]); setPreviewErrors([]); }} placeholder={THEORY_JSON_EXAMPLE} className="min-h-[360px] font-mono text-xs leading-5" spellCheck={false} /></div>
              <Button type="button" onClick={previewJson} disabled={!selectedLessonId || !jsonText.trim()} className="min-h-11"><Eye className="h-4 w-4" />Kiểm tra và xem trước</Button>
            </CardContent>
          </Card>

          {previewErrors.length > 0 && <Alert variant="destructive"><X className="h-4 w-4" /><AlertTitle>Cần sửa trước khi nhập</AlertTitle><AlertDescription><ul className="list-disc space-y-1 pl-5">{previewErrors.map((message) => <li key={message}>{message}</li>)}</ul></AlertDescription></Alert>}

          {previewQuestions.length > 0 && previewErrors.length === 0 && (
            <Card className="rounded-2xl border-primary/30">
              <CardHeader><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><CardTitle className="text-xl">Xem trước nội dung</CardTitle><p className="mt-1 text-sm text-muted-foreground">Đáp án đúng chỉ hiện ở màn hình Admin.</p></div><Badge variant="outline" className="w-fit border-primary/40 bg-primary-soft text-primary">{previewQuestions.length} câu hợp lệ</Badge></div></CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2" aria-label="Chọn câu xem trước">{previewQuestions.map((_, index) => <Button key={index} type="button" variant={previewIndex === index ? 'default' : 'outline'} size="icon" onClick={() => setPreviewIndex(index)} className="h-11 w-11" aria-label={'Xem câu ' + (index + 1)}>{index + 1}</Button>)}</div>
                <TheoryQuestionPreview question={previewQuestions[previewIndex]} index={previewIndex} />
                <div className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => { setPreviewQuestions([]); setPreviewErrors([]); }} className="min-h-11">Quay lại chỉnh JSON</Button><Button onClick={importQuestions} disabled={importing} className="min-h-11">{importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}Duyệt và nhập {previewQuestions.length} câu</Button></div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
