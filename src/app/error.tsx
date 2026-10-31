"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error de aplicación:", error);
  }, [error]);

  return (
    <div role="alert" className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Ocurrió un problema inesperado</CardTitle>
          <CardDescription>
            No pudimos procesar esta vista en este momento. Puedes intentar recargar la sección o
            regresar a la página principal.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-2.5">
          <Button onClick={() => reset()}>
            <RotateCcw /> Intentar de nuevo
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home /> Volver al inicio
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
