/** Application-wide constants */

export const APP_NAME = "FlyDo";
export const APP_DESCRIPTION = "Nền tảng Học & Tự luyện Toán thông minh FlyDo";

/** Navigation items */
export const NAV_ITEMS = [
  { label: "Trang chủ", href: "/home", icon: "Home" },
  { label: "Tự luyện", href: "/practice", icon: "BookOpen" },
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
