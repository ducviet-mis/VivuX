'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Plus, Trash2, Database, AlertCircle, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading, initialized } = useAuthStore();
  const [lessons, setLessons] = useState<any[]>([]);
  const [dbError, setDbError] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form states
  const [id, setId] = useState('');
  const [grade, setGrade] = useState('8');
  const [chapter, setChapter] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [isNewChapter, setIsNewChapter] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const existingChaptersForGrade = Array.from(new Set(
    lessons.filter(l => l.grade.toString() === grade.toString()).map(l => (l.chapter || '').trim())
  ));

  useEffect(() => {
    if (initialized && !isLoading) {
      if (!user || (user.email !== 'vietdang293.vn@gmail.com' && user.email !== 'vietdang293@gmail.com')) {
        router.replace('/home');
      }
    }
  }, [user, isLoading, initialized, router]);

  useEffect(() => {
    async function fetchLessons() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('practice_lessons').select('*').order('grade').order('id');
      
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setDbError(true);
        } else {
          console.error('Error fetching lessons:', error);
        }
      } else if (data) {
        setLessons(data);
      }
      setFetching(false);
    }
    
    if (user && (user.email === 'vietdang293.vn@gmail.com' || user.email === 'vietdang293@gmail.com')) {
      fetchLessons();
    }
  }, [user]);

  const handleAddLesson = async () => {
    if (!id || !grade || !chapter || !title) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    setSaving(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('practice_lessons').insert([
      { id, grade: parseInt(grade), chapter: chapter.trim(), title: title.trim() }
    ]);
    
    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      alert('Thêm chuyên đề thành công!');
      // Refresh list
      const { data } = await supabase.from('practice_lessons').select('*').order('grade').order('id');
      if (data) setLessons(data);
      
      // Reset form
      setId('');
      setChapter('');
      setTitle('');
    }
    setSaving(false);
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chuyên đề này VÀ TẤT CẢ câu hỏi, tiến độ liên quan?')) return;
    
    const supabase = getSupabaseClient();
    
    // Xóa dữ liệu liên quan trước (để tránh rác trong DB nếu không có ON DELETE CASCADE)
    await supabase.from('practice_questions').delete().eq('lesson_id', lessonId);
    await supabase.from('practice_progress').delete().eq('lesson_id', lessonId);
    await supabase.from('saved_questions').delete().eq('lesson_id', lessonId);

    // Sau đó xóa chuyên đề
    const { error } = await supabase.from('practice_lessons').delete().eq('id', lessonId);
    
    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      setLessons(prev => prev.filter(l => l.id !== lessonId));
    }
  };

  const groupedLessons = useMemo(() => {
    const grades = new Map<number, Map<string, any[]>>();
    lessons.forEach(l => {
      const g = l.grade;
      const c = (l.chapter || 'Chuyên đề khác').trim();
      if (!grades.has(g)) grades.set(g, new Map());
      const chapters = grades.get(g)!;
      if (!chapters.has(c)) chapters.set(c, []);
      chapters.get(c)!.push(l);
    });
    
    return Array.from(grades.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([gradeNum, chapters]) => ({
        gradeNum,
        chapters: Array.from(chapters.entries()).map(([title, items]) => ({
          title,
          items
        }))
      }));
  }, [lessons]);

  if (!initialized || isLoading || fetching) return <div className="py-20 text-center animate-pulse">Đang tải dữ liệu...</div>;
  if (!user || (user.email !== 'vietdang293.vn@gmail.com' && user.email !== 'vietdang293@gmail.com')) return null;

  return (
    <div className="space-y-8">

      {dbError && (
        <Card className="mt-8 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-2">Bảng dữ liệu chưa được khởi tạo</h3>
              <p className="text-amber-700/80 dark:text-amber-500/80 text-sm mb-4">
                Bạn cần chạy đoạn SQL sau trong Supabase SQL Editor để tạo bảng lưu trữ chuyên đề (practice_lessons) trước khi có thể thêm chuyên đề mới từ giao diện này.
              </p>
              <pre className="bg-white/50 dark:bg-black/20 p-4 rounded-xl text-xs overflow-x-auto border border-amber-200/50 text-slate-800 dark:text-slate-200">
{`CREATE TABLE IF NOT EXISTS public.practice_lessons (
  id TEXT PRIMARY KEY,
  grade INTEGER NOT NULL,
  chapter TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bật Row Level Security nhưng cho phép mọi người đọc, chỉ Admin sửa
ALTER TABLE public.practice_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.practice_lessons FOR SELECT USING (true);
CREATE POLICY "Allow admin all access" ON public.practice_lessons FOR ALL USING (auth.jwt()->>'email' = 'vietdang293.vn@gmail.com');

-- Chèn một số chuyên đề mặc định hiện tại
INSERT INTO public.practice_lessons (id, grade, chapter, title) VALUES
('l6-1', 6, 'Số tự nhiên', 'Tập hợp các số tự nhiên'),
('l7-1', 7, 'Số hữu tỉ', 'Các phép toán với số hữu tỉ'),
('l8-1', 8, 'Phép nhân và phép chia đa thức', 'Nhân đơn thức với đa thức'),
('l8-2-1', 8, 'ÔN TẬP ĐA THỨC', 'Bài tập trắc nghiệm'),
('l9-1', 9, 'Căn bậc hai', 'Khái niệm về căn bậc hai');
`}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {!dbError && (
        <div className="space-y-8 mt-8">
          <Card className="rounded-[24px] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-fuchsia-500" />
                Thêm chuyên đề mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                <div className="space-y-2 lg:col-span-2">
                  <Label>Lớp</Label>
                  <Input type="number" value={grade} onChange={e => setGrade(e.target.value)} placeholder="VD: 8" />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Mã bài học (ID)</Label>
                  <Input value={id} onChange={e => setId(e.target.value)} placeholder="VD: l8-3" />
                </div>
                <div className="space-y-2 lg:col-span-3">
                  <Label>Tên Chương / Nhóm</Label>
                  {!isNewChapter ? (
                    <Select 
                      value={chapter} 
                      onValueChange={(val) => {
                        if (val === '__new__') {
                          setIsNewChapter(true);
                          setChapter('');
                        } else {
                          setChapter(val);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chương..." />
                      </SelectTrigger>
                      <SelectContent>
                        {existingChaptersForGrade.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                        <SelectItem value="__new__" className="text-fuchsia-600 font-bold">
                          ＋ Tạo chương mới
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input 
                        value={chapter} 
                        onChange={e => setChapter(e.target.value)} 
                        placeholder="Tên chương mới..." 
                        autoFocus 
                      />
                      <Button 
                        variant="outline" 
                        className="shrink-0"
                        onClick={() => {
                          setIsNewChapter(false);
                          setChapter('');
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2 lg:col-span-3">
                  <Label>Tên Bài Học</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="VD: Phép cộng phân thức" />
                </div>
                
                <div className="lg:col-span-2 pt-2 md:pt-0">
                  <Button onClick={handleAddLesson} disabled={saving} className="w-full rounded-xl bg-fuchsia-500 hover:bg-fuchsia-600 text-white">
                    {saving ? 'Đang thêm...' : 'Thêm mới'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                Danh sách chuyên đề ({lessons.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupedLessons.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  Chưa có chuyên đề nào trong CSDL.
                </div>
              ) : (
                <div className="space-y-8">
                  {groupedLessons.map(gradeGroup => (
                    <div key={gradeGroup.gradeNum}>
                      <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#1e1b4b] dark:text-white">Chuyên đề Toán Lớp {gradeGroup.gradeNum}</h3>
                      <div className="space-y-4">
                        {gradeGroup.chapters.map(ch => {
                          const chapterId = `g${gradeGroup.gradeNum}-c${ch.title}`;
                          const isExpanded = expandedId === chapterId;
                          
                          return (
                            <div key={chapterId} className="border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 overflow-hidden shadow-sm">
                              <button
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                onClick={() => setExpandedId(isExpanded ? null : chapterId)}
                              >
                                <div className="flex items-center gap-3">
                                  {isExpanded ? <ChevronDown className="w-5 h-5 text-fuchsia-600" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                  <span className="font-semibold text-[#1e1b4b] dark:text-slate-200 text-left uppercase tracking-wide text-sm">{ch.title}</span>
                                </div>
                                <Badge variant="secondary" className="bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400">
                                  {ch.items.length} bài học
                                </Badge>
                              </button>
                              
                              {isExpanded && (
                                <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                                  <div className="space-y-2 mt-4">
                                    <Card className="shadow-none border-dashed bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 mb-4">
                                      <CardContent className="p-6">
                                        <div className="flex items-start gap-3">
                                          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mt-0.5 shrink-0">
                                            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                          </div>
                                          <div>
                                            <h3 className="font-semibold text-blue-900 dark:text-blue-300">Quản lý câu hỏi (Supabase)</h3>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                              Để thêm câu hỏi cho chuyên đề, hãy truy cập Supabase và thêm vào bảng <code>practice_questions</code>. Hãy nhớ điền <code>lesson_id</code> tương ứng với ID chuyên đề.
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 font-medium">
                                              Lưu ý tính năng Level: Cột <code>difficulty_level</code> (1: Nhận biết, 2: Thông hiểu, 3: Vận dụng, 4: Vận dụng cao) sẽ tự động phân loại câu hỏi vào từng Level tương ứng trên giao diện tự luyện.
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    {ch.items.map(lesson => (
                                      <div key={lesson.id} className="flex items-center gap-2 group">
                                        <div className="flex-1 flex items-center justify-between p-3 rounded-xl border border-transparent bg-white dark:bg-white/5 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-all">
                                          <div className="flex items-center gap-4">
                                            <div className="bg-blue-100 dark:bg-blue-900/50 p-2.5 rounded-lg text-blue-600 dark:text-blue-400">
                                              <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div>
                                              <div className="font-semibold text-[#1e1b4b] dark:text-slate-200">{lesson.title}</div>
                                              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">ID: {lesson.id}</div>
                                            </div>
                                          </div>
                                        </div>
                                        <Button 
                                          variant="outline" 
                                          size="icon" 
                                          onClick={() => handleDelete(lesson.id)}
                                          className="rounded-xl shrink-0 border-slate-200 dark:border-white/10 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:border-red-800 text-slate-400 transition-all h-12 w-12"
                                          title="Xóa chuyên đề"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}