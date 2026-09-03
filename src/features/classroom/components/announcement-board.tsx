"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Send, Loader2, Trash2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

interface AnnouncementBoardProps {
  classId: string;
  isTeacher?: boolean;
}

export function AnnouncementBoard({ classId, isTeacher = false }: AnnouncementBoardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    if (!classId) return;
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('announcements')
      .select('id, content, is_pinned, created_at')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });
    setAnnouncements((data || []) as Announcement[]);
    setLoading(false);
  }, [classId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handlePost = async () => {
    if (!newContent.trim()) return;
    setPosting(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('announcements').insert({
      class_id: classId,
      content: newContent.trim(),
      is_pinned: false,
    });
    if (error) {
      console.error('Post announcement error:', error);
      alert('Lỗi khi đăng thông báo: ' + error.message);
    } else {
      setNewContent('');
      await fetchAnnouncements();
    }
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      console.error('Delete announcement error:', error);
      alert('Lỗi khi xóa thông báo: ' + error.message);
    } else {
      await fetchAnnouncements();
    }
  };

  const pinned = announcements.find(a => a.is_pinned);
  const others = announcements.filter(a => !a.is_pinned);

  return (
    <Card className="rounded-2xl border border-border bg-primary/10 dark:bg-primary/5 shadow-sm overflow-hidden mb-6 hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/20 dark:bg-primary/20 p-3 rounded-full shrink-0">
            <Megaphone className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
              </div>
            ) : pinned ? (
              <div className="relative group">
                <h3 className="text-lg font-bold text-foreground mb-1">Thông báo</h3>
                <p className="text-foreground/90 whitespace-pre-wrap pr-8">{pinned.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(pinned.created_at).toLocaleDateString('vi-VN')}
                  </span>
                  {isTeacher && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pinned.id)} className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <h3 className="text-lg font-bold text-foreground">Thông báo</h3>
            )}

            {others.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                {others.map(a => (
                  <div key={a.id} className="relative group">
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap pr-8">{a.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      {isTeacher && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isTeacher && (
              <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-2">
                <Textarea
                  placeholder="Nhập thông báo mới..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="bg-background"
                />
                <Button onClick={handlePost} className="self-end" size="sm" disabled={posting || !newContent.trim()}>
                  {posting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Đăng thông báo
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
