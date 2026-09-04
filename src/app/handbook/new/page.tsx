"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { HandbookCategory } from '@/features/handbook/types';
import { RichTextEditor } from '@/features/handbook/components/rich-text-editor';
import { uploadHandbookImage } from '@/features/handbook/utils/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Save, UploadCloud } from 'lucide-react';

const CATEGORIES: HandbookCategory[] = ['Toán & Đời sống', 'Phương pháp học toán', 'Bản đồ lý thuyết'];

export default function NewHandbookPostPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState<HandbookCategory>('Toán & Đời sống');
  const [title, setTitle] = useState('');
  const [sapo, setSapo] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [readTime, setReadTime] = useState('3');
  const [isFeatured, setIsFeatured] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const url = await uploadHandbookImage(file);
    if (url) {
      setCoverUrl(url);
    }
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const isAdmin = user?.email === "vietdang293.vn@gmail.com" || user?.email === "vietdang293@gmail.com";

  if (!isAdmin && user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
        <Button onClick={() => router.push('/handbook')}>Quay lại Cẩm nang</Button>
      </div>
    );
  }

  const handlePublish = async () => {
    if (!title.trim() || !sapo.trim() || !content.trim()) {
      alert("Vui lòng nhập đầy đủ Tiêu đề, Tóm tắt và Nội dung bài viết.");
      return;
    }

    setLoading(true);
    const supabase = getSupabaseClient();
    
    // Nếu set isFeatured = true, thì un-feature các bài cũ
    if (isFeatured) {
      await supabase.from('handbook_posts').update({ is_featured: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { error } = await supabase.from('handbook_posts').insert({
      category,
      title,
      sapo,
      content,
      cover_url: coverUrl || null,
      author_name: user?.name || 'Admin',
      read_time_minutes: parseInt(readTime) || 3,
      is_featured: isFeatured
    });

    setLoading(false);

    if (error) {
      alert('Lỗi khi đăng bài: ' + error.message);
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
            Viết bài mới
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-full px-6">
            Hủy
          </Button>
          <Button onClick={handlePublish} disabled={loading} className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg rounded-full px-8">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Đăng bài
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
              <Label className="font-semibold">Ảnh bìa (Cover)</Label>
              <input 
                type="file"
                ref={coverInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleCoverUpload}
              />
              <div 
                className="mt-3 aspect-[16/9] w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors overflow-hidden relative group"
                onClick={() => coverInputRef.current?.click()}
              >
                {uploadingCover ? (
                  <div className="flex flex-col items-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-fuchsia-500" />
                    <span className="text-sm font-medium">Đang tải ảnh...</span>
                  </div>
                ) : coverUrl ? (
                  <>
                    <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <UploadCloud className="w-8 h-8 text-white mb-2" />
                      <span className="text-white font-medium text-sm">Đổi ảnh bìa</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm font-medium">Tải ảnh lên</span>
                  </div>
                )}
              </div>
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
