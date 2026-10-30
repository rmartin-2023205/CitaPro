"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyAppointments, cancelAppointment } from "@/features/appointments/api/appointments-api";
import { Appointment } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarX2,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function MyAppointmentsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST">("UPCOMING");

  // Estado para modal de cancelación
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err?.detail || err?.title || "Error al cargar tus citas.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    } else if (!isAuthLoading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAuthLoading]);

  const handleCancelConfirm = async () => {
    if (!cancellingAppointment) return;

    setIsSubmittingCancel(true);
    try {
      await cancelAppointment(cancellingAppointment.id, cancelReason);
      setFeedbackMessage({
        type: "success",
        text: "Tu cita ha sido cancelada exitosamente. El horario vuelve a estar disponible para el público.",
      });
      setCancellingAppointment(null);
      setCancelReason("");
      await fetchAppointments();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err?.detail || err?.title || "No se pudo cancelar la cita. Verifica que falten más de 2 horas.",
      });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-48 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <div className="h-12 w-12 bg-slate-100 text-slate-500 rounded-full mx-auto flex items-center justify-center mb-4">
          <Calendar className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Inicia sesión</h2>
        <p className="text-sm text-slate-500 mb-6">
          Debes acceder a tu cuenta para consultar y administrar tus citas.
        </p>
        <Link
          href="/iniciar-sesion?redirect=/mi-cuenta/citas"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const now = new Date();

  const upcomingAppointments = appointments.filter((a) => {
    const isFuture = new Date(a.startAt) > now;
    return isFuture && a.status !== "CANCELLED";
  });

  const pastAppointments = appointments.filter((a) => {
    const isPast = new Date(a.startAt) <= now;
    return isPast || a.status === "CANCELLED";
  });

  const displayedAppointments = activeTab === "UPCOMING" ? upcomingAppointments : pastAppointments;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Confirmada
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completada
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            <XCircle className="h-3.5 w-3.5" />
            Cancelada
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            No se presentó
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mis Citas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulta tus citas reservadas, historial y cancelaciones.
          </p>
        </div>
        <Link
          href="/reservar"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          Agendar Nueva Cita
        </Link>
      </div>

      {/* Banner de Mensajes */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab("UPCOMING")}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === "UPCOMING"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Próximas Citas ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab("PAST")}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === "PAST"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Historial y Canceladas ({pastAppointments.length})
        </button>
      </div>

      {/* Listado de Citas */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : displayedAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CalendarX2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {activeTab === "UPCOMING" ? "No tienes citas próximas agendadas" : "No tienes citas pasadas registradas"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            {activeTab === "UPCOMING"
              ? "Elige uno de nuestros servicios y agenda tu horario en cuestión de minutos."
              : "Tus citas completadas y canceladas aparecerán aquí como historial."}
          </p>
          {activeTab === "UPCOMING" && (
            <Link
              href="/reservar"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              Agendar una Cita Ahora
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedAppointments.map((appointment) => {
            const startDate = new Date(appointment.startAt);
            const endDate = new Date(appointment.endAt);

            const dateFormatted = startDate.toLocaleDateString("es-GT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const timeFormatted = `${startDate.toLocaleTimeString("es-GT", {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${endDate.toLocaleTimeString("es-GT", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;

            return (
              <div
                key={appointment.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-900">
                      {appointment.serviceName || "Servicio"}
                    </h3>
                    {getStatusBadge(appointment.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="capitalize">{dateFormatted}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{timeFormatted}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium">
                      <Scissors className="h-4 w-4 text-slate-500" />
                      <span>{appointment.professionalName || "Especialista"}</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-lg">
                      Nota: &ldquo;{appointment.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-end md:items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Precio acordado</span>
                    <span className="text-lg font-extrabold text-blue-700">
                      {formatPrice(appointment.priceAtBooking)}
                    </span>
                  </div>

                  {/* Botón de Cancelación */}
                  {appointment.status === "CONFIRMED" && (
                    <div>
                      {appointment.canCancel ? (
                        <button
                          onClick={() => setCancellingAppointment(appointment)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                        >
                          Cancelar Cita
                        </button>
                      ) : (
                        <span
                          className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg block text-right"
                          title="Solo se puede cancelar con al menos 2 horas de anticipación"
                        >
                          Menos de 2h (Contáctanos)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación de Cancelación */}
      {cancellingAppointment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <CalendarX2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">¿Deseas cancelar esta cita?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tu cita para <span className="font-semibold text-slate-700">{cancellingAppointment.serviceName}</span> será liberada y quedará disponible para otros clientes.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo de la cancelación (opcional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ejemplo: Imprevisto laboral o cambio de horario..."
                maxLength={250}
                rows={2}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              Política: Cancelación permitida hasta 2 horas antes de la cita.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={() => setCancellingAppointment(null)}
                className="text-xs font-medium px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleCancelConfirm}
                className="text-xs font-semibold px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {isSubmittingCancel ? "Cancelando..." : "Sí, Cancelar Cita"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
