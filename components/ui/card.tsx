import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds an interactive hover treatment (border + subtle lift). */
  interactive?: boolean;
}

/**
 * Surface container with a hairline border. The base primitive for project,
 * experience, and research cards. Pass `interactive` for hover affordance.
 */
export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface",
        interactive &&
          "transition-colors duration-300 hover:border-muted/40 hover:bg-surface/80",
        className,
      )}
    >
      {children}
    </div>
  );
}
