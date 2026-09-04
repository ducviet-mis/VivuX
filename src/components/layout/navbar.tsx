"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, BookOpen, GraduationCap, LayoutDashboard,
  Menu, X, LogOut, User, ChevronDown, Shield, FileText, BookText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { Separator } from "@/components/ui/separator";
import { useState, useRef, useEffect } from "react";

const iconMap: Record<string, React.ElementType> = {
  Home, BookOpen, GraduationCap, LayoutDashboard, Shield, FileText, BookText
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: "Trang chủ", href: "/home", icon: "Home" },
    { label: "Tự luyện", href: "/practice", icon: "BookOpen" },
    { label: "Thi thử", href: "/mock-exams", icon: "FileText" },
    { label: "Lớp học", href: "/classroom", icon: "GraduationCap" },
    { label: "Cẩm nang", href: "/handbook", icon: "BookText" },
  ];

  const teacherItems = user?.role === "teacher"
    ? [
        { label: "Quản lý", href: "/teacher", icon: "LayoutDashboard" },
      ]
    : [];

  const isAdmin = user?.email === "vietdang293.vn@gmail.com" || user?.email === "vietdang293@gmail.com";

  const allItems = [...navItems, ...teacherItems];

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#fefdff]/90 dark:bg-[#1a1625]/90 backdrop-blur-md border-b border-white/60 dark:border-white/5 shadow-[0_4px_20px_-10px_rgba(200,180,220,0.2)] dark:shadow-none transition-all">
      <div className="mx-auto flex h-16 md:h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-extrabold text-[#1e1b4b] dark:text-white hidden sm:inline tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-full border border-white/50 dark:border-white/5 shadow-inner">
          {allItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            
            if (item.href === '/practice' || item.href === '/mock-exams') {
              return (
                <div key={item.href} className="relative group">
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all duration-300",
                        isActive 
                          ? "bg-white dark:bg-[#2a2438] text-[#1e1b4b] dark:text-white font-bold shadow-[0_4px_16px_-4px_rgba(200,180,220,0.5)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.5)]" 
                          : "text-slate-500 dark:text-slate-400 font-semibold hover:text-[#1e1b4b] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.label}
                      <ChevronDown className="h-3 w-3 ml-1 opacity-50 transition-transform group-hover:rotate-180" />
                    </div>
                  </Link>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 py-2 rounded-[24px] bg-white dark:bg-[#1a1625] border border-slate-200 dark:border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {[6, 7, 8, 9].map(grade => (
                        <Link key={grade} href={`${item.href}?grade=${grade}`} className="px-2 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-fuchsia-50 hover:text-fuchsia-600 dark:hover:bg-fuchsia-900/30 rounded-xl transition-colors text-center">
                          Lớp {grade}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all duration-300",
                    isActive 
                      ? "bg-white dark:bg-[#2a2438] text-[#1e1b4b] dark:text-white font-bold shadow-[0_4px_16px_-4px_rgba(200,180,220,0.5)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.5)]" 
                      : "text-slate-500 dark:text-slate-400 font-semibold hover:text-[#1e1b4b] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar + Name - Clickable */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white/60 dark:bg-[#2a2438]/60 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-[#2a2438] transition-all"
              >
                <Avatar className="h-9 w-9 border-2 border-white dark:border-[#2a2438] shadow-sm">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="text-sm bg-gradient-to-br from-fuchsia-100 to-pink-100 text-fuchsia-600 font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold text-[#1e1b4b] dark:text-white hidden lg:inline">
                  {user.name}
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 text-slate-400 transition-transform hidden lg:block",
                  dropdownOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-[24px] border border-white/60 dark:border-white/10 bg-white/95 dark:bg-[#1a1625]/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(200,180,220,0.4)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info header */}
                  <div className="px-4 py-4 mb-2 rounded-[16px] bg-slate-50 dark:bg-slate-800/50">
                    <p className="font-bold text-[#1e1b4b] dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
                    <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 font-bold">
                      {user.role === 'teacher' ? '👨‍🏫 Giáo viên' : '🎓 Học sinh'}
                    </span>
                  </div>

                  {/* Menu items */}
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#1e1b4b] dark:hover:text-white rounded-[16px] transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Thông tin tài khoản
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 rounded-[16px] transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        ADMIN
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-[16px] transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button className="rounded-full bg-[#1e1b4b] text-white hover:bg-[#1e1b4b]/90 px-6 font-bold shadow-lg shadow-[#1e1b4b]/20">Đăng nhập</Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 rounded-full bg-white dark:bg-[#2a2438] shadow-sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5 text-[#1e1b4b] dark:text-white" /> : <Menu className="h-5 w-5 text-[#1e1b4b] dark:text-white" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#1a1625]/95 backdrop-blur-xl border-b border-white/60 dark:border-white/10 shadow-[0_20px_40px_-15px_rgba(200,180,220,0.3)] dark:shadow-none px-4 py-4 space-y-2">
          {allItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            
            if (item.href === '/practice' || item.href === '/mock-exams') {
              return (
                <div key={item.href} className="flex flex-col gap-1">
                  <div className="px-4 py-2 mt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label} theo lớp</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 px-2">
                    {[6, 7, 8, 9].map(grade => (
                      <Link 
                        key={grade} 
                        href={`${item.href}?grade=${grade}`} 
                        onClick={() => setMobileOpen(false)}
                        className="py-3 text-center rounded-[14px] bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-fuchsia-100 hover:text-fuchsia-600 dark:hover:bg-fuchsia-900/40"
                      >
                        {grade}
                      </Link>
                    ))}
                  </div>
                  <Separator className="my-2 bg-slate-100 dark:bg-slate-800" />
                </div>
              );
            }

            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block">
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-[16px] text-sm transition-all",
                    isActive 
                      ? "bg-fuchsia-50 dark:bg-[#2a2438] text-fuchsia-600 dark:text-fuchsia-400 font-bold" 
                      : "text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  {item.label}
                </div>
              </Link>
            );
          })}
          {user && (
            <>
              <Separator className="my-3 bg-slate-100 dark:bg-slate-800" />
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="block">
                <div className="flex items-center gap-3 px-4 py-3 rounded-[16px] text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
                  <User className="h-5 w-5" />
                  Thông tin tài khoản
                </div>
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="block">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-[16px] text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20">
                    <Shield className="h-5 w-5" />
                    ADMIN
                  </div>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
              >
                <LogOut className="h-5 w-5" />
                Đăng xuất
              </button>
            </>
          )}
          <div className="pt-2 px-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Giao diện</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
