"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, LoginCredentials, RegisterData, UserRole } from "../types";
import { loginApi, registerApi, logoutApi, getMeApi } from "../api/auth-api";
import { SESSION_EXPIRED_EVENT } from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await getMeApi();
        setUser(currentUser);
      } catch {
        // No hay sesión activa o backend desconectado
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      setUser((prevUser) => {
        if (prevUser) {
          setSessionExpired(true);
        }
        return null;
      });
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  const clearSessionExpired = () => setSessionExpired(false);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedUser = await loginApi(credentials);
      setUser(loggedUser);
      setSessionExpired(false);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    setIsLoading(true);
    try {
      const registeredUser = await registerApi(data);
      setUser(registeredUser);
      setSessionExpired(false);
      return registeredUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutApi().catch(() => {});
      setUser(null);
      setSessionExpired(false);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        sessionExpired,
        clearSessionExpired,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {sessionExpired && (
        <div
          role="alert"
          className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm text-amber-900 flex items-center justify-center gap-3"
        >
          <span>Tu sesión ha expirado por inactividad. Por favor inicia sesión nuevamente.</span>
          <button
            type="button"
            onClick={clearSessionExpired}
            className="text-xs font-semibold underline hover:text-amber-700"
          >
            Cerrar aviso
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
