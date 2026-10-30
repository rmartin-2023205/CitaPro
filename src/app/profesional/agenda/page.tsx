"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  getProfessionalProfile,
  getProfessionalAgenda,
  updateAppointmentStatus,
} from "@/features/professional/api/professional-api";
import {
  Appointment,
  AppointmentStatus,
  ProfessionalWithServices,
} from "@/types";
import {
  Calendar,
  Clock,
  CheckCircle2,
  UserX,
  XCircle,
  Phone,
  Mail,
  FileText,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

export default function ProfessionalAgendaPage() {
  const { user, isAuthenticated, hasRole, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfessionalWithServices | null>(null);
  const [agenda, setAgenda] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow" | "week" | "all">("today");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [proProfile, appts] = await Promise.all([
        getProfessionalProfile().catch(() => null),
        getProfessionalAgenda(),
      ]);

      setProfile(proProfile);
      setAgenda(appts);
    } catch (err: any) {
      setError(err.message || "Error al cargar la agenda.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      setUpdatingId(id);
      await updateAppointmentStatus(id, status);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error al actualizar el estado de la cita");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtrado por fecha según pestaña
  const filteredAppointments = agenda.filter((appt) => {
    const apptDate = new Date(appt.startAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    if (activeTab === "today") {
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      return apptDate >= today && apptDate <= endOfToday;
    }
    if (activeTab === "tomorrow") {
      return apptDate >= tomorrow && apptDate <= endOfTomorrow;
    }
    if (activeTab === "week") {
      return apptDate >= today && apptDate <= endOfWeek;
    }
    return true;
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

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-slate-600 text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated || (!hasRole("PROFESSIONAL") && !hasRole("ADMIN"))) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-xl shadow-sm border border-red-100 text-center">
        <div className="h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso a Especialistas</h2>
        <p className="text-sm text-slate-600 mb-6">
          Esta vista es exclusiva para especialistas de CitaPro. Inicia sesión con tus credenciales de profesional.
        </p>
        <Link
          href="/iniciar-sesion"
          className="inline-block px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cabecera del Especialista */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {profile?.displayName?.charAt(0) || user?.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Agenda de Especialista
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {profile?.displayName || user?.fullName}
            </h1>
            <p className="text-xs text-slate-500">
              {profile?.services?.map((s) => s.name).join(" • ") || "Servicios asignados"}
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition self-start md:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Actualizar Agenda
        </button>
      </div>

      {/* Pestañas de filtrado temporal */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab("today")}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "today"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => setActiveTab("tomorrow")}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "tomorrow"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Mañana
        </button>
        <button
          onClick={() => setActiveTab("week")}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "week"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Esta Semana
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "all"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Todas
        </button>
      </div>

      {/* Listado de Citas */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Cargando tus citas programadas...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Sin citas en este periodo</h3>
          <p className="text-xs text-slate-500 mt-1">
            No tienes citas asignadas para la vista seleccionada.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const dateObj = new Date(appt.startAt);
            const dateFormatted = dateObj.toLocaleDateString("es-GT", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });
            const timeFormatted = dateObj.toLocaleTimeString("es-GT", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isUpdating = updatingId === appt.id;

            return (
              <div
                key={appt.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5 hover:border-emerald-200 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-sm font-extrabold flex items-center gap-1.5 border border-emerald-100">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      {timeFormatted}
                    </div>
                    <span className="text-xs text-slate-500 font-medium capitalize">
                      {dateFormatted}
                    </span>
                    {getStatusBadge(appt.status)}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{appt.serviceName}</h3>
                    <div className="text-xs text-slate-500">
                      Duración estimada: {appt.durationMinutes} min • Tarifa: Q{Number(appt.priceAtBooking).toFixed(2)}
                    </div>
                  </div>

                  {/* Datos del Cliente */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div className="font-semibold text-slate-800">
                      Cliente: {appt.clientName || "Sin nombre registrado"}
                    </div>
                    {appt.clientPhone && (
                      <a
                        href={`tel:${appt.clientPhone}`}
                        className="flex items-center gap-1 text-emerald-700 hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {appt.clientPhone}
                      </a>
                    )}
                    {appt.clientEmail && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Mail className="h-3.5 w-3.5" />
                        {appt.clientEmail}
                      </div>
                    )}
                  </div>

                  {appt.notes && (
                    <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-900 flex items-start gap-2 border border-amber-100">
                      <FileText className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <span className="font-semibold">Nota del cliente: </span>
                        {appt.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones para el especialista */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:w-44">
                  {isUpdating ? (
                    <div className="py-2 flex items-center justify-center gap-2 text-xs text-emerald-700">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Actualizando...</span>
                    </div>
                  ) : (
                    <>
                      {appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                          className="w-full px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Completada
                        </button>
                      )}

                      {appt.status !== "NO_SHOW" && appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleStatusChange(appt.id, "NO_SHOW")}
                          className="w-full px-3 py-2 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition flex items-center justify-center gap-1.5"
                        >
                          <UserX className="h-4 w-4" />
                          No se presentó
                        </button>
                      )}

                      {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                        <button
                          onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                          className="w-full px-3 py-2 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancelar Cita
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

