"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

import { useAuth } from "../context/auth-context";
import { buildLoginHref, getHomePathForUser } from "../lib/routes";
import type { UserRole } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RequireAuthProps {
  children: React.ReactNode;
  /** Si se especifica, el usuario debe tener al menos uno de estos roles. */
  roles?: UserRole[];
  /** Texto mostrado mientras se verifica la sesión. */
  loadingLabel?: string;
}

/**
 * Protege una sección del lado del cliente.
 * - Sin sesión → redirige a /iniciar-sesion?redirect=<ruta actual>.
 * - Con sesión pero sin rol → muestra "Acceso restringido".
 *
 * Nota: la autorización real la aplica el backend (Spring Security);
 * este guard solo mejora la experiencia de usuario.
 */
export function RequireAuth({ children, roles, loadingLabel = "Verificando tu sesión..." }: RequireAuthProps) {
  const { user, status, hasAnyRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(buildLoginHref(pathname));
    }
  }, [status, router, pathname]);

  if (status !== "authenticated" || !user) {
    return <FullPageLoader label={status === "unauthenticated" ? "Redirigiendo al inicio de sesión..." : loadingLabel} />;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <AccessDenied homeHref={getHomePathForUser(user)} />;
  }

  return <>{children}</>;
}

export function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function AccessDenied({ homeHref }: { homeHref: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Acceso restringido</CardTitle>
          <CardDescription>
            Tu cuenta no tiene permisos para ver esta sección. Si crees que es un error, contacta al
            administrador del negocio.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2">
          <Button asChild>
            <Link href={homeHref}>Ir a mi panel</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Ir al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

