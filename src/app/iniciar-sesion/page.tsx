"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/features/auth/context/auth-context";
import { Lock, Mail, AlertCircle, ArrowRight, Shield, Scissors, UserCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Ingrese un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await login(data);
      if (user.roles.includes("ADMIN")) {
        router.push("/admin");
      } else if (user.roles.includes("PROFESSIONAL")) {
        router.push("/profesional/agenda");
      } else {
        router.push(redirectUrl !== "/" ? redirectUrl : "/servicios");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.detail || err?.title || "Credenciales inválidas. Por favor intente nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (email: string) => {
    setValue("email", email);
    setValue("password", "Password123!");
    setErrorMessage(null);
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="text-center mb-6">
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl mx-auto flex items-center justify-center mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Iniciar Sesión</h1>
          <p className="text-sm text-slate-500 mt-1">Accede a tu cuenta de CitaPro</p>
        </div>

        {errorMessage && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                {...register("email")}
                placeholder="ejemplo@correo.com"
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
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
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? "Autenticando..." : "Ingresar a mi cuenta"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          ¿No tienes una cuenta?{" "}
          <Link href="/registro" className="text-blue-600 hover:underline font-semibold">
            Crear cuenta nueva
          </Link>
        </div>

        {/* Cuentas de demostración de acceso rápido */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            Acceso Rápido para Pruebas (Demo)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@citapro.com")}
              className="p-2 border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 rounded-lg text-center transition group"
            >
              <Shield className="h-4 w-4 mx-auto text-purple-600 mb-1" />
              <span className="text-[11px] font-semibold text-purple-900 block">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("carlos@citapro.com")}
              className="p-2 border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-lg text-center transition group"
            >
              <Scissors className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
              <span className="text-[11px] font-semibold text-emerald-900 block">Profesional</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("cliente@citapro.com")}
              className="p-2 border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 rounded-lg text-center transition group"
            >
              <UserCheck className="h-4 w-4 mx-auto text-blue-600 mb-1" />
              <span className="text-[11px] font-semibold text-blue-900 block">Cliente</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Contraseña compartida: <code className="bg-slate-100 px-1 py-0.5 rounded">Password123!</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-sm text-slate-500">Cargando inicio de sesión...</div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

