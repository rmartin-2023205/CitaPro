"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "./user-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Si es true, solo se marca activo con coincidencia exacta. */
  exact?: boolean;
}

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: DashboardNavItem[];
  /** Etiqueta del área, p. ej. "Administración". */
  areaLabel: string;
}

function SidebarNav({ items, onNavigate }: { items: DashboardNavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Navegación del panel">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({
  navItems,
  areaLabel,
  onNavigate,
}: Omit<DashboardShellProps, "children"> & { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-4">
        <Logo />
        <Badge variant="info" className="ml-auto">
          {areaLabel}
        </Badge>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav items={navItems} onNavigate={onNavigate} />
      </div>
      <Separator />
      <div className="p-3">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
          <Link href="/" onClick={onNavigate}>
            <ArrowLeft /> Volver al sitio
          </Link>
        </Button>
      </div>
    </div>
  );
}

/** Layout con barra lateral para los paneles de administración y profesional. */
export function DashboardShell({ children, navItems, areaLabel }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const current = navItems.find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)));

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block">
        <SidebarContent navItems={navItems} areaLabel={areaLabel} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
                <Menu />
              </Button>
            </DialogTrigger>
            <DialogContent className="left-0 top-0 h-full max-h-screen w-72 max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-r p-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100">
              <DialogTitle className="sr-only">Menú de navegación</DialogTitle>
              <SidebarContent
                navItems={navItems}
                areaLabel={areaLabel}
                onNavigate={() => setMobileOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {areaLabel}
              {current && (
                <>
                  <span className="mx-1.5 text-border">/</span>
                  <span className="text-foreground">{current.label}</span>
                </>
              )}
            </p>
          </div>

          <ThemeToggle />
          <UserMenu />
        </header>

        <main id="main-content" className="flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

