"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import InferenceFlow from "@/components/inference/InferenceFlow";
import type { ReqClass } from "@/components/inference/sim";
import { Arrow, Evidence, Magnetic } from "@/components/ui";
import { site } from "@/content/site";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const injectRef = useRef<((cls?: ReqClass, n?: number) => void) | null>(null);
  const [playing, setPlaying] = useState(true);

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-70" aria-hidden />

      <div className="container-x relative">
        <motion.p
          className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 text-[var(--fg-2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
            {site.role}
          </span>
          <span aria-hidden>·</span>
          <span>AI infrastructure and systems research</span>
          <span aria-hidden>·</span>
          <span>{site.location}</span>
        </motion.p>

        <h1 id="hero-title" className="display mt-8 text-[clamp(3.3rem,11.5vw,10.5rem)] leading-[0.88]">
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease }}
          >
            Vidhun
          </motion.span>
          <motion.span
            className="block text-[var(--fg-2)]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.08, ease }}
          >
            <em className="italic">Vijayakumar</em> Suja
          </motion.span>
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-10">
          <motion.div
            className="md:col-span-7 lg:col-span-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
          >
            <p className="text-[clamp(1.15rem,1.9vw,1.45rem)] leading-[1.5] text-[var(--fg)]">
              I build complex systems and then take them apart to see what actually matters. Lately that means an LLM
              serving engine written from scratch, a controller that tries to tune it while it runs, and an SMT-based
              checker for weak memory models.
            </p>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--fg-2)]">
              I care about measuring carefully and about saying exactly how far a result goes. MSc Software Engineering
              from Heriot-Watt, with three manuscripts under review.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic href="/#work" variant="solid">
                Explore projects <Arrow />
              </Magnetic>
              <Magnetic href="/#research">View research</Magnetic>
              <Magnetic href={site.resume}>Download CV</Magnetic>
              <Magnetic href="/#contact">Contact me</Magnetic>
            </div>
          </motion.div>

          <motion.ul
            className="flex flex-col gap-0 self-end md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.45 }}
            aria-label="Specialisations"
          >
            {site.specialisations.map((s, i) => (
              <li key={s} className="flex items-baseline gap-4 border-t border-[var(--line)] py-2.5 text-sm text-[var(--fg-2)] last:border-b">
                <span className="font-mono text-[11px] text-[var(--fg-3)]">0{i + 1}</span>
                {s}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.figure
          className="mt-16 rounded-2xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-2)_70%,transparent)] p-3 sm:mt-20 sm:p-5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease }}
        >
          <div className="mb-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] text-[var(--fg-3)]">Fig. 0</span>
              <span className="text-sm text-[var(--fg)]">A miniature inference server, running in your browser</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <HeroButton onClick={() => injectRef.current?.("chat")}>+ chat</HeroButton>
              <HeroButton onClick={() => injectRef.current?.("long")}>+ long prompt</HeroButton>
              <HeroButton onClick={() => injectRef.current?.("shared")}>+ shared prefix</HeroButton>
              <HeroButton onClick={() => injectRef.current?.(undefined, 6)}>burst ×6</HeroButton>
              <HeroButton onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
                {playing ? "pause" : "play"}
              </HeroButton>
            </div>
          </div>
          <InferenceFlow compact policy="prefix" workload="mixed" injectRef={injectRef} playing={playing} />
          <figcaption className="mt-2 flex flex-col gap-3 border-t border-[var(--line)] px-1 pt-4 text-[13px] leading-relaxed text-[var(--fg-2)] sm:flex-row sm:items-start sm:justify-between">
            <span className="max-w-3xl">
              Requests are routed by prompt type, admitted into a continuous batch when KV blocks are free, prefilled in
              chunks alongside running decodes, and stream tokens until done. Shared system prompts reuse cached prefix
              blocks (hatched). This is a teaching model of the ideas inside{" "}
              <a className="text-[var(--fg)] underline decoration-[var(--line-2)] underline-offset-4" href="/work/mini-vllm-carl/">
                Mini-vLLM
              </a>
              ; its timings are made up.
            </span>
            <Evidence kind="simulated" />
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}

function HeroButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className="rounded-full border border-[var(--line-2)] px-3 py-1.5 font-mono text-[11px] text-[var(--fg-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
    >
      {children}
    </button>
  );
}
