"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { HandbookPost, HandbookCategory } from '@/features/handbook/types';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PenSquare, Clock, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

const CATEGORIES: HandbookCategory[] = ['Toán & Đời sống', 'Phương pháp học toán', 'Bản đồ lý thuyết'];

export default function HandbookHubPage() {
  const [posts, setPosts] = useState<HandbookPost[]>([]);
  const [authorAvatars, setAuthorAvatars] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<HandbookCategory | 'Tất cả'>('Tất cả');
  const { user } = useAuthStore();
  const router = useRouter();

  const isAdmin = user?.email === "vietdang293.vn@gmail.com" || user?.email === "vietdang293@gmail.com";

  const fetchPosts = async () => {
    setLoading(true);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('handbook_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      // Fetch avatar profiles for all distinct author names
      const authorNames = Array.from(new Set(data.map((p: any) => p.author_name).filter(Boolean)));
      if (authorNames.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .in('name', authorNames);

        const avatarMap: Record<string, string> = {};
        profiles?.forEach((prof: any) => {
          if (prof.name && prof.avatar_url) {
            avatarMap[prof.name] = prof.avatar_url;
          }
        });
        // If current user avatar exists, map that too
        if (user?.name && user?.avatarUrl) {
          avatarMap[user.name] = user.avatarUrl;
        }
        setAuthorAvatars(avatarMap);
      }
      setPosts(data as HandbookPost[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('handbook_posts').delete().eq('id', id);
    if (!error) {
      setPosts(posts.filter(p => p.id !== id));
    } else {
      alert('Lỗi: ' + error.message);
    }
  };

  const filteredPosts = activeCategory === 'Tất cả' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  const featuredPost = filteredPosts.find(p => p.is_featured) || filteredPosts[0];
  const gridPosts = featuredPost ? filteredPosts.filter(p => p.id !== featuredPost.id) : filteredPosts;

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

  return (
    <div className="container max-w-7xl py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e1b4b] dark:text-white tracking-tight mb-2">
            Cẩm nang
          </h1>
          <p className="text-muted-foreground text-lg">Khám phá thế giới Toán học qua những góc nhìn mới mẻ</p>
        </div>
        
        {isAdmin && (
          <Button onClick={() => router.push('/handbook/new')} className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/25 rounded-full h-12 px-6 font-bold text-base hover:opacity-90">
            <PenSquare className="w-5 h-5 mr-2" />
            Viết bài mới
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-row overflow-x-auto snap-x [&::-webkit-scrollbar]:hidden gap-3 mb-10 pb-2">
        <button
          onClick={() => setActiveCategory('Tất cả')}
          className={cn(
            "px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap snap-start border",
            activeCategory === 'Tất cả'
              ? "bg-[#1e1b4b] dark:bg-white text-white dark:text-[#1e1b4b] border-transparent shadow-md"
              : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
          )}
        >
          Tất cả
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap snap-start border",
              activeCategory === cat
                ? "bg-[#1e1b4b] dark:bg-white text-white dark:text-[#1e1b4b] border-transparent shadow-md"
                : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Đang tải bài viết...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/20">
          Chưa có bài viết nào trong chuyên mục này.
        </div>
      ) : (
        <div className="space-y-12">
          {/* Featured Hero Post */}
          {featuredPost && (
            <Link href={`/handbook/${featuredPost.id}`} className="group block relative">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 bg-white dark:bg-[#1a1625] rounded-[32px] p-4 lg:p-6 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-fuchsia-200 dark:hover:border-fuchsia-900/50 transition-all duration-300">
                
                {/* 60% Image Left */}
                <div className="w-full lg:w-[60%] shrink-0">
                  <div className="relative w-full aspect-[16/9] lg:aspect-[4/3] rounded-2xl lg:rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {featuredPost.cover_url ? (
                      <img src={featuredPost.cover_url} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">Không có ảnh</div>
                    )}
                  </div>
                </div>

                {/* 40% Text Right */}
                <div className="w-full lg:w-[40%] flex flex-col justify-center py-4 lg:pr-6">
                  <Badge className="w-fit bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 mb-4 rounded-lg px-3 py-1 border-0">
                    {featuredPost.category}
                  </Badge>
                  
                  <h2 className="text-2xl lg:text-4xl font-bold text-[#1e1b4b] dark:text-white leading-tight mb-4 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors line-clamp-3">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8 line-clamp-3">
                    {featuredPost.sapo}
                  </p>

                  <div className="mt-auto flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                    <Avatar className="w-10 h-10 border-2 border-white dark:border-[#1a1625] shadow-sm">
                      {authorAvatars[featuredPost.author_name] && (
                        <AvatarImage src={authorAvatars[featuredPost.author_name]} alt={featuredPost.author_name} className="object-cover" />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                        {featuredPost.author_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1e1b4b] dark:text-white">{featuredPost.author_name}</span>
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <span title={new Date(featuredPost.created_at).toLocaleString('vi-VN')}>{formatPublishTime(featuredPost.created_at)}</span>
                        <span className="mx-1.5">•</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-fuchsia-500" /> ~{featuredPost.read_time_minutes || 3} phút đọc</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-md bg-white/90 hover:bg-white text-slate-700" onClick={(e) => { e.preventDefault(); router.push(`/handbook/${featuredPost.id}/edit`); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full shadow-md" onClick={(e) => handleDelete(featuredPost.id, e)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Link>
          )}

          {/* Standard Card Grid (3 cols) */}
          {gridPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {gridPosts.map(post => (
                <Link key={post.id} href={`/handbook/${post.id}`} className="group relative flex flex-col bg-white dark:bg-[#1a1625] rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  
                  <div className="relative w-full aspect-[16/9] bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    {post.cover_url ? (
                      <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">Không có ảnh</div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-white/90 text-[#1e1b4b] hover:bg-white dark:bg-[#1a1625]/90 dark:text-white border-0 shadow-sm backdrop-blur-sm">
                      {post.category}
                    </Badge>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-[#1e1b4b] dark:text-white mb-3 line-clamp-2 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                      {post.sapo}
                    </p>

                    <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                      <Avatar className="w-8 h-8 shadow-sm">
                        {authorAvatars[post.author_name] && (
                          <AvatarImage src={authorAvatars[post.author_name]} alt={post.author_name} className="object-cover" />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs">
                          {post.author_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1e1b4b] dark:text-white line-clamp-1">{post.author_name}</span>
                        <div className="flex items-center text-xs text-slate-500">
                          <span title={new Date(post.created_at).toLocaleString('vi-VN')}>{formatPublishTime(post.created_at)}</span>
                          <span className="mx-1">•</span>
                          <span>~{post.read_time_minutes || 3}p đọc</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md bg-white/90 hover:bg-white text-slate-700" onClick={(e) => { e.preventDefault(); router.push(`/handbook/${post.id}/edit`); }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-md" onClick={(e) => handleDelete(post.id, e)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
