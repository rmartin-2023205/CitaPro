"use client";

import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getAdminAppointments,
  updateAppointmentStatus,
} from "@/features/admin/api/admin-api";
import { Appointment, AppointmentStatus, DashboardSummary } from "@/types";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  RefreshCw,
  Loader2,
  Check,
  X,
  UserX,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [sumData, appts] = await Promise.all([
        getDashboardSummary(),
        getAdminAppointments({
          from: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
          to: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        }),
      ]);
      setSummary(sumData);
      setTodayAppointments(appts);
    } catch (err: any) {
      setError(err.message || "Error al cargar la información del panel.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      setUpdatingId(appointmentId);
      await updateAppointmentStatus(appointmentId, newStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error al actualizar estado");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "CONFIRMED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Confirmada</span>;
      case "PENDING":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pendiente</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Completada</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Cancelada</span>;
      case "NO_SHOW":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">No se presentó</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-3" />
        <p className="text-slate-600 text-sm">Cargando métricas del negocio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panel de Control General</h1>
          <p className="text-sm text-slate-600">
            Resumen en tiempo real de operaciones, ocupación e ingresos.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4 text-slate-500" />
          Actualizar datos
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Grid de KPIs principales */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Citas de Hoy */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Citas de Hoy
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{summary.totalAppointmentsToday}</div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
              <span className="text-emerald-600 font-semibold">{summary.confirmedAppointmentsToday} confirmadas</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold">{summary.completedAppointmentsToday} completadas</span>
            </div>
          </div>

          {/* Ingresos Hoy */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ingresos de Hoy
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              Q{Number(summary.revenueToday).toFixed(2)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Citas atendidas o confirmadas hoy
            </div>
          </div>

          {/* Ingresos del Mes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ingresos del Mes
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              Q{Number(summary.revenueMonth).toFixed(2)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Acumulado en el mes en curso
            </div>
          </div>

          {/* Catálogo Activo */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Equipo y Clientes
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {summary.totalProfessionals}{" "}
              <span className="text-sm font-normal text-slate-500">especialistas</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
              <span>{summary.totalServices} servicios</span>
              <span>•</span>
              <span>{summary.totalClients} clientes</span>
            </div>
          </div>
        </div>
      )}

      {/* Citas de Hoy con acciones de cambio de estado */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Agenda de Citas del Día</h2>
            <p className="text-xs text-slate-500">Monitorea y cambia el estado de las citas programadas para hoy.</p>
          </div>
          <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
            {todayAppointments.length} citas hoy
          </span>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-10 text-center">
            <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-medium">No hay citas programadas para el día de hoy.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Hora</th>
                  <th className="px-5 py-3 font-semibold">Cliente</th>
                  <th className="px-5 py-3 font-semibold">Servicio</th>
                  <th className="px-5 py-3 font-semibold">Especialista</th>
                  <th className="px-5 py-3 font-semibold">Precio</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold text-right">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAppointments.map((appt) => {
                  const startTime = new Date(appt.startAt).toLocaleTimeString("es-GT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isUpdating = updatingId === appt.id;

                  return (
                    <tr key={appt.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">
                        {startTime}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">{appt.clientName || "Cliente"}</div>
                        <div className="text-xs text-slate-500">{appt.clientPhone || appt.clientEmail}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium whitespace-nowrap">
                        {appt.serviceName}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {appt.professionalName}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">
                        Q{Number(appt.priceAtBooking).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(appt.status)}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600 ml-auto" />
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                                className="p-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200 transition"
                                title="Marcar como Completada"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {appt.status !== "NO_SHOW" && appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "NO_SHOW")}
                                className="p-1.5 text-xs text-amber-700 hover:bg-amber-50 rounded border border-amber-200 transition"
                                title="Marcar como No se presentó"
                              >
                                <UserX className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                                className="p-1.5 text-xs text-red-700 hover:bg-red-50 rounded border border-red-200 transition"
                                title="Cancelar Cita"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

