"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { User } from "../types";

export type RegisterResult = {
  success: boolean;
  requiresEmailConfirmation: boolean;
  email?: string;
};

function getEmailRedirectUrl() {
  return typeof window === 'undefined' ? undefined : `${window.location.origin}/home`;
}

export function translateAuthError(message?: string): string {
  const normalized = message?.toLowerCase() || '';

  if (normalized.includes('email not confirmed')) return 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư và bấm vào liên kết xác nhận.';
  if (normalized.includes('invalid login credentials')) return 'Email hoặc mật khẩu không đúng.';
  if (normalized.includes('already registered') || normalized.includes('already been registered')) return 'Email này đã được đăng ký.';
  if (normalized.includes('email rate limit exceeded') || normalized.includes('too many requests')) return 'Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng thử lại sau ít phút.';
  if (normalized.includes('signup is disabled') || normalized.includes('signups not allowed')) return 'Hệ thống hiện chưa mở đăng ký tài khoản mới.';
  if (normalized.includes('password should be at least') || normalized.includes('password')) return 'Mật khẩu chưa đáp ứng yêu cầu bảo mật. Vui lòng dùng ít nhất 6 ký tự.';
  if (normalized.includes('email') && (normalized.includes('invalid') || normalized.includes('format'))) return 'Địa chỉ email không hợp lệ.';
  if (normalized.includes('expired') || normalized.includes('invalid token') || normalized.includes('invalid link')) return 'Liên kết xác thực không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại email xác nhận.';

  return 'Đã xảy ra lỗi xác thực. Vui lòng thử lại.';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: "teacher" | "student") => Promise<RegisterResult>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

function mapProfile(profile: any): User {
  const accountTier = ['flygo', 'flymax', 'flyinfinity'].includes(profile.account_tier)
    ? profile.account_tier
    : 'flygo';

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone || '',
    birthDate: profile.birth_date || '',
    avatarUrl: profile.avatar_url || '',
    role: profile.role as "teacher" | "student",
    accountTier,
    subscriptionStartedAt: profile.subscription_started_at || undefined,
    subscriptionExpiresAt: profile.subscription_expires_at || undefined,
    referralCode: profile.referral_code || undefined,
    referralRewardDays: Number(profile.referral_reward_days || 0),
    referralDiscountPercent: Number(profile.referral_discount_percent || 0),
    referralEligibleUntil: profile.referral_eligible_until || undefined,
    referralRedeemedAt: profile.referral_redeemed_at || undefined,
    createdAt: profile.created_at,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      initialized: false,

      clearError: () => set({ error: null }),

      initAuth: async () => {
        if (get().initialized) return;
        try {
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            await supabase.rpc('sync_my_membership_status');
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profile) {
              set({ user: mapProfile(profile), initialized: true });
            } else {
              set({ initialized: true });
            }
          } else {
            // No active session — clear persisted user
            set({ user: null, initialized: true });
          }

          // Listen for auth state changes
          supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            if (event === 'SIGNED_OUT') {
              set({ user: null });
            } else if (event === 'SIGNED_IN' && session?.user) {
              await supabase.rpc('sync_my_membership_status');
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();
              if (profile) {
                set({ user: mapProfile(profile) });
              }
            }
          });
        } catch {
          set({ initialized: true });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });

          if (error) {
            set({
              error: translateAuthError(error.message),
              isLoading: false
            });
            return false;
          }

          if (data.user) {
            await supabase.rpc('sync_my_membership_status');
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

            if (profile) {
              set({ user: mapProfile(profile), isLoading: false, initialized: true });
              return true;
            }
          }

          set({ isLoading: false });
          return false;
        } catch {
          set({ error: "Đã xảy ra lỗi khi đăng nhập", isLoading: false });
          return false;
        }
      },

      register: async (name: string, email: string, password: string, role: "teacher" | "student") => {
        set({ isLoading: true, error: null });
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name, role },
              emailRedirectTo: getEmailRedirectUrl(),
            },
          });

          if (error) {
            set({ error: translateAuthError(error.message), isLoading: false });
            return { success: false, requiresEmailConfirmation: false };
          }

          if (data.user) {
            if (!data.session) {
              set({ user: null, isLoading: false, initialized: true });
              return { success: true, requiresEmailConfirmation: true, email: data.user.email || email };
            }

            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .maybeSingle();

            set({
              user: profile ? mapProfile(profile) : {
                id: data.user.id,
                name, email, role,
                accountTier: 'flygo',
                referralRewardDays: 0,
                referralDiscountPercent: 0,
                referralEligibleUntil: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
              },
              isLoading: false,
              initialized: true,
            });
            return { success: true, requiresEmailConfirmation: false };
          }

          set({ isLoading: false });
          return { success: false, requiresEmailConfirmation: false };
        } catch {
          set({ error: "Đã xảy ra lỗi khi đăng ký", isLoading: false });
          return { success: false, requiresEmailConfirmation: false };
        }
      },

      resendConfirmationEmail: async (email: string) => {
        try {
          const { error } = await getSupabaseClient().auth.resend({
            type: 'signup',
            email,
            options: { emailRedirectTo: getEmailRedirectUrl() },
          });
          if (error) return { success: false, message: translateAuthError(error.message) };
          return { success: true, message: 'Email xác nhận mới đã được gửi. Vui lòng kiểm tra hộp thư.' };
        } catch {
          return { success: false, message: 'Không thể gửi lại email xác nhận. Vui lòng thử lại sau.' };
        }
      },

      logout: async () => {
        try {
          const supabase = getSupabaseClient();
          await supabase.auth.signOut();
        } catch { /* ignore */ }
        set({ user: null, error: null });
      },

      logoutAllDevices: async () => {
        try {
          const supabase = getSupabaseClient();
          await supabase.auth.signOut({ scope: 'global' });
        } catch { /* ignore */ }
        set({ user: null, error: null });
      },

      refreshUser: async () => {
        try {
          const supabase = getSupabaseClient();
          const { data: { user: authUser } } = await supabase.auth.getUser();

          if (authUser) {
            await supabase.rpc('sync_my_membership_status');
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", authUser.id)
              .single();
            if (profile) {
              set({ user: mapProfile(profile) });
            }
          } else {
            set({ user: null });
          }
        } catch { /* keep current */ }
      },
    }),
    {
      name: "edu-tutor-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
