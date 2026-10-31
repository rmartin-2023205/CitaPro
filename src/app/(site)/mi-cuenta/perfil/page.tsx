"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, LogOut, Mail, Phone, Scissors, Shield, UserCheck } from "lucide-react";

import { useAuth } from "@/features/auth/context/auth-context";
import { ROLE_LABELS } from "@/features/auth/lib/routes";
import { getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada");
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Mi perfil"
        description="Gestiona tus datos personales y credenciales de acceso."
      />

      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.fullName}</h2>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {user.roles.map((role) => (
                  <Badge
                    key={role}
                    variant={
                      role === "ADMIN"
                        ? "info"
                        : role === "PROFESSIONAL"
                          ? "success"
                          : "secondary"
                    }
                  >
                    {role === "ADMIN" ? (
                      <Shield />
                    ) : role === "PROFESSIONAL" ? (
                      <Scissors />
                    ) : (
                      <UserCheck />
                    )}
                    {ROLE_LABELS[role]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-destructive hover:text-destructive"
          >
            <LogOut /> Cerrar sesión
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl border bg-muted/40 p-4">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Correo electrónico
              </span>
              <div className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user.email}
              </div>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Teléfono</span>
              <div className="flex items-center gap-2 font-medium">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {user.phone || "No especificado"}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Acciones rápidas
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Button asChild size="sm">
                <Link href="/reservar">
                  <Calendar /> Agendar nueva cita
                </Link>
              </Button>

              {user.roles.includes("ADMIN") && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin">
                    <Shield /> Ir al panel admin
                  </Link>
                </Button>
              )}

              {user.roles.includes("PROFESSIONAL") && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/profesional/agenda">
                    <Scissors /> Ir a mi agenda
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
