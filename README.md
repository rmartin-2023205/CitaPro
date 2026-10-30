# CitaPro - Frontend

Aplicación cliente de CitaPro construida con Next.js 14 (App Router), TypeScript y Tailwind CSS.

## Características Principales
- **Next.js 14 con App Router** y componentes tipados con TypeScript estricto.
- **Tailwind CSS** para un diseño moderno, responsivo y accesible (incluye enlace `Saltar al contenido principal`, alertas ARIA y manejo de foco).
- **React Hook Form + Zod** para validación de formularios en cliente.
- **TanStack Query** para sincronización y caché de estado del servidor.
- **Módulo de Autenticación y Sesiones (`AuthProvider`)**:
  - Soporte de roles (`ADMIN`, `PROFESSIONAL`, `CLIENT`).
  - Detección automática de expiración de sesión (`401 Unauthorized`) con aviso no intrusivo al usuario.
- **Flujo de Reserva en 4 Pasos (`/reservar`)** con consulta de disponibilidad real en backend.
- **Gestión de Citas del Cliente (`/mi-cuenta/citas`)** con pestañas de próximas citas, historial y cancelación bajo política de 2 horas.
- **Panel Administrativo (`/admin`)**:
  - Dashboard de métricas y calendario diario, semanal y mensual.
  - Gestión y filtrado de citas (`/admin/citas`).
  - CRUD de servicios (`/admin/servicios`), profesionales (`/admin/profesionales`) y bloqueos/horarios (`/admin/horarios`).
- **Agenda del Profesional (`/profesional/agenda`)** para consulta diaria/semanal y cambio de estado de citas.
- **Páginas de Error Personalizadas (`not-found.tsx` y `error.tsx`)**.

## Puesta en marcha

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre `http://localhost:3000` en tu navegador.

## Verificación de Calidad y Build
```bash
# Linter ESLint
npm run lint

# Verificación de tipos TypeScript
npx tsc --noEmit

# Compilación de producción
npm run build
```
