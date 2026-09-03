"use client";

import { useEffect, useState } from 'react';
import { AnnouncementBoard } from '@/features/classroom/components/announcement-board';
import { ScheduleCalendar } from '@/features/classroom/components/schedule-calendar';
import { AttendanceTable } from '@/features/classroom/components/attendance-table';
import { MonthlyReview } from '@/features/classroom/components/monthly-review';
import { ResourceSidebar } from '@/features/classroom/components/resource-sidebar';
import { PageHeader } from '@/components/shared/page-header';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Loader2, Home, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassInfo {
  id: string;
  name: string;
  teacherName: string;
  studentCount: number;
  students: { id: string; name: string; email: string; status: 'active' | 'paused' | 'completed'; joinedAt: string }[];
}

type TabKey = 'home' | 'resources';

export default function ClassDetailPage({ params }: { params: { classId: string } }) {
  const [classroom, setClassroom] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  useEffect(() => {
    async function loadClass() {
      setLoading(true);
      const supabase = getSupabaseClient();

      const { data: cls } = await supabase
        .from('classes')
        .select('*')
        .eq('id', params.classId)
        .maybeSingle();

      if (cls) {
        const { data: teacher } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', cls.teacher_id)
          .maybeSingle();

        const { data: members } = await supabase
          .from('class_members')
          .select('student_id, status, joined_at')
          .eq('class_id', params.classId);

        let students: ClassInfo['students'] = [];
        if (members && members.length > 0) {
          const studentIds = members.map((m: any) => m.student_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', studentIds);

          const profileMap = new Map<string, { name: string; email: string }>();
          (profiles || []).forEach((p: any) => {
            profileMap.set(p.id, { name: p.name || '', email: p.email || '' });
          });

          students = members.map((m: any) => ({
            id: m.student_id,
            name: profileMap.get(m.student_id)?.name || 'Học sinh',
            email: profileMap.get(m.student_id)?.email || '',
            status: (m.status || 'active') as 'active',
            joinedAt: m.joined_at || '',
          }));
        }

        setClassroom({
          id: cls.id,
          name: cls.name,
          teacherName: teacher?.name || 'GV',
          studentCount: students.length,
          students,
        });
      }
      setLoading(false);
    }
    loadClass();
  }, [params.classId]);

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải lớp học...</p>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy lớp học</h2>
        <p className="text-muted-foreground">Lớp học này không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }

  const isTeacher = false;

  const tabs = [
    { key: 'home' as TabKey, label: 'Trang chủ', icon: Home },
    { key: 'resources' as TabKey, label: 'Tài nguyên', icon: FolderOpen },
  ];

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <PageHeader 
        title={classroom.name} 
        description={`Giáo viên: ${classroom.teacherName} • ${classroom.studentCount} học sinh`}
      />

      <div className="flex gap-6 mt-6">
        {/* Sidebar Navigation */}
        <div className="w-48 shrink-0">
          <nav className="sticky top-6 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
          {activeTab === 'home' && (
            <>
              <AnnouncementBoard classId={classroom.id} isTeacher={isTeacher} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <ScheduleCalendar classId={classroom.id} isTeacher={isTeacher} />
                </div>
                <div className="lg:col-span-2">
                  <AttendanceTable 
                    classId={classroom.id} 
                    students={classroom.students} 
                    isTeacher={isTeacher}
                  />
                </div>
              </div>

              <MonthlyReview students={classroom.students} isTeacher={isTeacher} />
            </>
          )}

          {activeTab === 'resources' && (
            <div className="max-w-4xl">
              <ResourceSidebar isTeacher={isTeacher} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
