import { BookOpen, BookText, Crown, FileText, Home, LibraryBig } from "lucide-react";

export const primaryNavigationItems = [
  { label: "Trang chủ", href: "/home", icon: Home },
  { label: "Lý thuyết", href: "/theory", icon: LibraryBig },
  { label: "Tự luyện", href: "/practice", icon: BookOpen },
  { label: "Thi thử", href: "/mock-exams", icon: FileText },
  { label: "Cẩm nang", href: "/handbook", icon: BookText },
] as const;

export const desktopNavigationItems = [
  ...primaryNavigationItems,
  { label: "Gói FlyDo", href: "/pricing", icon: Crown },
] as const;
