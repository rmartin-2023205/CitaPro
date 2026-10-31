"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { AlertCircle, Edit2, Plus, Scissors, Trash2 } from "lucide-react";

import {
  useAdminServices,
  useCreateService,
  useDeleteService,
  useUpdateService,
} from "@/features/admin/hooks/use-admin";
import type { Service } from "@/types";
import { getErrorMessage } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const serviceSchema = z.object({
  name: z.string().trim().min(2, "El nombre es requerido"),
  description: z.string().trim().optional(),
  durationMinutes: z.coerce.number().int().min(5, "Mínimo 5 minutos"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  active: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function AdminServicesPage() {
  const servicesQuery = useAdminServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [deletingService, setDeletingService] = React.useState<Service | null>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      durationMinutes: 30,
      price: 50,
      active: true,
    },
  });

  const openCreateModal = () => {
    setEditingService(null);
    form.reset({
      name: "",
      description: "",
      durationMinutes: 30,
      price: 50,
      active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditModal = (svc: Service) => {
    setEditingService(svc);
    form.reset({
      name: svc.name,
      description: svc.description || "",
      durationMinutes: svc.durationMinutes,
      price: Number(svc.price),
      active: svc.active,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: ServiceFormValues) => {
    try {
      if (editingService) {
        await updateMutation.mutateAsync({ id: editingService.id, data: values });
        toast.success("Servicio actualizado");
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          description: values.description || undefined,
          durationMinutes: values.durationMinutes,
          price: values.price,
        });
        toast.success("Servicio creado");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al guardar el servicio"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    try {
      await deleteMutation.mutateAsync(deletingService.id);
      toast.success("Servicio desactivado del catálogo público");
      setDeletingService(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al desactivar el servicio"));
    }
  };

  const services = servicesQuery.data ?? [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de servicios"
        description="Administra los servicios, tiempos de atención y tarifas del negocio."
        actions={
          <Button onClick={openCreateModal}>
            <Plus /> Nuevo servicio
          </Button>
        }
      />

      {servicesQuery.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(servicesQuery.error, "Error al cargar los servicios")}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          {servicesQuery.isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              icon={Scissors}
              title="No hay servicios registrados"
              description="Crea el primer servicio para que aparezca en el catálogo público."
              action={
                <Button size="sm" onClick={openCreateModal}>
                  <Plus /> Crear servicio
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del servicio</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Tarifa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell>
                      <div className="font-semibold">{svc.name}</div>
                      {svc.description && (
                        <div className="line-clamp-1 text-xs text-muted-foreground">
                          {svc.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {svc.durationMinutes} minutos
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-semibold">
                      {formatPrice(Number(svc.price))}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={svc.active ? "success" : "secondary"}>
                        {svc.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditModal(svc)}
                          aria-label={`Editar ${svc.name}`}
                        >
                          <Edit2 />
                        </Button>
                        {svc.active && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeletingService(svc)}
                            aria-label={`Desactivar ${svc.name}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Crear / Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
            <DialogDescription>
              Define el nombre, duración en minutos y precio del servicio.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Corte de cabello clásico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Detalles del servicio..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (min)</FormLabel>
                      <FormControl>
                        <Input type="number" min={5} step={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio (Q)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step={0.5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {editingService && (
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel className="cursor-pointer">
                        Servicio activo en el catálogo público
                      </FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {editingService ? "Actualizar" : "Crear servicio"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Desactivar */}
      <AlertDialog
        open={Boolean(deletingService)}
        onOpenChange={(open) => !open && setDeletingService(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar este servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              El servicio &ldquo;{deletingService?.name}&rdquo; dejará de mostrarse en el catálogo
              público. Las citas existentes no se verán afectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
