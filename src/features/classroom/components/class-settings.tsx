'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSupabaseClient } from '@/lib/supabase/client';

interface ClassSettingsProps {
  classId: string;
}

export function ClassSettings({ classId }: ClassSettingsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function loadSettings() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('classes')
        .select('name, password')
        .eq('id', classId)
        .maybeSingle();

      if (data && !error) {
        setName(data.name || '');
        setPassword(data.password || '');
      }
      setLoading(false);
    }
    loadSettings();
  }, [classId]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      alert('Tên lớp không được để trống');
      return;
    }

    setSaving(true);
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('classes')
      .update({ name: name.trim(), password: password })
      .eq('id', classId);

    if (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi cập nhật.');
    } else {
      alert('Cập nhật thông tin lớp thành công!');
      router.refresh();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu học sinh, tài liệu, đề thi của lớp.')) {
      return;
    }
    if (!confirm('Vui lòng xác nhận lại lần nữa để XÓA LỚP HỌC.')) {
      return;
    }

    setDeleting(true);
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (error) {
      console.error(error);
      alert('Không thể xóa lớp học.');
      setDeleting(false);
    } else {
      alert('Đã xóa lớp học thành công.');
      router.push('/teacher');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải cài đặt...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="rounded-xl border-none shadow-card dark:shadow-none bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Thông tin lớp học</CardTitle>
          <CardDescription>Thay đổi tên và mật khẩu để học sinh tham gia.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className" className="text-foreground">Tên lớp học</Label>
            <Input
              id="className"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Toán 9 - Luyện Thi"
              className="rounded-md border-control bg-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classPwd" className="text-foreground">Mật khẩu lớp (Tùy chọn)</Label>
            <Input
              id="classPwd"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Để trống nếu không yêu cầu mật khẩu"
              className="rounded-md border-control bg-surface"
            />
            <p className="text-xs text-muted-foreground">Học sinh sẽ cần nhập mật khẩu này khi tham gia lớp học qua mã.</p>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button
              onClick={handleUpdate}
              disabled={saving}
              className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-card px-8"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>

            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive hover:text-destructive hover:bg-destructive-soft px-4"
            >
              {deleting ? 'Đang xóa...' : 'Xóa lớp học'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}