'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

type AttendanceStatus = 'present' | 'excused' | 'absent' | 'makeup';

interface AttendanceRecord {
  studentId: string;
  date: string;
  status: AttendanceStatus;
}

export function useAttendance(classId: string, month: string) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classDates, setClassDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!classId || !month) return;
    setLoading(true);
    const supabase = getSupabaseClient();

    // Parse month string (YYYY-MM)
    const [y, m] = month.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const startDate = `${month}-01`;
    const endDate = `${month}-${String(daysInMonth).padStart(2, '0')}`;

    // Fetch schedule dates first
    try {
      const { data: scheduleData, error: schedErr } = await supabase
        .from('schedule')
        .select('date')
        .eq('class_id', classId)
        .eq('has_class', true)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      if (schedErr) console.error('Schedule fetch error:', schedErr);
      const dates = (scheduleData || []).map((s: any) => s.date);
      setClassDates(dates);
    } catch (e) {
      console.error('Schedule fetch failed:', e);
      setClassDates([]);
    }

    // Fetch attendance records separately (table may not exist yet)
    try {
      const { data: attendanceData, error: attErr } = await supabase
        .from('attendance')
        .select('student_id, date, status')
        .eq('class_id', classId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (attErr) console.error('Attendance fetch error:', attErr);
      const mapped: AttendanceRecord[] = (attendanceData || []).map((a: any) => ({
        studentId: a.student_id,
        date: a.date,
        status: a.status as AttendanceStatus,
      }));
      setRecords(mapped);
    } catch (e) {
      console.error('Attendance fetch failed:', e);
      setRecords([]);
    }

    setLoading(false);
  }, [classId, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (studentId: string, date: string, status: AttendanceStatus | 'none') => {
    const supabase = getSupabaseClient();

    if (status === 'none') {
      // Delete the record
      await supabase
        .from('attendance')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', studentId)
        .eq('date', date);

      setRecords(prev => prev.filter(r => !(r.studentId === studentId && r.date === date)));
    } else {
      // Upsert the record
      const { error } = await supabase.from('attendance').upsert({
        class_id: classId,
        student_id: studentId,
        date,
        status,
      }, { onConflict: 'class_id,student_id,date' });

      if (error) {
        // Fallback: try delete + insert
        await supabase.from('attendance').delete()
          .eq('class_id', classId)
          .eq('student_id', studentId)
          .eq('date', date);
        await supabase.from('attendance').insert({
          class_id: classId,
          student_id: studentId,
          date,
          status,
        });
      }

      setRecords(prev => {
        const filtered = prev.filter(r => !(r.studentId === studentId && r.date === date));
        return [...filtered, { studentId, date, status }];
      });
    }
  };

  const getRecord = (studentId: string, date: string) => {
    return records.find(r => r.studentId === studentId && r.date === date);
  };

  return {
    records,
    classDates,
    loading,
    updateStatus,
    getRecord,
    refetch: fetchData,
  };
}
