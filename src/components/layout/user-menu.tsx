"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, LayoutDashboard, LogOut, Scissors, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/context/auth-context";
import { ROLE_LABELS } from "@/features/auth/lib/routes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

export function UserMenu({ align = "end" }: { align?: "start" | "end" }) {
  const { user, logout, hasRole } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada", { description: "¡Hasta pronto!" });
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:pr-3" aria-label="Menú de usuario">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[8rem] truncate text-sm font-medium md:inline">
            {user.fullName.split(" ")[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="truncate text-sm font-semibold">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              {user.roles.map((r) => ROLE_LABELS[r]).join(" · ")}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {hasRole("ADMIN") && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <LayoutDashboard /> Panel de administración
              </Link>
            </DropdownMenuItem>
          )}
          {hasRole("PROFESSIONAL") && (
            <DropdownMenuItem asChild>
              <Link href="/profesional/agenda">
                <Scissors /> Mi agenda profesional
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/mi-cuenta/citas">
              <CalendarDays /> Mis citas
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/mi-cuenta/perfil">
              <UserRound /> Mi perfil
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

