'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, FileText, Flag } from "lucide-react";
import { useTeacherDashboard } from "../hooks/use-teacher-dashboard";
import { cn } from "@/lib/utils";

export const DashboardOverview = () => {
  const { stats } = useTeacherDashboard();
  const items = [
    { label: 'Lớp học', value: stats.totalClasses, icon: Users, color: 'text-blue-500' },
    { label: 'Học sinh', value: stats.totalStudents, icon: GraduationCap, color: 'text-emerald-500' },
    { label: 'Đề thi', value: stats.totalExams, icon: FileText, color: 'text-purple-500' },
    { label: 'Câu hỏi cờ đỏ', value: stats.flaggedQuestions, icon: Flag, color: 'text-red-500', onClick: () => document.getElementById('flagged-questions')?.scrollIntoView({behavior: 'smooth'}) }
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, i) => (
        <Card key={i} className={cn("rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5", item.onClick && "cursor-pointer")} onClick={item.onClick}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <h3 className="text-3xl font-bold mt-1">{item.value}</h3>
            </div>
            <div className={cn("p-3 rounded-full bg-primary/10", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};