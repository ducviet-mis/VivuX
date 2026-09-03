"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useClassroom } from '../hooks/use-classroom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function JoinClassDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState('');
  const [password, setPassword] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [joining, setJoining] = useState(false);
  
  const { joinClass } = useClassroom();
  const router = useRouter();

  const handleJoinById = async () => {
    setError('');
    setJoining(true);
    const ok = await joinClass(classId, password);
    setJoining(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setClassId('');
        setPassword('');
        router.push('/classroom');
        router.refresh();
      }, 1500);
    } else {
      setError('Mã lớp hoặc mật khẩu không chính xác');
    }
  };

  const handleJoinByLink = async () => {
    setError('');
    try {
      const url = new URL(inviteLink.startsWith('http') ? inviteLink : `http://localhost${inviteLink}`);
      const id = url.searchParams.get('id');
      if (!id) {
        setError('Link không hợp lệ');
        return;
      }
      setJoining(true);
      const ok = await joinClass(id);
      setJoining(false);
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setInviteLink('');
          router.push('/classroom');
          router.refresh();
        }, 1500);
      } else {
        setError('Link không hợp lệ hoặc lớp không tồn tại');
      }
    } catch {
      setError('Link không hợp lệ');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tham gia lớp học</DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">Tham gia thành công!</p>
          </div>
        ) : (
          <Tabs defaultValue="id" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="id">Nhập mã lớp</TabsTrigger>
              <TabsTrigger value="link">Link mời</TabsTrigger>
            </TabsList>
            <TabsContent value="id" className="space-y-4 pt-4">
              <Input 
                placeholder="Mã lớp" 
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              />
              <Input 
                type="password" 
                placeholder="Mật khẩu (nếu có)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
              <Button className="w-full" onClick={handleJoinById} disabled={joining || !classId}>
                {joining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {joining ? 'Đang tham gia...' : 'Tham gia'}
              </Button>
            </TabsContent>
            <TabsContent value="link" className="space-y-4 pt-4">
              <Input 
                placeholder="Dán link mời vào đây..." 
                value={inviteLink}
                onChange={(e) => setInviteLink(e.target.value)}
              />
              {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
              <Button className="w-full" onClick={handleJoinByLink} disabled={joining || !inviteLink}>
                {joining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {joining ? 'Đang tham gia...' : 'Tham gia'}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
