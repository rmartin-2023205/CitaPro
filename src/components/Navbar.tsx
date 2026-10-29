"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";
import { Calendar, User, Shield, LogOut, Scissors, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-slate-900 tracking-tight">CitaPro</span>
        </Link>

        <nav className="flex items-center space-x-3 sm:space-x-5">
          <Link
            href="/servicios"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Servicios
          </Link>
          <Link
            href="/reservar"
            className="text-sm font-medium bg-blue-600 text-white px-3.5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Reservar Cita
          </Link>

          {/* Menú condicional según estado de autenticación */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 border-l pl-3 sm:pl-5 border-slate-200">
              {hasRole("ADMIN") && (
                <Link
                  href="/admin"
                  className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-md flex items-center gap-1 transition"
                  title="Panel de Administración"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {hasRole("PROFESSIONAL") && (
                <Link
                  href="/profesional/agenda"
                  className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-md flex items-center gap-1 transition"
                  title="Mi Agenda Profesional"
                >
                  <Scissors className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Agenda</span>
                </Link>
              )}

              <Link
                href="/mi-cuenta/perfil"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 flex items-center gap-1.5"
                title="Mi Perfil"
              >
                <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                  {user.fullName.charAt(0)}
                </div>
                <span className="hidden md:inline text-xs">{user.fullName.split(" ")[0]}</span>
              </Link>

              <button
                onClick={() => logout()}
                className="text-slate-400 hover:text-red-600 transition p-1"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 border-l pl-3 sm:pl-5 border-slate-200">
              <Link
                href="/iniciar-sesion"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <User className="h-4 w-4" />
                Acceder
              </Link>
              <Link
                href="/registro"
                className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 rounded-md border border-slate-200 hover:border-blue-400 transition"
              >
                Registrarse
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
