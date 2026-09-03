import { Badge } from "@/components/ui/badge";

export const STUDENT_STATUS = {
  active: { label: 'Đang học', color: 'bg-emerald-500' },
  paused: { label: 'Tạm dừng', color: 'bg-amber-500' },
  completed: { label: 'Đã hoàn thành', color: 'bg-blue-500' }
};

interface StudentStatusBadgeProps {
  status: keyof typeof STUDENT_STATUS;
}

export function StudentStatusBadge({ status }: StudentStatusBadgeProps) {
  const config = STUDENT_STATUS[status];
  return (
    <Badge className={`${config.color} text-white hover:${config.color}/90 border-transparent`}>
      {config.label}
    </Badge>
  );
}
