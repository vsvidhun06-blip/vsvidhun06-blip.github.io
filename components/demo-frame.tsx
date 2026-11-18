"use client";

import { useState, useSyncExternalStore } from "react";
import { Arrow } from "./ui";

const noop = () => () => {};

export default function DemoFrame({ src, title }: { src: string; title: string }) {
  const gpu = useSyncExternalStore(
    noop,
    () => "gpu" in navigator,
    () => null,
  );
  const [on, setOn] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-2)]">
      <div className="relative aspect-[16/10] w-full bg-[var(--bg)]">
        {on ? (
          <iframe src={src} title={title} className="absolute inset-0 h-full w-full" allow="fullscreen" />
        ) : (
          <div className="bg-grid absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
            <p className="display max-w-md text-3xl sm:text-4xl">Run the scene in your browser</p>
            <p className="max-w-md text-sm leading-relaxed text-[var(--fg-2)]">
              {gpu === false
                ? "This browser does not expose WebGPU, so the scene will show a notice instead. Recent Chrome or Edge on a desktop GPU works."
                : "About 5.6 MB, mostly the cabin mesh. WASD to move, hold and drag to look, buttons trigger the animations."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setOn(true)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--fg)] px-5 text-sm text-[var(--bg)] transition-opacity hover:opacity-90"
              >
                Load the live demo
              </button>
              <a href={src} className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--line-2)] px-5 text-sm text-[var(--fg)]">
                Open full screen <Arrow dir="up-right" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
