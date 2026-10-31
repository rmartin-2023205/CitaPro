"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  DollarSign,
  RefreshCw,
  UserX,
  Users,
  X,
} from "lucide-react";

import {
  useAdminAppointments,
  useDashboardSummary,
  useUpdateAppointmentStatus,
} from "@/features/admin/hooks/use-admin";
import {
  APPOINTMENT_STATUS_META,
  AppointmentStatusBadge,
} from "@/features/appointments/components/appointment-status-badge";
import type { AppointmentStatus } from "@/types";
import { getErrorMessage } from "@/lib/api-client";
import { formatPrice, formatTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AdminDashboardPage() {
  const todayBounds = React.useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }, []);

  const summaryQuery = useDashboardSummary();
  const apptsQuery = useAdminAppointments(todayBounds);
  const updateStatus = useUpdateAppointmentStatus();

  const isLoading = summaryQuery.isLoading || apptsQuery.isLoading;
  const isFetching = summaryQuery.isFetching || apptsQuery.isFetching;
  const error = summaryQuery.error || apptsQuery.error;
  const summary = summaryQuery.data;
  const todayAppointments = apptsQuery.data ?? [];

  const handleRefresh = () => {
    summaryQuery.refetch();
    apptsQuery.refetch();
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Cita marcada como ${APPOINTMENT_STATUS_META[status].label.toLowerCase()}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al actualizar el estado de la cita"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de control general"
        description="Resumen en tiempo real de operaciones, ocupación e ingresos."
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh} loading={isFetching}>
            {!isFetching && <RefreshCw />}
            Actualizar datos
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(error, "Error al cargar la información del panel.")}
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      {isLoading || !summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Citas de hoy
              </CardTitle>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {summary.totalAppointmentsToday}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-success">
                  {summary.confirmedAppointmentsToday} confirmadas
                </span>
                <span>·</span>
                <span className="font-semibold text-primary">
                  {summary.completedAppointmentsToday} completadas
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ingresos de hoy
              </CardTitle>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <DollarSign className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {formatPrice(Number(summary.revenueToday))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Citas atendidas o confirmadas hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ingresos del mes
              </CardTitle>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {formatPrice(Number(summary.revenueMonth))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Acumulado del mes en curso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Equipo y clientes
              </CardTitle>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-amber-600">
                <Users className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {summary.totalProfessionals}{" "}
                <span className="text-sm font-normal text-muted-foreground">especialistas</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.totalServices} servicios · {summary.totalClients} clientes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agenda de hoy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Agenda de citas del día</CardTitle>
            <CardDescription>
              Monitorea y cambia el estado de las citas programadas para hoy.
            </CardDescription>
          </div>
          <Badge variant="secondary">{todayAppointments.length} citas hoy</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {apptsQuery.isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : todayAppointments.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Sin citas para hoy"
              description="No hay citas programadas para el día de hoy."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Especialista</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción rápida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppointments.map((appt) => {
                  const isUpdating =
                    updateStatus.isPending && updateStatus.variables?.id === appt.id;
                  const canMutate =
                    appt.status !== "COMPLETED" && appt.status !== "CANCELLED";

                  return (
                    <TableRow key={appt.id}>
                      <TableCell className="whitespace-nowrap font-semibold">
                        {formatTime(appt.startAt)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{appt.clientName || "Cliente"}</div>
                        <div className="text-xs text-muted-foreground">
                          {appt.clientPhone || appt.clientEmail}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium">
                        {appt.serviceName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {appt.professionalName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-semibold">
                        {formatPrice(Number(appt.priceAtBooking))}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <AppointmentStatusBadge status={appt.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {canMutate && (
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon-sm"
                                  loading={isUpdating}
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                                  aria-label="Marcar como completada"
                                  className="text-success hover:text-success"
                                >
                                  <Check />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Marcar como completada</TooltipContent>
                            </Tooltip>

                            {appt.status !== "NO_SHOW" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon-sm"
                                    disabled={isUpdating}
                                    onClick={() => handleStatusChange(appt.id, "NO_SHOW")}
                                    aria-label="Marcar como no se presentó"
                                  >
                                    <UserX />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>No se presentó</TooltipContent>
                              </Tooltip>
                            )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon-sm"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                                  aria-label="Cancelar cita"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancelar cita</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
