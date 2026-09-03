'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shuffle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MixModeDialogProps {
  lessonId: string;
  lessonTitle: string;
  totalQuestions: number;
}

export function MixModeDialog({ lessonId, lessonTitle, totalQuestions }: MixModeDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(20);
  const [ratio, setRatio] = useState({ l1: 40, l2: 30, l3: 20, l4: 10 });

  const totalRatio = ratio.l1 + ratio.l2 + ratio.l3 + ratio.l4;

  const handleStart = () => {
    if (totalRatio !== 100) {
      alert('Tổng tỉ lệ phải bằng 100%');
      return;
    }
    if (count <= 0) {
      alert('Số lượng câu hỏi phải lớn hơn 0');
      return;
    }
    
    setOpen(false);
    // Chuyển hướng với các tham số tỉ lệ
    router.push(`/practice/${lessonId}?mode=mix&count=${count}&l1=${ratio.l1}&l2=${ratio.l2}&l3=${ratio.l3}&l4=${ratio.l4}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full border-dashed border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 transition-all font-medium py-6"
        >
          <Shuffle className="w-5 h-5 mr-2" />
          Trộn câu theo tỉ lệ
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Trộn câu bài tập</DialogTitle>
          <DialogDescription>
            {lessonTitle} • Hiện có {totalQuestions} câu trong kho
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="count" className="font-semibold text-slate-700 dark:text-slate-300">
              Tổng số câu muốn làm
            </Label>
            <Input
              id="count"
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 0)}
              className="text-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Thiết lập tỉ lệ %</Label>
              <span className={`text-sm font-bold ${totalRatio === 100 ? 'text-emerald-500' : 'text-red-500'}`}>
                Tổng: {totalRatio}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label className="text-xs text-slate-500">Level 1 (Nhận biết)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={ratio.l1} 
                    onChange={(e) => setRatio(p => ({ ...p, l1: parseInt(e.target.value) || 0 }))} 
                    className="pr-6"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>
              
              <div className="grid gap-1.5">
                <Label className="text-xs text-slate-500">Level 2 (Thông hiểu)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={ratio.l2} 
                    onChange={(e) => setRatio(p => ({ ...p, l2: parseInt(e.target.value) || 0 }))} 
                    className="pr-6"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>
              
              <div className="grid gap-1.5">
                <Label className="text-xs text-slate-500">Level 3 (Vận dụng)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={ratio.l3} 
                    onChange={(e) => setRatio(p => ({ ...p, l3: parseInt(e.target.value) || 0 }))} 
                    className="pr-6"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>
              
              <div className="grid gap-1.5">
                <Label className="text-xs text-slate-500">Level 4 (Vận dụng cao)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={ratio.l4} 
                    onChange={(e) => setRatio(p => ({ ...p, l4: parseInt(e.target.value) || 0 }))} 
                    className="pr-6"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleStart} 
          disabled={totalRatio !== 100 || count <= 0}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
        >
          Bắt đầu làm bài
        </Button>
      </DialogContent>
    </Dialog>
  );
}
