"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "../stores/auth-store";
import { RoleSelector } from "./role-selector";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader2, MailCheck, RefreshCw } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser, resendConfirmationEmail, isLoading, error, clearError } = useAuthStore();
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    const result = await registerUser(data.name, data.email, data.password, role);
    if (result.success && result.requiresEmailConfirmation) {
      setConfirmationEmail(result.email || data.email);
      return;
    }
    if (result.success) {
      router.push("/home");
    }
  };

  const handleResend = async () => {
    if (!confirmationEmail) return;
    setResending(true);
    setResendMessage(null);
    const result = await resendConfirmationEmail(confirmationEmail);
    setResendMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setResending(false);
  };

  if (confirmationEmail) {
    return (
      <div className="space-y-5" role="status">
        <div className="rounded-2xl border border-primary/25 bg-primary-soft/55 p-5 text-center sm:p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <MailCheck aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">Kiểm tra email để kích hoạt tài khoản</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            FlyDo đã gửi liên kết xác nhận đến
          </p>
          <p className="mt-1 break-all font-semibold text-foreground">{confirmationEmail}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Hãy mở email và bấm vào liên kết để hoàn tất đăng ký. Nếu chưa thấy, hãy kiểm tra mục Thư rác hoặc Quảng cáo.
          </p>
        </div>

        {resendMessage && (
          <p role={resendMessage.type === 'error' ? 'alert' : 'status'} className={resendMessage.type === 'success' ? 'flex items-start gap-2 rounded-xl bg-success-soft p-3 text-sm font-medium text-success' : 'flex items-start gap-2 rounded-xl bg-destructive-soft p-3 text-sm font-medium text-destructive'}>
            {resendMessage.type === 'success' ? <MailCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
            {resendMessage.text}
          </p>
        )}

        <Button type="button" variant="outline" onClick={handleResend} disabled={resending} className="h-12 w-full">
          {resending ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <RefreshCw aria-hidden="true" className="h-4 w-4" />}
          {resending ? 'Đang gửi lại...' : 'Gửi lại email xác nhận'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Đã xác nhận email?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">Đăng nhập</Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <RoleSelector selectedRole={role} onSelect={setRole} />

      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground font-bold ml-1">Họ và tên</Label>
        <Input id="name" placeholder="Nguyễn Văn A" className="rounded-md bg-card border-control px-5 h-12" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive ml-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground font-bold ml-1">Email</Label>
        <Input id="email" type="email" placeholder="email@example.com" className="rounded-md bg-card border-control px-5 h-12" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive ml-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground font-bold ml-1">Mật khẩu</Label>
        <Input id="password" type="password" placeholder="••••••••" className="rounded-md bg-card border-control px-5 h-12" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-destructive ml-1">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-foreground font-bold ml-1">Xác nhận mật khẩu</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="rounded-md bg-card border-control px-5 h-12"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive ml-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-destructive-soft p-4 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full rounded-md h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base shadow-card mt-6" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tạo tài khoản...
          </>
        ) : (
          "Tạo tài khoản"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
