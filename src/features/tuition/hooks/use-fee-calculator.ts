import { useState, useEffect, useRef, useCallback } from 'react';
import { InvoiceData } from '../types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export const useFeeCalculator = () => {
  const user = useAuthStore(state => state.user);
  const [feePerSession, setFeePerSession] = useState(100000);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [students, setStudents] = useState<{id: string, name: string, sessions: number}[]>([]);
  const feeLoadedRef = useRef(false);

  // Fetch classes
  useEffect(() => {
    async function fetchClasses() {
      if (!user) return;
      const supabase = getSupabaseClient();
      const { data } = await supabase.from('classes').select('id, name').eq('teacher_id', user.id);
      if (data && data.length > 0) {
        setClasses(data);
        if (!selectedClassId) {
          setSelectedClassId(data[0].id);
        }
      } else {
        setClasses([]);
      }
    }
    fetchClasses();
  }, [user, selectedClassId]);

  // Load saved fee when class changes
  useEffect(() => {
    feeLoadedRef.current = false;
    async function loadFee() {
      if (!selectedClassId) {
        feeLoadedRef.current = true;
        return;
      }
      const supabase = getSupabaseClient();
      try {
        const { data } = await supabase
          .from('tuition_config')
          .select('fee_per_session')
          .eq('class_id', selectedClassId)
          .maybeSingle();
        if (data && data.fee_per_session) {
          setFeePerSession(data.fee_per_session);
        }
      } catch (e) {
        console.error('Load fee error:', e);
      }
      feeLoadedRef.current = true;
    }
    loadFee();
  }, [selectedClassId]);

  // Save fee (called manually by setFee wrapper)
  const saveFee = useCallback(async (classId: string, fee: number) => {
    const supabase = getSupabaseClient();
    // Delete existing + insert (most reliable)
    await supabase.from('tuition_config').delete().eq('class_id', classId);
    await supabase.from('tuition_config').insert({
      class_id: classId,
      fee_per_session: fee,
    });
  }, []);

  // Wrapped setFeePerSession that also saves
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSetFee = useCallback((fee: number) => {
    setFeePerSession(fee);
    if (!feeLoadedRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (selectedClassId) {
        saveFee(selectedClassId, fee);
      }
    }, 800);
  }, [selectedClassId, saveFee]);

  // Fetch students + attendance count
  useEffect(() => {
    async function fetchStudentsAndAttendance() {
      if (!selectedClassId) {
        setStudents([]);
        return;
      }
      const supabase = getSupabaseClient();
      
      // Fetch students in class
      const { data: members } = await supabase
        .from('class_members')
        .select('student_id')
        .eq('class_id', selectedClassId);
      
      if (!members || members.length === 0) {
        setStudents([]);
        return;
      }
      
      const studentIds = members.map((m: any) => m.student_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', studentIds);
      
      // Fetch ALL attendance for this class+month (present + makeup = counted)
      const [y, m] = selectedMonth.split('-').map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      const startDate = `${selectedMonth}-01`;
      const endDate = `${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`;

      const { data: attendance } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', selectedClassId)
        .in('status', ['present', 'makeup'])
        .gte('date', startDate)
        .lte('date', endDate);
        
      const sessionCountMap = new Map<string, number>();
      if (attendance) {
        attendance.forEach((a: any) => {
          const current = sessionCountMap.get(a.student_id) || 0;
          sessionCountMap.set(a.student_id, current + 1);
        });
      }

      const studentsData = profiles ? profiles.map((p: any) => ({
        id: p.id,
        name: p.name || 'Học sinh',
        sessions: sessionCountMap.get(p.id) || 0
      })) : [];
      
      setStudents(studentsData);
    }
    fetchStudentsAndAttendance();
  }, [selectedClassId, selectedMonth]);

  const calculateForStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const sessions = student ? student.sessions : 0;
    const subtotal = sessions * feePerSession;
    return { sessions, subtotal, adjustment: 0, total: subtotal };
  };

  const calculateForAllStudents = (): Partial<InvoiceData>[] => {
    return students.map(s => {
      const { sessions, subtotal, adjustment, total } = calculateForStudent(s.id);
      return { studentId: s.id, studentName: s.name, sessionsAttended: sessions, subtotal, adjustment, total, feePerSession, month: selectedMonth };
    });
  };

  return { feePerSession, setFeePerSession: handleSetFee, selectedMonth, setSelectedMonth, selectedClassId, setSelectedClassId, calculateForStudent, calculateForAllStudents, students, classes };
};