'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDailyGoal } from '../hooks/use-daily-goal';
import { useGoalStore } from '../stores/goal-store';

export function GoalSettingDialog() {
  const { goals } = useDailyGoal();
  const setGoals = useGoalStore((state) => state.setGoals);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    studyMinutes: goals.studyMinutes,
    questionsCount: goals.questionsCount,
    accuracy: goals.accuracy,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals({
      studyMinutes: Number(formData.studyMinutes),
      questionsCount: Number(formData.questionsCount),
      accuracy: Number(formData.accuracy),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cài đặt mục tiêu</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thời gian học (phút)</label>
            <Input 
              type="number" 
              min={1} 
              value={formData.studyMinutes} 
              onChange={e => setFormData(p => ({ ...p, studyMinutes: Number(e.target.value) }))} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Số câu hoàn thành</label>
            <Input 
              type="number" 
              min={1} 
              value={formData.questionsCount} 
              onChange={e => setFormData(p => ({ ...p, questionsCount: Number(e.target.value) }))} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Độ chính xác mục tiêu (%)</label>
            <Input 
              type="number" 
              min={1} 
              max={100} 
              value={formData.accuracy} 
              onChange={e => setFormData(p => ({ ...p, accuracy: Number(e.target.value) }))} 
            />
          </div>
          <Button type="submit" className="w-full mt-4">Lưu mục tiêu</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
