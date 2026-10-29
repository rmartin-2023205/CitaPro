import { apiClient } from "@/lib/api-client";
import { User, LoginCredentials, RegisterData } from "../types";

export async function loginApi(credentials: LoginCredentials): Promise<User> {
  return apiClient<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function registerApi(data: RegisterData): Promise<User> {
  return apiClient<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logoutApi(): Promise<void> {
  return apiClient<void>("/auth/logout", {
    method: "POST",
  });
}

export async function getMeApi(): Promise<User> {
  return apiClient<User>("/auth/me");
}

