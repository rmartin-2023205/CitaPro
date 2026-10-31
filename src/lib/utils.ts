import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(price);
}

/** Iniciales (máx. 2 letras) para avatares. */
export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

const DEFAULT_TZ = "America/Guatemala";

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  return new Intl.DateTimeFormat("es-GT", { timeZone: DEFAULT_TZ, ...options }).format(
    typeof value === "string" ? new Date(value) : value
  );
}

export function formatTime(value: string | Date): string {
  return formatDate(value, { hour: "2-digit", minute: "2-digit" });
}
