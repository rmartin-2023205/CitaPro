"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertCircle, Calendar, CalendarX2, Clock, Plus, Scissors } from "lucide-react";

import {
  useCancelAppointment,
  useMyAppointments,
} from "@/features/appointments/hooks/use-appointments";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import type { Appointment } from "@/types";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatPrice, formatTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function MyAppointmentsPage() {
  const appointmentsQuery = useMyAppointments();
  const cancelMutation = useCancelAppointment();

  const [activeTab, setActiveTab] = React.useState<"UPCOMING" | "PAST">("UPCOMING");
  const [cancellingAppointment, setCancellingAppointment] = React.useState<Appointment | null>(
    null
  );
  const [cancelReason, setCancelReason] = React.useState("");

  const appointments = appointmentsQuery.data ?? [];
  const now = new Date();

  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.startAt) > now && a.status !== "CANCELLED"
  );
  const pastAppointments = appointments.filter(
    (a) => new Date(a.startAt) <= now || a.status === "CANCELLED"
  );
  const displayedAppointments =
    activeTab === "UPCOMING" ? upcomingAppointments : pastAppointments;

  const handleCancelConfirm = async () => {
    if (!cancellingAppointment) return;
    try {
      await cancelMutation.mutateAsync({
        id: cancellingAppointment.id,
        reason: cancelReason || undefined,
      });
      toast.success("Cita cancelada exitosamente", {
        description: "El horario vuelve a estar disponible en la agenda.",
      });
      setCancellingAppointment(null);
      setCancelReason("");
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "No se pudo cancelar la cita. Verifica que falten más de 2 horas."
        )
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Mis citas"
        description="Consulta tus citas reservadas, historial y cancelaciones."
        actions={
          <Button asChild>
            <Link href="/reservar">
              <Plus /> Agendar nueva cita
            </Link>
          </Button>
        }
      />

      {appointmentsQuery.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(appointmentsQuery.error, "Error al cargar tus citas.")}
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "UPCOMING" | "PAST")}
      >
        <TabsList>
          <TabsTrigger value="UPCOMING">
            Próximas citas ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="PAST">
            Historial y canceladas ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {appointmentsQuery.isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : displayedAppointments.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarX2}
            title={
              activeTab === "UPCOMING"
                ? "No tienes citas próximas agendadas"
                : "No tienes citas pasadas registradas"
            }
            description={
              activeTab === "UPCOMING"
                ? "Elige uno de nuestros servicios y agenda tu horario en cuestión de minutos."
                : "Tus citas completadas y canceladas aparecerán aquí como historial."
            }
            action={
              activeTab === "UPCOMING" ? (
                <Button asChild size="sm">
                  <Link href="/reservar">
                    <Plus /> Agendar una cita ahora
                  </Link>
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-semibold">
                      {appointment.serviceName || "Servicio"}
                    </h3>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="capitalize">
                        {formatDate(appointment.startAt, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Clock className="h-4 w-4 text-primary" />
                      {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
                    </span>

                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Scissors className="h-4 w-4" />
                      {appointment.professionalName || "Especialista"}
                    </span>
                  </div>

                  {appointment.notes && (
                    <p className="max-w-lg rounded-lg border bg-muted/40 p-2 text-xs italic text-muted-foreground">
                      Nota: &ldquo;{appointment.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex w-full flex-col items-end justify-between gap-4 border-t pt-3 sm:flex-row md:w-auto md:items-center md:border-t-0 md:pt-0">
                  <div className="text-right">
                    <span className="block text-[11px] text-muted-foreground">
                      Precio acordado
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(appointment.priceAtBooking)}
                    </span>
                  </div>

                  {appointment.status === "CONFIRMED" && (
                    <div>
                      {appointment.canCancel ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancellingAppointment(appointment)}
                          className="text-destructive hover:text-destructive"
                        >
                          Cancelar cita
                        </Button>
                      ) : (
                        <Badge
                          variant="secondary"
                          title="Solo se puede cancelar con al menos 2 horas de anticipación"
                        >
                          Menos de 2h (contáctanos)
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de cancelación */}
      <Dialog
        open={Boolean(cancellingAppointment)}
        onOpenChange={(open) => {
          if (!open) {
            setCancellingAppointment(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Deseas cancelar esta cita?</DialogTitle>
            <DialogDescription>
              Tu cita para{" "}
              <span className="font-semibold text-foreground">
                {cancellingAppointment?.serviceName}
              </span>{" "}
              será liberada y quedará disponible para otros clientes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason">Motivo de la cancelación (opcional):</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ejemplo: Imprevisto laboral o cambio de horario..."
                maxLength={250}
                rows={2}
              />
            </div>

            <p className="rounded-lg border bg-muted/40 p-2.5 text-xs text-muted-foreground">
              Política: Cancelación permitida hasta 2 horas antes de la cita.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancellingAppointment(null)}>
              Volver
            </Button>
            <Button
              variant="destructive"
              loading={cancelMutation.isPending}
              onClick={handleCancelConfirm}
            >
              Sí, cancelar cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
