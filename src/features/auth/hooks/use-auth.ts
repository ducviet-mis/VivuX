"use client";

import { useAuthStore } from "../stores/auth-store";
import { useEffect } from "react";

export function useAuth() {
  const { user, isLoading, error, login, register, logout, refreshUser, clearError } = useAuthStore();

  useEffect(() => {
    // Refresh user data on mount (sync with Supabase session)
    refreshUser();
  }, [refreshUser]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    isLoggedIn: !!user,
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
  };
}
