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
import { Loader2 } from "lucide-react";

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
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [role, setRole] = useState<"teacher" | "student">("student");
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
    const success = await registerUser(data.name, data.email, data.password, role);
    if (success) {
      router.push("/home");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <RoleSelector selectedRole={role} onSelect={setRole} />

      <div className="space-y-2">
        <Label htmlFor="name" className="text-[#1e1b4b] dark:text-slate-300 font-bold ml-1">Họ và tên</Label>
        <Input id="name" placeholder="Nguyễn Văn A" className="rounded-full bg-white dark:bg-[#1a1625] border-slate-200 dark:border-white/10 px-5 h-12" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500 ml-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#1e1b4b] dark:text-slate-300 font-bold ml-1">Email</Label>
        <Input id="email" type="email" placeholder="email@example.com" className="rounded-full bg-white dark:bg-[#1a1625] border-slate-200 dark:border-white/10 px-5 h-12" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-red-500 ml-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#1e1b4b] dark:text-slate-300 font-bold ml-1">Mật khẩu</Label>
        <Input id="password" type="password" placeholder="••••••••" className="rounded-full bg-white dark:bg-[#1a1625] border-slate-200 dark:border-white/10 px-5 h-12" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-red-500 ml-1">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-[#1e1b4b] dark:text-slate-300 font-bold ml-1">Xác nhận mật khẩu</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="rounded-full bg-white dark:bg-[#1a1625] border-slate-200 dark:border-white/10 px-5 h-12"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500 ml-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-500 font-medium">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full rounded-full h-12 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-base shadow-lg shadow-fuchsia-500/20 mt-6" disabled={isLoading}>
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
