"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";
import CommandMenu from "./command-menu";

type Theme = "dark" | "light";

interface UiContext {
  theme: Theme;
  toggleTheme: () => void;
  openCommand: () => void;
}

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

const Ctx = createContext<UiContext>({ theme: "dark", toggleTheme: () => {}, openCommand: () => {} });
export const useUi = () => useContext(Ctx);

export default function Providers({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "dark" as Theme);
  const [open, setOpen] = useState(false);

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this page.
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Ctx.Provider value={{ theme, toggleTheme, openCommand: () => setOpen(true) }}>
        {children}
        <CommandMenu open={open} onClose={() => setOpen(false)} onToggleTheme={toggleTheme} theme={theme} />
      </Ctx.Provider>
    </MotionConfig>
  );
}
