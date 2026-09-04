/** Application-wide constants */

export const APP_NAME = "VivuX";
export const APP_DESCRIPTION = "Nền tảng Học & Tự luyện Toán thông minh VivuX";

/** Navigation items */
export const NAV_ITEMS = [
  { label: "Trang chủ", href: "/home", icon: "Home" },
  { label: "Tự luyện", href: "/practice", icon: "BookOpen" },
  { label: "Lớp học", href: "/classroom", icon: "GraduationCap" },
] as const;

export const TEACHER_NAV_ITEMS = [
  { label: "Quản lý lớp", href: "/teacher", icon: "LayoutDashboard" },
] as const;

/** Grade levels */
export const GRADE_LEVELS = [
  { id: 6, label: "Lớp 6", color: "bg-blue-500" },
  { id: 7, label: "Lớp 7", color: "bg-emerald-500" },
  { id: 8, label: "Lớp 8", color: "bg-purple-500" },
  { id: 9, label: "Lớp 9", color: "bg-orange-500" },
] as const;

/** Exam countdown dates */
export const EXAM_DATES = [
  {
    id: "midterm",
    label: "Giữa kỳ I",
    date: new Date(2026, 9, 15), // Oct 15, 2026
    icon: "BookOpenCheck",
  },
  {
    id: "final",
    label: "Cuối kỳ I",
    date: new Date(2026, 11, 20), // Dec 20, 2026
    icon: "GraduationCap",
  },
  {
    id: "entrance",
    label: "Tuyển sinh vào 10",
    date: new Date(2027, 5, 5), // Jun 5, 2027
    icon: "Trophy",
  },
] as const;

/** Attendance status options */
export const ATTENDANCE_STATUS = {
  PRESENT: { label: "Có mặt", color: "bg-emerald-500", icon: "Check" },
  EXCUSED: { label: "Nghỉ có phép", color: "bg-amber-500", icon: "FileText" },
  ABSENT: { label: "Nghỉ không phép", color: "bg-red-500", icon: "X" },
  MAKEUP: { label: "Học bù", color: "bg-blue-500", icon: "RefreshCw" },
} as const;

/** Student status in class */
export const STUDENT_STATUS = {
  ACTIVE: { label: "Đang học", color: "bg-emerald-500" },
  PAUSED: { label: "Tạm dừng", color: "bg-amber-500" },
  COMPLETED: { label: "Đã hoàn thành", color: "bg-blue-500" },
} as const;

/** Answer types for exam */
export const ANSWER_TYPES = {
  MCQ: "mcq",           // Trắc nghiệm A/B/C/D
  TRUE_FALSE: "tf",     // Đúng / Sai
  SHORT: "short",       // Điền đáp án ngắn
} as const;

/** Resource folder types */
export const RESOURCE_FOLDERS = [
  { id: "theory", label: "Lý thuyết", icon: "BookOpen" },
  { id: "exercises", label: "Phiếu bài tập tự luyện", icon: "FileText" },
  { id: "extra", label: "Tài liệu mở rộng", icon: "FolderOpen" },
] as const;
