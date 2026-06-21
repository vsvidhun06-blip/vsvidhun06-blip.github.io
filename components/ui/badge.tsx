import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "metric" | "tech";

interface BadgeProps {
  children: ReactNode;
  /**
   * `metric` — emphasised pill for headline numbers.
   * `tech` — quieter tag for technology names.
   */
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  metric:
    "border-border bg-surface text-text font-medium",
  tech: "border-border/70 bg-transparent text-muted",
};

/** Small inline pill used for metrics (emphasised) and tech tags (quiet). */
export function Badge({ children, variant = "metric", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-tight whitespace-nowrap",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
