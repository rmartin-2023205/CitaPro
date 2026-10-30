"use client";

import { useEffect, useState } from "react";
import {
  getAllAdminServices,
  createService,
  updateService,
  deleteService,
} from "@/features/admin/api/admin-api";
import { Service } from "@/types";
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationMinutes: 30,
    price: 50,
    active: true,
  });

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllAdminServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar servicios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      durationMinutes: 30,
      price: 50,
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      durationMinutes: service.durationMinutes,
      price: service.price,
      active: service.active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingService) {
        await updateService(editingService.id, formData);
      } else {
        await createService({
          name: formData.name,
          description: formData.description,
          durationMinutes: formData.durationMinutes,
          price: formData.price,
        });
      }
      setIsModalOpen(false);
      await loadServices();
    } catch (err: any) {
      alert(err.message || "Error al guardar servicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas desactivar este servicio del catálogo público?")) return;
    try {
      await deleteService(id);
      await loadServices();
    } catch (err: any) {
      alert(err.message || "Error al desactivar servicio");
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Servicios</h1>
          <p className="text-sm text-slate-600">
            Administra los servicios, tiempos de atención y tarifas del negocio.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo Servicio
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Tabla de servicios */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-7 w-7 text-purple-600 animate-spin mb-2" />
            <p className="text-slate-500 text-xs">Cargando catálogo...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center">
            <Scissors className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-semibold">No hay servicios registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nombre del Servicio</th>
                  <th className="px-5 py-3 font-semibold">Duración</th>
                  <th className="px-5 py-3 font-semibold">Tarifa</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{svc.name}</div>
                      {svc.description && (
                        <div className="text-xs text-slate-500 line-clamp-1">{svc.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-700 whitespace-nowrap">
                      {svc.durationMinutes} minutos
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      Q{Number(svc.price).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {svc.active ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(svc)}
                          className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded transition"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {svc.active && (
                          <button
                            onClick={() => handleDelete(svc.id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Desactivar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Corte de Cabello Clásico"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles del servicio..."
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duración (min)</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Precio (Q)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              {editingService && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="serviceActive"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <label htmlFor="serviceActive" className="text-xs font-medium text-slate-700">
                    Servicio Activo en el Catálogo Público
                  </label>
                </div>
              )}

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
                  {editingService ? "Actualizar" : "Crear Servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
