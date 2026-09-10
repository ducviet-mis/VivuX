"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: "teacher" | "student") => Promise<boolean>;
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
              error: error.message === "Invalid login credentials"
                ? "Email hoặc mật khẩu không đúng"
                : error.message,
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
            options: { data: { name, role } },
          });

          if (error) {
            let msg = error.message;
            if (msg.includes("already registered")) msg = "Email này đã được đăng ký";
            else if (msg.includes("Password")) msg = "Mật khẩu phải có ít nhất 6 ký tự";
            set({ error: msg, isLoading: false });
            return false;
          }

          if (data.user) {
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
            return true;
          }

          set({ isLoading: false });
          return false;
        } catch {
          set({ error: "Đã xảy ra lỗi khi đăng ký", isLoading: false });
          return false;
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
