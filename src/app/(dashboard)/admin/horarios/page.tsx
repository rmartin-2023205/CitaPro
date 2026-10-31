"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertCircle, Clock, Plus, Trash2 } from "lucide-react";

import {
  useAdminBlocks,
  useAdminProfessionals,
  useCreateBlock,
  useDeleteBlock,
} from "@/features/admin/hooks/use-admin";
import type { AvailabilityBlock } from "@/types";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate, formatTime } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ENTIRE_BUSINESS = "all";

export default function AdminBlocksPage() {
  const blocksQuery = useAdminBlocks();
  const prosQuery = useAdminProfessionals();
  const createMutation = useCreateBlock();
  const deleteMutation = useDeleteBlock();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deletingBlock, setDeletingBlock] = React.useState<AvailabilityBlock | null>(null);
  const [formData, setFormData] = React.useState({
    professionalId: ENTIRE_BUSINESS,
    startAt: "",
    endAt: "",
    reason: "",
  });

  const openCreateModal = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const startIso = now.toISOString().slice(0, 16);
    now.setHours(now.getHours() + 1);
    const endIso = now.toISOString().slice(0, 16);

    setFormData({
      professionalId: ENTIRE_BUSINESS,
      startAt: startIso,
      endAt: endIso,
      reason: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        professionalId:
          formData.professionalId !== ENTIRE_BUSINESS ? formData.professionalId : undefined,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        reason: formData.reason || undefined,
      });
      toast.success("Bloqueo de horario registrado");
      setIsModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al crear el bloqueo"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBlock) return;
    try {
      await deleteMutation.mutateAsync(deletingBlock.id);
      toast.success("Bloqueo eliminado y horario liberado");
      setDeletingBlock(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al eliminar el bloqueo"));
    }
  };

  const blocks = blocksQuery.data ?? [];
  const professionals = prosQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bloqueos de horario y descansos"
        description="Define periodos de descanso, vacaciones o indisponibilidad para el personal o el negocio completo."
        actions={
          <Button onClick={openCreateModal}>
            <Plus /> Nuevo bloqueo
          </Button>
        }
      />

      {blocksQuery.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(blocksQuery.error, "Error al cargar descansos y bloqueos")}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          {blocksQuery.isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : blocks.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No hay bloqueos activos"
              description="Configura un bloqueo cuando necesites reservar horario para almuerzo, mantenimiento o ausencias."
              action={
                <Button size="sm" onClick={openCreateModal}>
                  <Plus /> Nuevo bloqueo
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horario del bloqueo</TableHead>
                  <TableHead>Afecta a</TableHead>
                  <TableHead>Motivo / razón</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((blk) => (
                  <TableRow key={blk.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-semibold">
                        {formatTime(blk.startAt)} - {formatTime(blk.endAt)}
                      </div>
                      <div className="text-xs capitalize text-muted-foreground">
                        {formatDate(blk.startAt, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {blk.professionalName ? (
                        <Badge variant="info">{blk.professionalName}</Badge>
                      ) : (
                        <Badge variant="warning">Todo el negocio (cierre general)</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {blk.reason || (
                        <span className="italic text-muted-foreground">
                          Sin motivo especificado
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeletingBlock(blk)}
                        aria-label="Eliminar bloqueo"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Crear */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear bloqueo de horario</DialogTitle>
            <DialogDescription>
              Durante este intervalo no se podrán agendar citas para el alcance seleccionado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Especialista o negocio</Label>
              <Select
                value={formData.professionalId}
                onValueChange={(val) => setFormData({ ...formData, professionalId: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ENTIRE_BUSINESS}>
                    Todo el establecimiento (cierre general)
                  </SelectItem>
                  {professionals.map((pro) => (
                    <SelectItem key={pro.id} value={pro.id}>
                      {pro.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="block-start">Fecha y hora de inicio</Label>
                <Input
                  id="block-start"
                  type="datetime-local"
                  required
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="block-end">Fecha y hora de fin</Label>
                <Input
                  id="block-end"
                  type="datetime-local"
                  required
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="block-reason">Motivo / razón</Label>
              <Input
                id="block-reason"
                placeholder="Ej. Almuerzo, vacaciones, mantenimiento..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                Guardar bloqueo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Eliminar */}
      <AlertDialog
        open={Boolean(deletingBlock)}
        onOpenChange={(open) => !open && setDeletingBlock(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este bloqueo?</AlertDialogTitle>
            <AlertDialogDescription>
              El horario quedará libre inmediatamente para nuevas reservas públicas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar bloqueo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
