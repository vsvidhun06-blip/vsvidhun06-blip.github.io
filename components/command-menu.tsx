"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

type Item = {
  id: string;
  label: string;
  hint: string;
  group: "Go to" | "Case studies" | "Projects" | "Actions";
  run: () => void;
};

export default function CommandMenu({
  open,
  onClose,
  onToggleTheme,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
  theme: "dark" | "light";
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const items: Item[] = useMemo(() => {
    const go = (href: string) => () => {
      onClose();
      router.push(href);
    };
    const ext = (href: string) => () => {
      onClose();
      window.open(href, "_blank", "noopener,noreferrer");
    };
    return [
      { id: "home", label: "Home", hint: "/", group: "Go to", run: go("/") },
      { id: "work", label: "Featured work", hint: "#work", group: "Go to", run: go("/#work") },
      { id: "research", label: "Research and publications", hint: "#research", group: "Go to", run: go("/#research") },
      { id: "skills", label: "Skills, with evidence", hint: "#skills", group: "Go to", run: go("/#skills") },
      { id: "leetcode", label: "Problem solving", hint: "#problem-solving", group: "Go to", run: go("/#problem-solving") },
      { id: "journey", label: "Journey", hint: "#journey", group: "Go to", run: go("/#journey") },
      { id: "archive", label: "Project archive", hint: "/archive", group: "Go to", run: go("/archive/") },
      { id: "contact", label: "Contact", hint: "#contact", group: "Go to", run: go("/#contact") },
      ...projects
        .filter((p) => p.caseStudy)
        .map((p) => ({ id: `cs-${p.slug}`, label: p.title, hint: "case study", group: "Case studies" as const, run: go(p.caseStudy!) })),
      ...projects
        .filter((p) => !p.caseStudy)
        .map((p) => ({ id: `p-${p.slug}`, label: p.title, hint: p.kind.toLowerCase(), group: "Projects" as const, run: go(`/archive/#${p.slug}`) })),
      {
        id: "copy-email",
        label: copied ? "Email copied" : "Copy email address",
        hint: site.email,
        group: "Actions",
        run: () => {
          navigator.clipboard?.writeText(site.email).then(() => setCopied(true), () => {});
        },
      },
      { id: "cv", label: "Download CV (PDF)", hint: "resume", group: "Actions", run: ext(site.resume) },
      { id: "theme", label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme", hint: "theme", group: "Actions", run: () => { onToggleTheme(); } },
      { id: "gh", label: "Open GitHub", hint: "github.com", group: "Actions", run: ext(site.links.github) },
      { id: "li", label: "Open LinkedIn", hint: "linkedin.com", group: "Actions", run: ext(site.links.linkedin) },
      { id: "lc", label: "Open LeetCode", hint: "leetcode.com", group: "Actions", run: ext(site.links.leetcode) },
    ];
  }, [router, onClose, onToggleTheme, theme, copied]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((i) => `${i.label} ${i.hint} ${i.group}`.toLowerCase().includes(t));
  }, [items, q]);

  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setQ("");
      setActive(0);
      setCopied(false);
    }
  }

  useEffect(() => {
    if (open) {
      restoreFocus.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      restoreFocus.current?.focus?.();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);


  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      // Keep focus inside the dialog.
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-[var(--bg)]/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-[var(--line-2)] bg-[var(--bg-2)] shadow-2xl shadow-black/40"
            initial={{ y: 12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
              <span className="font-mono text-xs text-[var(--fg-3)]" aria-hidden>
                ⌘K
              </span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Jump to a project, section or action"
                className="h-14 w-full bg-transparent text-[15px] text-[var(--fg)] placeholder:text-[var(--fg-3)] focus:outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
                aria-activedescendant={filtered[active] ? `cmd-${filtered[active]!.id}` : undefined}
                aria-autocomplete="list"
              />
              <kbd className="hidden rounded border border-[var(--line-2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--fg-3)] sm:block">
                esc
              </kbd>
            </div>
            <ul ref={listRef} id="command-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-[var(--fg-3)]">Nothing matches “{q}”.</li>}
              {filtered.map((item, i) => {
                const header = item.group !== lastGroup;
                lastGroup = item.group;
                return (
                  <li key={item.id} role="presentation">
                    {header && <div className="eyebrow px-3 pb-1 pt-3">{item.group}</div>}
                    <div
                      id={`cmd-${item.id}`}
                      role="option"
                      aria-selected={i === active}
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => item.run()}
                      className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors ${
                        i === active ? "bg-[var(--bg-3)] text-[var(--fg)]" : "text-[var(--fg-2)]"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-[11px] text-[var(--fg-3)]">{item.hint}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between border-t border-[var(--line)] px-4 py-2 font-mono text-[10px] text-[var(--fg-3)]">
              <span>↑ ↓ to move · enter to open</span>
              <span>ctrl or ⌘ + K anywhere</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
