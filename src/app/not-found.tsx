import Link from "next/link";
import { ArrowLeft, CalendarX2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarX2 className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Página no encontrada</CardTitle>
          <CardDescription>
            La ruta que buscas no existe o fue movida. Puedes volver al inicio o explorar nuestro
            catálogo de servicios.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-2.5">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft /> Ir al inicio
            </Link>
          </Button>
          <Button asChild>
            <Link href="/servicios">
              <Sparkles /> Ver servicios
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
