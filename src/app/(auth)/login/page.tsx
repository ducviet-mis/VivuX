import { LoginForm } from '@/features/auth/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-white/50 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[32px] overflow-hidden">
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="bg-fuchsia-100 dark:bg-fuchsia-900/30 p-4 rounded-full">
              <GraduationCap className="w-8 h-8 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#1e1b4b] dark:text-white">Chào mừng trở lại</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Đăng nhập để tiếp tục học tập</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
