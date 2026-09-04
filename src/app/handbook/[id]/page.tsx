"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { HandbookPost } from '@/features/handbook/types';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, Clock, Share2, Facebook, Twitter, Link as LinkIcon, Loader2, Edit, Edit3, Save, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function HandbookReadingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [post, setPost] = useState<HandbookPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<HandbookPost[]>([]);
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [bioText, setBioText] = useState<string>('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [bioSavedSuccess, setBioSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === "vietdang293.vn@gmail.com" || user?.email === "vietdang293@gmail.com";

  useEffect(() => {
    async function fetchPost() {
      if (!params.id) return;
      const supabase = getSupabaseClient();
      
      const { data: postData } = await supabase
        .from('handbook_posts')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (postData) {
        setPost(postData as HandbookPost);

        // Check local storage fallback for bio
        const cachedBio = typeof window !== 'undefined' ? localStorage.getItem(`handbook_author_bio_${params.id}`) : null;
        const initialBio = (postData as any).author_bio || cachedBio || `Người đam mê Toán học và truyền cảm hứng. Các bài viết của ${postData.author_name} tập trung vào việc áp dụng Toán học vào đời sống và các phương pháp tư duy logic hiện đại.`;
        setBioText(initialBio);

        // Fetch author avatar from profiles by name
        if (postData.author_name) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('name', postData.author_name)
            .maybeSingle();

          if (profile?.avatar_url) {
            setAuthorAvatar(profile.avatar_url);
          }
        }
        
        // Fetch related posts in the same category
        const { data: relatedData } = await supabase
          .from('handbook_posts')
          .select('*')
          .eq('category', postData.category)
          .neq('id', postData.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (relatedData) {
          setRelatedPosts(relatedData as HandbookPost[]);
        }
      }
      setLoading(false);
    }
    fetchPost();
  }, [params.id]);

  const handleSaveBio = async () => {
    if (!post) return;
    setSavingBio(true);
    
    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem(`handbook_author_bio_${post.id}`, bioText);
    }

    // Attempt save to Supabase
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('handbook_posts')
        .update({ author_bio: bioText })
        .eq('id', post.id);
    } catch (e) {
      console.warn('Note: author_bio column might not exist yet in Supabase:', e);
    }

    setSavingBio(false);
    setIsEditingBio(false);
    setBioSavedSuccess(true);
    setTimeout(() => setBioSavedSuccess(false), 3000);
  };

  const formatPublishTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      if (diffHour < 24) return `${diffHour} giờ trước`;
      if (diffDay < 7) return `${diffDay} ngày trước`;
      return format(date, 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const currentAuthorAvatar = authorAvatar || (user?.name === post?.author_name ? user?.avatarUrl : null);

  if (loading) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500 mb-4" />
        <p className="text-slate-500 font-medium">Đang tải bài viết...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container max-w-3xl py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Bài viết không tồn tại</h1>
        <p className="text-slate-500 mb-8">Có thể bài viết đã bị xóa hoặc đường dẫn không đúng.</p>
        <Link href="/handbook">
          <Button className="rounded-full bg-[#1e1b4b] text-white hover:opacity-90">
            Quay lại Cẩm nang
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="container max-w-[800px] py-8 md:py-12 mx-auto">
      {/* Back button & Admin Edit top action */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/handbook" className="inline-flex items-center text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:opacity-80 transition-opacity">
          <ChevronLeft className="w-4 h-4 mr-1" /> Cẩm nang
        </Link>
        {isAdmin && (
          <Button
            onClick={() => router.push(`/handbook/${post.id}/edit`)}
            variant="outline"
            size="sm"
            className="rounded-full gap-2 border-fuchsia-300 dark:border-fuchsia-800 text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30"
          >
            <Edit className="w-3.5 h-3.5" />
            Sửa toàn bộ bài viết
          </Button>
        )}
      </div>

      {/* Header */}
      <header className="mb-10 text-center md:text-left">
        <span className="inline-block uppercase tracking-widest text-xs font-bold text-fuchsia-500 dark:text-fuchsia-400 mb-4 px-3 py-1 bg-fuchsia-50 dark:bg-fuchsia-950/30 rounded-full">
          {post.category}
        </span>
        
        <h1 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-[#1e1b4b] dark:text-white leading-[1.2] mb-6">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              {currentAuthorAvatar && <AvatarImage src={currentAuthorAvatar} alt={post.author_name} className="object-cover" />}
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs">
                {post.author_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[#1e1b4b] dark:text-slate-200 font-bold">{post.author_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden md:block"></span>
            <span title={new Date(post.created_at).toLocaleString('vi-VN')}>
              {formatPublishTime(post.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden md:block"></span>
            <Clock className="w-4 h-4 text-fuchsia-500" />
            <span>~{post.read_time_minutes || 3} phút đọc</span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.cover_url && (
        <figure className="mb-12">
          <div className="relative w-full aspect-[21/9] md:aspect-[2.35/1] rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md">
            <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </figure>
      )}

      {/* Sapo / Lead Paragraph */}
      <div className="mb-10 text-xl md:text-[22px] leading-relaxed font-serif italic text-[#1e1b4b]/80 dark:text-slate-300 border-l-4 border-fuchsia-500 pl-6">
        {post.sapo}
      </div>

      {/* Main Content (Rich Text) */}
      <div 
        className="prose prose-lg md:prose-xl prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-[#1e1b4b] dark:prose-headings:text-white prose-a:text-fuchsia-600 prose-img:rounded-2xl prose-img:shadow-sm leading-relaxed tracking-normal"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Share Actions */}
      <div className="mt-16 py-6 border-y border-slate-200 dark:border-white/10 flex items-center justify-between">
        <span className="font-bold text-[#1e1b4b] dark:text-white">Chia sẻ bài viết</span>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200">
            <Facebook className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-slate-200 text-sky-500 hover:bg-sky-50 hover:border-sky-200">
            <Twitter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-slate-200 text-slate-600 hover:bg-slate-50">
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Author Footer Box */}
      <div className="mt-12 bg-slate-50 dark:bg-white/5 rounded-[24px] p-6 md:p-8 border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <Avatar className="w-20 h-20 border-4 border-white dark:border-[#1a1625] shadow-sm shrink-0">
            {currentAuthorAvatar && <AvatarImage src={currentAuthorAvatar} alt={post.author_name} className="object-cover" />}
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-2xl">
              {post.author_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Tác giả</span>
              {bioSavedSuccess && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                  <Check className="w-3.5 h-3.5" /> Đã lưu giới thiệu!
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-[#1e1b4b] dark:text-white mb-2">{post.author_name}</h3>

            {/* Editable Author Bio */}
            {isEditingBio ? (
              <div className="space-y-3 mt-2">
                <Textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="text-sm leading-relaxed min-h-[90px] rounded-xl bg-white dark:bg-white/10 border-fuchsia-300 dark:border-fuchsia-700 focus-visible:ring-fuchsia-500"
                  placeholder="Nhập lời giới thiệu ngắn về tác giả..."
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingBio(false);
                      setBioText((post as any).author_bio || localStorage.getItem(`handbook_author_bio_${post.id}`) || `Người đam mê Toán học và truyền cảm hứng. Các bài viết của ${post.author_name} tập trung vào việc áp dụng Toán học vào đời sống và các phương pháp tư duy logic hiện đại.`);
                    }}
                    className="h-8 rounded-lg text-xs"
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    disabled={savingBio}
                    onClick={handleSaveBio}
                    className="h-8 rounded-lg text-xs bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-sm gap-1.5"
                  >
                    {savingBio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Lưu lời giới thiệu
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                  {bioText}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-fuchsia-600 dark:text-fuchsia-400 font-semibold hover:underline mt-2.5 opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Sửa lời giới thiệu này
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Thanh quản trị bài viết */}
        {isAdmin && (
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Bạn đang đăng nhập với tư cách tác giả / quản trị viên
            </div>
            <Button
              onClick={() => router.push(`/handbook/${post.id}/edit`)}
              className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-md h-10 px-5 gap-2 w-full sm:w-auto"
            >
              <Edit className="w-4 h-4" />
              Sửa toàn bộ bài viết
            </Button>
          </div>
        )}
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-10">
          <h3 className="text-2xl font-bold text-[#1e1b4b] dark:text-white mb-8">Bài viết cùng chuyên mục</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map(rel => (
              <Link key={rel.id} href={`/handbook/${rel.id}`} className="group flex flex-col bg-white dark:bg-[#1a1625] rounded-[20px] border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  {rel.cover_url ? (
                    <img src={rel.cover_url} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Không có ảnh</div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-bold text-[#1e1b4b] dark:text-white text-base line-clamp-2 mb-2 group-hover:text-fuchsia-600 transition-colors">
                    {rel.title}
                  </h4>
                  <div className="mt-auto text-xs font-medium text-slate-500">
                    {formatPublishTime(rel.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
