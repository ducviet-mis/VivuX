'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Plus, Trash2, Clock, Hash, FileText, FolderTree, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getMockExamCategoryLabel, MOCK_EXAM_CATEGORIES, type MockExamCategory } from '@/features/mock-exams/exam-categories';

interface MockExamTopic { id: string; name: string; grade: number; }
const isAdminEmail = (email?: string | null) => email === 'vietdang293.vn@gmail.com' || email === 'vietdang293@gmail.com';

export default function MockExamsAdminPage() {
  const { user, isLoading, initialized } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [topics, setTopics] = useState<MockExamTopic[]>([]);
  const [fetching, setFetching] = useState(true);
  const [databaseReady, setDatabaseReady] = useState(true);
  const [code, setCode] = useState('');
  const [grade, setGrade] = useState('8');
  const [category, setCategory] = useState<MockExamCategory>('midterm_1');
  const [topicId, setTopicId] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('45');
  const [saving, setSaving] = useState(false);

  const topicsForGrade = useMemo(() => topics.filter((topic) => topic.grade === parseInt(grade)), [topics, grade]);
  const topicNameById = useMemo(() => Object.fromEntries(topics.map((topic) => [topic.id, topic.name])), [topics]);

  const fetchData = async () => {
    const supabase = getSupabaseClient();
    const [examResult, topicResult] = await Promise.all([
      supabase.from('mock_exams').select('*').order('created_at', { ascending: false }),
      supabase.from('mock_exam_topics').select('id, name, grade').order('grade').order('sort_order').order('name'),
    ]);
    if (examResult.error?.code === '42P01' || topicResult.error?.code === '42P01') {
      setDatabaseReady(false);
    } else {
      if (examResult.error) console.error('Không thể tải danh sách đề:', examResult.error);
      if (topicResult.error) console.error('Không thể tải chuyên đề:', topicResult.error);
      setExams(examResult.data || []);
      setTopics((topicResult.data || []) as MockExamTopic[]);
      setDatabaseReady(true);
    }
    setFetching(false);
  };

  useEffect(() => { if (user && isAdminEmail(user.email)) void fetchData(); }, [user]);
  useEffect(() => { setTopicId(''); setNewTopicName(''); }, [grade, category]);

  const handleAddExam = async () => {
    if (!code.trim() || !title.trim() || !duration) return alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
    if (category === 'topic' && !topicId && !newTopicName.trim()) return alert('Hãy chọn hoặc tạo chuyên đề cho đề này.');
    setSaving(true);
    const supabase = getSupabaseClient();
    let resolvedTopicId: string | null = null;

    if (category === 'topic') {
      resolvedTopicId = topicId || null;
      if (!resolvedTopicId && newTopicName.trim()) {
        const { data: newTopic, error: topicError } = await supabase.from('mock_exam_topics').insert({ name: newTopicName.trim(), grade: parseInt(grade) }).select('id').single();
        if (topicError || !newTopic) {
          alert('Không thể tạo chuyên đề: ' + (topicError?.message || 'Lỗi không xác định'));
          setSaving(false);
          return;
        }
        resolvedTopicId = newTopic.id;
      }
    }

    const { error } = await supabase.from('mock_exams').insert({ code: code.trim(), grade: parseInt(grade), title: title.trim(), duration: parseInt(duration), category, topic_id: resolvedTopicId });
    if (error) alert('Không thể tạo đề: ' + error.message);
    else {
      alert('Đã tạo đề. Bạn có thể tiếp tục nhập câu hỏi theo mã đề trong Supabase.');
      setCode(''); setTitle(''); setTopicId(''); setNewTopicName('');
      await fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async (examId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đề này cùng toàn bộ câu hỏi và lịch sử thi liên quan?')) return;
    const { error } = await getSupabaseClient().from('mock_exams').delete().eq('id', examId);
    if (error) alert('Không thể xóa đề: ' + error.message);
    else setExams((current) => current.filter((exam) => exam.id !== examId));
  };

  if (!initialized || isLoading || fetching) return <div className="py-20 text-center animate-pulse">Đang tải dữ liệu...</div>;
  if (!user || !isAdminEmail(user.email)) return null;

  return (
    <div className="space-y-8">
      {!databaseReady && <Card className="border-warning bg-warning-soft"><CardContent className="flex gap-4 p-6"><AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-warning" /><div><h2 className="font-bold text-warning">Chưa khởi tạo cấu trúc Thi thử</h2><p className="mt-1 text-sm text-warning">Hãy chạy tệp SQL đi kèm bản cập nhật này trong Supabase SQL Editor, sau đó tải lại trang.</p></div></CardContent></Card>}

      {databaseReady && <>
        <Card className="rounded-2xl border-primary shadow-float dark:shadow-none">
          <CardHeader className="border-b border-border bg-muted/50"><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />Tạo đề thi thử</CardTitle><CardDescription>Chọn đúng loại đề trước; nếu là Chuyên đề, hãy gắn đề vào chương tương ứng.</CardDescription></CardHeader>
          <CardContent className="p-5 sm:p-6"><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
            <div className="space-y-2 xl:col-span-3"><Label>Mã đề</Label><Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="VD: GK1-L8-01" className="h-11 bg-surface" /></div>
            <div className="space-y-2 xl:col-span-2"><Label>Lớp</Label><Select value={grade} onValueChange={setGrade}><SelectTrigger className="h-11 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{[6, 7, 8, 9].map((value) => <SelectItem key={value} value={String(value)}>Lớp {value}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2 xl:col-span-3"><Label>Danh mục</Label><Select value={category} onValueChange={(value) => setCategory(value as MockExamCategory)}><SelectTrigger className="h-11 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{MOCK_EXAM_CATEGORIES.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2 xl:col-span-4"><Label>Tên đề thi</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="VD: Đề giữa học kì I - Toán 8" className="h-11 bg-surface" /></div>
            {category === 'topic' && <div className="space-y-2 md:col-span-2 xl:col-span-8"><Label className="flex items-center gap-2"><FolderTree className="h-4 w-4 text-primary" />Chuyên đề / chương</Label><div className="grid gap-3 sm:grid-cols-2"><Select value={topicId || '__new__'} onValueChange={(value) => { setTopicId(value === '__new__' ? '' : value); if (value !== '__new__') setNewTopicName(''); }}><SelectTrigger className="h-11 bg-surface"><SelectValue placeholder="Chọn chuyên đề đã có" /></SelectTrigger><SelectContent>{topicsForGrade.map((topic) => <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>)}<SelectItem value="__new__">＋ Tạo chuyên đề mới</SelectItem></SelectContent></Select>{!topicId && <Input value={newTopicName} onChange={(event) => setNewTopicName(event.target.value)} placeholder="VD: Đa thức và các phép toán" className="h-11 bg-surface" />}</div></div>}
            <div className="space-y-2 xl:col-span-2"><Label>Thời gian (phút)</Label><Input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} className="h-11 bg-surface" /></div>
          </div><Button onClick={handleAddExam} disabled={saving} className="mt-6 h-11 w-full rounded-md bg-primary px-8 font-bold text-primary-foreground md:w-auto">{saving ? 'Đang tạo...' : 'Tạo đề thi'}</Button></CardContent>
        </Card>

        <section className="space-y-4"><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold text-foreground">Danh sách đề thi thử</h2></div>{exams.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-muted-foreground">Chưa có đề thi thử nào.</div> : <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{exams.map((exam) => <Card key={exam.id} className="overflow-hidden rounded-2xl border-border shadow-soft"><CardContent className="flex items-start justify-between gap-4 p-4 sm:p-5"><div className="min-w-0 space-y-3"><div className="flex flex-wrap gap-2"><Badge variant="outline" className="border-primary bg-primary-soft text-primary">Lớp {exam.grade}</Badge><Badge variant="outline" className="border-border bg-muted text-muted-foreground">{getMockExamCategoryLabel(exam.category)}</Badge><Badge variant="outline" className="border-border bg-muted text-muted-foreground"><Hash className="mr-1 h-3 w-3" />{exam.code}</Badge><Badge variant="outline" className="border-primary bg-primary-soft text-primary"><Clock className="mr-1 h-3 w-3" />{exam.duration} phút</Badge></div><h3 className="text-lg font-bold text-foreground">{exam.title}</h3>{exam.topic_id && <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><FolderTree className="h-4 w-4" />{topicNameById[exam.topic_id] || 'Chuyên đề đã xóa'}</p>}<p className="break-all text-xs text-muted-foreground">ID: {exam.id}</p></div><Button variant="destructive" size="icon" onClick={() => handleDelete(exam.id)} className="h-11 w-11 shrink-0 rounded-md bg-destructive-soft text-destructive hover:bg-destructive-soft" aria-label={`Xóa đề ${exam.title}`}><Trash2 className="h-4 w-4" /></Button></CardContent></Card>)}</div>}</section>
      </>}
    </div>
  );
}
