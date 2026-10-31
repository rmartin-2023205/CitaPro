"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, Lock, Mail, Phone, User } from "lucide-react";

import { useAuth } from "@/features/auth/context/auth-context";
import { resolvePostAuthPath, sanitizeRedirect } from "@/features/auth/lib/routes";
import { getErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Skeleton } from "@/components/ui/skeleton";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(150, "El nombre no puede exceder 150 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "El correo electrónico es requerido")
      .email("Ingresa un correo electrónico válido"),
    phone: z
      .string()
      .trim()
      .max(20, "El teléfono no puede exceder 20 caracteres")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .max(100, "La contraseña es demasiado larga"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function scorePassword(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "bg-muted" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Muy corta", color: "bg-destructive" },
    { label: "Débil", color: "bg-destructive" },
    { label: "Aceptable", color: "bg-warning" },
    { label: "Buena", color: "bg-primary" },
    { label: "Fuerte", color: "bg-success" },
  ];
  return { score, ...levels[score] };
}

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const safeRedirect = sanitizeRedirect(redirectParam);

  const { user, status, register: registerAuth } = useAuth();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(resolvePostAuthPath(user, redirectParam));
    }
  }, [status, user, router, redirectParam]);

  const passwordValue = form.watch("password");
  const strength = scorePassword(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    try {
      const created = await registerAuth({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      });
      toast.success("¡Cuenta creada con éxito!", {
        description: `Bienvenido a CitaPro, ${created.fullName.split(" ")[0]}.`,
      });
      router.replace(resolvePostAuthPath(created, redirectParam));
    } catch (err) {
      setErrorMessage(
        getErrorMessage(err, "No se pudo crear la cuenta. Revisa los datos ingresados.")
      );
    }
  };

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Crear cuenta</CardTitle>
        <CardDescription>Regístrate para reservar y gestionar tus citas en línea</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        autoComplete="name"
                        autoFocus
                        placeholder="Juan Pérez"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="juan@correo.com"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Teléfono <span className="font-normal text-muted-foreground">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+502 5555-5555"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      />
                      <PasswordInput
                        autoComplete="new-password"
                        placeholder="Mínimo 6 caracteres"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  {passwordValue && (
                    <div className="space-y-1 pt-0.5" aria-live="polite">
                      <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={cn(
                              "h-1 rounded-full transition-colors",
                              strength.score >= step ? strength.color : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Seguridad: <span className="font-medium text-foreground">{strength.label}</span>
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      />
                      <PasswordInput
                        autoComplete="new-password"
                        placeholder="Repite tu contraseña"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-2 w-full"
              size="lg"
              loading={form.formState.isSubmitting}
            >
              Crear mi cuenta
              <ArrowRight />
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center border-t bg-muted/30 py-4 text-xs text-muted-foreground">
        ¿Ya tienes una cuenta?{" "}
        <Link
          href={
            safeRedirect
              ? `/iniciar-sesion?redirect=${encodeURIComponent(safeRedirect)}`
              : "/iniciar-sesion"
          }
          className="ml-1 font-semibold text-primary underline-offset-4 hover:underline"
        >
          Inicia sesión
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="mx-auto h-7 w-40" />
            <Skeleton className="mx-auto h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
