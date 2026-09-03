import { useState, useEffect } from 'react';
import { DashboardStats, FlaggedQuestion } from '../types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export const useTeacherDashboard = () => {
  const user = useAuthStore(state => state.user);
  const [stats, setStats] = useState<DashboardStats>({ totalClasses: 0, totalStudents: 0, totalExams: 0, flaggedQuestions: 0 });
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedQuestion[]>([]);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      const supabase = getSupabaseClient();
      
      // 1. Fetch teacher classes
      const { data: classes } = await supabase.from('classes').select('id').eq('teacher_id', user.id);
      const classIds = classes ? classes.map((c: any) => c.id) : [];
      
      let totalStudents = 0;
      let totalExams = 0;
      
      if (classIds.length > 0) {
        // 2. Count students in these classes
        const { count: studentCount } = await supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds);
          
        totalStudents = studentCount || 0;
        
        // 3. Count exams in these classes
        const { count: examCount } = await supabase
          .from('exams')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds);
          
        totalExams = examCount || 0;
      }
      
      setStats({
        totalClasses: classIds.length,
        totalStudents,
        totalExams,
        flaggedQuestions: 0
      });
      setFlaggedQuestions([]);
    }
    
    loadStats();
  }, [user]);

  return { stats, flaggedQuestions, recentExams: [] };
};