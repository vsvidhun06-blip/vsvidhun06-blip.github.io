"use client";

import { useMemo, useState } from "react";
import { litmusTests, type LEdge, type LEvent, type LitmusTest, type Model, type Rel } from "@/content/litmus";
import { Evidence, Segmented } from "./ui";

const MODELS: Model[] = ["SC", "TSO", "PSO", "RA", "WEAKEST", "RC11"];

const REL: Record<Rel, { name: string; color: string; dashed?: boolean }> = {
  po: { name: "po · program order", color: "var(--fg-3)" },
  rf: { name: "rf · reads from", color: "var(--c-long)" },
  co: { name: "co · coherence", color: "var(--c-chat)" },
  fr: { name: "fr · from-read", color: "var(--violet)" },
  dep: { name: "dep · semantic dependency", color: "var(--c-shared)" },
  fakedep: { name: "dep · syntactic only (fake)", color: "var(--c-shared)", dashed: true },
};

const NW = 150;
const NH = 40;
const COLW = 230;
const ROW0 = 46;
const ROWH = 112;

type Pt = { x: number; y: number };

function edgeKey(e: LEdge) {
  return `${e.from}>${e.to}:${e.rel}`;
}

function inCycle(e: LEdge, cycle: string[] | undefined) {
  if (!cycle) return false;
  return cycle.some((c) => {
    const [pair, rel] = c.split(":");
    if (pair !== `${e.from}>${e.to}`) return false;
    if (rel) return rel === e.rel;
    return e.rel !== "dep" && e.rel !== "fakedep";
  });
}

function layout(t: LitmusTest) {
  const nThreads = t.threads.length;
  const order = t.order ?? t.threads.map((_, i) => i);
  const col = (thread: number) => order.indexOf(thread);
  const W = 60 + nThreads * COLW;
  const minRow = Math.min(...t.events.map((e) => (e.thread < 0 ? 0 : e.row)));
  const maxRow = Math.max(...t.events.map((e) => e.row));
  const H = ROW0 + (maxRow - minRow) * ROWH + NH / 2 + 30;
  const pos = new Map<string, Pt & { w: number; col: number; row: number }>();
  for (const ev of t.events) {
    if (ev.thread < 0) pos.set(ev.id, { x: W / 2, y: ROW0, w: 200, col: -1, row: 0 });
    else pos.set(ev.id, { x: 30 + COLW / 2 + col(ev.thread) * COLW, y: ROW0 + (ev.row - minRow) * ROWH, w: NW, col: col(ev.thread), row: ev.row });
  }
  return { W, H, pos, nThreads, order };
}

type Placed = ReturnType<typeof layout>;

function geometry(e: LEdge, L: Placed, twin: boolean): { d: string; label: Pt } {
  const a = L.pos.get(e.from)!;
  const b = L.pos.get(e.to)!;
  const k = 70;
  let p0: Pt, p1: Pt, c0: Pt, c1: Pt;
  if (a.col === b.col && a.col >= 0) {
    if (e.rel === "po" || !twin) {
      p0 = { x: a.x - (twin ? 22 : 0), y: a.y + NH / 2 };
      p1 = { x: b.x - (twin ? 22 : 0), y: b.y - NH / 2 };
      c0 = p0;
      c1 = p1;
    } else {
      p0 = { x: a.x + a.w / 2, y: a.y };
      p1 = { x: b.x + b.w / 2, y: b.y };
      c0 = { x: p0.x + 48, y: p0.y + 10 };
      c1 = { x: p1.x + 48, y: p1.y - 10 };
    }
  } else if (a.col === -1) {
    if (b.row === 1) {
      p0 = { x: a.x + Math.sign(b.x - a.x) * 60, y: a.y + NH / 2 };
      p1 = { x: b.x, y: b.y - NH / 2 };
      c0 = { x: p0.x, y: p0.y + 40 };
      c1 = { x: p1.x, y: p1.y - 40 };
    } else {
      const outward = b.col < L.nThreads / 2 ? -1 : 1;
      p0 = { x: a.x + outward * (a.w / 2), y: a.y };
      p1 = { x: b.x + outward * (b.w / 2), y: b.y };
      c0 = { x: p0.x + outward * 140, y: p0.y };
      c1 = { x: p1.x + outward * 60, y: p1.y };
    }
  } else {
    const dir = Math.sign(b.x - a.x) || 1;
    p0 = { x: a.x + (dir * a.w) / 2, y: a.y };
    p1 = { x: b.x - (dir * b.w) / 2, y: b.y };
    const span = Math.abs(b.col - a.col);
    c0 = { x: p0.x + dir * k * span * 0.6, y: p0.y };
    c1 = { x: p1.x - dir * k * span * 0.6, y: p1.y };
  }
  const t = 0.42;
  const mt = 1 - t;
  const label = {
    x: mt ** 3 * p0.x + 3 * mt ** 2 * t * c0.x + 3 * mt * t ** 2 * c1.x + t ** 3 * p1.x,
    y: mt ** 3 * p0.y + 3 * mt ** 2 * t * c0.y + 3 * mt * t ** 2 * c1.y + t ** 3 * p1.y,
  };
  return { d: `M${p0.x},${p0.y} C${c0.x},${c0.y} ${c1.x},${c1.y} ${p1.x},${p1.y}`, label };
}

export default function EventGraph() {
  const [testId, setTestId] = useState("LB-fake");
  const [model, setModel] = useState<Model>("WEAKEST");
  const [hidden, setHidden] = useState<Set<Rel>>(new Set());
  const [hover, setHover] = useState<string | null>(null);

  const test = litmusTests.find((t) => t.id === testId)!;
  const L = useMemo(() => layout(test), [test]);
  const note = test.models[model];
  const cycle = note?.verdict === "forbidden" ? note.cycle : undefined;
  const rels = Array.from(new Set(test.edges.map((e) => e.rel)));

  const twins = new Set<string>();
  const seen = new Set<string>();
  for (const e of test.edges) {
    const p = `${e.from}>${e.to}`;
    if (seen.has(p)) twins.add(p);
    seen.add(p);
  }

  const chooseTest = (id: string) => {
    setTestId(id);
    const t = litmusTests.find((x) => x.id === id)!;
    if (!t.models[model]) setModel("SC");
    setHidden(new Set());
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)]">
      <div className="space-y-4 border-b border-[var(--line)] p-4 sm:p-6">
        <div>
          <p className="eyebrow mb-2.5">Litmus test</p>
          <Segmented label="Litmus test" value={testId} onChange={chooseTest} options={litmusTests.map((t) => ({ value: t.id, label: t.id, hint: t.name }))} />
        </div>
        <div>
          <p className="eyebrow mb-2.5">Memory model</p>
          <div role="radiogroup" aria-label="Memory model" className="flex flex-wrap gap-1.5">
            {MODELS.map((m) => {
              const n = test.models[m];
              const on = m === model;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!n}
                  onClick={() => setModel(m)}
                  title={n ? undefined : "Not in the atlas run for this test"}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                    on ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]" : "border-[var(--line-2)] text-[var(--fg-2)] hover:border-[var(--fg-3)] hover:text-[var(--fg)]"
                  }`}
                >
                  {m}
                  {n && (
                    <span aria-label={n.verdict} className={on ? "" : n.verdict === "allowed" ? "text-[var(--pos)]" : "text-[var(--fg-3)]"}>
                      {n.verdict === "allowed" ? "✓" : "✕"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="min-w-0 border-b border-[var(--line)] p-3 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3 px-1">
            <p className="text-[15px] text-[var(--fg)]">{test.name}</p>
            <p className="font-mono text-[11.5px] text-[var(--fg-3)]">outcome: {test.outcome}</p>
          </div>
          <p className="mb-2 px-1 font-mono text-[10.5px] text-[var(--fg-3)] sm:hidden">Swipe sideways to see the whole diagram.</p>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${L.W} ${L.H}`}
              className="mx-auto block w-full"
              style={{ minWidth: Math.min(L.W, 520), maxWidth: L.W * 1.25 }}
              role="img"
              aria-label={`Execution graph for ${test.name}. ${model}: ${note?.verdict ?? "not checked"}.`}
            >
              <defs>
                {[...Object.entries(REL).map(([k, v]) => [k, v.color] as const), ["cycle", "var(--accent)"] as const].map(([k, c]) => (
                  <marker key={k} id={`eg-${k}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0,0 L8,4 L0,8 z" fill={c} />
                  </marker>
                ))}
              </defs>

              {L.order.map((th, c) => (
                <text key={th} x={30 + COLW / 2 + c * COLW} y={L.H - 8} textAnchor="middle" className="fill-[var(--fg-3)] font-mono text-[11px]">
                  thread {th + 1}
                </text>
              ))}

              {test.edges.map((e) => {
                if (hidden.has(e.rel)) return null;
                const { d, label } = geometry(e, L, twins.has(`${e.from}>${e.to}`));
                const cyc = inCycle(e, cycle);
                const touches = hover && (e.from === hover || e.to === hover);
                const dim = (cycle && !cyc) || (hover && !touches);
                const r = REL[e.rel];
                const stroke = cyc ? "var(--accent)" : r.color;
                return (
                  <g key={edgeKey(e)} className="eg-edge" style={{ opacity: dim ? 0.22 : 1 }}>
                    <path
                      d={d}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={cyc ? 2.4 : 1.6}
                      strokeDasharray={r.dashed && !cyc ? "5 5" : undefined}
                      className={cyc ? "eg-cycle" : undefined}
                      markerEnd={`url(#eg-${cyc ? "cycle" : e.rel})`}
                    />
                    <text x={label.x + 6} y={label.y - 5} className="font-mono text-[11px]" fill={stroke} style={{ paintOrder: "stroke", stroke: "var(--bg-2)", strokeWidth: 4 }}>
                      {e.rel === "fakedep" ? "fake" : e.rel}
                    </text>
                  </g>
                );
              })}

              {test.events.map((ev: LEvent) => {
                const p = L.pos.get(ev.id)!;
                const on = hover === ev.id;
                return (
                  <g
                    key={ev.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Event ${ev.label}`}
                    onPointerEnter={() => setHover(ev.id)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(ev.id)}
                    onBlur={() => setHover(null)}
                    className="cursor-default outline-none"
                  >
                    <rect
                      x={p.x - p.w / 2}
                      y={p.y - NH / 2}
                      width={p.w}
                      height={NH}
                      rx={8}
                      fill="var(--bg)"
                      stroke={on ? "var(--fg)" : "var(--line-2)"}
                      strokeWidth={on ? 1.6 : 1}
                    />
                    <text x={p.x} y={p.y + 4.5} textAnchor="middle" className="fill-[var(--fg)] font-mono text-[12.5px]">
                      {ev.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 px-1" aria-label="Show or hide relations">
            {rels.map((r) => {
              const off = hidden.has(r);
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={!off}
                  onClick={() =>
                    setHidden((h) => {
                      const n = new Set(h);
                      if (n.has(r)) n.delete(r);
                      else n.add(r);
                      return n;
                    })
                  }
                  className={`flex items-center gap-2 rounded-full border border-[var(--line)] px-2.5 py-1 font-mono text-[11px] transition-opacity ${off ? "opacity-40" : ""}`}
                >
                  <svg width="18" height="6" aria-hidden>
                    <line x1="0" x2="18" y1="3" y2="3" stroke={REL[r].color} strokeWidth="2" strokeDasharray={REL[r].dashed ? "4 3" : undefined} />
                  </svg>
                  <span className="text-[var(--fg-2)]">{REL[r].name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5 p-4 sm:p-6" aria-live="polite">
          <div>
            <p className="eyebrow">Program</p>
            <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${test.threads.length}, minmax(0,1fr))` }}>
              {test.threads.map((th, i) => (
                <div key={i} className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2.5 font-mono text-[11.5px] leading-relaxed text-[var(--fg-2)]">
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--fg-3)]">T{i + 1}</p>
                  {th.map((s) => (
                    <p key={s} className="whitespace-nowrap">
                      {s}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--fg-2)]">{test.idea}</p>
          </div>
          {note && (
            <div className="border-t border-[var(--line)] pt-5">
              <p className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-[var(--fg-3)]">{model}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] ${
                    note.verdict === "allowed" ? "bg-[color-mix(in_oklab,var(--pos)_18%,transparent)] text-[var(--pos)]" : "bg-[var(--accent-soft)] text-[var(--accent)]"
                  }`}
                >
                  {note.verdict}
                </span>
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--fg)]">{note.why}</p>
              {cycle && <p className="mt-3 text-[12.5px] text-[var(--fg-3)]">The highlighted edges form the cycle the model rejects.</p>}
            </div>
          )}
          <div className="mt-auto space-y-3 border-t border-[var(--line)] pt-5">
            {test.toolLine && (
              <pre className="overflow-x-auto whitespace-pre rounded-lg bg-[var(--bg)] p-3 font-mono text-[10.5px] leading-relaxed text-[var(--fg-2)]">{test.toolLine}</pre>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-[var(--fg-3)]">Verdicts: {test.source}</span>
              <Evidence kind="tool" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
