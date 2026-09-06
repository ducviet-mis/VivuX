'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Plus, Trash2, Clock, Hash, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MockExamsAdminPage() {
  const { user, isLoading, initialized } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Form states
  const [code, setCode] = useState('');
  const [grade, setGrade] = useState('8');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('45');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchExams() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('mock_exams').select('*').order('created_at', { ascending: false });

      if (error) {
        if (error.code !== '42P01') {
          console.error('Error fetching mock exams:', error);
        }
      } else if (data) {
        setExams(data);
      }
      setFetching(false);
    }

    if (user && (user.email === 'vietdang293.vn@gmail.com' || user.email === 'vietdang293@gmail.com')) {
      fetchExams();
    }
  }, [user]);

  const handleAddExam = async () => {
    if (!code || !grade || !title || !duration) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSaving(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('mock_exams').insert([
      {
        code: code.trim(),
        grade: parseInt(grade),
        title: title.trim(),
        duration: parseInt(duration)
      }
    ]);

    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      alert('Thêm đề thi thử thành công!');
      // Refresh list
      const { data } = await supabase.from('mock_exams').select('*').order('created_at', { ascending: false });
      if (data) setExams(data);

      // Reset form
      setCode('');
      setTitle('');
    }
    setSaving(false);
  };

  const handleDelete = async (examId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này VÀ TẤT CẢ câu hỏi, lịch sử thi liên quan?')) return;

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('mock_exams').delete().eq('id', examId);

    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      setExams(prev => prev.filter(e => e.id !== examId));
    }
  };

  if (!initialized || isLoading || fetching) return <div className="py-20 text-center animate-pulse">Đang tải dữ liệu...</div>;
  if (!user || (user.email !== 'vietdang293.vn@gmail.com' && user.email !== 'vietdang293@gmail.com')) return null;

  return (
    <div className="space-y-8">
      <Card className="border-primary shadow-float dark:shadow-none">
        <CardHeader className="bg-primary border-b border-primary">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Plus className="w-5 h-5" />
            Tạo đề thi thử mới
          </CardTitle>
          <CardDescription>
            Điền các thông tin cơ bản để tạo đề thi. Sau khi tạo, hãy dùng mã đề (Code) để up câu hỏi qua Supabase SQL.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground font-bold flex items-center gap-2">
                Mã đề (VD: THI-L9-01)
              </Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã đề..."
                className="bg-surface border-control"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground font-bold">Lớp</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="bg-surface border-control">
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Lớp 6</SelectItem>
                  <SelectItem value="7">Lớp 7</SelectItem>
                  <SelectItem value="8">Lớp 8</SelectItem>
                  <SelectItem value="9">Lớp 9</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label className="text-muted-foreground font-bold">Tên đề thi</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Đề thi thử giữa kì I Môn Toán..."
                className="bg-surface border-control"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground font-bold flex items-center gap-2">
                Thời gian (Phút)
              </Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45"
                className="bg-surface border-control"
              />
            </div>
          </div>

          <Button
            onClick={handleAddExam}
            disabled={saving || !code || !title || !duration}
            className="mt-6 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md shadow-card w-full md:w-auto px-8"
          >
            {saving ? 'Đang tạo...' : 'Tạo Đề Thi'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Danh sách đề thi thử
        </h3>

        {exams.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border text-muted-foreground">
            Chưa có đề thi thử nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {exams.map(exam => (
              <Card key={exam.id} className="overflow-hidden border-border shadow-soft hover:shadow-card transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary-soft text-primary border-primary">
                          Lớp {exam.grade}
                        </Badge>
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                          <Hash className="w-3 h-3 mr-1" />
                          {exam.code}
                        </Badge>
                        <Badge variant="outline" className="bg-primary-soft text-primary border-primary">
                          <Clock className="w-3 h-3 mr-1" />
                          {exam.duration} phút
                        </Badge>
                      </div>
                      <h4 className="font-bold text-lg text-foreground">{exam.title}</h4>
                      <div className="text-xs text-muted-foreground">
                        ID: {exam.id}
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(exam.id)}
                      className="shrink-0 rounded-md h-11 w-11 bg-destructive-soft hover:bg-destructive-soft text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
