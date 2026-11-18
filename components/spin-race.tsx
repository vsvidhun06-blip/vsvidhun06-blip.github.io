"use client";

import { useState } from "react";
import { Evidence, Segmented } from "./ui";

type Mode = "plain" | "atomic";
type P = 1 | 2;

const PLAIN = ["temp = count", "temp = temp + 1", "count = temp"];
const ATOMIC = ["atomic { count = count + 1 }"];

interface S {
  count: number;
  pc: Record<P, number>;
  temp: Record<P, number | null>;
  trace: string[];
}

const init = (): S => ({ count: 0, pc: { 1: 0, 2: 0 }, temp: { 1: null, 2: null }, trace: [] });

export default function SpinRace() {
  const [mode, setMode] = useState<Mode>("plain");
  const [s, setS] = useState<S>(init);
  const prog = mode === "plain" ? PLAIN : ATOMIC;
  const done = s.pc[1] >= prog.length && s.pc[2] >= prog.length;

  const step = (p: P) =>
    setS((cur) => {
      const pc = cur.pc[p];
      if (pc >= prog.length) return cur;
      const n: S = { count: cur.count, pc: { ...cur.pc }, temp: { ...cur.temp }, trace: [...cur.trace] };
      if (mode === "atomic") n.count = cur.count + 1;
      else if (pc === 0) n.temp[p] = cur.count;
      else if (pc === 1) n.temp[p] = (cur.temp[p] ?? 0) + 1;
      else n.count = cur.temp[p] ?? 0;
      n.pc[p] = pc + 1;
      n.trace.push(`Vehicle ${p}: ${prog[pc]}`);
      return n;
    });

  const play = (order: P[]) => {
    let cur = init();
    const prg = mode === "plain" ? PLAIN : ATOMIC;
    for (const p of order) {
      const pc = cur.pc[p];
      if (pc >= prg.length) continue;
      const n: S = { count: cur.count, pc: { ...cur.pc }, temp: { ...cur.temp }, trace: [...cur.trace] };
      if (mode === "atomic") n.count = cur.count + 1;
      else if (pc === 0) n.temp[p] = cur.count;
      else if (pc === 1) n.temp[p] = (cur.temp[p] ?? 0) + 1;
      else n.count = cur.temp[p] ?? 0;
      n.pc[p] = pc + 1;
      n.trace.push(`Vehicle ${p}: ${prg[pc]}`);
      cur = n;
    }
    setS(cur);
  };

  const lost = done && s.count !== 2;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)]">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <Segmented
          label="Increment style"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setS(init());
          }}
          options={[
            { value: "plain", label: "Read, add, write" },
            { value: "atomic", label: "Atomic section" },
          ]}
        />
        <div className="flex flex-wrap gap-1.5">
          <Btn onClick={() => play(mode === "plain" ? [1, 2, 1, 2, 1, 2] : [1, 2])}>Interleave</Btn>
          <Btn onClick={() => play(mode === "plain" ? [1, 1, 1, 2, 2, 2] : [1, 2])}>One after the other</Btn>
          <Btn onClick={() => setS(init())}>Reset</Btn>
        </div>
      </div>
      <div className="grid gap-px bg-[var(--line)] md:grid-cols-3">
        {([1, 2] as P[]).map((p) => (
          <div key={p} className="bg-[var(--bg-2)] p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Vehicle {p}</p>
              <span className="font-mono text-[11px] text-[var(--fg-3)]">temp = {s.temp[p] ?? "·"}</span>
            </div>
            <ol className="mt-4 space-y-1.5 font-mono text-[12.5px]">
              {prog.map((line, i) => (
                <li
                  key={line}
                  className={`rounded-md px-2.5 py-1.5 ${
                    i === s.pc[p] ? "bg-[var(--accent-soft)] text-[var(--fg)]" : i < s.pc[p] ? "text-[var(--fg-3)] line-through decoration-[var(--line-2)]" : "text-[var(--fg-2)]"
                  }`}
                >
                  {line}
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => step(p)}
              disabled={s.pc[p] >= prog.length}
              className="mt-4 w-full rounded-full border border-[var(--line-2)] py-2 font-mono text-[12px] text-[var(--fg)] transition-colors hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Run vehicle {p}&apos;s next step
            </button>
          </div>
        ))}
        <div className="flex flex-col bg-[var(--bg-2)] p-4 sm:p-6" aria-live="polite">
          <p className="eyebrow">Shared counter</p>
          <p className="tabular display mt-2 text-7xl">{s.count}</p>
          <p className={`mt-2 text-sm ${lost ? "text-[var(--neg)]" : done ? "text-[var(--pos)]" : "text-[var(--fg-3)]"}`}>
            {lost ? "Two vehicles entered, the counter says one. A lost update." : done ? "Both increments counted." : "Pick who runs next."}
          </p>
          <ol className="mt-4 space-y-1 font-mono text-[11px] text-[var(--fg-3)]">
            {s.trace.map((t, i) => (
              <li key={i}>
                {i + 1}. {t}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-[var(--line)] px-4 py-4 text-[13px] leading-relaxed text-[var(--fg-3)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>
          You are the scheduler here. SPIN explores every order exhaustively, which is how it finds the one that loses an
          update.
        </span>
        <Evidence kind="illustrative">example from the report</Evidence>
      </div>
    </div>
  );
}

function Btn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className="rounded-full border border-[var(--line-2)] px-3 py-1.5 font-mono text-[11.5px] text-[var(--fg-2)] transition-colors hover:border-[var(--fg-3)] hover:text-[var(--fg)]"
    >
      {children}
    </button>
  );
}
