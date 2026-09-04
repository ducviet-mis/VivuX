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
    <div className="max-w-6xl mx-auto py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e1b4b] dark:text-white tracking-tight">
            Cẩm nang
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Khám phá thế giới Toán học qua những góc nhìn mới mẻ
          </p>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => router.push('/handbook/new')} 
            className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md shadow-fuchsia-500/20 rounded-full h-10 px-5 font-semibold text-sm hover:opacity-90 self-start sm:self-auto"
          >
            <PenSquare className="w-4 h-4 mr-2" />
            Viết bài mới
          </Button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-row overflow-x-auto snap-x [&::-webkit-scrollbar]:hidden gap-2 sm:gap-2.5 mb-6 sm:mb-8 pb-1">
        <button
          onClick={() => setActiveCategory('Tất cả')}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap snap-start border",
            activeCategory === 'Tất cả'
              ? "bg-[#1e1b4b] dark:bg-white text-white dark:text-[#1e1b4b] border-transparent shadow-sm"
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
              "px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap snap-start border",
              activeCategory === cat
                ? "bg-[#1e1b4b] dark:bg-white text-white dark:text-[#1e1b4b] border-transparent shadow-sm"
                : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Đang tải bài viết...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm bg-white/50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/20">
          Chưa có bài viết nào trong chuyên mục này.
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-10">
          {/* Featured Hero Post - Compact & Balanced Proportions */}
          {featuredPost && (
            <Link href={`/handbook/${featuredPost.id}`} className="group block relative">
              <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 bg-white dark:bg-[#1a1625] rounded-2xl lg:rounded-[24px] p-3 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:border-fuchsia-200 dark:hover:border-fuchsia-900/40 transition-all duration-300">
                
                {/* Image (Bounded Height, max 280px on desktop) */}
                <div className="w-full lg:w-[48%] shrink-0">
                  <div className="relative w-full h-52 sm:h-64 lg:h-[280px] rounded-xl lg:rounded-[18px] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {featuredPost.cover_url ? (
                      <img 
                        src={featuredPost.cover_url} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Không có ảnh</div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-[52%] flex flex-col justify-between py-1 sm:py-2 lg:pr-2">
                  <div>
                    <Badge className="w-fit bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 mb-2.5 rounded-md px-2.5 py-0.5 text-xs font-semibold border-0">
                      {featuredPost.category}
                    </Badge>
                    
                    <h2 className="text-lg sm:text-xl lg:text-[22px] font-bold text-[#1e1b4b] dark:text-white leading-snug mb-2.5 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors line-clamp-2">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4">
                      {featuredPost.sapo}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                    <Avatar className="w-8 h-8 border border-white dark:border-[#1a1625] shadow-xs">
                      {authorAvatars[featuredPost.author_name] && (
                        <AvatarImage src={authorAvatars[featuredPost.author_name]} alt={featuredPost.author_name} className="object-cover" />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs">
                        {featuredPost.author_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-bold text-[#1e1b4b] dark:text-white">{featuredPost.author_name}</span>
                      <div className="flex items-center text-[11px] text-slate-500 font-medium">
                        <span title={new Date(featuredPost.created_at).toLocaleString('vi-VN')}>{formatPublishTime(featuredPost.created_at)}</span>
                        <span className="mx-1.5">•</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-fuchsia-500" /> ~{featuredPost.read_time_minutes || 3} phút đọc</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Quick Actions */}
              {isAdmin && (
                <div className="absolute top-5 right-5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm bg-white/95 hover:bg-white text-slate-700" onClick={(e) => { e.preventDefault(); router.push(`/handbook/${featuredPost.id}/edit`); }}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-sm" onClick={(e) => handleDelete(featuredPost.id, e)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </Link>
          )}

          {/* Standard Card Grid (3 columns) */}
          {gridPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {gridPosts.map(post => (
                <Link key={post.id} href={`/handbook/${post.id}`} className="group relative flex flex-col bg-white dark:bg-[#1a1625] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                  
                  <div className="relative w-full h-44 sm:h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    {post.cover_url ? (
                      <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Không có ảnh</div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-white/95 text-[#1e1b4b] hover:bg-white dark:bg-[#1a1625]/95 dark:text-white border-0 shadow-xs backdrop-blur-sm text-[11px] px-2 py-0.5">
                      {post.category}
                    </Badge>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-[#1e1b4b] dark:text-white mb-2 line-clamp-2 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">
                      {post.sapo}
                    </p>

                    <div className="mt-auto flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
                      <Avatar className="w-7 h-7 shadow-xs">
                        {authorAvatars[post.author_name] && (
                          <AvatarImage src={authorAvatars[post.author_name]} alt={post.author_name} className="object-cover" />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-[10px]">
                          {post.author_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#1e1b4b] dark:text-white line-clamp-1">{post.author_name}</span>
                        <div className="flex items-center text-[11px] text-slate-500">
                          <span title={new Date(post.created_at).toLocaleString('vi-VN')}>{formatPublishTime(post.created_at)}</span>
                          <span className="mx-1">•</span>
                          <span>~{post.read_time_minutes || 3}p đọc</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Quick Actions */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full shadow-xs bg-white/95 hover:bg-white text-slate-700" onClick={(e) => { e.preventDefault(); router.push(`/handbook/${post.id}/edit`); }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-7 w-7 rounded-full shadow-xs" onClick={(e) => handleDelete(post.id, e)}>
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
