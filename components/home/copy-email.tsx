"use client";

import { useState } from "react";
import { site } from "@/content/site";

export default function CopyEmail() {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard?.writeText(site.email).then(
          () => {
            setDone(true);
            setTimeout(() => setDone(false), 2000);
          },
          () => {},
        )
      }
      className="h-11 rounded-full border border-[var(--line-2)] px-5 text-sm text-[var(--fg-2)] transition-colors hover:text-[var(--fg)]"
      aria-live="polite"
    >
      {done ? "Copied" : "Copy address"}
    </button>
  );
}
