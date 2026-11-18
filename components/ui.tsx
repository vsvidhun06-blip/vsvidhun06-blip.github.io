"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";

/* Fade and lift into view once. Respects reduced motion via MotionConfig. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  // Visible by default. With JS, CSS hides `.reveal` until it scrolls into view,
  // so crawlers, print and no-JS visitors always get the content.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Comp = as as React.ElementType;
  return (
    <Comp ref={ref} className={`reveal ${className ?? ""}`} style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </Comp>
  );
}

export function SectionHeader({
  index,
  label,
  title,
  intro,
  id,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="grid gap-6 border-t border-[var(--line)] pt-6 md:grid-cols-12 md:gap-10">
      <div className="eyebrow flex gap-3 md:col-span-3">
        <span className="text-[var(--accent)]">{index}</span>
        <span>{label}</span>
      </div>
      <div className="md:col-span-9">
        <h2 id={id} className="display text-[clamp(2.4rem,5.4vw,4.6rem)]">
          {title}
        </h2>
        {intro && <div className="prose-body mt-6 max-w-2xl">{intro}</div>}
      </div>
    </div>
  );
}

export type EvidenceKind = "measured" | "tool" | "simulated" | "self-reported" | "proved" | "illustrative";

const EVIDENCE: Record<EvidenceKind, { label: string; color: string; title: string }> = {
  measured: { label: "Measured", color: "var(--pos)", title: "Measured on real hardware; source given alongside." },
  tool: { label: "Tool output", color: "var(--c-long)", title: "Produced by the tool itself; run and date given alongside." },
  simulated: { label: "Simulated", color: "var(--accent)", title: "Produced by an illustrative simulation in your browser. Not a measurement." },
  illustrative: { label: "Illustrative", color: "var(--accent)", title: "A conceptual explanation, not experimental evidence." },
  "self-reported": { label: "Self-reported", color: "var(--fg-2)", title: "Reported from work done at an employer; no public artifact." },
  proved: { label: "Machine-checked", color: "var(--violet)", title: "Proved in Isabelle/HOL with no sorry and no oracles." },
};

export function Evidence({ kind, children }: { kind: EvidenceKind; children?: React.ReactNode }) {
  const e = EVIDENCE[kind];
  return (
    <span
      title={e.title}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line-2)] px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-[var(--fg-2)]"
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: e.color }} aria-hidden />
      {e.label}
      {children && <span className="normal-case tracking-normal text-[var(--fg-3)]">· {children}</span>}
    </span>
  );
}

/* A button that leans slightly towards the pointer. Disabled for touch and reduced motion. */
export function Magnetic({
  href,
  children,
  variant = "ghost",
  external,
  download,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  external?: boolean;
  download?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.18);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const cls =
    variant === "solid"
      ? "bg-[var(--fg)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
      : "border border-[var(--line-2)] text-[var(--fg)] hover:border-[var(--fg-2)]";

  const inner = (
    <motion.span style={{ x: sx, y: sy }} className="inline-flex items-center gap-2">
      {children}
    </motion.span>
  );
  const common = {
    ref,
    onPointerMove: onMove,
    onPointerLeave: reset,
    className: `inline-flex h-11 items-center rounded-full px-5 text-sm transition-colors duration-300 ${cls}`,
  };
  if (external || download || href.startsWith("mailto:") || href.endsWith(".pdf")) {
    return (
      <a
        {...common}
        href={href}
        target={external || href.endsWith(".pdf") ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        download={download || undefined}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link {...common} href={href}>
      {inner}
    </Link>
  );
}

export function Arrow({ dir = "right" }: { dir?: "right" | "up-right" | "down" }) {
  const rot = dir === "up-right" ? -45 : dir === "down" ? 90 : 0;
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}

export function Figure({
  n,
  caption,
  children,
  evidence,
  className = "",
}: {
  n?: string;
  caption: React.ReactNode;
  children: React.ReactNode;
  evidence?: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={`rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-4 sm:p-6 ${className}`}>
      {children}
      <figcaption className="mt-4 flex flex-col items-start gap-3 border-t border-[var(--line)] pt-4 text-sm leading-relaxed text-[var(--fg-2)]">
        <span>
          {n && <span className="mr-2 font-mono text-[12px] text-[var(--fg-3)]">Fig. {n}</span>}
          {caption}
        </span>
        {evidence && <span className="shrink-0">{evidence}</span>}
      </figcaption>
    </figure>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.hint}
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-3 py-1.5 font-mono text-[11.5px] transition-colors ${
            value === o.value
              ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]"
              : "border-[var(--line-2)] text-[var(--fg-2)] hover:border-[var(--fg-3)] hover:text-[var(--fg)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
