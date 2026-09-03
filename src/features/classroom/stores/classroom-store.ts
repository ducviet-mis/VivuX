import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClassRoom, AttendanceRecord, MonthlyReview, ResourceItem, Announcement } from '../types';
import { ExamConfig } from '@/features/exam-setup/types';

interface ClassroomState {
  classes: ClassRoom[];
  currentClassId: string | null;
  attendanceRecords: AttendanceRecord[];
  monthlyReviews: MonthlyReview[];
  resources: ResourceItem[];
  exams: ExamConfig[];
  joinClass: (id: string, password?: string) => boolean;
  createClass: (name: string, password?: string) => ClassRoom;
  setCurrentClass: (id: string) => void;
  addAnnouncement: (classId: string, content: string) => void;
  updateAttendance: (record: AttendanceRecord) => void;
  addMonthlyReview: (review: MonthlyReview) => void;
  addResource: (resource: ResourceItem) => void;
  removeResource: (resourceId: string) => void;
  addExam: (exam: ExamConfig) => void;
  getCurrentClass: () => ClassRoom | null;
}

export const useClassroomStore = create<ClassroomState>()(
  persist(
    (set, get) => ({
      classes: [],
      currentClassId: null,
      attendanceRecords: [],
      monthlyReviews: [],
      resources: [],
      exams: [],
      
      joinClass: (id, password) => {
        const cls = get().classes.find(c => c.id === id);
        if (!cls) return false;
        if (password && cls.password !== password) return false;
        return true;
      },
      
      createClass: (name, password) => {
        const newClass: ClassRoom = {
          id: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          name,
          teacherId: 't-current',
          teacherName: 'Bạn',
          password: password || '',
          inviteLink: '',
          students: [],
          announcements: [],
          schedule: [],
          createdAt: new Date().toISOString()
        };
        newClass.inviteLink = `/classroom/join?id=${newClass.id}&token=token-${newClass.id}`;
        set((state) => ({ classes: [...state.classes, newClass] }));
        return newClass;
      },
      
      setCurrentClass: (id) => set({ currentClassId: id }),
      
      addAnnouncement: (classId, content) => set((state) => {
        const newAnnouncement: Announcement = {
          id: `a-${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
          isPinned: false
        };
        return {
          classes: state.classes.map(c => 
            c.id === classId 
              ? { ...c, announcements: [newAnnouncement, ...c.announcements] }
              : c
          )
        };
      }),
      
      updateAttendance: (record) => set((state) => {
        const filtered = state.attendanceRecords.filter(r => !(r.studentId === record.studentId && r.date === record.date));
        return { attendanceRecords: [...filtered, record] };
      }),
      
      addMonthlyReview: (review) => set((state) => {
        const filtered = state.monthlyReviews.filter(r => !(r.studentId === review.studentId && r.month === review.month));
        return { monthlyReviews: [...filtered, review] };
      }),
      
      addResource: (resource) => set((state) => ({
        resources: [...state.resources, resource]
      })),

      removeResource: (resourceId) => set((state) => ({
        resources: state.resources.filter(r => r.id !== resourceId)
      })),
      
      addExam: (exam) => set((state) => ({
        exams: [...state.exams, exam]
      })),
      
      getCurrentClass: () => {
        const { classes, currentClassId } = get();
        return classes.find(c => c.id === currentClassId) || null;
      }
    }),
    {
      name: 'classroom-storage',
    }
  )
);
