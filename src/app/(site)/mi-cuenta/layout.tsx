"use client";

import { RequireAuth } from "@/features/auth/components/require-auth";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

