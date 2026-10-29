export type UserRole = "ADMIN" | "PROFESSIONAL" | "CLIENT";

export interface User {
  id: string;
  businessId?: string;
  fullName: string;
  email: string;
  phone?: string;
  roles: UserRole[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

