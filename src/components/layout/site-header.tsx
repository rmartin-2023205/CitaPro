"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus } from "lucide-react";

import { useAuth } from "@/features/auth/context/auth-context";
import { buildLoginHref } from "@/features/auth/lib/routes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/servicios", label: "Servicios" },
  { href: "/mi-cuenta/citas", label: "Mis citas", auth: true },
];

export function SiteHeader() {
  const { status } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {NAV_LINKS.filter((l) => !l.auth || status === "authenticated").map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  pathname.startsWith(link.href) && "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/reservar">
              <CalendarPlus /> Reservar cita
            </Link>
          </Button>

          {status === "loading" ? (
            <Skeleton className="h-8 w-24" />
          ) : status === "authenticated" ? (
            <UserMenu />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={buildLoginHref(pathname)}>Iniciar sesión</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href="/registro">Crear cuenta</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

