"use client";

import {
  CalendarDays,
  Clock,
  LayoutDashboard,
  Scissors,
  Users,
} from "lucide-react";

import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { RequireAuth } from "@/features/auth/components/require-auth";

const navItems: DashboardNavItem[] = [
  { label: "Resumen", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Citas", href: "/admin/citas", icon: CalendarDays },
  { label: "Servicios", href: "/admin/servicios", icon: Scissors },
  { label: "Especialistas", href: "/admin/profesionales", icon: Users },
  { label: "Bloqueos y descansos", href: "/admin/horarios", icon: Clock },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["ADMIN"]} loadingLabel="Verificando permisos de administración...">
      <DashboardShell navItems={navItems} areaLabel="Administración">
        {children}
      </DashboardShell>
    </RequireAuth>
  );
}
