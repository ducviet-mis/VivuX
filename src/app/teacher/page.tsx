'use client';
import { PageHeader } from "@/components/shared/page-header";
import { DashboardOverview } from "@/features/teacher-dashboard/components/dashboard-overview";
import { ClassManagement } from "@/features/teacher-dashboard/components/class-management";
import { FlaggedQuestions } from "@/features/teacher-dashboard/components/flagged-questions";

export default function TeacherDashboardPage() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <PageHeader title="Bảng quản trị Giáo viên" description="Tổng quan và quản lý lớp học của bạn" />
      <DashboardOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <ClassManagement />
        <FlaggedQuestions />
      </div>
    </div>
  );
}