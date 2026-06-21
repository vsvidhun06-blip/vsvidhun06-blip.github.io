/**
 * Centralised Framer Motion variants and transition presets.
 *
 * Animation philosophy: subtle and premium (Linear / Vercel style). Motion
 * should support hierarchy, not distract. All movement uses CSS transforms
 * (`opacity` + `transform`) rather than layout-affecting properties so the
 * compositor can run it off the main thread.
 *
 * Reduced motion: components read `useReducedMotion()` (or the CSS media query)
 * and swap in `reducedVariants` / skip animations entirely. Keeping the
 * variants here means that policy is applied consistently everywhere.
 */
import type { Variants, Transition } from "framer-motion";

/** Premium easing curve (ease-out cubic) used across the site. */
export const EASE_OUT: Transition["ease"] = [0.16, 1, 0.3, 1];

/** Default transition for entrance animations. */
export const transition: Transition = {
  duration: 0.6,
  ease: EASE_OUT,
};

/** Fade + rise. The workhorse entrance for headings and content blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition,
  },
};

/** Simple fade, no movement — for backgrounds and large surfaces. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition },
};

/**
 * Stagger container. Children using `fadeUp`/`staggerItem` animate in sequence.
 * Apply to a parent with `variants={staggerContainer}`.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

/** Child item paired with `staggerContainer`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition,
  },
};

/**
 * Reduced-motion replacement: instant cross-fade with no transform. Components
 * substitute this whenever `prefers-reduced-motion: reduce` is set.
 */
export const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

/** Shared viewport config for scroll-triggered `whileInView` animations. */
export const viewportOnce = { once: true, amount: 0.2 } as const;
