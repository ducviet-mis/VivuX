import { Badge } from "@/components/ui/badge";

export const STUDENT_STATUS = {
  active: { label: 'Đang học', color: 'bg-success' },
  paused: { label: 'Tạm dừng', color: 'bg-warning' },
  completed: { label: 'Đã hoàn thành', color: 'bg-primary' }
};

interface StudentStatusBadgeProps {
  status: keyof typeof STUDENT_STATUS;
}

export function StudentStatusBadge({ status }: StudentStatusBadgeProps) {
  const config = STUDENT_STATUS[status];
  return (
    <Badge className={`${config.color} text-primary-foreground hover:${config.color}/90 border-transparent`}>
      {config.label}
    </Badge>
  );
}
