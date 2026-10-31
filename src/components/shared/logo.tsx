import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-lg">CitaPro</span>
    </Link>
  );
}

