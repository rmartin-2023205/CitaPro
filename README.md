# CitaPro - Frontend

Aplicación cliente de CitaPro construida con Next.js 14 (App Router), TypeScript y Tailwind CSS.

## Características
- **Next.js 14 con App Router** y Server/Client Components.
- **Tailwind CSS** para un diseño moderno, responsivo y accesible.
- **React Hook Form + Zod** para validación robusta de formularios.
- **TanStack Query** para sincronización y caché de datos.
- **Lucide React** para iconografía consistente.
- **Módulo de Autenticación** (`AuthProvider`, roles, cookies seguras).
- **Catálogo de Servicios y Reserva por Pasos** con cálculo de disponibilidad en tiempo real.

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
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
