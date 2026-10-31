"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertCircle, Calendar as CalendarIcon, RefreshCw, Search } from "lucide-react";

import {
  useAdminAppointments,
  useAdminProfessionals,
  useUpdateAppointmentStatus,
} from "@/features/admin/hooks/use-admin";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_META,
  AppointmentStatusBadge,
} from "@/features/appointments/components/appointment-status-badge";
import type { AppointmentStatus } from "@/types";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatPrice, formatTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DateRange = "today" | "week" | "all";
const ALL_VALUE = "all";

export default function AdminAppointmentsPage() {
  const [selectedProId, setSelectedProId] = React.useState<string>(ALL_VALUE);
  const [selectedStatus, setSelectedStatus] = React.useState<string>(ALL_VALUE);
  const [dateRange, setDateRange] = React.useState<DateRange>("today");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filters = React.useMemo(() => {
    let from: string | undefined;
    let to: string | undefined;

    if (dateRange === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      from = start.toISOString();
      to = end.toISOString();
    } else if (dateRange === "week") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      from = start.toISOString();
      to = nextWeek.toISOString();
    }

    return {
      from,
      to,
      professionalId: selectedProId !== ALL_VALUE ? selectedProId : undefined,
      status:
        selectedStatus !== ALL_VALUE ? (selectedStatus as AppointmentStatus) : undefined,
    };
  }, [dateRange, selectedProId, selectedStatus]);

  const apptsQuery = useAdminAppointments(filters);
  const prosQuery = useAdminProfessionals();
  const updateStatus = useUpdateAppointmentStatus();

  const appointments = React.useMemo(() => apptsQuery.data ?? [], [apptsQuery.data]);
  const professionals = prosQuery.data ?? [];

  const filteredAppointments = React.useMemo(() => {
    if (!searchTerm.trim()) return appointments;
    const term = searchTerm.toLowerCase();
    return appointments.filter(
      (a) =>
        a.clientName?.toLowerCase().includes(term) ||
        a.clientEmail?.toLowerCase().includes(term) ||
        a.serviceName?.toLowerCase().includes(term) ||
        a.professionalName?.toLowerCase().includes(term)
    );
  }, [appointments, searchTerm]);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Estado actualizado a ${APPOINTMENT_STATUS_META[status].label.toLowerCase()}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al cambiar el estado"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario y control de citas"
        description="Visualiza, filtra y administra todas las citas del establecimiento."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => apptsQuery.refetch()}
            loading={apptsQuery.isFetching}
          >
            {!apptsQuery.isFetching && <RefreshCw />}
            Refrescar
          </Button>
        }
      />

      {apptsQuery.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(apptsQuery.error, "Error al cargar las citas.")}
          </AlertDescription>
        </Alert>
      )}

      {/* Barra de filtros */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <TabsList>
              <TabsTrigger value="today">Hoy</TabsTrigger>
              <TabsTrigger value="week">Próximos 7 días</TabsTrigger>
              <TabsTrigger value="all">Todas</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={selectedProId} onValueChange={setSelectedProId}>
            <SelectTrigger className="w-[210px]" aria-label="Filtrar por especialista">
              <SelectValue placeholder="Todos los especialistas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos los especialistas</SelectItem>
              {professionals.map((pro) => (
                <SelectItem key={pro.id} value={pro.id}>
                  {pro.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]" aria-label="Filtrar por estado">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos los estados</SelectItem>
              {APPOINTMENT_STATUSES.map((st) => (
                <SelectItem key={st} value={st}>
                  {APPOINTMENT_STATUS_META[st].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative min-w-[220px] flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar cliente, servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {apptsQuery.isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No se encontraron citas con estos filtros"
              description="Prueba seleccionando otro rango de fechas, especialista o estado."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Especialista</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Gestión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appt) => {
                  const isUpdatingThis =
                    updateStatus.isPending && updateStatus.variables?.id === appt.id;
                  const canMutate =
                    appt.status !== "COMPLETED" && appt.status !== "CANCELLED";

                  return (
                    <TableRow key={appt.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-semibold">{formatTime(appt.startAt)}</div>
                        <div className="text-xs capitalize text-muted-foreground">
                          {formatDate(appt.startAt, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{appt.clientName || "Cliente"}</div>
                        <div className="text-xs text-muted-foreground">
                          {appt.clientPhone || appt.clientEmail}
                        </div>
                        {appt.notes && (
                          <div className="mt-0.5 text-xs italic text-muted-foreground">
                            Nota: &ldquo;{appt.notes}&rdquo;
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-medium">{appt.serviceName}</div>
                        <div className="text-xs text-muted-foreground">
                          {appt.durationMinutes} min
                        </div>
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
                            {appt.status !== "CONFIRMED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isUpdatingThis}
                                onClick={() => handleStatusChange(appt.id, "CONFIRMED")}
                              >
                                Confirmar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              loading={isUpdatingThis}
                              disabled={isUpdatingThis}
                              onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                            >
                              Completar
                            </Button>
                            {appt.status !== "NO_SHOW" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isUpdatingThis}
                                onClick={() => handleStatusChange(appt.id, "NO_SHOW")}
                              >
                                No asistió
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isUpdatingThis}
                              onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                              className="text-destructive hover:text-destructive"
                            >
                              Cancelar
                            </Button>
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
