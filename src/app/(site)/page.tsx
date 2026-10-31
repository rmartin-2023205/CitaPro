"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CalendarCheck2,
  CalendarPlus,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Scissors,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/features/auth/context/auth-context";
import { ROLE_LABELS } from "@/features/auth/lib/routes";
import type { User } from "@/features/auth/types";
import {
  useMyAppointments,
  usePublicServices,
} from "@/features/appointments/hooks/use-appointments";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { formatDate, formatPrice, formatTime, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const FEATURES = [
  {
    icon: Calendar,
    title: "Disponibilidad en tiempo real",
    description:
      "Consulta los huecos libres exactos por profesional y servicio sin riesgo de solapamientos.",
  },
  {
    icon: Clock,
    title: "Políticas transparentes",
    description:
      "Cancela y consulta tus citas en línea respetando las reglas de anticipación del negocio.",
  },
  {
    icon: ShieldCheck,
    title: "Panel administrativo y de especialistas",
    description:
      "Control de agenda, catálogo de servicios, descansos y métricas operativas en tiempo real.",
  },
];

function PublicLanding() {
  return (
    <div className="flex flex-col items-center py-10 text-center sm:py-16">
      <Badge variant="info" className="mb-6 gap-1.5 px-3 py-1 text-xs">
        <Sparkles className="h-3.5 w-3.5" />
        Sistema de reservas inteligente
      </Badge>

      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
        Gestiona y reserva tus citas en <span className="text-primary">segundos</span>
      </h1>

      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Olvídate de las agendas manuales y las citas duplicadas. CitaPro garantiza disponibilidad
        en tiempo real para barberías, clínicas y centros profesionales.
      </p>

      <div className="mt-8 flex w-full max-w-md flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="xl">
          <Link href="/reservar">
            Agendar una cita
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline" size="xl">
          <Link href="/servicios">Ver servicios disponibles</Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Confirmación inmediata
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Sin dobles reservas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Cancelación en línea
        </span>
      </div>

      <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-6 text-left md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader className="pb-3">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AuthenticatedHome({ user }: { user: User }) {
  const { hasRole } = useAuth();
  const appointmentsQuery = useMyAppointments();
  const servicesQuery = usePublicServices();

  const appointments = React.useMemo(
    () => appointmentsQuery.data ?? [],
    [appointmentsQuery.data]
  );

  const upcoming = React.useMemo(() => {
    const now = new Date();
    return appointments
      .filter((a) => new Date(a.startAt) > now && a.status !== "CANCELLED")
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [appointments]);

  const completedCount = React.useMemo(
    () => appointments.filter((a) => a.status === "COMPLETED").length,
    [appointments]
  );

  const nextAppointment = upcoming[0];
  const featuredServices = (servicesQuery.data ?? []).slice(0, 3);
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Banner de bienvenida del usuario */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-card">
        <CardContent className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarFallback className="text-lg">{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Sesión activa</Badge>
                {user.roles.map((r) => (
                  <Badge key={r} variant="secondary">
                    {ROLE_LABELS[r]}
                  </Badge>
                ))}
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                ¡Hola, {firstName}! Qué gusto verte en CitaPro
              </h1>
              <p className="text-sm text-muted-foreground">
                Desde tu espacio personal puedes agendar en segundos, revisar tus próximas citas o
                administrar tu cuenta.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild size="lg">
              <Link href="/reservar">
                <CalendarPlus /> Nueva reserva
              </Link>
            </Button>
            {hasRole("ADMIN") && (
              <Button asChild variant="outline" size="lg">
                <Link href="/admin">
                  <LayoutDashboard /> Panel Admin
                </Link>
              </Button>
            )}
            {hasRole("PROFESSIONAL") && (
              <Button asChild variant="outline" size="lg">
                <Link href="/profesional/agenda">
                  <Scissors /> Mi agenda
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumen + Próxima cita */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Tu próxima cita</CardTitle>
              <CardDescription>
                {nextAppointment
                  ? "Tienes una reserva programada próximamente"
                  : "Aún no tienes citas futuras agendadas"}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/mi-cuenta/citas">
                Ver todas <ArrowRight />
              </Link>
            </Button>
          </CardHeader>

          <CardContent>
            {appointmentsQuery.isLoading ? (
              <Skeleton className="h-28 w-full rounded-xl" />
            ) : nextAppointment ? (
              <div className="flex flex-col justify-between gap-4 rounded-xl border bg-muted/30 p-5 sm:flex-row sm:items-center">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold">
                      {nextAppointment.serviceName || "Servicio"}
                    </span>
                    <AppointmentStatusBadge status={nextAppointment.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="capitalize">
                        {formatDate(nextAppointment.startAt, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      {formatTime(nextAppointment.startAt)} - {formatTime(nextAppointment.endAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Scissors className="h-4 w-4" />
                      {nextAppointment.professionalName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(nextAppointment.priceAtBooking)}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/mi-cuenta/citas">Gestionar cita</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-dashed p-6 text-center sm:flex-row sm:text-left">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">No tienes citas próximas</p>
                  <p className="text-xs text-muted-foreground">
                    Elige el servicio y el especialista de tu preferencia con confirmación
                    inmediata.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/reservar">
                    <CalendarPlus /> Agendar ahora
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tarjeta de actividad y accesos rápidos */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base">Resumen de tu cuenta</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-muted/30 p-3.5">
              <span className="text-xs text-muted-foreground">Próximas</span>
              <p className="mt-1 text-2xl font-bold text-primary">{upcoming.length}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3.5">
              <span className="text-xs text-muted-foreground">Completadas</span>
              <p className="mt-1 text-2xl font-bold">{completedCount}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t bg-muted/20 pt-4">
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/mi-cuenta/citas">
                <CalendarCheck2 /> Mis citas e historial
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full justify-start">
              <Link href="/mi-cuenta/perfil">
                <UserRound /> Ver mi perfil
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/*Reserva rápida de servicios populares */}
      {featuredServices.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Reserva rápida</h2>
              <p className="text-xs text-muted-foreground">
                Selecciona un servicio para ir directo a elegir horario
              </p>
            </div>
            <Button asChild variant="link" size="sm">
              <Link href="/servicios">
                Ver catálogo completo <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featuredServices.map((svc) => (
              <Card key={svc.id} className="flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{svc.name}</CardTitle>
                    <span className="font-bold text-primary">{formatPrice(svc.price)}</span>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs">
                    {svc.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="justify-between border-t bg-muted/20 py-3">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {svc.durationMinutes} min
                  </span>
                  <Button asChild size="sm">
                    <Link href={`/reservar?serviceId=${svc.id}`}>Agendar</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function Home() {
  const { user, status } = useAuth();

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-xl lg:col-span-2" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return <AuthenticatedHome user={user} />;
  }

  return <PublicLanding />;
}
