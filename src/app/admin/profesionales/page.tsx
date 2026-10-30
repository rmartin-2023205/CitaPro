"use client";

import { useEffect, useState } from "react";
import {
  getAllAdminProfessionals,
  getAllAdminServices,
  createProfessional,
  updateProfessional,
} from "@/features/admin/api/admin-api";
import { ProfessionalWithServices, Service } from "@/types";
import {
  Users,
  Plus,
  Edit2,
  Loader2,
  X,
  AlertCircle,
  Check,
} from "lucide-react";

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<ProfessionalWithServices[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPro, setEditingPro] = useState<ProfessionalWithServices | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    serviceIds: [] as string[],
    active: true,
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [pros, svcs] = await Promise.all([
        getAllAdminProfessionals(),
        getAllAdminServices(),
      ]);
      setProfessionals(pros);
      setServices(svcs);
    } catch (err: any) {
      setError(err.message || "Error al cargar especialistas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingPro(null);
    setFormData({
      displayName: "",
      bio: "",
      serviceIds: [],
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pro: ProfessionalWithServices) => {
    setEditingPro(pro);
    setFormData({
      displayName: pro.displayName,
      bio: pro.bio || "",
      serviceIds: pro.services?.map((s) => s.id) || [],
      active: pro.active,
    });
    setIsModalOpen(true);
  };

  const toggleServiceSelect = (serviceId: string) => {
    setFormData((prev) => {
      const exists = prev.serviceIds.includes(serviceId);
      if (exists) {
        return { ...prev, serviceIds: prev.serviceIds.filter((id) => id !== serviceId) };
      } else {
        return { ...prev, serviceIds: [...prev.serviceIds, serviceId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingPro) {
        await updateProfessional(editingPro.id, {
          displayName: formData.displayName,
          bio: formData.bio,
          active: formData.active,
          serviceIds: formData.serviceIds,
        });
      } else {
        await createProfessional({
          displayName: formData.displayName,
          bio: formData.bio,
          serviceIds: formData.serviceIds,
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error al guardar especialista");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipo de Especialistas</h1>
          <p className="text-sm text-slate-600">
            Gestiona el personal del negocio y los servicios que cada uno realiza.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Registrar Especialista
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Grid de especialistas */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-7 w-7 text-purple-600 animate-spin mb-2" />
          <p className="text-slate-500 text-xs">Cargando personal...</p>
        </div>
      ) : professionals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 text-sm font-semibold">No hay especialistas registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm border border-purple-200">
                      {pro.displayName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{pro.displayName}</h3>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          pro.active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {pro.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(pro)}
                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    title="Editar perfil"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>

                {pro.bio && (
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 italic">{pro.bio}</p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-2">
                    Servicios Asignados ({pro.services?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pro.services && pro.services.length > 0 ? (
                      pro.services.map((svc) => (
                        <span
                          key={svc.id}
                          className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                        >
                          {svc.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin servicios vinculados</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPro ? "Editar Especialista" : "Registrar Especialista"}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Ej. Rodrigo Pérez"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Biografía / Perfil</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Experiencia, especialidades..."
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Servicios que Realiza ({formData.serviceIds.length} seleccionados)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {services.map((svc) => {
                    const isSelected = formData.serviceIds.includes(svc.id);
                    return (
                      <button
                        type="button"
                        key={svc.id}
                        onClick={() => toggleServiceSelect(svc.id)}
                        className={`text-left p-2 rounded-lg text-xs font-medium border flex items-center justify-between transition ${
                          isSelected
                            ? "bg-purple-50 border-purple-300 text-purple-900"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="truncate">{svc.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-purple-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {editingPro && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="proActive"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <label htmlFor="proActive" className="text-xs font-medium text-slate-700">
                    Especialista activo para agendamiento público
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
                  {editingPro ? "Actualizar" : "Guardar Especialista"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

