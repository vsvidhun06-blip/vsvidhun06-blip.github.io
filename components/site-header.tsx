"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";
import { useUi } from "./providers";

export default function SiteHeader() {
  const { theme, toggleTheme, openCommand } = useUi();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenu(false);
  }

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || menu
          ? "border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3" aria-label={`${site.name}, home`}>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line-2)] font-mono text-[10px] tracking-wider text-[var(--fg)] transition-colors group-hover:border-[var(--accent)]">
            {site.initials}
          </span>
          <span className="hidden text-sm text-[var(--fg-2)] sm:block">
            {site.shortName}
            <span className="text-[var(--fg-3)]"> · {site.location}</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="link-u text-sm text-[var(--fg-2)] transition-colors hover:text-[var(--fg)]">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCommand}
            className="hidden h-8 items-center gap-2 rounded-full border border-[var(--line-2)] px-3 font-mono text-[11px] text-[var(--fg-2)] transition-colors hover:border-[var(--fg-3)] hover:text-[var(--fg)] sm:flex"
            aria-label="Open command menu"
          >
            Search <kbd className="text-[var(--fg-3)]">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line-2)] text-[var(--fg-2)] transition-colors hover:text-[var(--fg)]"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line-2)] text-[var(--fg)] md:hidden"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu((m) => !m)}
          >
            <span className="relative block h-2.5 w-3.5" aria-hidden>
              <span className={`absolute left-0 h-px w-full bg-current transition-transform duration-300 ${menu ? "top-1/2 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px w-full bg-current transition-transform duration-300 ${menu ? "top-1/2 -rotate-45" : "bottom-0"}`} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            className="container-x h-[calc(100dvh-4rem)] overflow-y-auto pb-10 pt-6 md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="space-y-1">
              {nav.map((n, i) => (
                <li key={n.href}>
                  <Link href={n.href} className="flex items-baseline gap-4 border-b border-[var(--line)] py-4" onClick={() => setMenu(false)}>
                    <span className="font-mono text-[11px] text-[var(--fg-3)]">0{i + 1}</span>
                    <span className="display text-4xl">{n.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <a className="rounded-full border border-[var(--line-2)] px-4 py-2" href={site.resume} target="_blank" rel="noopener">
                CV (PDF)
              </a>
              <a className="rounded-full border border-[var(--line-2)] px-4 py-2" href={`mailto:${site.email}`}>
                Email
              </a>
              <button
                type="button"
                className="rounded-full border border-[var(--line-2)] px-4 py-2"
                onClick={() => {
                  setMenu(false);
                  openCommand();
                }}
              >
                Search
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
