"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getServices } from "@/features/services/api/get-services";
import { getProfessionals, ProfessionalWithServices } from "@/features/professionals/api/get-professionals";
import { Service } from "@/types";
import { formatPrice } from "@/lib/utils";
import {
  Clock,
  Search,
  Users,
  Sparkles,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";

// Catálogo demo de respaldo cuando el backend aún no está iniciado
const DEMO_SERVICES: Service[] = [
  {
    id: "s0000000-0000-0000-0000-000000000001",
    businessId: "b0000000-0000-0000-0000-000000000001",
    name: "Corte Clásico",
    description: "Corte personalizado con tijera y máquina, lavado y peinado con cera mate.",
    durationMinutes: 30,
    price: 50.0,
    active: true,
  },
  {
    id: "s0000000-0000-0000-0000-000000000002",
    businessId: "b0000000-0000-0000-0000-000000000001",
    name: "Afeitado Tradicional y Perfilado",
    description: "Afeitado clásico a navaja con toallas calientes y bálsamo hidratante.",
    durationMinutes: 30,
    price: 40.0,
    active: true,
  },
  {
    id: "s0000000-0000-0000-0000-000000000003",
    businessId: "b0000000-0000-0000-0000-000000000001",
    name: "Corte + Barba Completo",
    description: "Experiencia completa: corte de cabello con perfilado y arreglo de barba.",
    durationMinutes: 60,
    price: 80.0,
    active: true,
  },
  {
    id: "s0000000-0000-0000-0000-000000000004",
    businessId: "b0000000-0000-0000-0000-000000000001",
    name: "Tratamiento Capilar e Hidratación",
    description: "Tratamiento profundo para revitalizar el cuero cabelludo y reparar fibras secas.",
    durationMinutes: 45,
    price: 110.0,
    active: true,
  },
];

const DEMO_PROFESSIONALS: ProfessionalWithServices[] = [
  {
    id: "p0000000-0000-0000-0000-000000000001",
    businessId: "b0000000-0000-0000-0000-000000000001",
    displayName: "Carlos Gómez",
    bio: "Master Barber con más de 8 años de experiencia en cortes clásicos y diseño de barba.",
    active: true,
    services: [
      { id: "s0000000-0000-0000-0000-000000000001", name: "Corte Clásico", durationMinutes: 30, price: 50.0 },
      { id: "s0000000-0000-0000-0000-000000000002", name: "Afeitado Tradicional", durationMinutes: 30, price: 40.0 },
      { id: "s0000000-0000-0000-0000-000000000003", name: "Corte + Barba", durationMinutes: 60, price: 80.0 },
    ],
  },
  {
    id: "p0000000-0000-0000-0000-000000000002",
    businessId: "b0000000-0000-0000-0000-000000000001",
    displayName: "Andrea Morales",
    bio: "Estilista profesional especializada en cuidado del cabello, texturas y asesoría de imagen.",
    active: true,
    services: [
      { id: "s0000000-0000-0000-0000-000000000001", name: "Corte Clásico", durationMinutes: 30, price: 50.0 },
      { id: "s0000000-0000-0000-0000-000000000003", name: "Corte + Barba", durationMinutes: 60, price: 80.0 },
      { id: "s0000000-0000-0000-0000-000000000004", name: "Tratamiento Capilar", durationMinutes: 45, price: 110.0 },
    ],
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalWithServices[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [servicesData, professionalsData] = await Promise.all([
          getServices(),
          getProfessionals(),
        ]);
        setServices(servicesData);
        setProfessionals(professionalsData);
        setIsUsingDemoData(false);
      } catch (err) {
        // En caso de que el backend local aún no esté encendido, usamos el seed demo
        setServices(DEMO_SERVICES);
        setProfessionals(DEMO_PROFESSIONALS);
        setIsUsingDemoData(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedProfessional === "ALL") {
      return matchesSearch;
    }

    const pro = professionals.find((p) => p.id === selectedProfessional);
    const proHasService = pro?.services.some((s) => s.id === service.id);

    return matchesSearch && proHasService;
  });

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="border-b pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Catálogo de Servicios
            </h1>
            <p className="text-slate-600 mt-1">
              Explora nuestros servicios disponibles, duraciones y precios transparentes.
            </p>
          </div>
          <Link
            href="/reservar"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm"
          >
            <CalendarCheck className="h-4 w-4" />
            Agendar Cita Directa
          </Link>
        </div>

        {isUsingDemoData && (
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-2 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Mostrando catálogo de demostración (los datos reales se sincronizarán al arrancar el backend en el puerto 8080).
            </span>
          </div>
        )}
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Users className="h-4 w-4 text-slate-500 shrink-0" />
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="ALL">Todos los profesionales</option>
            {professionals.map((pro) => (
              <option key={pro.id} value={pro.id}>
                {pro.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Servicios */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4"
            >
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="h-6 bg-slate-200 rounded w-16" />
                <div className="h-8 bg-slate-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No se encontraron servicios con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => {
            const prosForService = professionals.filter((p) =>
              p.services.some((s) => s.id === service.id)
            );

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-lg text-slate-900">{service.name}</h3>
                    <span className="font-extrabold text-blue-700 text-lg">
                      {formatPrice(service.price)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {service.description || "Sin descripción disponible."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      {service.durationMinutes} minutos
                    </span>

                    {prosForService.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-600">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        {prosForService.map((p) => p.displayName).join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                    Reserva confirmada
                  </span>
                  <Link
                    href={`/reservar?serviceId=${service.id}`}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition"
                  >
                    Seleccionar y agendar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sección del Equipo de Profesionales */}
      <div className="mt-16 pt-10 border-t border-slate-200">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Nuestro Equipo Profesional</h2>
          <p className="text-sm text-slate-600 mt-1">
            Especialistas calificados listos para atenderte con la mejor calidad y servicio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm"
            >
              <div className="h-16 w-16 bg-blue-100 text-blue-700 font-bold text-xl rounded-full flex items-center justify-center mb-4">
                {pro.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h3 className="font-bold text-base text-slate-900">{pro.displayName}</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs">{pro.bio}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {pro.services.map((s) => (
                  <span
                    key={s.id}
                    className="bg-slate-50 text-slate-600 border border-slate-200 text-[11px] px-2 py-0.5 rounded-full"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

