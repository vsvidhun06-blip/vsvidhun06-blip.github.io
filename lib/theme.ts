/**
 * Design tokens for the monochrome dark theme.
 *
 * These are the canonical colour values. They are mirrored as CSS custom
 * properties in `app/globals.css` (and exposed to Tailwind via `@theme inline`),
 * so components should normally reference the Tailwind utilities
 * (`bg-background`, `text-muted`, `border-border`, …) rather than importing
 * these constants. The export exists so non-CSS contexts (canvas, charts, the
 * future React Three Fiber hero, metric visualisations) can read the exact same
 * palette without duplicating hex codes.
 */
export const theme = {
  /** Page background — near-black, not pure black. */
  background: "#050505",
  /** Raised surfaces: cards, the nav bar, form fields. */
  surface: "#0b0b0b",
  /** Hairline borders and dividers. */
  border: "#1a1a1a",
  /** Primary foreground text. */
  text: "#fafafa",
  /** Secondary / de-emphasised text. */
  muted: "#a1a1aa",
} as const;

export type ThemeToken = keyof typeof theme;

export type Theme = typeof theme;
