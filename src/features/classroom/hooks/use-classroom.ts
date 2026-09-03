'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { ClassRoom } from '../types';

export function useClassroom() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchClasses = async () => {
    if (!user?.id) {
      setClasses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = getSupabaseClient();

    if (user.role === 'teacher') {
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const classIds = data.map((c: any) => c.id);
        const { data: members } = await supabase
          .from('class_members')
          .select('class_id')
          .in('class_id', classIds.length > 0 ? classIds : ['__none__']);

        const countMap = new Map<string, number>();
        (members || []).forEach((m: any) => {
          countMap.set(m.class_id, (countMap.get(m.class_id) || 0) + 1);
        });

        const mapped: ClassRoom[] = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          teacherId: c.teacher_id,
          teacherName: user.name || 'Bạn',
          password: c.password || '',
          inviteLink: c.invite_link || '',
          students: Array.from({ length: countMap.get(c.id) || 0 }, (_, i) => ({
            id: `s-${i}`, name: '', email: '', status: 'active' as const, joinedAt: ''
          })),
          announcements: [],
          schedule: [],
          createdAt: c.created_at,
        }));
        setClasses(mapped);
      }
    } else {
      // Students: use student_id column
      const { data: memberships } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', user.id);

      if (!memberships || memberships.length === 0) {
        setClasses([]);
        setLoading(false);
        return;
      }

      const classIds = memberships.map((m: any) => m.class_id);

      const { data } = await supabase
        .from('classes')
        .select('*')
        .in('id', classIds);

      if (data) {
        const teacherIds = Array.from(new Set(data.map((c: any) => c.teacher_id))) as string[];
        const { data: teachers } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', teacherIds.length > 0 ? teacherIds : ['__none__']);

        const teacherMap = new Map<string, string>();
        (teachers || []).forEach((t: any) => {
          teacherMap.set(t.id, t.name);
        });

        const { data: allMembers } = await supabase
          .from('class_members')
          .select('class_id')
          .in('class_id', classIds);

        const countMap = new Map<string, number>();
        (allMembers || []).forEach((m: any) => {
          countMap.set(m.class_id, (countMap.get(m.class_id) || 0) + 1);
        });

        const mapped: ClassRoom[] = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          teacherId: c.teacher_id,
          teacherName: teacherMap.get(c.teacher_id) || 'GV',
          password: '',
          inviteLink: '',
          students: Array.from({ length: countMap.get(c.id) || 0 }, (_, i) => ({
            id: `s-${i}`, name: '', email: '', status: 'active' as const, joinedAt: ''
          })),
          announcements: [],
          schedule: [],
          createdAt: c.created_at,
        }));
        setClasses(mapped);
      }
    }

    setLoading(false);
  };

  const joinClass = async (classId: string, password?: string): Promise<boolean> => {
    if (!user?.id) return false;
    const supabase = getSupabaseClient();

    // Find class by exact match or prefix
    let cls: any = null;
    const { data: exact } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .maybeSingle();

    if (exact) {
      cls = exact;
    } else {
      const { data: prefixResults } = await supabase
        .from('classes')
        .select('*')
        .ilike('id', `${classId}%`)
        .limit(1);
      if (prefixResults && prefixResults.length > 0) {
        cls = prefixResults[0];
      }
    }

    if (!cls) return false;

    const fullClassId = cls.id;

    // Check password
    if (cls.password && cls.password !== (password || '')) return false;

    // Check not already a member (use student_id!)
    const { data: existing } = await supabase
      .from('class_members')
      .select('id')
      .eq('class_id', fullClassId)
      .eq('student_id', user.id)
      .maybeSingle();

    if (existing) return true;

    // Insert membership (use student_id, status)
    const { error } = await supabase.from('class_members').insert({
      class_id: fullClassId,
      student_id: user.id,
      status: 'active',
    });

    if (error) {
      console.error('Join class error:', error);
      return false;
    }

    await fetchClasses();
    return true;
  };

  useEffect(() => {
    fetchClasses();
  }, [user?.id, user?.role]);

  return {
    classes,
    loading,
    joinClass,
    refreshClasses: fetchClasses,
  };
}
