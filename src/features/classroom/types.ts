export type StudentInClass = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'paused' | 'completed';
  joinedAt: string;
};

export type Announcement = {
  id: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
};

export type ScheduleDay = {
  date: string;
  hasClass: boolean;
};

export type ClassRoom = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  password: string;
  inviteLink: string;
  students: StudentInClass[];
  announcements: Announcement[];
  schedule: ScheduleDay[];
  createdAt: string;
};

export type AttendanceRecord = {
  studentId: string;
  date: string;
  status: 'present' | 'excused' | 'absent' | 'makeup';
};

export type MonthlyReview = {
  studentId: string;
  month: string;
  content: string;
};

export type ResourceItem = {
  id: string;
  title: string;
  type: 'document' | 'video' | 'exam';
  url: string;
  folder: string;
  createdAt: string;
};
