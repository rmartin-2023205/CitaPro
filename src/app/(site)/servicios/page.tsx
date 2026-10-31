"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CalendarCheck, Clock, Scissors, Search, Sparkles, Users } from "lucide-react";

import { usePublicProfessionals, usePublicServices } from "@/features/appointments/hooks/use-appointments";
import type { ProfessionalWithServices } from "@/features/professionals/api/get-professionals";
import type { Service } from "@/types";
import { formatPrice, getInitials } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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
    description:
      "Tratamiento profundo para revitalizar el cuero cabelludo y reparar fibras secas.",
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
  const servicesQuery = usePublicServices();
  const prosQuery = usePublicProfessionals();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProfessional, setSelectedProfessional] = React.useState<string>("ALL");

  const isLoading = servicesQuery.isLoading || prosQuery.isLoading;
  const isUsingDemoData = Boolean(servicesQuery.isError || prosQuery.isError);
  const services = isUsingDemoData ? DEMO_SERVICES : (servicesQuery.data ?? []);
  const professionals = isUsingDemoData ? DEMO_PROFESSIONALS : (prosQuery.data ?? []);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedProfessional === "ALL") return matchesSearch;

    const pro = professionals.find((p) => p.id === selectedProfessional);
    const proHasService = pro?.services.some((s) => s.id === service.id);
    return matchesSearch && proHasService;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Catálogo de servicios"
        description="Explora nuestros servicios disponibles, duraciones y precios transparentes."
        actions={
          <Button asChild>
            <Link href="/reservar">
              <CalendarCheck /> Agendar cita directa
            </Link>
          </Button>
        }
      />

      {isUsingDemoData && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Mostrando catálogo de demostración (los datos reales se sincronizarán al arrancar el
            backend en el puerto 8080).
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
          <div className="relative w-full sm:w-80">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar por servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-64">
            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger aria-label="Filtrar por profesional">
                <SelectValue placeholder="Todos los profesionales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los profesionales</SelectItem>
                {professionals.map((pro) => (
                  <SelectItem key={pro.id} value={pro.id}>
                    {pro.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de servicios */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <Card>
          <EmptyState
            icon={Scissors}
            title="No se encontraron servicios"
            description="No hay servicios que coincidan con los filtros seleccionados."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredServices.map((service) => {
            const prosForService = professionals.filter((p) =>
              p.services.some((s) => s.id === service.id)
            );

            return (
              <Card key={service.id} className="flex flex-col justify-between transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                  <CardDescription className="pt-1 leading-relaxed">
                    {service.description || "Sin descripción disponible."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-wrap items-center gap-2 pt-0">
                  <Badge variant="secondary">
                    <Clock />
                    {service.durationMinutes} minutos
                  </Badge>
                  {prosForService.length > 0 && (
                    <Badge variant="outline">
                      <Users />
                      {prosForService.map((p) => p.displayName).join(", ")}
                    </Badge>
                  )}
                </CardContent>

                <CardFooter className="justify-between border-t bg-muted/20 py-3">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Reserva confirmada
                  </span>
                  <Button asChild size="sm">
                    <Link href={`/reservar?serviceId=${service.id}`}>Seleccionar y agendar</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Equipo */}
      <Separator className="my-4" />

      <section className="space-y-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Nuestro equipo profesional</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Especialistas calificados listos para atenderte con la mejor calidad y servicio.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {professionals.map((pro) => (
            <Card key={pro.id} className="text-center">
              <CardHeader className="items-center pb-3">
                <Avatar className="mb-2 h-16 w-16">
                  <AvatarFallback className="text-lg">{getInitials(pro.displayName)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-base">{pro.displayName}</CardTitle>
                <CardDescription className="max-w-xs">{pro.bio}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-center gap-1.5">
                {pro.services.map((s) => (
                  <Badge key={s.id} variant="secondary" className="font-normal">
                    {s.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
