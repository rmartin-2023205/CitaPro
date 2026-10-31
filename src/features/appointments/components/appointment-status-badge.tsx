import { CheckCircle2, CircleDashed, CircleSlash, Clock, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/types";

export const APPOINTMENT_STATUS_META: Record<
  AppointmentStatus,
  { label: string; variant: NonNullable<BadgeProps["variant"]>; icon: LucideIcon }
> = {
  PENDING: { label: "Pendiente", variant: "warning", icon: Clock },
  CONFIRMED: { label: "Confirmada", variant: "success", icon: CheckCircle2 },
  COMPLETED: { label: "Completada", variant: "info", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelada", variant: "destructive", icon: XCircle },
  NO_SHOW: { label: "No se presentó", variant: "secondary", icon: CircleSlash },
};

export const APPOINTMENT_STATUSES = Object.keys(APPOINTMENT_STATUS_META) as AppointmentStatus[];

export function AppointmentStatusBadge({
  status,
  showIcon = true,
}: {
  status: AppointmentStatus;
  showIcon?: boolean;
}) {
  const meta = APPOINTMENT_STATUS_META[status] ?? {
    label: status,
    variant: "outline" as const,
    icon: CircleDashed,
  };
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant}>
      {showIcon && <Icon aria-hidden="true" />}
      {meta.label}
    </Badge>
  );
}

