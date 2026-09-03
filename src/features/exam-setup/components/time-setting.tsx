'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface TimeSettingProps {
  duration: number;
  setDuration: (minutes: number) => void;
}

export function TimeSetting({ duration, setDuration }: TimeSettingProps) {
  const presets = [15, 30, 45, 60, 90, 120];

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          Nhập thời gian làm bài (phút)
        </label>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-xs">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              min={1}
              value={duration || ''}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="pl-9"
              placeholder="VD: 45"
            />
          </div>
          <span className="text-muted-foreground">phút</span>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          Hoặc chọn nhanh:
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset}
              variant={duration === preset ? 'default' : 'outline'}
              onClick={() => setDuration(preset)}
              className="w-20"
            >
              {preset} p
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center space-x-3">
        <Clock className="w-5 h-5 text-primary" />
        <span className="font-medium text-primary">
          Thời gian làm bài: {duration} phút
        </span>
      </div>
    </div>
  );
}
