"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Phone,
  RefreshCw,
  UserX,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/features/auth/context/auth-context";
import {
  useProfessionalAgenda,
  useProfessionalProfile,
  useUpdateAgendaStatus,
} from "@/features/professional/hooks/use-agenda";
import {
  APPOINTMENT_STATUS_META,
  AppointmentStatusBadge,
} from "@/features/appointments/components/appointment-status-badge";
import type { AppointmentStatus } from "@/types";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatPrice, formatTime, getInitials } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabRange = "today" | "tomorrow" | "week" | "all";

export default function ProfessionalAgendaPage() {
  const { user } = useAuth();
  const profileQuery = useProfessionalProfile();
  const agendaQuery = useProfessionalAgenda();
  const updateStatus = useUpdateAgendaStatus();

  const [activeTab, setActiveTab] = React.useState<TabRange>("today");

  const profile = profileQuery.data;
  const agenda = React.useMemo(() => agendaQuery.data ?? [], [agendaQuery.data]);

  const filteredAppointments = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return agenda.filter((appt) => {
      const d = new Date(appt.startAt);
      if (activeTab === "today") return d >= today && d <= endOfToday;
      if (activeTab === "tomorrow") return d >= tomorrow && d <= endOfTomorrow;
      if (activeTab === "week") return d >= today && d <= endOfWeek;
      return true;
    });
  }, [agenda, activeTab]);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Cita marcada como ${APPOINTMENT_STATUS_META[status].label.toLowerCase()}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al actualizar el estado de la cita"));
    }
  };

  const displayName = profile?.displayName || user?.fullName || "Especialista";

  return (
    <div className="space-y-6">
      {/* Cabecera del especialista */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-base">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <Badge variant="success" className="mb-1">
                Agenda de especialista
              </Badge>
              <h1 className="text-xl font-semibold tracking-tight">{displayName}</h1>
              <p className="text-xs text-muted-foreground">
                {profile?.services?.map((s) => s.name).join(" · ") || "Servicios asignados"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => agendaQuery.refetch()}
            loading={agendaQuery.isFetching}
          >
            {!agendaQuery.isFetching && <RefreshCw />}
            Actualizar agenda
          </Button>
        </CardContent>
      </Card>

      {agendaQuery.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(agendaQuery.error, "Error al cargar la agenda.")}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabRange)}>
        <TabsList>
          <TabsTrigger value="today">Hoy</TabsTrigger>
          <TabsTrigger value="tomorrow">Mañana</TabsTrigger>
          <TabsTrigger value="week">Esta semana</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>
      </Tabs>

      {agendaQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <EmptyState
            icon={Calendar}
            title="Sin citas en este periodo"
            description="No tienes citas asignadas para la vista seleccionada."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appt) => {
            const isUpdating =
              updateStatus.isPending && updateStatus.variables?.id === appt.id;
            const canMutate =
              appt.status !== "COMPLETED" && appt.status !== "CANCELLED";

            return (
              <Card key={appt.id}>
                <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge variant="info" className="px-2.5 py-1 text-sm font-semibold">
                        <Clock />
                        {formatTime(appt.startAt)}
                      </Badge>
                      <span className="text-xs font-medium capitalize text-muted-foreground">
                        {formatDate(appt.startAt, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                      <AppointmentStatusBadge status={appt.status} />
                    </div>

                    <div>
                      <h3 className="text-base font-semibold">{appt.serviceName}</h3>
                      <p className="text-xs text-muted-foreground">
                        Duración estimada: {appt.durationMinutes} min · Tarifa:{" "}
                        {formatPrice(Number(appt.priceAtBooking))}
                      </p>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Cliente: {appt.clientName || "Sin nombre registrado"}
                      </span>
                      {appt.clientPhone && (
                        <a
                          href={`tel:${appt.clientPhone}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {appt.clientPhone}
                        </a>
                      )}
                      {appt.clientEmail && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {appt.clientEmail}
                        </span>
                      )}
                    </div>

                    {appt.notes && (
                      <Alert variant="warning" className="py-2">
                        <FileText className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          <span className="font-semibold">Nota del cliente: </span>
                          {appt.notes}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {canMutate && (
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:w-44 md:flex-col">
                      <Button
                        variant="success"
                        size="sm"
                        loading={isUpdating}
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                      >
                        <CheckCircle2 /> Completada
                      </Button>

                      {appt.status !== "NO_SHOW" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(appt.id, "NO_SHOW")}
                        >
                          <UserX /> No se presentó
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                        className="text-destructive hover:text-destructive"
                      >
                        <XCircle /> Cancelar cita
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
