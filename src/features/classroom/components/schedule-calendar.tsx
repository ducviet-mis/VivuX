"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetCard } from '@/components/shared/widget-card';
import { getSupabaseClient } from '@/lib/supabase/client';

interface ScheduleCalendarProps {
  classId: string;
  isTeacher?: boolean;
}

export function ScheduleCalendar({ classId, isTeacher }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday is 1, Sunday is 0. We want Monday=0, Sunday=6
  let firstDayOfMonth = new Date(year, month, 1).getDay();
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  useEffect(() => {
    async function fetchSchedule() {
      if (!classId) return;
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      
      const { data } = await supabase
        .from('schedule')
        .select('date')
        .eq('class_id', classId)
        .eq('has_class', true)
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (data) {
        setScheduleData(data.map((r: any) => r.date));
      }
      setLoading(false);
    }
    
    fetchSchedule();
  }, [classId, year, month, daysInMonth]);

  const toggleDay = async (dateStr: string, currentStatus: boolean) => {
    if (!isTeacher) return;
    
    const supabase = getSupabaseClient();
    if (currentStatus) {
      // Remove or set false
      await supabase.from('schedule').delete().match({ class_id: classId, date: dateStr });
      setScheduleData(prev => prev.filter(d => d !== dateStr));
    } else {
      // Insert
      await supabase.from('schedule').insert({ class_id: classId, date: dateStr, has_class: true });
      setScheduleData(prev => [...prev, dateStr]);
    }
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasClass = scheduleData.includes(dateStr);
    return { day, dateStr, hasClass };
  });

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const today = new Date().toISOString().split('T')[0];

  return (
    <WidgetCard 
      title={`Lịch học tháng ${month + 1}/${year}`}
      icon={CalendarIcon}
      headerAction={
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-7 gap-1 text-center mb-2 mt-2">
        {weekDays.map(d => (
          <div key={d} className="text-xs font-semibold text-muted-foreground p-1">{d}</div>
        ))}
      </div>
      <div className={cn("grid grid-cols-7 gap-1", loading && "opacity-50 pointer-events-none")}>
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}
        {days.map(d => (
          <div 
            key={d.day} 
            onClick={() => toggleDay(d.dateStr, d.hasClass)}
            className={cn(
              "h-8 w-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all",
              d.hasClass 
                ? "bg-primary/20 dark:bg-primary/30 text-primary font-bold" 
                : "text-foreground hover:bg-muted",
              d.dateStr === today 
                ? "ring-2 ring-primary ring-offset-2 ring-offset-card" 
                : "",
              isTeacher ? "cursor-pointer hover:ring-2 hover:ring-primary/50" : ""
            )}
          >
            {d.day}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground justify-center pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary/20 dark:bg-primary/30 ring-1 ring-primary/50" /> 
          <span>Ngày có lịch học</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-primary" /> 
          <span>Hôm nay</span>
        </div>
      </div>
    </WidgetCard>
  );
}
