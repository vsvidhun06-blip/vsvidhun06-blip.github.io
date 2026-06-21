"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  animate as animateValue,
} from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { staggerContainer, staggerItem, reducedVariants, viewportOnce } from "@/lib/motion";
import { EASE_OUT } from "@/lib/motion";
import { stats } from "@/data/stats";
import type { Stat } from "@/types";

export function Impact() {
  const reduce = useReducedMotion();
  const container = reduce ? reducedVariants : staggerContainer;
  const item = reduce ? reducedVariants : staggerItem;

  return (
    <Section id="impact" ariaLabel="Selected impact">
      <SectionHeading
        eyebrow="Selected Impact"
        title="Numbers that anchor the work"
      />

      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5"
      >
        {stats.map((stat) => (
          <motion.li
            key={stat.id}
            variants={item}
            className="flex flex-col gap-2 bg-surface p-6"
          >
            <span className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              <CountUp stat={stat} disabled={!!reduce} />
            </span>
            <span className="text-sm leading-snug text-muted">{stat.label}</span>
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  );
}

/**
 * Counts from 0 to `stat.value` when scrolled into view. With reduced motion
 * (`disabled`) it renders the final value immediately. Formatting (decimals,
 * thousands separators, prefix/suffix) matches the résumé wording.
 */
function CountUp({ stat, disabled }: { stat: Stat; disabled: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(disabled ? stat.value : 0);

  useEffect(() => {
    if (disabled) {
      setDisplay(stat.value);
      return;
    }
    if (!inView) return;
    const controls = animateValue(0, stat.value, {
      duration: 1.4,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, disabled, stat.value]);

  const formatted = display.toLocaleString("en-US", {
    minimumFractionDigits: stat.decimals ?? 0,
    maximumFractionDigits: stat.decimals ?? 0,
  });

  return (
    <span ref={ref}>
      {stat.prefix}
      {formatted}
      {stat.suffix}
    </span>
  );
}
