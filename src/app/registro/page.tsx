"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/features/auth/context/auth-context";
import { UserPlus, Mail, Lock, Phone, User, AlertCircle, ArrowRight } from "lucide-react";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "Nombre demasiado largo"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().optional(),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme su contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAuth } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await registerAuth({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      router.push("/servicios");
    } catch (err: any) {
      setErrorMessage(
        err?.detail || err?.title || "Error al registrar la cuenta. Verifique los datos ingresados."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="text-center mb-6">
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl mx-auto flex items-center justify-center mb-3">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crear Cuenta</h1>
          <p className="text-sm text-slate-500 mt-1">Regístrate para reservar citas fácilmente</p>
        </div>

        {errorMessage && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                {...register("fullName")}
                placeholder="Juan Pérez"
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            {errors.fullName && (
              <p className="text-red-600 text-xs mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                {...register("email")}
                placeholder="juan@correo.com"
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Teléfono (opcional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                {...register("phone")}
                placeholder="+502 5555-5555"
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            {errors.phone && (
              <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                {...register("password")}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                {...register("confirmPassword")}
                placeholder="Repite tu contraseña"
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm shadow-sm transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {isSubmitting ? "Registrando..." : "Crear mi cuenta"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/iniciar-sesion" className="text-blue-600 hover:underline font-semibold">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

