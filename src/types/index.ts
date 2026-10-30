export type Role = "ADMIN" | "PROFESSIONAL" | "CLIENT";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Business {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  active: boolean;
}

export interface Professional {
  id: string;
  businessId: string;
  displayName: string;
  bio?: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  businessId: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  professionalId: string;
  professionalName?: string;
  serviceId: string;
  serviceName?: string;
  durationMinutes?: number;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes?: string;
  priceAtBooking: number;
  createdAt?: string;
  cancelledAt?: string;
  canCancel?: boolean;
}

export interface TimeSlot {
  professionalId: string;
  professionalName: string;
  startAt: string;
  endAt: string;
  formattedTime: string;
  available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  timezone: string;
  slots: TimeSlot[];
}

export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string>;
}

export interface DashboardSummary {
  totalAppointmentsToday: number;
  pendingAppointmentsToday: number;
  confirmedAppointmentsToday: number;
  completedAppointmentsToday: number;
  cancelledAppointmentsToday: number;
  revenueToday: number;
  revenueMonth: number;
  totalClients: number;
  totalServices: number;
  totalProfessionals: number;
}

export interface AvailabilityBlock {
  id: string;
  businessId: string;
  professionalId?: string;
  professionalName?: string;
  startAt: string;
  endAt: string;
  reason?: string;
  createdByEmail?: string;
  createdAt?: string;
}

export interface ProfessionalWithServices extends Professional {
  services?: Service[];
}
