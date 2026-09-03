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
          "cursor-pointer p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20",
          selectedRole === 'student' 
            ? "border-fuchsia-500 bg-fuchsia-50/50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 font-bold" 
            : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1625] text-slate-500 dark:text-slate-400 font-medium"
        )}
      >
        <GraduationCap className="w-8 h-8" />
        <span>Học sinh</span>
      </div>
      
      <div
        onClick={() => onSelect('teacher')}
        className={cn(
          "cursor-pointer p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20",
          selectedRole === 'teacher' 
            ? "border-fuchsia-500 bg-fuchsia-50/50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 font-bold" 
            : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1625] text-slate-500 dark:text-slate-400 font-medium"
        )}
      >
        <Users className="w-8 h-8" />
        <span>Giáo viên</span>
      </div>
    </div>
  );
}
