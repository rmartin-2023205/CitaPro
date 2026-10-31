"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertCircle, Edit2, Plus, Users } from "lucide-react";

import {
  useAdminProfessionals,
  useAdminServices,
  useCreateProfessional,
  useUpdateProfessional,
} from "@/features/admin/hooks/use-admin";
import type { ProfessionalWithServices } from "@/types";
import { getErrorMessage } from "@/lib/api-client";
import { getInitials } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AdminProfessionalsPage() {
  const prosQuery = useAdminProfessionals();
  const servicesQuery = useAdminServices();
  const createMutation = useCreateProfessional();
  const updateMutation = useUpdateProfessional();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPro, setEditingPro] = React.useState<ProfessionalWithServices | null>(null);
  const [formData, setFormData] = React.useState({
    displayName: "",
    bio: "",
    serviceIds: [] as string[],
    active: true,
  });

  const openCreateModal = () => {
    setEditingPro(null);
    setFormData({ displayName: "", bio: "", serviceIds: [], active: true });
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
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPro) {
        await updateMutation.mutateAsync({
          id: editingPro.id,
          data: {
            displayName: formData.displayName,
            bio: formData.bio,
            active: formData.active,
            serviceIds: formData.serviceIds,
          },
        });
        toast.success("Especialista actualizado");
      } else {
        await createMutation.mutateAsync({
          displayName: formData.displayName,
          bio: formData.bio,
          serviceIds: formData.serviceIds,
        });
        toast.success("Especialista registrado");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al guardar el especialista"));
    }
  };

  const professionals = prosQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const isLoading = prosQuery.isLoading || servicesQuery.isLoading;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipo de especialistas"
        description="Gestiona el personal del negocio y los servicios que cada uno realiza."
        actions={
          <Button onClick={openCreateModal}>
            <Plus /> Registrar especialista
          </Button>
        }
      />

      {prosQuery.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(prosQuery.error, "Error al cargar los especialistas")}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : professionals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No hay especialistas registrados"
            description="Registra al primer miembro del equipo y asígnale los servicios que atiende."
            action={
              <Button size="sm" onClick={openCreateModal}>
                <Plus /> Registrar especialista
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {professionals.map((pro) => (
            <Card key={pro.id} className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback>{getInitials(pro.displayName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold leading-tight">{pro.displayName}</h3>
                    <Badge
                      variant={pro.active ? "success" : "secondary"}
                      className="mt-1"
                    >
                      {pro.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEditModal(pro)}
                  aria-label={`Editar ${pro.displayName}`}
                >
                  <Edit2 />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {pro.bio && (
                  <p className="line-clamp-2 text-xs italic text-muted-foreground">{pro.bio}</p>
                )}
                <Separator />
                <div>
                  <span className="mb-2 block text-xs font-medium text-muted-foreground">
                    Servicios asignados ({pro.services?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pro.services && pro.services.length > 0 ? (
                      pro.services.map((svc) => (
                        <Badge key={svc.id} variant="secondary" className="font-normal">
                          {svc.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs italic text-muted-foreground">
                        Sin servicios vinculados
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Crear / Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPro ? "Editar especialista" : "Registrar especialista"}
            </DialogTitle>
            <DialogDescription>
              Completa el perfil y selecciona los servicios habilitados para este especialista.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pro-name">Nombre completo</Label>
              <Input
                id="pro-name"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Ej. Rodrigo Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pro-bio">Biografía / perfil</Label>
              <Textarea
                id="pro-bio"
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Experiencia, especialidades..."
              />
            </div>

            <div className="space-y-2">
              <Label>Servicios que realiza ({formData.serviceIds.length} seleccionados)</Label>
              <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-lg border bg-muted/30 p-3 sm:grid-cols-2">
                {services.map((svc) => {
                  const checked = formData.serviceIds.includes(svc.id);
                  return (
                    <label
                      key={svc.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border bg-background p-2 text-xs font-medium transition-colors hover:bg-accent"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleServiceSelect(svc.id)}
                      />
                      <span className="truncate">{svc.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {editingPro && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="proActive" className="cursor-pointer">
                  Especialista activo para agendamiento público
                </Label>
                <Switch
                  id="proActive"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {editingPro ? "Actualizar" : "Guardar especialista"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
