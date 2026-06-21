"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, reducedVariants, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Small uppercase label above the title (e.g. "Selected Impact"). */
  eyebrow?: string;
  /** The section title — rendered as an <h2>. */
  title: string;
  /** Optional supporting line under the title. */
  description?: string;
  /** Aligns content to the centre when true (default left). */
  centered?: boolean;
  className?: string;
}

/**
 * Consistent section header (eyebrow + h2 + optional description) with a shared
 * scroll-in animation. Used by every section so heading hierarchy and motion
 * stay uniform.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  className,
}: SectionHeadingProps) {
  const reduce = useReducedMotion();
  const variants = reduce ? reducedVariants : fadeUp;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn("max-w-2xl", centered && "mx-auto text-center", className)}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>
      )}
    </motion.div>
  );
}
