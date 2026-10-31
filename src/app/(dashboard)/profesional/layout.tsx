"use client";

import { CalendarDays, UserRound } from "lucide-react";

import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { RequireAuth } from "@/features/auth/components/require-auth";

const navItems: DashboardNavItem[] = [
  { label: "Mi agenda", href: "/profesional/agenda", icon: CalendarDays },
  { label: "Mi perfil", href: "/mi-cuenta/perfil", icon: UserRound },
];

export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["PROFESSIONAL", "ADMIN"]} loadingLabel="Cargando tu agenda...">
      <DashboardShell navItems={navItems} areaLabel="Profesional">
        {children}
      </DashboardShell>
    </RequireAuth>
  );
}

