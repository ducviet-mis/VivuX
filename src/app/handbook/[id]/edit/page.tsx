"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { HandbookCategory } from '@/features/handbook/types';
import { RichTextEditor } from '@/features/handbook/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const CATEGORIES: HandbookCategory[] = ['Toán & Đời sống', 'Phương pháp học toán', 'Bản đồ lý thuyết'];

export default function EditHandbookPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [category, setCategory] = useState<HandbookCategory>('Toán & Đời sống');
  const [title, setTitle] = useState('');
  const [sapo, setSapo] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [readTime, setReadTime] = useState('3');
  const [isFeatured, setIsFeatured] = useState(false);

  const isAdmin = user?.email === "vietdang293.vn@gmail.com" || user?.email === "vietdang293@gmail.com";

  useEffect(() => {
    async function fetchPost() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.from('handbook_posts').select('*').eq('id', params.id).single();
      
      if (data) {
        setCategory(data.category as HandbookCategory);
        setTitle(data.title);
        setSapo(data.sapo);
        setContent(data.content);
        setCoverUrl(data.cover_url || '');
        setReadTime(data.read_time_minutes?.toString() || '3');
        setIsFeatured(data.is_featured);
      }
      setLoading(false);
    }
    
    if (isAdmin) {
      fetchPost();
    }
  }, [params.id, isAdmin]);

  if (!isAdmin && user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
        <Button onClick={() => router.push('/handbook')}>Quay lại Cẩm nang</Button>
      </div>
    );
  }

  if (loading) {
    return <div className="container py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-fuchsia-500" /></div>;
  }

  const handlePublish = async () => {
    if (!title.trim() || !sapo.trim() || !content.trim()) {
      alert("Vui lòng nhập đầy đủ Tiêu đề, Tóm tắt và Nội dung bài viết.");
      return;
    }

    setSaving(true);
    const supabase = getSupabaseClient();
    
    if (isFeatured) {
      await supabase.from('handbook_posts').update({ is_featured: false }).neq('id', params.id);
    }

    const { error } = await supabase.from('handbook_posts').update({
      category,
      title,
      sapo,
      content,
      cover_url: coverUrl || null,
      read_time_minutes: parseInt(readTime) || 3,
      is_featured: isFeatured
    }).eq('id', params.id);

    setSaving(false);

    if (error) {
      alert('Lỗi khi cập nhật bài: ' + error.message);
    } else {
      router.push('/handbook');
      router.refresh();
    }
  };

  return (
    <div className="container max-w-5xl py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1e1b4b] dark:text-white">
            Chỉnh sửa bài viết
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-full px-6">
            Hủy
          </Button>
          <Button onClick={handlePublish} disabled={saving} className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg rounded-full px-8">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Cập nhật
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Tiêu đề bài báo</Label>
            <Input 
              placeholder="Nhập tiêu đề thật cuốn hút..." 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="text-xl md:text-2xl font-bold h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Đoạn Sa-pô (Tóm tắt ngắn)</Label>
            <Textarea 
              placeholder="1-2 câu tóm tắt nội dung bài viết..." 
              value={sapo} 
              onChange={e => setSapo(e.target.value)}
              className="text-base leading-relaxed h-24 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Nội dung chi tiết</Label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1a1625] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <Label className="font-semibold">Chuyên mục</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as HandbookCategory)}>
                <SelectTrigger className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl">
                  <SelectValue placeholder="Chọn chuyên mục" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Ảnh bìa (Cover URL)</Label>
              <Input 
                placeholder="https://..." 
                value={coverUrl} 
                onChange={e => setCoverUrl(e.target.value)}
                className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
              />
              {coverUrl && (
                <div className="mt-3 aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Thời gian đọc (phút)</Label>
              <Input 
                type="number"
                min="1"
                value={readTime} 
                onChange={e => setReadTime(e.target.value)}
                className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/30 cursor-pointer" onClick={() => setIsFeatured(!isFeatured)}>
              <input type="checkbox" checked={isFeatured} onChange={() => {}} className="w-5 h-5 rounded border-fuchsia-300 text-fuchsia-600 focus:ring-fuchsia-500" />
              <div className="flex flex-col">
                <span className="font-bold text-fuchsia-800 dark:text-fuchsia-300 text-sm">Đặt làm Tiêu điểm</span>
                <span className="text-xs text-fuchsia-600/70 dark:text-fuchsia-400/70">Hiển thị bài viết to nhất ở đầu trang</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
