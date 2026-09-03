import { GraduationCap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '../types';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelect: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div
        onClick={() => onSelect('student')}
        className={cn(
          "cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:bg-teal-50 dark:hover:bg-teal-950",
          selectedRole === 'student' 
            ? "border-primary bg-teal-50/50 dark:bg-teal-900/20 text-primary" 
            : "border-border bg-card text-muted-foreground"
        )}
      >
        <GraduationCap className="w-8 h-8" />
        <span className="font-medium">Học sinh</span>
      </div>
      
      <div
        onClick={() => onSelect('teacher')}
        className={cn(
          "cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:bg-teal-50 dark:hover:bg-teal-950",
          selectedRole === 'teacher' 
            ? "border-primary bg-teal-50/50 dark:bg-teal-900/20 text-primary" 
            : "border-border bg-card text-muted-foreground"
        )}
      >
        <Users className="w-8 h-8" />
        <span className="font-medium">Giáo viên</span>
      </div>
    </div>
  );
}
