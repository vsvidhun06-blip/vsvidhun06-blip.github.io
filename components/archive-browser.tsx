"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { categories, projects, type Category } from "@/content/projects";
import { Arrow } from "./ui";

const kinds = Array.from(new Set(projects.map((p) => p.kind)));
const techCount = new Map<string, number>();
projects.forEach((p) => p.tech.forEach((t) => techCount.set(t, (techCount.get(t) ?? 0) + 1)));
const topTech = [...techCount.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 14)
  .map(([t]) => t);

export default function ArchiveBrowser() {
  const [cat, setCat] = useState<Category | "All">("All");
  const [kind, setKind] = useState<string>("All");
  const [tech, setTech] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (!h || !projects.some((p) => p.slug === h)) return;
    const id = requestAnimationFrame(() => {
      setOpen(h);
      document.getElementById(h)?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return projects
      .filter((p) => cat === "All" || p.categories.includes(cat))
      .filter((p) => kind === "All" || p.kind === kind)
      .filter((p) => !tech || p.tech.includes(tech))
      .filter((p) => !s || [p.title, p.line, p.summary, ...p.tech].join(" ").toLowerCase().includes(s))
      .sort((a, b) => b.year - a.year);
  }, [cat, kind, tech, q]);

  const reset = () => {
    setCat("All");
    setKind("All");
    setTech(null);
    setQ("");
  };
  const filtered = cat !== "All" || kind !== "All" || tech !== null || q !== "";

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
            {(["All", ...categories] as const).map((c) => (
              <Chip key={c} on={cat === c} onClick={() => setCat(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="arch-kind">
              Type
            </label>
            <select
              id="arch-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="h-9 rounded-full border border-[var(--line-2)] bg-[var(--bg)] px-3 font-mono text-[11.5px] text-[var(--fg-2)]"
            >
              <option value="All">All types</option>
              {kinds.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="arch-q">
              Search projects
            </label>
            <input
              id="arch-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="h-9 w-full min-w-0 rounded-full border border-[var(--line-2)] bg-[var(--bg)] px-4 text-sm text-[var(--fg)] placeholder:text-[var(--fg-3)] lg:w-56"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Technology">
          <span className="mr-1 font-mono text-[10.5px] uppercase tracking-wider text-[var(--fg-3)]">Tech</span>
          {topTech.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tech === t}
              onClick={() => setTech((x) => (x === t ? null : t))}
              className={`rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors ${
                tech === t ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between font-mono text-[12px] text-[var(--fg-3)]" aria-live="polite">
        <span>
          {list.length} of {projects.length} projects
        </span>
        {filtered && (
          <button type="button" onClick={reset} className="underline underline-offset-4 hover:text-[var(--fg)]">
            Clear filters
          </button>
        )}
      </div>

      <ul className="mt-4 border-t border-[var(--line)]">
        <AnimatePresence initial={false}>
          {list.map((p) => {
            const isOpen = open === p.slug;
            return (
              <motion.li
                key={p.slug}
                id={p.slug}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="scroll-mt-48 border-b border-[var(--line)]"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`${p.slug}-panel`}
                  onClick={() => setOpen(isOpen ? null : p.slug)}
                  className="group grid w-full gap-2 py-6 text-left md:grid-cols-12 md:items-baseline md:gap-6"
                >
                  <span className="font-mono text-[12px] text-[var(--fg-3)] md:col-span-1">{p.year}</span>
                  <span className="text-xl text-[var(--fg)] transition-colors group-hover:text-[var(--accent)] md:col-span-4 md:text-2xl">{p.title}</span>
                  <span className="text-[15px] leading-relaxed text-[var(--fg-2)] md:col-span-5">{p.line}</span>
                  <span className="flex items-center justify-between gap-2 font-mono text-[11px] text-[var(--fg-3)] md:col-span-2 md:justify-end">
                    {p.kind}
                    <span className={`text-lg transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} aria-hidden>
                      +
                    </span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${p.slug}-panel`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-8 pb-8 md:grid-cols-12 md:gap-6">
                        <div className="md:col-span-6 md:col-start-2">
                          <p className="text-[15px] leading-relaxed text-[var(--fg-2)]">{p.summary}</p>
                          <ul className="mt-5 space-y-2">
                            {p.highlights.map((h) => (
                              <li key={h} className="flex gap-3 text-[14px] leading-relaxed text-[var(--fg-2)]">
                                <span className="mt-2.5 h-px w-3 shrink-0 bg-[var(--fg-3)]" aria-hidden />
                                {h}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-5 font-mono text-[11px] text-[var(--fg-3)]">Written from: {p.source}</p>
                        </div>
                        <div className="space-y-5 md:col-span-4 md:col-start-9">
                          <div>
                            <p className="eyebrow">Period</p>
                            <p className="mt-1.5 text-sm text-[var(--fg-2)]">{p.period}</p>
                          </div>
                          <div>
                            <p className="eyebrow">Built with</p>
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                              {p.tech.map((t) => (
                                <li key={t} className="rounded-full border border-[var(--line)] px-2.5 py-1 font-mono text-[10.5px] text-[var(--fg-3)]">
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-2">
                            {p.caseStudy && (
                              <Link href={p.caseStudy} className="link-u inline-flex items-center gap-1.5 text-sm text-[var(--fg)]">
                                Case study <Arrow />
                              </Link>
                            )}
                            {p.links.map((l) => (
                              <a
                                key={l.href}
                                href={l.href}
                                target={l.href.startsWith("http") ? "_blank" : undefined}
                                rel="noopener noreferrer"
                                className="link-u inline-flex items-center gap-1.5 text-sm text-[var(--fg)]"
                              >
                                {l.label} <Arrow dir="up-right" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {list.length === 0 && <p className="py-16 text-center text-[var(--fg-3)]">Nothing matches those filters.</p>}
    </div>
  );
}

function Chip({ on, children, ...rest }: { on: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={on}
      {...rest}
      className={`rounded-full border px-3 py-1.5 font-mono text-[11.5px] transition-colors ${
        on ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]" : "border-[var(--line-2)] text-[var(--fg-2)] hover:border-[var(--fg-3)] hover:text-[var(--fg)]"
      }`}
    >
      {children}
    </button>
  );
}
