import Link from "next/link";
import { CalendarX2, ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
        <CalendarX2 className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        Página no encontrada
      </h1>
      <p className="text-slate-600 max-w-md mb-8">
        La ruta que buscas no existe o fue movida. Puedes volver al inicio o explorar nuestro catálogo de servicios.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ir al inicio
        </Link>
        <Link
          href="/servicios"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Ver servicios
        </Link>
      </div>
    </div>
  );
}

