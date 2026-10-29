"use client";

import { useAuth } from "@/features/auth/context/auth-context";
import Link from "next/link";
import { User, Mail, Phone, Shield, Scissors, UserCheck, Calendar, LogOut, ArrowRight } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-40 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <div className="h-12 w-12 bg-slate-100 text-slate-500 rounded-full mx-auto flex items-center justify-center mb-4">
          <User className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No has iniciado sesión</h2>
        <p className="text-sm text-slate-500 mb-6">
          Inicia sesión para consultar tu información y gestionar tus citas.
        </p>
        <Link
          href="/iniciar-sesion"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Ir a Iniciar Sesión
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-200"
          >
            <Shield className="h-3 w-3" />
            Administrador
          </span>
        );
      case "PROFESSIONAL":
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200"
          >
            <Scissors className="h-3 w-3" />
            Profesional de Servicios
          </span>
        );
      default:
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200"
          >
            <UserCheck className="h-3 w-3" />
            Cliente
          </span>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mi Perfil</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestiona tus datos personales y credenciales de acceso.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-600 text-white font-bold text-2xl rounded-2xl flex items-center justify-center shadow-md">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.fullName}</h2>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {user.roles.map((role) => getRoleBadge(role))}
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-lg transition flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar Sesión
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Correo Electrónico</span>
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <Mail className="h-4 w-4 text-slate-500" />
              {user.email}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Teléfono</span>
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <Phone className="h-4 w-4 text-slate-500" />
              {user.phone || "No especificado"}
            </div>
          </div>
        </div>

        {/* Accesos rápidos según rol */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Acciones Rápidas
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/reservar"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              <Calendar className="h-4 w-4" />
              Agendar Nueva Cita
            </Link>

            {user.roles.includes("ADMIN") && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
              >
                <Shield className="h-4 w-4" />
                Ir al Panel Admin
              </Link>
            )}

            {user.roles.includes("PROFESSIONAL") && (
              <Link
                href="/profesional/agenda"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
              >
                <Scissors className="h-4 w-4" />
                Ir a Mi Agenda
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

