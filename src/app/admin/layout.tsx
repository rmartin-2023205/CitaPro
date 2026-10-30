"use client";

import { useAuth } from "@/features/auth/context/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Clock,
  ArrowLeft,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import React from "react";

const navigationItems = [
  { name: "Métricas y Resumen", href: "/admin", icon: LayoutDashboard },
  { name: "Control de Citas", href: "/admin/citas", icon: Calendar },
  { name: "Servicios", href: "/admin/servicios", icon: Scissors },
  { name: "Especialistas", href: "/admin/profesionales", icon: Users },
  { name: "Bloqueos y Descansos", href: "/admin/horarios", icon: Clock },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, hasRole, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Verificando permisos de administración...</p>
      </div>
    );
  }

  if (!isAuthenticated || !hasRole("ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-xl shadow-sm border border-red-100 text-center">
        <div className="h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Restringido</h2>
        <p className="text-sm text-slate-600 mb-6">
          Esta sección requiere permisos de Administrador del negocio. Si consideras que esto es un error, inicia sesión con la cuenta autorizada.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/iniciar-sesion"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
          >
            Ir al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar de administración */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              Panel Admin
            </span>
            <h2 className="font-bold text-slate-800 text-lg mt-1">CitaPro Control</h2>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
        </div>
      </aside>

      {/* Contenido principal del panel */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
