"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  Scissors,
  Shield,
  Sparkles,
  UserCheck,
} from "lucide-react";

import { useAuth } from "@/features/auth/context/auth-context";
import { resolvePostAuthPath, sanitizeRedirect } from "@/features/auth/lib/routes";
import { getErrorMessage } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es requerido")
    .email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const DEMO_PASSWORD = "Password123!";

const DEMO_ACCOUNTS = [
  {
    label: "Admin",
    hint: "Panel completo",
    email: "admin@citapro.com",
    icon: Shield,
  },
  {
    label: "Profesional",
    hint: "Agenda del día",
    email: "carlos@citapro.com",
    icon: Scissors,
  },
  {
    label: "Cliente",
    hint: "Mis reservas",
    email: "cliente@citapro.com",
    icon: UserCheck,
  },
] as const;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const safeRedirect = sanitizeRedirect(redirectParam);

  const { user, status, login } = useAuth();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [quickLoadingEmail, setQuickLoadingEmail] = React.useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Si ya tiene sesión activa, redirigir directamente a su destino.
  React.useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(resolvePostAuthPath(user, redirectParam));
    }
  }, [status, user, router, redirectParam]);

  const authenticate = async (values: LoginFormData) => {
    setErrorMessage(null);
    try {
      const loggedUser = await login(values);
      toast.success(`Bienvenido, ${loggedUser.fullName.split(" ")[0]}`);
      router.replace(resolvePostAuthPath(loggedUser, redirectParam));
    } catch (err) {
      setErrorMessage(
        getErrorMessage(err, "Credenciales inválidas. Verifica tu correo y contraseña.")
      );
    }
  };

  const handleQuickDemo = async (email: string) => {
    form.setValue("email", email, { shouldValidate: true });
    form.setValue("password", DEMO_PASSWORD, { shouldValidate: true });
    setQuickLoadingEmail(email);
    try {
      await authenticate({ email, password: DEMO_PASSWORD });
    } finally {
      setQuickLoadingEmail(null);
    }
  };

  const isBusy = form.formState.isSubmitting || quickLoadingEmail !== null;

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu cuenta de CitaPro
        </CardDescription>
        {safeRedirect && (
          <div className="pt-1">
            <Badge variant="info" className="font-normal">
              Continuarás hacia {safeRedirect} al iniciar sesión
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(authenticate)} className="space-y-4" noValidate>
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
                        autoFocus
                        placeholder="nombre@correo.com"
                        className="pl-9"
                        disabled={isBusy}
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
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="pl-9"
                        disabled={isBusy}
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
              className="w-full"
              size="lg"
              loading={form.formState.isSubmitting && !quickLoadingEmail}
              disabled={isBusy}
            >
              Ingresar a mi cuenta
              <ArrowRight />
            </Button>
          </form>
        </Form>

        {/* Acceso rápido demo en 1 clic */}
        <div className="pt-2">
          <div className="relative my-3">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3 text-primary" aria-hidden="true" />
              Acceso rápido demo (1 clic)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {DEMO_ACCOUNTS.map(({ label, hint, email, icon: Icon }) => {
              const isThisLoading = quickLoadingEmail === email;
              return (
                <Button
                  key={email}
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  loading={isThisLoading}
                  onClick={() => handleQuickDemo(email)}
                  className="h-auto flex-col gap-1 py-2.5 text-center"
                >
                  {!isThisLoading && <Icon className="h-4 w-4 text-primary" />}
                  <span className="text-xs font-semibold leading-tight">{label}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">{hint}</span>
                </Button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Contraseña demo:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
              {DEMO_PASSWORD}
            </code>
          </p>
        </div>
      </CardContent>

      <CardFooter className="justify-center border-t bg-muted/30 py-4 text-xs text-muted-foreground">
        ¿Aún no tienes una cuenta?{" "}
        <Link
          href={
            safeRedirect
              ? `/registro?redirect=${encodeURIComponent(safeRedirect)}`
              : "/registro"
          }
          className="ml-1 font-semibold text-primary underline-offset-4 hover:underline"
        >
          Crear cuenta gratis
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="mx-auto h-7 w-40" />
            <Skeleton className="mx-auto h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
