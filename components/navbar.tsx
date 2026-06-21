"use client";

import { useEffect, useState } from "react";
import { cn, NAV_LINKS, RESUME_PATH } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Sticky navigation bar. Smooth scrolling is handled by CSS (`scroll-behavior`
 * + section `scroll-mt`), so anchors are plain links and remain functional with
 * JS disabled. The mobile menu is a disclosure toggled by the hamburger button.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on resize up to desktop to avoid a stuck-open state.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <a
          href="#"
          className="text-sm font-semibold tracking-tight text-text transition-colors hover:text-muted"
        >
          Vidhun Suja
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-text"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Button as="a" href={RESUME_PATH} download size="sm" variant="secondary">
            Download Resume
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <HamburgerIcon open={open} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "overflow-hidden border-border bg-background/95 backdrop-blur-md transition-[max-height] duration-300 ease-out md:hidden",
          open ? "max-h-96 border-b" : "max-h-0",
        )}
      >
        <ul className="flex flex-col gap-1 px-5 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-text"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="px-3 pt-2">
            <Button
              as="a"
              href={RESUME_PATH}
              download
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Download Resume
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="4" y1="4" x2="16" y2="16" />
          <line x1="16" y1="4" x2="4" y2="16" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="17" y2="6" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="14" x2="17" y2="14" />
        </>
      )}
    </svg>
  );
}
