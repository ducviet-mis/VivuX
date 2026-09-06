import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassRoom } from '../types';
import { Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface ClassCardProps {
  classroom: ClassRoom;
  status: 'active' | 'paused' | 'completed';
}

export function ClassCard({ classroom, status }: ClassCardProps) {
  const statusLabels = {
    active: { label: 'Đang học', color: 'bg-success hover:bg-success' },
    paused: { label: 'Tạm dừng', color: 'bg-warning hover:bg-warning' },
    completed: { label: 'Đã hoàn thành', color: 'bg-primary hover:bg-primary-hover' }
  };

  return (
    <Link href={`/classroom/${classroom.id}`}>
      <Card className="rounded-2xl border border-border bg-card shadow-soft hover:shadow-card transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-3">
            <CardTitle className="text-xl font-bold text-card-foreground line-clamp-2">
              {classroom.name}
            </CardTitle>
            <Badge className={`${statusLabels[status].color} whitespace-nowrap shrink-0`}>
              {statusLabels[status].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="mt-auto pt-4 flex flex-col gap-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span>GV: {classroom.teacherName}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2" />
            <span>{classroom.students.length} học sinh</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
