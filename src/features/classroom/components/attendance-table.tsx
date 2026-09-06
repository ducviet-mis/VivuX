"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentInClass } from '../types';
import { useAttendance } from '../hooks/use-attendance';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const ATTENDANCE_STATUS = {
  present: { color: 'bg-success-soft text-success', label: 'Có mặt', short: '✓' },
  excused: { color: 'bg-warning-soft text-warning', label: 'Có phép', short: 'P' },
  absent: { color: 'bg-destructive-soft text-destructive', label: 'Vắng', short: 'V' },
  makeup: { color: 'bg-primary-soft text-primary', label: 'Học bù', short: 'B' },
  none: { color: 'bg-muted text-muted-foreground', label: 'Chưa điểm danh', short: '–' }
} as const;

type StatusKey = keyof typeof ATTENDANCE_STATUS;

interface AttendanceTableProps {
  classId: string;
  students: StudentInClass[];
  isTeacher?: boolean;
}

export function AttendanceTable({ classId, students, isTeacher = false }: AttendanceTableProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const { classDates, loading, updateStatus, getRecord } = useAttendance(classId, monthStr);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleCellClick = (studentId: string, date: string) => {
    if (!isTeacher) return;
    const record = getRecord(studentId, date);
    const currentStatus: StatusKey = (record?.status as StatusKey) || 'none';
    const cycle: StatusKey[] = ['none', 'present', 'excused', 'absent', 'makeup'];
    const currentIdx = cycle.indexOf(currentStatus);
    const nextStatus = cycle[(currentIdx + 1) % cycle.length];
    updateStatus(studentId, date, nextStatus);
  };

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-lg">
          Điểm danh tháng {String(month).padStart(2, '0')}/{year}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Tháng trước">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Tháng sau">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto" tabIndex={0} role="region" aria-label="Bảng điểm danh, cuộn ngang để xem đầy đủ">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : classDates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Chưa có lịch học tháng này. {isTeacher ? 'Hãy thiết lập lịch học trước.' : ''}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Chưa có học sinh nào trong lớp.
          </div>
        ) : (
          <>
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">STT</th>
                  <th className="px-3 py-3 min-w-[130px]">Họ tên</th>
                  {classDates.map(date => (
                    <th key={date} className="px-1 py-3 text-center w-9">
                      {parseInt(date.split('-')[2])}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center min-w-[80px]">Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student, idx) => {
                  let present = 0, excused = 0, absent = 0;
                  classDates.forEach(date => {
                    const r = getRecord(student.id, date);
                    if (r?.status === 'present' || r?.status === 'makeup') present++;
                    else if (r?.status === 'excused') excused++;
                    else if (r?.status === 'absent') absent++;
                  });

                  return (
                    <tr key={student.id} className="hover:bg-muted/30">
                      <td className="px-3 py-2.5 text-center text-muted-foreground text-xs">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-sm">{student.name}</td>
                      {classDates.map(date => {
                        const record = getRecord(student.id, date);
                        const statusKey: StatusKey = (record?.status as StatusKey) || 'none';
                        const { color, label, short } = ATTENDANCE_STATUS[statusKey];

                        return (
                          <td key={date} className="px-1 py-2.5 text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {isTeacher ? (
                                    <button
                                      onClick={() => handleCellClick(student.id, date)}
                                      aria-label={`${student.name}, ${date}: ${label}. Bấm để đổi trạng thái`}
                                      className={cn(
                                        "h-11 w-11 rounded-sm mx-auto flex items-center justify-center text-xs font-semibold transition-colors hover:ring-2 hover:ring-primary/50",
                                        color
                                      )}
                                    >{short}</button>
                                  ) : (
                                    <div
                                      aria-label={`${student.name}, ${date}: ${label}`}
                                      className={cn(
                                        "h-11 w-11 rounded-sm mx-auto flex items-center justify-center text-xs font-semibold",
                                        color
                                      )}
                                    >{short}</div>
                                  )}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{label}</p>
                                  {isTeacher && <p className="text-xs text-muted-foreground">Click để đổi</p>}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                          {present > 0 && <span className="text-success">{present}</span>}
                          {excused > 0 && <span className="text-warning">/{excused}P</span>}
                          {absent > 0 && <span className="text-destructive">/{absent}V</span>}
                          {present === 0 && excused === 0 && absent === 0 && <span className="text-muted-foreground">-</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground p-3 border-t border-border/50 flex-wrap">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-success" /> Có mặt</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-warning" /> Có phép</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-destructive" /> Vắng</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary" /> Học bù</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-muted" /> Chưa điểm danh</div>
              {isTeacher && <span className="ml-auto italic">Click vào ô để điểm danh</span>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
