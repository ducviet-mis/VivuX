import { RegisterForm } from '@/features/auth/components/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-float border-border bg-card/70 backdrop-blur-md rounded-xl overflow-hidden my-8">
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-soft p-4 rounded-full">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle as="h1" className="text-2xl font-bold text-foreground">Tạo tài khoản mới</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Bắt đầu hành trình học tập của bạn</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
