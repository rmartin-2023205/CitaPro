"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";

import { useAuth } from "@/features/auth/context/auth-context";
import { buildLoginHref } from "@/features/auth/lib/routes";
import {
  useAvailability,
  useCreateAppointment,
  usePublicProfessionals,
  usePublicServices,
} from "@/features/appointments/hooks/use-appointments";
import type { Appointment, Service, TimeSlot } from "@/types";
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { cn, formatPrice, getInitials } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const STEPS = [
  { num: 1, label: "Servicio" },
  { num: 2, label: "Profesional" },
  { num: 3, label: "Fecha y hora" },
  { num: 4, label: "Confirmación" },
] as const;

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("serviceId");
  const { isAuthenticated } = useAuth();

  const servicesQuery = usePublicServices();
  const prosQuery = usePublicProfessionals();
  const createAppointment = useCreateAppointment();

  const [step, setStep] = React.useState<number>(1);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = React.useState<string>("ANY");
  const [selectedDate, setSelectedDate] = React.useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlot | null>(null);
  const [notes, setNotes] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = React.useState<Appointment | null>(null);

  const services = React.useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const professionals = React.useMemo(() => prosQuery.data ?? [], [prosQuery.data]);
  const isLoadingCatalog = servicesQuery.isLoading || prosQuery.isLoading;

  // Preselección por query param
  React.useEffect(() => {
    if (preselectedServiceId && services.length > 0 && !selectedService) {
      const found = services.find((s) => s.id === preselectedServiceId);
      if (found) {
        setSelectedService(found);
        setStep(2);
      }
    }
  }, [preselectedServiceId, services, selectedService]);

  const availabilityQuery = useAvailability({
    serviceId: step === 3 && selectedService ? selectedService.id : undefined,
    professionalId: selectedProfessionalId === "ANY" ? undefined : selectedProfessionalId,
    date: step === 3 ? selectedDate : undefined,
  });

  const availableSlots = availabilityQuery.data?.slots ?? [];

  const professionalsForService = selectedService
    ? professionals.filter((p) => p.services.some((s) => s.id === selectedService.id))
    : [];

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      router.push(buildLoginHref("/reservar"));
      return;
    }
    if (!selectedService || !selectedSlot) return;

    setErrorMessage(null);
    try {
      const result = await createAppointment.mutateAsync({
        serviceId: selectedService.id,
        professionalId: selectedSlot.professionalId,
        startAt: selectedSlot.startAt,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      setBookedAppointment(result);
      setStep(5);
      toast.success("¡Tu cita ha sido agendada!");
    } catch (err) {
      if (err instanceof ApiError && err.isConflict) {
        setErrorMessage(
          "El horario seleccionado acaba de ser reservado por otro cliente. Por favor regresa al paso anterior y selecciona otro horario disponible."
        );
      } else {
        setErrorMessage(
          getErrorMessage(err, "Ocurrió un error al confirmar la cita. Intenta de nuevo.")
        );
      }
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // Paso 5: Éxito
  if (step === 5 && bookedAppointment) {
    return (
      <Card className="mx-auto my-8 max-w-2xl text-center">
        <CardHeader className="items-center space-y-3 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <Badge variant="success">Reserva confirmada exitosamente</Badge>
          <CardTitle className="text-2xl sm:text-3xl">¡Tu cita ha sido agendada!</CardTitle>
          <CardDescription>
            Hemos reservado tu espacio en el sistema. Te esperamos puntualmente.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-xl border bg-muted/40 p-6 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Servicio:</span>
              <span className="font-semibold">{selectedService?.name}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Especialista:</span>
              <span className="font-semibold">{selectedSlot?.professionalName}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha y horario:</span>
              <span className="font-semibold text-primary">
                {selectedDate} ({selectedSlot?.formattedTime})
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total a pagar:</span>
              <span className="font-bold">{formatPrice(bookedAppointment.priceAtBooking)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>ID de referencia:</span>
              <span className="font-mono">{bookedAppointment.id.slice(0, 8)}</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/mi-cuenta/citas">
                <CalendarCheck2 /> Ver mis citas
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-6">
        <PageHeader
          title="Reservar una cita"
          description="Sigue los pasos para elegir tu servicio y apartar tu horario garantizado."
        />

        {/* Stepper */}
        <ol className="grid grid-cols-4 gap-2" aria-label="Pasos de reserva">
          {STEPS.map((s) => {
            const active = step === s.num;
            const done = step > s.num;
            return (
              <li
                key={s.num}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-colors",
                  active && "border-primary bg-primary/5 text-primary shadow-sm",
                  done && "border-border bg-muted/50 text-foreground",
                  !active && !done && "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    active && "bg-primary text-primary-foreground",
                    done && "bg-foreground text-background",
                    !active && !done && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : s.num}
                </span>
                <span className="hidden truncate sm:inline">{s.label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {(errorMessage || servicesQuery.error || availabilityQuery.error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage ||
              getErrorMessage(
                servicesQuery.error || availabilityQuery.error,
                "Error al consultar el servidor."
              )}
            {errorMessage?.includes("acaba de ser reservado") && (
              <Button
                variant="link"
                size="sm"
                className="ml-2 h-auto p-0 text-destructive underline"
                onClick={() => setStep(3)}
              >
                Volver al selector de horarios
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* PASO 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">1. Selecciona el servicio deseado</h2>

          {isLoadingCatalog ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {services.map((svc) => {
                const selected = selectedService?.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      setSelectedService(svc);
                      setStep(2);
                    }}
                    className={cn(
                      "flex flex-col justify-between rounded-xl border bg-card p-5 text-left transition hover:border-primary/50 hover:shadow-sm",
                      selected && "border-primary bg-primary/5 ring-2 ring-primary/30"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{svc.name}</h3>
                        <span className="font-bold text-primary">{formatPrice(svc.price)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {svc.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {svc.durationMinutes} minutos de atención
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PASO 2 */}
      {step === 2 && selectedService && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">2. ¿Quién te gustaría que te atienda?</h2>
            <Button variant="link" size="sm" onClick={() => setStep(1)}>
              Cambiar servicio ({selectedService.name})
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => {
                setSelectedProfessionalId("ANY");
                setStep(3);
              }}
              className={cn(
                "rounded-xl border bg-card p-5 text-left transition hover:border-primary/50 hover:shadow-sm",
                selectedProfessionalId === "ANY" &&
                  "border-primary bg-primary/5 ring-2 ring-primary/30"
              )}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">Cualquiera disponible</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Te asignaremos el primer horario libre de cualquier especialista.
              </p>
            </button>

            {professionalsForService.map((pro) => (
              <button
                key={pro.id}
                type="button"
                onClick={() => {
                  setSelectedProfessionalId(pro.id);
                  setStep(3);
                }}
                className={cn(
                  "rounded-xl border bg-card p-5 text-left transition hover:border-primary/50 hover:shadow-sm",
                  selectedProfessionalId === pro.id &&
                    "border-primary bg-primary/5 ring-2 ring-primary/30"
                )}
              >
                <Avatar className="mb-3 h-10 w-10">
                  <AvatarFallback>{getInitials(pro.displayName)}</AvatarFallback>
                </Avatar>
                <h3 className="text-sm font-semibold">{pro.displayName}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{pro.bio}</p>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              <ChevronLeft /> Atrás
            </Button>
          </div>
        </div>
      )}

      {/* PASO 3 */}
      {step === 3 && selectedService && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold">3. Elige la fecha y el horario disponible</h2>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Disponibilidad calculada en tiempo real
            </span>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-4 sm:flex-row">
              <Label htmlFor="booking-date" className="flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="h-4 w-4 text-primary" />
                Fecha de la cita:
              </Label>
              <Input
                id="booking-date"
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="w-full sm:w-52"
              />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Horarios disponibles para el {selectedDate}
            </h3>

            {availabilityQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Clock}
                  title="Sin horarios disponibles"
                  description="No hay espacios libres en la fecha seleccionada. Por favor elige otro día."
                />
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {availableSlots.map((slot, index) => {
                  const isSelected =
                    selectedSlot?.startAt === slot.startAt &&
                    selectedSlot?.professionalId === slot.professionalId;
                  return (
                    <button
                      key={`${slot.professionalId}-${slot.startAt}-${index}`}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border p-3 text-center transition",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/40"
                          : "bg-card hover:border-primary/50 hover:bg-accent"
                      )}
                    >
                      <span className="text-sm font-semibold">{slot.formattedTime}</span>
                      <span
                        className={cn(
                          "mt-0.5 text-[11px]",
                          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}
                      >
                        {slot.professionalName}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <ChevronLeft /> Atrás
            </Button>
            <Button disabled={!selectedSlot} onClick={() => setStep(4)}>
              Continuar a confirmación
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      {/* PASO 4 */}
      {step === 4 && selectedService && selectedSlot && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">4. Confirmación de reserva</h2>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">Resumen de tu cita</CardTitle>
                <CardDescription>Revisa los detalles antes de agendar</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl border bg-muted/40 p-4">
                  <span className="block text-xs font-medium text-muted-foreground">Servicio</span>
                  <span className="mt-1 block font-semibold">{selectedService.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Duración: {selectedService.durationMinutes} min
                  </span>
                </div>

                <div className="rounded-xl border bg-muted/40 p-4">
                  <span className="block text-xs font-medium text-muted-foreground">
                    Especialista
                  </span>
                  <span className="mt-1 block font-semibold">{selectedSlot.professionalName}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Atención personalizada
                  </span>
                </div>

                <div className="rounded-xl border bg-muted/40 p-4">
                  <span className="block text-xs font-medium text-muted-foreground">
                    Fecha y horario
                  </span>
                  <span className="mt-1 block font-semibold">{selectedDate}</span>
                  <span className="mt-1 block text-xs font-semibold text-primary">
                    {selectedSlot.formattedTime}
                  </span>
                </div>

                <div className="rounded-xl border bg-muted/40 p-4">
                  <span className="block text-xs font-medium text-muted-foreground">
                    Total a pagar
                  </span>
                  <span className="mt-1 block text-lg font-bold text-primary">
                    {formatPrice(selectedService.price)}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    Precio garantizado en el momento de la reserva
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-notes">
                  Instrucciones o notas adicionales (opcional):
                </Label>
                <Textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ejemplo: Si es posible añadir diseño en la barba..."
                  maxLength={500}
                  rows={2}
                />
              </div>

              {!isAuthenticated ? (
                <Alert variant="warning" className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <AlertDescription>
                      Para completar la reserva necesitas iniciar sesión o crear tu cuenta.
                    </AlertDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(buildLoginHref("/reservar"))}
                  >
                    Iniciar sesión
                  </Button>
                </Alert>
              ) : (
                <Button
                  size="xl"
                  className="w-full"
                  loading={createAppointment.isPending}
                  onClick={handleConfirmBooking}
                >
                  Confirmar y agendar cita
                  <ArrowRight />
                </Button>
              )}
            </CardContent>
          </Card>

          <Button variant="ghost" onClick={() => setStep(3)}>
            <ChevronLeft /> Cambiar horario
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
