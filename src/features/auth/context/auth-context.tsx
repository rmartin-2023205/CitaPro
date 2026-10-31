"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, LoginCredentials, RegisterData, UserRole } from "../types";
import { loginApi, registerApi, logoutApi, getMeApi } from "../api/auth-api";
import { SESSION_EXPIRED_EVENT } from "@/lib/api-client";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  /** `true` solo durante la verificación inicial de la sesión (no durante login/logout). */
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [sessionExpired, setSessionExpired] = useState(false);

  const applyUser = useCallback((next: User | null) => {
    setUser(next);
    setStatus(next ? "authenticated" : "unauthenticated");
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getMeApi();
      applyUser(currentUser);
      return currentUser;
    } catch {
      // No hay sesión activa o backend desconectado
      applyUser(null);
      return null;
    }
  }, [applyUser]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    function handleSessionExpired() {
      setUser((prevUser) => {
        if (prevUser) {
          setSessionExpired(true);
          toast.warning("Tu sesión ha expirado", {
            id: "session-expired",
            description: "Por seguridad, inicia sesión nuevamente para continuar.",
          });
        }
        return null;
      });
      setStatus("unauthenticated");
      queryClient.clear();
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [queryClient]);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<User> => {
      const loggedUser = await loginApi(credentials);
      queryClient.clear();
      applyUser(loggedUser);
      setSessionExpired(false);
      return loggedUser;
    },
    [applyUser, queryClient]
  );

  const register = useCallback(
    async (data: RegisterData): Promise<User> => {
      const registeredUser = await registerApi(data);
      queryClient.clear();
      applyUser(registeredUser);
      setSessionExpired(false);
      return registeredUser;
    },
    [applyUser, queryClient]
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutApi().catch(() => {});
    applyUser(null);
    setSessionExpired(false);
    queryClient.clear();
  }, [applyUser, queryClient]);

  const value = useMemo<AuthContextType>(() => {
    const hasRole = (role: UserRole) => !!user?.roles.includes(role);
    return {
      user,
      status,
      isLoading: status === "loading",
      isAuthenticated: status === "authenticated" && !!user,
      sessionExpired,
      clearSessionExpired,
      login,
      register,
      logout,
      refreshUser,
      hasRole,
      hasAnyRole: (roles) => roles.some(hasRole),
    };
  }, [user, status, sessionExpired, clearSessionExpired, login, register, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
