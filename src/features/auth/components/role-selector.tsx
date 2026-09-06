import { GraduationCap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '../types';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelect: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div role="group" aria-label="Vai trò tài khoản" className="grid grid-cols-2 gap-4">
      <button type="button" aria-pressed={selectedRole === 'student'}
        onClick={() => onSelect('student')}
        className={cn(
          "cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:bg-primary-soft",
          selectedRole === 'student'
            ? "border-primary bg-primary-soft text-primary font-bold"
            : "border-border bg-card text-muted-foreground font-medium"
        )}
      >
        <GraduationCap className="w-8 h-8" />
        <span>Học sinh</span>
      </button>

      <button type="button" aria-pressed={selectedRole === 'teacher'}
        onClick={() => onSelect('teacher')}
        className={cn(
          "cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:bg-primary-soft",
          selectedRole === 'teacher'
            ? "border-primary bg-primary-soft text-primary font-bold"
            : "border-border bg-card text-muted-foreground font-medium"
        )}
      >
        <Users className="w-8 h-8" />
        <span>Giáo viên</span>
      </button>
    </div>
  );
}
