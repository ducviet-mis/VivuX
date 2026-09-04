"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { HandbookPost } from '@/features/handbook/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, Clock, Share2, Facebook, Twitter, Link as LinkIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function HandbookReadingPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<HandbookPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<HandbookPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

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
      {/* Back button */}
      <Link href="/handbook" className="inline-flex items-center text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:opacity-80 mb-8 transition-opacity">
        <ChevronLeft className="w-4 h-4 mr-1" /> Cẩm nang
      </Link>

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
            <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs">
                {post.author_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[#1e1b4b] dark:text-slate-200 font-bold">{post.author_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden md:block"></span>
            <span>{formatDate(post.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden md:block"></span>
            <Clock className="w-4 h-4" />
            <span>{post.read_time_minutes} phút đọc</span>
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
      <div className="mt-12 bg-slate-50 dark:bg-white/5 rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left border border-slate-100 dark:border-white/5">
        <Avatar className="w-20 h-20 border-4 border-white dark:border-[#1a1625] shadow-sm shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-2xl">
            {post.author_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 block">Tác giả</span>
          <h3 className="text-xl font-bold text-[#1e1b4b] dark:text-white mb-2">{post.author_name}</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Người đam mê Toán học và truyền cảm hứng. Các bài viết của {post.author_name} tập trung vào việc áp dụng Toán học vào đời sống và các phương pháp tư duy logic hiện đại.
          </p>
        </div>
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
                    {formatDate(rel.created_at)}
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
