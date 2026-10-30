"use client";

import { useEffect, useState } from "react";
import {
  getAllBlocks,
  getAllAdminProfessionals,
  createBlock,
  deleteBlock,
} from "@/features/admin/api/admin-api";
import { AvailabilityBlock, ProfessionalWithServices } from "@/types";
import {
  Clock,
  Plus,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function AdminBlocksPage() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalWithServices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    professionalId: "",
    startAt: "",
    endAt: "",
    reason: "",
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [blks, pros] = await Promise.all([
        getAllBlocks(),
        getAllAdminProfessionals(),
      ]);
      setBlocks(blks);
      setProfessionals(pros);
    } catch (err: any) {
      setError(err.message || "Error al cargar descansos y bloqueos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    // Inicializar con la fecha de hoy a la siguiente hora
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const startIso = now.toISOString().slice(0, 16);
    now.setHours(now.getHours() + 1);
    const endIso = now.toISOString().slice(0, 16);

    setFormData({
      professionalId: "",
      startAt: startIso,
      endAt: endIso,
      reason: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createBlock({
        professionalId: formData.professionalId ? formData.professionalId : undefined,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        reason: formData.reason || undefined,
      });
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error al crear bloqueo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas eliminar este bloqueo y liberar el horario?")) return;
    try {
      await deleteBlock(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error al eliminar bloqueo");
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bloqueos de Horario y Descansos</h1>
          <p className="text-sm text-slate-600">
            Define periodos de descanso, vacaciones o indisponibilidad para el personal o el negocio completo.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo Bloqueo
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Lista de bloqueos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-7 w-7 text-purple-600 animate-spin mb-2" />
            <p className="text-slate-500 text-xs">Cargando bloqueos de horario...</p>
          </div>
        ) : blocks.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-semibold">No hay bloqueos activos ni descansos configurados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Horario del Bloqueo</th>
                  <th className="px-5 py-3 font-semibold">Afecta a</th>
                  <th className="px-5 py-3 font-semibold">Motivo / Razón</th>
                  <th className="px-5 py-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blocks.map((blk) => {
                  const startDate = new Date(blk.startAt);
                  const endDate = new Date(blk.endAt);
                  const formattedDate = startDate.toLocaleDateString("es-GT", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const timeRange = `${startDate.toLocaleTimeString("es-GT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - ${endDate.toLocaleTimeString("es-GT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`;

                  return (
                    <tr key={blk.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{timeRange}</div>
                        <div className="text-xs text-slate-500 capitalize">{formattedDate}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {blk.professionalName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700">
                            {blk.professionalName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700">
                            Todo el Negocio (Cierre General)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {blk.reason || <span className="text-slate-400 italic">Sin motivo especificado</span>}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(blk.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar bloqueo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Bloqueo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Crear Bloqueo de Horario</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Especialista o Negocio
                </label>
                <select
                  value={formData.professionalId}
                  onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white"
                >
                  <option value="">Todo el establecimiento (Cierre General)</option>
                  {professionals.map((pro) => (
                    <option key={pro.id} value={pro.id}>
                      {pro.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha y Hora de Inicio</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha y Hora de Fin</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo / Razón</label>
                <input
                  type="text"
                  placeholder="Ej. Almuerzo, Vacaciones, Mantenimiento..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Guardar Bloqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
