'use client';

import { useState } from 'react';
import { BookOpenCheck, GraduationCap, Trophy, Plus, Trash2, Edit2 } from 'lucide-react';
import { getCountdownData } from '../data/exam-dates';
import { useExamStore, ExamDate } from '../stores/exam-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCountdown } from '../hooks/use-countdown';

const icons = [BookOpenCheck, GraduationCap, Trophy];

function CountdownItem({ exam, icon: Icon, onRemove }: { exam: ExamDate, icon: any, onRemove: (id: string) => void }) {
  const targetDate = new Date(exam.date);
  const { days, hours, minutes } = useCountdown(targetDate);
  
  const isUrgent = days < 30;
  const isWarning = days >= 30 && days < 60;
  
  return (
    <div className="group flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors relative">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-background border">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="font-medium text-sm">{exam.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className={cn(
          "text-right flex flex-col items-end",
          isUrgent ? "text-red-500 dark:text-red-400" : 
          isWarning ? "text-amber-500 dark:text-amber-400" : 
          "text-primary"
        )}>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold">{days}</span>
            <span className="text-xs font-medium">ngày</span>
          </div>
          <span className="text-xs opacity-80">{hours}h {minutes}m</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onRemove(exam.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function CountdownCard() {
  const { examDates, addExam, removeExam } = useExamStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleAdd = () => {
    if (name && date) {
      addExam(name, new Date(date).toISOString());
      setName('');
      setDate('');
      setOpen(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          Kỳ thi sắp tới
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm kỳ thi mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên kỳ thi</label>
                <Input 
                  placeholder="Ví dụ: Thi cuối kì 1..." 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày thi</label>
                <Input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">Thêm</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {examDates.length > 0 ? examDates.map((exam, i) => (
          <CountdownItem 
            key={exam.id} 
            exam={exam} 
            icon={icons[i % icons.length]} 
            onRemove={removeExam}
          />
        )) : (
          <p className="text-sm text-muted-foreground text-center py-4">Chưa có lịch thi nào</p>
        )}
      </CardContent>
    </Card>
  );
}
