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
    <div className="group flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="p-2 rounded-md bg-primary-soft">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="min-w-0 break-words font-medium text-sm">{exam.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className={cn(
          "text-right flex flex-col items-end",
          isUrgent ? "text-destructive" : 
          isWarning ? "text-warning" : 
          "text-primary"
        )}>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">{days}</span>
            <span className="text-xs font-medium">ngày</span>
          </div>
          <span className="text-xs opacity-80">{hours}h {minutes}m</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label={`Xóa kỳ thi ${exam.name}`} className="h-11 w-9 text-muted-foreground hover:bg-destructive-soft hover:text-destructive"
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
    <Card level="supporting">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Kỳ thi sắp tới
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Thêm kỳ thi mới">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm kỳ thi mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="countdown-name" className="text-sm font-medium">Tên kỳ thi</label>
                <Input 
                  id="countdown-name" placeholder="Ví dụ: Thi cuối kì 1..." 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="countdown-date" className="text-sm font-medium">Ngày thi</label>
                <Input 
                  id="countdown-date" type="date"
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
