"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, GraduationCap, LayoutDashboard, Menu, X, LogOut, User, ChevronDown, Shield, FileText, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navItems = [
    { label: "Trang chủ", href: "/home", icon: Home },
    { label: "Tự luyện", href: "/practice", icon: BookOpen },
    { label: "Thi thử", href: "/mock-exams", icon: FileText },
    { label: "Lớp học", href: "/classroom", icon: GraduationCap },
    { label: "Cẩm nang", href: "/handbook", icon: BookText },
  ];
  const teacherItems = user?.role === "teacher" ? [{ label: "Quản lý", href: "/teacher", icon: LayoutDashboard }] : [];
  const isAdmin = user?.email === "vietdang293.vn@gmail.com" || user?.email === "vietdang293@gmail.com";
  const allItems = [...navItems, ...teacherItems];
  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.push('/login');
  };
  return (
    <nav aria-label="Điều hướng chính" className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/home" className="flex shrink-0 items-center gap-2.5 rounded-md" aria-label="VivuX — Trang chủ">
          <img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-md object-cover" />
          <span className="text-2xl font-bold tracking-tight text-foreground">Vivu<span className="text-primary">X</span></span>
        </Link>
        <div className="hidden items-center gap-1 xl:flex">
          {allItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const hasGrades = item.href === "/practice" || item.href === "/mock-exams";
            return (
              <div key={item.href} className="flex items-center">
                <Link href={item.href} className="vivux-nav-link" aria-current={isActive ? "page" : undefined}>
                  <Icon aria-hidden="true" className="h-[18px] w-[18px]" />{item.label}
                </Link>
                {hasGrades && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-11 w-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-primary" aria-label={`Chọn lớp — ${item.label}`}>
                        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      {[6, 7, 8, 9].map(grade => <DropdownMenuItem asChild key={grade}><Link href={`${item.href}?grade=${grade}`}>Lớp {grade}</Link></DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-2 text-sm font-semibold hover:bg-muted" aria-label={`Tài khoản ${user.name}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary-soft text-primary">{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate lg:inline">{user.name}</span>
                  <ChevronDown aria-hidden="true" className="hidden h-4 w-4 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuLabel className="rounded-sm bg-muted p-3">
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <p className="mt-1 truncate text-xs font-normal text-muted-foreground">{user.email}</p>
                  <p className="mt-2 text-xs text-primary">{user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile"><User aria-hidden="true" />Thông tin tài khoản</Link></DropdownMenuItem>
                {isAdmin && <DropdownMenuItem asChild><Link href="/admin"><Shield aria-hidden="true" />ADMIN</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:bg-destructive-soft focus:text-destructive"><LogOut aria-hidden="true" />Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="hidden sm:inline-flex"><Link href="/login">Đăng nhập</Link></Button>
          )}
          <Button variant="ghost" size="icon" className="border border-border xl:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Đóng menu" : "Mở menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation">
            {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-border bg-surface px-4 py-4 xl:hidden">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3">
            {allItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} aria-current={isActive ? "page" : undefined} className={cn("flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-medium", isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted")}><Icon aria-hidden="true" className="h-[18px] w-[18px]" />{item.label}</Link>;
            })}
          </div>
          <div className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center gap-2 border-t border-border pt-3">
            {user ? <>
              <Button asChild variant="ghost"><Link href="/profile" onClick={() => setMobileOpen(false)}><User aria-hidden="true" className="h-4 w-4" />Thông tin tài khoản</Link></Button>
              {isAdmin && <Button asChild variant="ghost"><Link href="/admin" onClick={() => setMobileOpen(false)}><Shield aria-hidden="true" className="h-4 w-4" />ADMIN</Link></Button>}
              <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:bg-destructive-soft hover:text-destructive"><LogOut aria-hidden="true" className="h-4 w-4" />Đăng xuất</Button>
            </> : <Button asChild className="w-full"><Link href="/login" onClick={() => setMobileOpen(false)}>Đăng nhập</Link></Button>}
          </div>
        </div>
      )}
    </nav>
  );
}
