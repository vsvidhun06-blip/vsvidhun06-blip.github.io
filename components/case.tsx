"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Arrow } from "./ui";
import { projects } from "@/content/projects";

export interface CaseMeta {
  label: string;
  value: React.ReactNode;
}

export function CaseHeader({
  kicker,
  title,
  lede,
  meta,
  links,
}: {
  kicker: string;
  title: React.ReactNode;
  lede: React.ReactNode;
  meta: CaseMeta[];
  links: { label: string; href: string }[];
}) {
  return (
    <header className="container-x pt-28 sm:pt-36">
      <nav aria-label="Breadcrumb" className="eyebrow flex items-center gap-2">
        <Link href="/#work" className="link-u hover:text-[var(--fg)]">
          Work
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--fg-2)]">{kicker}</span>
      </nav>
      <motion.h1
        className="display mt-8 max-w-6xl text-[clamp(3rem,9vw,8.5rem)]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        {title}
      </motion.h1>
      <motion.div
        className="mt-10 grid gap-10 border-t border-[var(--line)] pt-8 md:grid-cols-12"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-[clamp(1.1rem,1.7vw,1.35rem)] leading-[1.55] text-[var(--fg)] md:col-span-7">{lede}</div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm md:col-span-4 md:col-start-9">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="eyebrow">{m.label}</dt>
              <dd className="mt-1.5 leading-snug text-[var(--fg-2)]">{m.value}</dd>
            </div>
          ))}
          {links.length > 0 && (
            <div className="col-span-2 flex flex-wrap gap-3 pt-2">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--line-2)] px-4 text-[13px] text-[var(--fg)] transition-colors hover:border-[var(--accent)]"
                >
                  {l.label} <Arrow dir="up-right" />
                </a>
              ))}
            </div>
          )}
        </dl>
      </motion.div>
    </header>
  );
}

export function CaseBody({ toc, children }: { toc: { id: string; label: string }[]; children: React.ReactNode }) {
  const [active, setActive] = useState(toc[0]?.id);
  useEffect(() => {
    const els = toc.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [toc]);

  return (
    <div className="container-x mt-20 grid gap-10 lg:grid-cols-12 lg:gap-12">
      <aside className="hidden lg:col-span-3 lg:block">
        <nav aria-label="On this page" className="sticky top-28">
          <p className="eyebrow mb-4">On this page</p>
          <ol className="space-y-0.5 border-l border-[var(--line)]">
            {toc.map((t, i) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  aria-current={active === t.id ? "true" : undefined}
                  className={`-ml-px flex gap-3 border-l py-1.5 pl-4 text-[13px] transition-colors ${
                    active === t.id ? "border-[var(--accent)] text-[var(--fg)]" : "border-transparent text-[var(--fg-3)] hover:text-[var(--fg-2)]"
                  }`}
                >
                  <span className="font-mono text-[11px]">{String(i + 1).padStart(2, "0")}</span>
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      <div className="min-w-0 lg:col-span-9">{children}</div>
    </div>
  );
}

export function CaseSection({
  id,
  n,
  title,
  children,
  wide,
}: {
  id: string;
  n: string;
  title: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mb-28 scroll-mt-28">
      <div className="mb-8 flex items-baseline gap-4 border-t border-[var(--line)] pt-5">
        <span className="font-mono text-[12px] text-[var(--accent)]">{n}</span>
        <h2 id={`${id}-h`} className="display text-[clamp(2rem,4vw,3.4rem)]">
          {title}
        </h2>
      </div>
      <div className={wide ? "" : "max-w-3xl"}>{children}</div>
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="prose-body space-y-5">{children}</div>;
}

export function KeyList({ items }: { items: { t: string; d: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {items.map((i) => (
        <div key={i.t} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8">
          <dt className="text-[15px] text-[var(--fg)]">{i.t}</dt>
          <dd className="text-[15px] leading-relaxed text-[var(--fg-2)]">{i.d}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Shot({ src, alt, caption, evidence, w, h }: { src: string; alt: string; caption: React.ReactNode; evidence?: React.ReactNode; w: number; h: number }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-2)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" className="block h-auto w-full border-b border-[var(--line)]" />
      <figcaption className="flex flex-col items-start gap-3 p-4 text-[13px] leading-relaxed text-[var(--fg-2)] sm:p-5">
        <span>{caption}</span>
        {evidence && <span className="shrink-0">{evidence}</span>}
      </figcaption>
    </figure>
  );
}

export function NextProject({ current }: { current: string }) {
  const list = projects.filter((p) => p.caseStudy);
  const i = list.findIndex((p) => p.slug === current);
  const next = list[(i + 1) % list.length]!;
  return (
    <div className="container-x mb-10">
      <Link href={next.caseStudy!} className="group block border-t border-[var(--line)] pt-8">
        <p className="eyebrow">Next case study</p>
        <p className="display mt-4 flex items-center gap-4 text-[clamp(2.4rem,6vw,5.5rem)] transition-colors group-hover:text-[var(--accent)]">
          {next.title}
          <span className="transition-transform duration-300 group-hover:translate-x-2">
            <Arrow />
          </span>
        </p>
        <p className="mt-3 max-w-2xl text-[15px] text-[var(--fg-2)]">{next.line}</p>
      </Link>
    </div>
  );
}
