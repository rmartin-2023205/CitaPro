import Link from "next/link";
import { ArrowLeft, CalendarCheck, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

const HIGHLIGHTS = [
  {
    icon: Clock,
    title: "Disponibilidad en tiempo real",
    description: "Elige servicio, especialista y horario confirmado al instante.",
  },
  {
    icon: ShieldCheck,
    title: "Sin dobles reservas",
    description: "Protección transaccional contra solapamientos de agenda.",
  },
  {
    icon: CheckCircle2,
    title: "Panel unificado por rol",
    description: "Experiencias dedicadas para clientes, profesionales y administración.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca (solo escritorio) */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r bg-slate-950 p-10 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-950 to-slate-950"
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <span className="text-xl">CitaPro</span>
          </Link>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
            Barbería &amp; Spa Central
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">
              Tu agenda bajo control, tus clientes siempre a tiempo.
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Reserva en segundos o administra servicios, especialistas y horarios desde un solo
              lugar.
            </p>
          </div>

          <ul className="space-y-4 pt-2">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-300">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-slate-400">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} CitaPro · Plataforma de gestión de citas
        </p>
      </div>

      {/* Columna del formulario */}
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Logo />
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/">
                <ArrowLeft /> Volver al inicio
              </Link>
            </Button>
          </div>
          <ThemeToggle />
        </header>

        <main
          id="main-content"
          className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8"
        >
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}

