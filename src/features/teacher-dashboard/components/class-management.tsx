'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Copy, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useClassroom } from "@/features/classroom/hooks/use-classroom";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useState } from "react";

export const ClassManagement = () => {
  const router = useRouter();
  const { classes, loading, refreshClasses } = useClassroom();
  const { user } = useAuthStore();
  const [newClassName, setNewClassName] = useState('');
  const [newClassPassword, setNewClassPassword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy: ' + text);
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !user?.id) return;
    setCreating(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('classes').insert({
      name: newClassName.trim(),
      teacher_id: user.id,
      password: newClassPassword || null,
    });
    if (error) {
      alert('Lỗi tạo lớp: ' + error.message);
    } else {
      setNewClassName('');
      setNewClassPassword('');
      setDialogOpen(false);
      await refreshClasses();
    }
    setCreating(false);
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Xóa lớp "${className}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(classId);
    const supabase = getSupabaseClient();
    // Delete members first
    await supabase.from('class_members').delete().eq('class_id', classId);
    // Delete class
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) {
      alert('Lỗi xóa lớp: ' + error.message);
    } else {
      await refreshClasses();
    }
    setDeletingId(null);
  };

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="w-5 h-5 text-primary" />
          Quản lý lớp học
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Tạo lớp mới</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo lớp học mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên lớp</label>
                <Input 
                  placeholder="Ví dụ: Toán 8 - Nhóm B" 
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu (tùy chọn)</label>
                <Input 
                  type="password" 
                  placeholder="Mật khẩu tham gia lớp"
                  value={newClassPassword}
                  onChange={(e) => setNewClassPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleCreateClass} disabled={creating || !newClassName.trim()}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {creating ? 'Đang tạo...' : 'Xác nhận tạo lớp'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : classes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Chưa có lớp học nào. Bấm "Tạo lớp mới" để bắt đầu.</p>
        ) : (
          classes.map(cls => (
            <div key={cls.id} className="p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{cls.name}</h4>
                  <p className="text-sm text-muted-foreground">{cls.students.length} học sinh • ID: {cls.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 h-9 w-9"
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    disabled={deletingId === cls.id}
                  >
                    {deletingId === cls.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                  <Button onClick={() => router.push(`/teacher/${cls.id}`)}>
                    Mở lớp <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm bg-muted p-2 rounded-md">
                <span className="text-muted-foreground font-medium">Mã mời:</span>
                <code className="px-2 py-1 bg-background rounded font-bold text-primary">{cls.id.slice(0, 8)}</code>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(cls.id.slice(0, 8))} className="ml-auto h-8 w-8" title="Copy mã mời">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};