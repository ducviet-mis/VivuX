"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getSessionIdFromAccessToken, SESSION_REPLACED_QUERY } from "@/lib/auth/single-session";
import { rememberAccount } from "../lib/remembered-accounts";
import type { User } from "../types";

export type RegisterResult = {
  success: boolean;
  requiresEmailConfirmation: boolean;
  email?: string;
};

function getEmailRedirectUrl() {
  return typeof window === 'undefined' ? undefined : `${window.location.origin}/home`;
}

function getOAuthRedirectUrl() {
  return typeof window === 'undefined'
    ? undefined
    : `${window.location.origin}/auth/callback?next=/home`;
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
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<RegisterResult>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkActiveSession: () => Promise<boolean>;
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

type SessionRegistrationStatus = "active" | "replaced" | "unavailable";
type SetAuthState = (state: Partial<AuthState>) => void;

let forcedLogoutInProgress = false;

async function registerCurrentSession(
  accessToken: string | null | undefined,
  replace: boolean,
): Promise<SessionRegistrationStatus> {
  const sessionId = getSessionIdFromAccessToken(accessToken);
  if (!sessionId) return "unavailable";

  const { data, error } = await getSupabaseClient().rpc("register_current_session", {
    p_session_id: sessionId,
    p_replace: replace,
  });

  // Giữ đăng nhập hoạt động nếu quản trị viên chưa chạy migration SQL.
  // Sau khi migration được chạy, RPC là nguồn xác thực phiên duy nhất.
  if (error) {
    console.warn("Single-session check is unavailable:", error.message);
    return "unavailable";
  }

  return data && typeof data === "object" && "active" in data && data.active === false
    ? "replaced"
    : "active";
}

async function endReplacedSession(set: SetAuthState) {
  if (forcedLogoutInProgress) return;
  forcedLogoutInProgress = true;

  set({ user: null, error: null, initialized: true, isLoading: false });
  try {
    await getSupabaseClient().auth.signOut({ scope: "local" });
  } catch {
    // Việc chuyển về trang đăng nhập vẫn phải diễn ra nếu Supabase tạm lỗi.
  }

  if (typeof window !== "undefined") {
    window.location.replace(`/login?${SESSION_REPLACED_QUERY}=1`);
  }
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
            const sessionStatus = await registerCurrentSession(session.access_token, false);
            if (sessionStatus === "replaced") {
              await endReplacedSession(set);
              return;
            }

            await supabase.rpc('sync_my_membership_status');
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profile) {
              const mappedUser = mapProfile(profile);
              rememberAccount(mappedUser);
              set({ user: mappedUser, initialized: true });
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
                const mappedUser = mapProfile(profile);
                rememberAccount(mappedUser);
                set({ user: mappedUser });
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
            if (data.session) {
              await registerCurrentSession(data.session.access_token, true);
              // Thu hồi refresh token của các thiết bị cũ nhưng giữ phiên hiện tại.
              await supabase.auth.signOut({ scope: "others" });
            }

            await supabase.rpc('sync_my_membership_status');
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

            if (profile) {
              const mappedUser = mapProfile(profile);
              rememberAccount(mappedUser);
              set({ user: mappedUser, isLoading: false, initialized: true });
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

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const redirectTo = getOAuthRedirectUrl();
          if (!redirectTo) {
            set({ error: 'Không thể mở đăng nhập Google trên thiết bị này.', isLoading: false });
            return false;
          }

          const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo,
              skipBrowserRedirect: true,
              queryParams: { prompt: 'select_account' },
            },
          });

          if (error || !data.url) {
            set({ error: translateAuthError(error?.message), isLoading: false });
            return false;
          }

          window.location.assign(data.url);
          return true;
        } catch {
          set({ error: 'Không thể kết nối với Google. Vui lòng thử lại.', isLoading: false });
          return false;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
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

            await registerCurrentSession(data.session.access_token, true);

            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .maybeSingle();

            const signedInUser: User = profile ? mapProfile(profile) : {
                id: data.user.id,
                name, email,
                accountTier: 'flygo',
                referralRewardDays: 0,
                referralDiscountPercent: 0,
                referralEligibleUntil: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
              };
            rememberAccount(signedInUser);
            set({
              user: signedInUser,
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
          const { data: { session } } = await supabase.auth.getSession();
          const sessionId = getSessionIdFromAccessToken(session?.access_token);
          if (sessionId) {
            await supabase.rpc("release_current_session", { p_session_id: sessionId });
          }
          await supabase.auth.signOut();
        } catch { /* ignore */ }
        set({ user: null, error: null });
      },

      logoutAllDevices: async () => {
        try {
          const supabase = getSupabaseClient();
          await supabase.rpc("clear_my_active_session");
          await supabase.auth.signOut({ scope: 'global' });
        } catch { /* ignore */ }
        set({ user: null, error: null });
      },

      checkActiveSession: async () => {
        try {
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();

          if (!session?.user) {
            set({ user: null });
            return false;
          }

          const sessionStatus = await registerCurrentSession(session.access_token, false);
          if (sessionStatus === "replaced") {
            await endReplacedSession(set);
            return false;
          }

          return true;
        } catch {
          // Không đăng xuất người học chỉ vì mạng chập chờn hoặc RPC tạm lỗi.
          return true;
        }
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
              const mappedUser = mapProfile(profile);
              rememberAccount(mappedUser);
              set({ user: mappedUser });
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
