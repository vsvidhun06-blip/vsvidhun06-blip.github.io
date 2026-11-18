"use client";

import { useRef, useState } from "react";
import InferenceFlow from "./InferenceFlow";
import type { Policy, ReqClass, Workload } from "./sim";
import { Evidence, Segmented } from "@/components/ui";

const POLICIES: { value: Policy; label: string; watch: string }[] = [
  {
    value: "static",
    label: "Static batching",
    watch:
      "A batch is admitted only when the previous one has fully finished. Watch the queue grow while one slow request holds the whole batch, and new arrivals wait even though KV blocks are free.",
  },
  {
    value: "continuous",
    label: "Continuous batching",
    watch:
      "Finished requests leave and new ones join at every step. Without chunking, any step with prefill work runs only prefill, so a long prompt stalls every decode for that step. Look for the GPU step flipping between prefill and decode.",
  },
  {
    value: "chunked",
    label: "+ chunked prefill",
    watch:
      "Each step has a token budget. Running decodes take one token each, and the rest of the budget feeds prefill in chunks, so long prompts no longer freeze decoding. Steps become mixed.",
  },
  {
    value: "prefix",
    label: "+ prefix caching",
    watch:
      "The first request with the shared system prompt publishes its first four KV blocks (hatched). Later shared requests reuse them and start prefill 64 tokens in. Try the shared-prompt workload.",
  },
  {
    value: "adaptive",
    label: "Adaptive controller (concept)",
    watch:
      "A rule classifies waiting work as interactive or long context and picks a batch size and chunk budget from a fixed table, which is the shape of CARL's decision. It is not CARL's learner, and the measured results below show a well-tuned static configuration did as well or better.",
  },
];

const WORKLOADS: { value: Workload; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  { value: "chat", label: "Short chat" },
  { value: "long", label: "Long context" },
  { value: "shared", label: "Shared system prompt" },
  { value: "burst", label: "Bursty" },
];

export default function Explorer() {
  const [policy, setPolicy] = useState<Policy>("continuous");
  const [workload, setWorkload] = useState<Workload>("mixed");
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [reset, setReset] = useState(0);
  const injectRef = useRef<((cls?: ReqClass, n?: number) => void) | null>(null);
  const stepRef = useRef<(() => void) | null>(null);
  const p = POLICIES.find((x) => x.value === policy)!;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)]">
      <div className="grid gap-5 border-b border-[var(--line)] p-4 sm:p-6 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-2.5">Scheduling policy</p>
          <Segmented label="Scheduling policy" value={policy} onChange={setPolicy} options={POLICIES.map(({ value, label }) => ({ value, label }))} />
        </div>
        <div>
          <p className="eyebrow mb-2.5">Workload</p>
          <Segmented label="Workload" value={workload} onChange={setWorkload} options={WORKLOADS} />
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <InferenceFlow
          key={`${policy}-${workload}-${reset}`}
          policy={policy}
          workload={workload}
          playing={playing}
          speed={speed}
          injectRef={injectRef}
          stepRef={stepRef}
          label={`Serving engine simulation, ${p.label}, ${workload} workload`}
        />
      </div>

      <div className="grid gap-6 border-t border-[var(--line)] p-4 sm:p-6 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow">What to watch</p>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--fg-2)]" aria-live="polite">
            {p.watch}
          </p>
        </div>
        <div className="flex flex-wrap content-start items-center gap-1.5 lg:max-w-[320px] lg:justify-end">
          <Btn onClick={() => setPlaying((x) => !x)}>{playing ? "Pause" : "Play"}</Btn>
          <Btn onClick={() => stepRef.current?.()} disabled={playing}>
            Step
          </Btn>
          <Btn onClick={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}>Speed {speed}x</Btn>
          <Btn onClick={() => setReset((r) => r + 1)}>Reset</Btn>
          <Btn onClick={() => injectRef.current?.("chat")}>+ chat</Btn>
          <Btn onClick={() => injectRef.current?.("long")}>+ long</Btn>
          <Btn onClick={() => injectRef.current?.("shared")}>+ shared</Btn>
          <Btn onClick={() => injectRef.current?.(undefined, 8)}>burst ×8</Btn>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-[var(--line)] px-4 py-4 text-[13px] leading-relaxed text-[var(--fg-3)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>
          48 KV blocks of 16 tokens, at most 6 running requests (8 under the adaptive rule), recompute-style preemption when
          the cache fills. Step cost is a made-up linear model, so compare policies by shape, not by number.
        </span>
        <Evidence kind="simulated" />
      </div>
    </div>
  );
}

function Btn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className="rounded-full border border-[var(--line-2)] px-3 py-1.5 font-mono text-[11.5px] text-[var(--fg-2)] transition-colors hover:border-[var(--fg-3)] hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
