import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <Logo className="text-foreground" />
        <nav className="flex gap-6" aria-label="Pie de página">
          <Link href="/servicios" className="hover:text-foreground">
            Servicios
          </Link>
          <Link href="/reservar" className="hover:text-foreground">
            Reservar
          </Link>
          <Link href="/mi-cuenta/citas" className="hover:text-foreground">
            Mis citas
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} CitaPro. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

