import { RegisterForm } from '@/features/auth/components/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-teal-50 dark:bg-slate-900">
      <Card className="w-full max-w-md shadow-lg border-primary/20 my-8">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Tạo tài khoản mới</CardTitle>
          <CardDescription>Bắt đầu hành trình học tập của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
