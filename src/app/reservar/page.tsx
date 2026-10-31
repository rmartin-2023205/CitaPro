"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getServices } from "@/features/services/api/get-services";
import { getProfessionals, ProfessionalWithServices } from "@/features/professionals/api/get-professionals";
import { getAvailability } from "@/features/booking/api/get-availability";
import { createAppointment } from "@/features/appointments/api/appointments-api";
import { Service, TimeSlot, Appointment } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Sparkles,
  CalendarCheck2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("serviceId");
  const { isAuthenticated } = useAuth();

  // Estados de datos
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalWithServices[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Estados de selección
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("ANY");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState<string>("");

  // Estados de carga, error y resultado
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  // Carga inicial de catálogo
  useEffect(() => {
    async function initCatalog() {
      setIsLoadingCatalog(true);
      try {
        const [servicesData, prosData] = await Promise.all([
          getServices(),
          getProfessionals(),
        ]);
        setServices(servicesData);
        setProfessionals(prosData);

        if (preselectedServiceId) {
          const found = servicesData.find((s) => s.id === preselectedServiceId);
          if (found) {
            setSelectedService(found);
            setStep(2);
          }
        }
      } catch (err) {
        setErrorMessage("Error al cargar el catálogo de servicios. Verifique la conexión con el servidor.");
      } finally {
        setIsLoadingCatalog(false);
      }
    }
    initCatalog();
  }, [preselectedServiceId]);

  // Cargar disponibilidad cuando cambian servicio, profesional o fecha
  useEffect(() => {
    if (!selectedService || !selectedDate || step !== 3) return;

    async function fetchSlots() {
      setIsLoadingSlots(true);
      setErrorMessage(null);
      setSelectedSlot(null);
      try {
        const response = await getAvailability({
          serviceId: selectedService!.id,
          professionalId: selectedProfessionalId === "ANY" ? undefined : selectedProfessionalId,
          date: selectedDate,
        });
        setAvailableSlots(response.slots);
      } catch (err: any) {
        setErrorMessage(
          err?.detail || err?.title || "No se pudieron calcular los horarios disponibles."
        );
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedService, selectedProfessionalId, selectedDate, step]);

  const professionalsForService = selectedService
    ? professionals.filter((p) => p.services.some((s) => s.id === selectedService.id))
    : [];

  const handleNextStep = () => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      router.push(`/iniciar-sesion?redirect=/reservar`);
      return;
    }

    if (!selectedService || !selectedSlot) return;

    setIsBooking(true);
    setErrorMessage(null);

    try {
      const result = await createAppointment({
        serviceId: selectedService.id,
        professionalId: selectedSlot.professionalId,
        startAt: selectedSlot.startAt,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      setBookedAppointment(result);
      setStep(5); // Pantalla de éxito
    } catch (err: any) {
      if (err?.status === 409) {
        setErrorMessage(
          "El horario seleccionado acaba de ser reservado por otro cliente. Por favor regresa al paso anterior y selecciona otro horario disponible."
        );
      } else {
        setErrorMessage(
          err?.detail || err?.title || "Ocurrió un error al confirmar la cita. Por favor intente de nuevo."
        );
      }
    } finally {
      setIsBooking(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // PANTALLA DE ÉXITO (Paso 5)
  if (step === 5 && bookedAppointment) {
    return (
      <div className="max-w-2xl mx-auto my-10 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-6">
        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Reserva Confirmada Exitosamente
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            ¡Tu cita ha sido agendada!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hemos reservado tu espacio en el sistema. Te esperamos puntualmente.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-left space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Servicio:</span>
            <span className="font-bold text-slate-900">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Especialista:</span>
            <span className="font-bold text-slate-900">{selectedSlot?.professionalName}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Fecha y Horario:</span>
            <span className="font-bold text-blue-600">
              {selectedDate} ({selectedSlot?.formattedTime})
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Total a pagar:</span>
            <span className="font-extrabold text-slate-900">
              {formatPrice(bookedAppointment.priceAtBooking)}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-xs text-slate-400">
            <span>ID de Referencia:</span>
            <span className="font-mono">{bookedAppointment.id.slice(0, 8)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/mi-cuenta/citas"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 shadow-sm transition text-sm"
          >
            <CalendarCheck2 className="h-4 w-4" />
            Ver Mis Citas
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-slate-300 bg-white text-slate-700 font-medium px-6 py-3 rounded-xl hover:bg-slate-50 transition text-sm"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Encabezado y barra de pasos */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Reservar una Cita
        </h1>
        <p className="text-slate-600 mt-1 text-sm">
          Sigue los sencillos pasos para elegir tu servicio y apartar tu horario garantizado.
        </p>

        {/* Indicador de Pasos */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {[
            { num: 1, label: "Servicio" },
            { num: 2, label: "Profesional" },
            { num: 3, label: "Fecha y Hora" },
            { num: 4, label: "Confirmación" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex flex-col items-center sm:items-start p-2.5 rounded-xl border text-xs font-semibold transition ${
                step === s.num
                  ? "bg-blue-50 border-blue-400 text-blue-700 shadow-sm"
                  : step > s.num
                  ? "bg-slate-50 border-slate-300 text-slate-700"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === s.num ? "bg-blue-600 text-white" : step > s.num ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {step > s.num ? "✓" : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{errorMessage}</span>
            {errorMessage.includes("acaba de ser reservado") && (
              <button
                onClick={() => setStep(3)}
                className="block mt-1 font-bold text-red-800 underline"
              >
                Volver al selector de horarios
              </button>
            )}
          </div>
        </div>
      )}

      {/* PASO 1: Seleccionar Servicio */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">1. Selecciona el servicio deseado</h2>

          {isLoadingCatalog ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => {
                    setSelectedService(svc);
                    setStep(2);
                  }}
                  className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedService?.id === svc.id
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900">{svc.name}</h3>
                      <span className="font-bold text-blue-600">{formatPrice(svc.price)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    {svc.durationMinutes} minutos de atención
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PASO 2: Seleccionar Profesional */}
      {step === 2 && selectedService && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              2. ¿Quién te gustaría que te atienda?
            </h2>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              Cambiar servicio ({selectedService.name})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setSelectedProfessionalId("ANY");
                setStep(3);
              }}
              className={`p-5 rounded-2xl border text-left transition ${
                selectedProfessionalId === "ANY"
                  ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-3">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Cualquiera disponible</h3>
              <p className="text-xs text-slate-500 mt-1">
                Te asignaremos el primer horario libre de cualquier especialista.
              </p>
            </button>

            {professionalsForService.map((pro) => (
              <button
                key={pro.id}
                onClick={() => {
                  setSelectedProfessionalId(pro.id);
                  setStep(3);
                }}
                className={`p-5 rounded-2xl border text-left transition ${
                  selectedProfessionalId === pro.id
                    ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="h-10 w-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-bold mb-3 text-sm">
                  {pro.displayName.charAt(0)}
                </div>
                <h3 className="font-bold text-sm text-slate-900">{pro.displayName}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pro.bio}</p>
              </button>
            ))}
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Seleccionar Fecha y Horario */}
      {step === 3 && selectedService && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              3. Elige la fecha y el horario disponible
            </h2>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Disponibilidad calculada en tiempo real
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-4">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-600" />
              Fecha de la cita:
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Horarios disponibles para el {selectedDate}
            </h3>

            {isLoadingSlots ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-12 bg-white rounded-xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
                No hay horarios disponibles en la fecha seleccionada. Por favor elige otro día.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={`${slot.professionalId}-${slot.startAt}-${index}`}
                    onClick={() => {
                      setSelectedSlot(slot);
                    }}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      selectedSlot?.startAt === slot.startAt && selectedSlot?.professionalId === slot.professionalId
                        ? "border-blue-600 bg-blue-600 text-white font-bold shadow-md ring-2 ring-blue-400"
                        : "border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                  >
                    <span className="text-sm font-semibold">{slot.formattedTime}</span>
                    <span className={`text-[10px] mt-0.5 ${
                      selectedSlot?.startAt === slot.startAt && selectedSlot?.professionalId === slot.professionalId
                        ? "text-blue-100"
                        : "text-slate-400"
                    }`}>
                      {slot.professionalName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-slate-200">
            <button
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </button>

            <button
              disabled={!selectedSlot}
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar a Confirmación
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASO 4: Resumen y Confirmación */}
      {step === 4 && selectedService && selectedSlot && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">4. Confirmación de Reserva</h2>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Resumen de tu Cita</h3>
                <p className="text-xs text-slate-500">Revisa los detalles antes de agendar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Servicio</span>
                <span className="font-bold text-slate-900">{selectedService.name}</span>
                <span className="block text-xs text-slate-500 mt-1">
                  Duración: {selectedService.durationMinutes} min
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Especialista</span>
                <span className="font-bold text-slate-900">{selectedSlot.professionalName}</span>
                <span className="block text-xs text-slate-500 mt-1">Atención personalizada</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Fecha y Horario</span>
                <span className="font-bold text-slate-900">{selectedDate}</span>
                <span className="block text-xs text-blue-600 font-semibold mt-1">
                  {selectedSlot.formattedTime}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Total a Pagar</span>
                <span className="font-extrabold text-blue-700 text-lg">
                  {formatPrice(selectedService.price)}
                </span>
                <span className="block text-[11px] text-slate-400 mt-1">
                  Precio garantizado en el momento de la reserva
                </span>
              </div>
            </div>

            {/* Campo opcional de notas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instrucciones o notas adicionales (opcional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ejemplo: Si es posible añadir diseño en la barba..."
                maxLength={500}
                rows={2}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!isAuthenticated ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                  <span>Para completar la reserva necesitas acceder o registrarte con tus datos.</span>
                </div>
                <button
                  onClick={() => router.push("/iniciar-sesion?redirect=/reservar")}
                  className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-4 py-2 rounded-lg text-xs whitespace-nowrap transition"
                >
                  Iniciar Sesión
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  disabled={isBooking}
                  onClick={handleConfirmBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isBooking ? (
                    <span>Procesando reserva...</span>
                  ) : (
                    <>
                      <span>Confirmar y Agendar Cita</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Cambiar horario
            </button>
          </div>
        </div>
      )}

      {/* PASO 4 Fallback de seguridad */}
      {step === 4 && (!selectedService || !selectedSlot) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <p className="text-slate-600 text-sm">
            {!selectedService
              ? "No has seleccionado un servicio para tu cita."
              : "No has seleccionado un horario para tu cita."}
          </p>
          <button
            onClick={() => setStep(!selectedService ? 1 : 3)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            {!selectedService ? "Seleccionar servicio" : "Volver a seleccionar horario"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-sm text-slate-500">Cargando módulo de reservas...</div>
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
