import Link from "next/link";
import { Calendar, Clock, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center py-12 sm:py-20">
      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
        <CheckCircle2 className="h-4 w-4" />
        Sistema de Reservas Inteligente
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
        Gestiona y reserva tus citas en <span className="text-blue-600">segundos</span>
      </h1>

      <p className="mt-6 text-lg text-slate-600 max-w-2xl leading-relaxed">
        Olvídate de las agendas manuales y citas duplicadas. CitaPro garantiza
        disponibilidad en tiempo real para barberías, clínicas y centros profesionales.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
        <Link
          href="/reservar"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-6 py-3.5 rounded-xl hover:bg-blue-700 shadow-md transition-all"
        >
          Agendar una cita
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/servicios"
          className="inline-flex items-center justify-center border border-slate-300 bg-white text-slate-700 font-medium px-6 py-3.5 rounded-xl hover:bg-slate-50 transition-all"
        >
          Ver servicios disponibles
        </Link>
      </div>

      {/* Tarjetas de características */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Disponibilidad en tiempo real</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Consulta los huecos libres exactos por profesional y servicio sin solapamientos.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Recordatorios y Políticas</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Cancela y visualiza tus citas de acuerdo a las políticas del negocio de forma transparente.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Panel Administrativo</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Control de agenda con vista de calendario, catálogo de servicios y gestión de personal.
          </p>
        </div>
      </div>
    </div>
  );
}

