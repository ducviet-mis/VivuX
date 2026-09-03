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
      <Card className="rounded-[24px] border-none shadow-[0_8px_30px_-10px_rgba(200,180,220,0.3)] dark:shadow-none bg-white dark:bg-[#2a2438]">
        <CardHeader>
          <CardTitle className="text-[#1e1b4b] dark:text-white">Thông tin lớp học</CardTitle>
          <CardDescription>Thay đổi tên và mật khẩu để học sinh tham gia.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className" className="text-[#1e1b4b] dark:text-slate-200">Tên lớp học</Label>
            <Input 
              id="className" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Toán 9 - Luyện Thi"
              className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="classPwd" className="text-[#1e1b4b] dark:text-slate-200">Mật khẩu lớp (Tùy chọn)</Label>
            <Input 
              id="classPwd" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Để trống nếu không yêu cầu mật khẩu"
              className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <p className="text-xs text-slate-500">Học sinh sẽ cần nhập mật khẩu này khi tham gia lớp học qua mã.</p>
          </div>
          
          <div className="pt-4 flex items-center justify-between">
            <Button 
              onClick={handleUpdate} 
              disabled={saving}
              className="rounded-xl bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 text-white shadow-md shadow-[#1e1b4b]/20 px-8"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>

            <Button 
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4"
            >
              {deleting ? 'Đang xóa...' : 'Xóa lớp học'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}