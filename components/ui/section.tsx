import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  /** Anchor id used for smooth-scroll navigation (e.g. "about"). */
  id: string;
  children: ReactNode;
  className?: string;
  /** Accessible label for the section landmark. */
  ariaLabel?: string;
}

/**
 * Standard section landmark: consistent vertical rhythm, responsive horizontal
 * padding, a centred max-width container, and a `scroll-mt` offset so anchored
 * navigation clears the sticky navbar. Wrapping every section here keeps spacing
 * uniform and avoids duplicated layout markup.
 */
export function Section({ id, children, className, ariaLabel }: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        "scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24 lg:py-32",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
