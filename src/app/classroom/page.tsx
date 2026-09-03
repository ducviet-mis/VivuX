"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ClassList } from "@/features/classroom/components/class-list";
import { BookOpen } from 'lucide-react';

export default function ClassroomPage() {
  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Lớp học của tôi" 
        description="Quản lý các lớp học bạn đang tham gia hoặc giảng dạy"
      />
      
      <ClassList />
    </div>
  );
}
