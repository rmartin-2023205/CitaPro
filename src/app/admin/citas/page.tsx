"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdminAppointments,
  getAllAdminProfessionals,
  updateAppointmentStatus,
} from "@/features/admin/api/admin-api";
import {
  Appointment,
  AppointmentStatus,
  ProfessionalWithServices,
} from "@/types";
import {
  Calendar as CalendarIcon,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalWithServices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Filtros
  const [selectedProId, setSelectedProId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [dateRange, setDateRange] = useState<"today" | "week" | "all">("today");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      let from: string | undefined;
      let to: string | undefined;
      const now = new Date();

      if (dateRange === "today") {
        from = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        to = new Date(now.setHours(23, 59, 59, 999)).toISOString();
      } else if (dateRange === "week") {
        from = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        to = nextWeek.toISOString();
      }

      const [appts, pros] = await Promise.all([
        getAdminAppointments({
          from,
          to,
          professionalId: selectedProId || undefined,
          status: (selectedStatus as AppointmentStatus) || undefined,
        }),
        getAllAdminProfessionals(),
      ]);

      setAppointments(appts);
      setProfessionals(pros);
    } catch (err: any) {
      alert(err.message || "Error al cargar citas.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProId, selectedStatus, dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      setIsUpdating(id);
      await updateAppointmentStatus(id, status);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error al cambiar el estado");
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.clientName?.toLowerCase().includes(term) ||
      a.clientEmail?.toLowerCase().includes(term) ||
      a.serviceName?.toLowerCase().includes(term) ||
      a.professionalName?.toLowerCase().includes(term)
    );
  });

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
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">No asistió</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calendario y Control de Citas</h1>
          <p className="text-sm text-slate-600">
            Visualiza, filtra y administra todas las citas del establecimiento.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Refrescar
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Rango de tiempo */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setDateRange("today")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                dateRange === "today"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setDateRange("week")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                dateRange === "week"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Próximos 7 días
            </button>
            <button
              onClick={() => setDateRange("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                dateRange === "all"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todas
            </button>
          </div>

          {/* Filtro por especialista */}
          <select
            value={selectedProId}
            onChange={(e) => setSelectedProId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Todos los especialistas</option>
            {professionals.map((pro) => (
              <option key={pro.id} value={pro.id}>
                {pro.displayName}
              </option>
            ))}
          </select>

          {/* Filtro por estado */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Todos los estados</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="PENDING">Pendiente</option>
            <option value="COMPLETED">Completada</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="NO_SHOW">No asistió</option>
          </select>

          {/* Búsqueda por texto */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente, servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Lista / Tabla de Citas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-7 w-7 text-purple-600 animate-spin mb-2" />
            <p className="text-slate-500 text-xs">Cargando citas programadas...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-semibold">No se encontraron citas con estos filtros.</p>
            <p className="text-slate-400 text-xs mt-1">Prueba seleccionando otro rango de fechas o estado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Fecha y Hora</th>
                  <th className="px-5 py-3 font-semibold">Cliente</th>
                  <th className="px-5 py-3 font-semibold">Servicio</th>
                  <th className="px-5 py-3 font-semibold">Especialista</th>
                  <th className="px-5 py-3 font-semibold">Precio</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appt) => {
                  const dateObj = new Date(appt.startAt);
                  const formattedDate = dateObj.toLocaleDateString("es-GT", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });
                  const formattedTime = dateObj.toLocaleTimeString("es-GT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isUpdatingThis = isUpdating === appt.id;

                  return (
                    <tr key={appt.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{formattedTime}</div>
                        <div className="text-xs text-slate-500 capitalize">{formattedDate}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{appt.clientName || "Cliente"}</div>
                        <div className="text-xs text-slate-500">{appt.clientPhone || appt.clientEmail}</div>
                        {appt.notes && (
                          <div className="text-xs text-slate-400 italic mt-0.5">Nota: &ldquo;{appt.notes}&rdquo;</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium whitespace-nowrap">
                        <div>{appt.serviceName}</div>
                        <div className="text-xs text-slate-400">{appt.durationMinutes} min</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {appt.professionalName}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">
                        Q{Number(appt.priceAtBooking).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(appt.status)}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {isUpdatingThis ? (
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600 ml-auto" />
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            {appt.status !== "CONFIRMED" && appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "CONFIRMED")}
                                className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition"
                                title="Confirmar"
                              >
                                Confirmar
                              </button>
                            )}
                            {appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                                className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition"
                                title="Completar"
                              >
                                Completar
                              </button>
                            )}
                            {appt.status !== "NO_SHOW" && appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "NO_SHOW")}
                                className="px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded transition"
                                title="No asistió"
                              >
                                No asistió
                              </button>
                            )}
                            {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                                className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded transition"
                                title="Cancelar"
                              >
                                Cancelar
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

