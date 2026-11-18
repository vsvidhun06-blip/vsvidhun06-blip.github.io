"use client";

import { useRef, useState } from "react";
import type { Interval } from "@/content/results";

/* ----------------------------------------------------------------------------
   Shared tooltip + table toggle
   ---------------------------------------------------------------------------- */

type Tip = { x: number; y: number; title: string; lines: string[] } | null;

function useTip() {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip>(null);
  const show = (e: React.PointerEvent | React.FocusEvent, title: string, lines: string[]) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    let x: number, y: number;
    if ("clientX" in e) {
      x = e.clientX - box.left;
      y = e.clientY - box.top;
    } else {
      const r = (e.target as Element).getBoundingClientRect();
      x = r.left - box.left + r.width / 2;
      y = r.top - box.top;
    }
    setTip({ x, y, title, lines });
  };
  return { ref, tip, show, hide: () => setTip(null) };
}

function TipBox({ tip, width }: { tip: Tip; width?: number }) {
  if (!tip) return null;
  const w = width ?? 220;
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 rounded-lg border border-[var(--line-2)] bg-[var(--bg-3)] px-3 py-2 text-xs shadow-xl shadow-black/30"
      style={{ left: Math.max(4, tip.x - w / 2), top: tip.y - 12, width: w, transform: "translateY(-100%)" }}
    >
      <div className="font-medium text-[var(--fg)]">{tip.title}</div>
      {tip.lines.map((l) => (
        <div key={l} className="mt-0.5 font-mono text-[11px] text-[var(--fg-2)]">
          {l}
        </div>
      ))}
    </div>
  );
}

export function ChartShell({
  children,
  table,
  tipRef,
  tip,
}: {
  children: React.ReactNode;
  table: { head: string[]; rows: (string | number)[][] };
  tipRef: React.RefObject<HTMLDivElement | null>;
  tip: Tip;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <div>
      <div ref={tipRef} className="relative">
        {showTable ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line-2)]">
                  {table.head.map((h) => (
                    <th key={h} className="py-2 pr-4 font-mono text-[11px] font-normal uppercase tracking-wider text-[var(--fg-3)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--line)]">
                    {r.map((c, j) => (
                      <td key={j} className="tabular py-2 pr-4 text-[var(--fg-2)]">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
        <TipBox tip={tip} />
      </div>
      <button
        type="button"
        onClick={() => setShowTable((s) => !s)}
        className="mt-3 font-mono text-[11px] text-[var(--fg-3)] underline decoration-[var(--line-2)] underline-offset-4 hover:text-[var(--fg)]"
      >
        {showTable ? "Show chart" : "Show data table"}
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Horizontal bars: one measure across a few configurations
   ---------------------------------------------------------------------------- */

export function HBars({
  rows,
  unit,
  max,
  highlight,
}: {
  rows: { label: string; value: number; note?: string }[];
  unit: string;
  max?: number;
  highlight?: number;
}) {
  const t = useTip();
  const top = max ?? Math.max(...rows.map((r) => r.value)) * 1.08;
  return (
    <ChartShell
      tipRef={t.ref}
      tip={t.tip}
      table={{ head: ["Configuration", unit, "Note"], rows: rows.map((r) => [r.label, r.value, r.note ?? ""]) }}
    >
      <ul className="space-y-4">
        {rows.map((r, i) => (
          <li key={r.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
              <span className="text-[var(--fg-2)]">{r.label}</span>
              <span className="tabular font-mono text-[var(--fg)]">
                {r.value} <span className="text-[var(--fg-3)]">{unit}</span>
              </span>
            </div>
            <div
              className="relative h-6 rounded-r bg-[var(--line)]/40"
              tabIndex={0}
              onPointerMove={(e) => t.show(e, r.label, [`${r.value} ${unit}`, ...(r.note ? [r.note] : [])])}
              onPointerLeave={t.hide}
              onFocus={(e) => t.show(e, r.label, [`${r.value} ${unit}`, ...(r.note ? [r.note] : [])])}
              onBlur={t.hide}
              aria-label={`${r.label}: ${r.value} ${unit}`}
            >
              <div
                className="h-full rounded-r-[4px] transition-[width] duration-700"
                style={{
                  width: `${(r.value / top) * 100}%`,
                  background: i === highlight ? "var(--c-long)" : "var(--fg-3)",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </ChartShell>
  );
}

/* ----------------------------------------------------------------------------
   Dumbbell: prefill latency per request, cache off vs on
   ---------------------------------------------------------------------------- */

export function Dumbbell({
  rows,
  max = 75,
}: {
  rows: { id: string; off: number; on: number; cached: string }[];
  max?: number;
}) {
  const t = useTip();
  const W = 560;
  const L = 64;
  const R = 20;
  const rowH = 44;
  const H = rows.length * rowH + 40;
  const x = (v: number) => L + (v / max) * (W - L - R);
  const ticks = [0, 25, 50, 75];
  return (
    <ChartShell
      tipRef={t.ref}
      tip={t.tip}
      table={{
        head: ["Request", "Cache off (ms)", "Cache on (ms)", "Speedup", "Cached blocks"],
        rows: rows.map((r) => [r.id, r.off, r.on, `${(r.off / r.on).toFixed(2)}x`, r.cached]),
      }}
    >
      <div className="mb-3 flex gap-5 font-mono text-[11px] text-[var(--fg-2)]">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-[var(--fg-3)]" /> prefix cache off
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--c-shared)]" /> prefix cache on
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Prefill time per request with prefix caching off and on">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={8} y2={H - 26} stroke="var(--line)" />
            <text x={x(v)} y={H - 8} textAnchor="middle" className="fill-[var(--fg-3)] font-mono text-[11px]">
              {v} ms
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = 24 + i * rowH;
          const lines = [`off ${r.off} ms, on ${r.on} ms`, `${(r.off / r.on).toFixed(2)}x faster`, `cached blocks ${r.cached}`];
          return (
            <g
              key={r.id}
              tabIndex={0}
              onPointerMove={(e) => t.show(e, r.id, lines)}
              onPointerLeave={t.hide}
              onFocus={(e) => t.show(e, r.id, lines)}
              onBlur={t.hide}
              aria-label={`${r.id}: ${lines.join(", ")}`}
            >
              <rect x={0} y={y - 18} width={W} height={36} fill="transparent" />
              <text x={0} y={y + 4} className="fill-[var(--fg-2)] font-mono text-[12px]">
                {r.id}
              </text>
              <line x1={x(r.on)} x2={x(r.off)} y1={y} y2={y} stroke="var(--fg-3)" strokeWidth={2} />
              <circle cx={x(r.off)} cy={y} r={6} fill="var(--bg-2)" stroke="var(--fg-3)" strokeWidth={2} />
              <circle cx={x(r.on)} cy={y} r={6} fill="var(--c-shared)" stroke="var(--bg-2)" strokeWidth={2} />
              <text x={x(r.on) - 12} y={y + 4} textAnchor="end" className="fill-[var(--fg)] font-mono text-[11px]">
                {(r.off / r.on).toFixed(2)}x
              </text>
            </g>
          );
        })}
      </svg>
    </ChartShell>
  );
}

/* ----------------------------------------------------------------------------
   Heat grid: speculative decoding speedup over (exit layer, draft length K)
   ---------------------------------------------------------------------------- */

export function SpecGrid({
  exitLayers,
  ks,
  grid,
}: {
  exitLayers: number[];
  ks: number[];
  grid: Record<number, [number, number, number][]>;
}) {
  const t = useTip();
  const rows: (string | number)[][] = [];
  exitLayers.forEach((L) =>
    ks.forEach((k, j) => {
      const c = grid[L]![j]!;
      rows.push([L, k, `${(c[0] * 100).toFixed(1)}%`, `${c[1].toFixed(2)}x`, `${(c[2] * 100).toFixed(1)}%`]);
    }),
  );
  return (
    <ChartShell
      tipRef={t.ref}
      tip={t.tip}
      table={{ head: ["Exit layer", "K", "Acceptance", "Speedup", "Needed acceptance"], rows }}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="grid grid-cols-[72px_repeat(5,1fr)] gap-1.5">
            <div />
            {ks.map((k) => (
              <div key={k} className="pb-1 text-center font-mono text-[11px] text-[var(--fg-3)]">
                K = {k}
              </div>
            ))}
            {exitLayers.map((L) => (
              <Row key={L} L={L} cells={grid[L]!} ks={ks} t={t} />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 font-mono text-[11px] text-[var(--fg-3)]">
            <span>slower</span>
            <span className="h-2 w-40 rounded-full" style={{ background: "linear-gradient(to right, color-mix(in oklab, var(--c-long) 18%, var(--bg-2)), var(--c-long))" }} />
            <span>closer to break-even (1.0x)</span>
          </div>
        </div>
      </div>
    </ChartShell>
  );
}

function Row({
  L,
  cells,
  ks,
  t,
}: {
  L: number;
  cells: [number, number, number][];
  ks: number[];
  t: ReturnType<typeof useTip>;
}) {
  return (
    <>
      <div className="flex items-center font-mono text-[11px] text-[var(--fg-3)]">exit L{L}</div>
      {cells.map(([acc, sp, need], j) => {
        const lines = [`speedup ${sp.toFixed(2)}x (below 1 means slower)`, `acceptance ${(acc * 100).toFixed(1)}%`, `needed ${(need * 100).toFixed(1)}% to break even`];
        const mix = Math.round(18 + ((sp - 0.2) / 0.65) * 82);
        return (
          <div
            key={j}
            tabIndex={0}
            className="grid h-12 place-items-center rounded-[4px] font-mono text-[12px] text-[var(--fg)] outline-offset-1"
            style={{ background: `color-mix(in oklab, var(--c-long) ${mix}%, var(--bg-2))` }}
            onPointerMove={(e) => t.show(e, `Exit layer ${L}, K = ${ks[j]}`, lines)}
            onPointerLeave={t.hide}
            onFocus={(e) => t.show(e, `Exit layer ${L}, K = ${ks[j]}`, lines)}
            onBlur={t.hide}
            aria-label={`Exit layer ${L}, K ${ks[j]}: ${lines.join(", ")}`}
          >
            {sp.toFixed(2)}x
          </div>
        );
      })}
    </>
  );
}

/* ----------------------------------------------------------------------------
   Forest plot: paired differences with 95% intervals around zero
   ---------------------------------------------------------------------------- */

export function Forest({ rows, unit, digits = 2 }: { rows: Interval[]; unit: string; digits?: number }) {
  const t = useTip();
  const W = 600;
  const L = 8;
  const R = 8;
  const rowH = 58;
  const H = rows.length * rowH + 34;
  const ext = Math.max(...rows.map((r) => Math.max(Math.abs(r.lo), Math.abs(r.hi)))) * 1.15;
  const x = (v: number) => L + ((v + ext) / (2 * ext)) * (W - L - R);
  const fmt = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(digits)}`;
  return (
    <ChartShell
      tipRef={t.ref}
      tip={t.tip}
      table={{
        head: ["Comparison", "Detail", `Mean (${unit})`, "95% CI"],
        rows: rows.map((r) => [r.label, r.detail, fmt(r.mean), `[${fmt(r.lo)}, ${fmt(r.hi)}]`]),
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Paired differences in ${unit} with 95% confidence intervals`}>
        <line x1={x(0)} x2={x(0)} y1={6} y2={H - 22} stroke="var(--fg-3)" strokeDasharray="3 4" />
        <text x={x(0)} y={H - 6} textAnchor="middle" className="fill-[var(--fg-3)] font-mono text-[11px]">
          0 (no difference)
        </text>
        <text x={W - R} y={H - 6} textAnchor="end" className="fill-[var(--fg-3)] font-mono text-[11px]">
          first system higher →
        </text>
        <text x={L} y={H - 6} className="fill-[var(--fg-3)] font-mono text-[11px]">
          ← first system lower
        </text>
        {rows.map((r, i) => {
          const y = 30 + i * rowH;
          const crossesZero = r.lo < 0 && r.hi > 0;
          const color = crossesZero ? "var(--fg-3)" : r.mean > 0 ? "var(--pos)" : "var(--neg)";
          const lines = [r.detail, `mean ${fmt(r.mean)} ${unit}`, `95% CI [${fmt(r.lo)}, ${fmt(r.hi)}]`, crossesZero ? "interval includes zero" : r.mean > 0 ? "interval above zero" : "interval below zero"];
          return (
            <g
              key={r.label}
              tabIndex={0}
              onPointerMove={(e) => t.show(e, r.label, lines)}
              onPointerLeave={t.hide}
              onFocus={(e) => t.show(e, r.label, lines)}
              onBlur={t.hide}
              aria-label={`${r.label}: ${lines.join(", ")}`}
            >
              <rect x={0} y={y - 26} width={W} height={rowH - 4} fill="transparent" />
              <text x={L} y={y - 12} className="fill-[var(--fg-2)] text-[13px]">
                {r.label}
              </text>
              <text x={W - R} y={y - 12} textAnchor="end" className="fill-[var(--fg)] font-mono text-[12px]">
                {fmt(r.mean)} [{fmt(r.lo)}, {fmt(r.hi)}]
              </text>
              <line x1={x(r.lo)} x2={x(r.hi)} y1={y + 6} y2={y + 6} stroke={color} strokeWidth={2} strokeLinecap="round" />
              <line x1={x(r.lo)} x2={x(r.lo)} y1={y} y2={y + 12} stroke={color} strokeWidth={2} />
              <line x1={x(r.hi)} x2={x(r.hi)} y1={y} y2={y + 12} stroke={color} strokeWidth={2} />
              <circle cx={x(r.mean)} cy={y + 6} r={5} fill={color} stroke="var(--bg-2)" strokeWidth={2} />
            </g>
          );
        })}
      </svg>
    </ChartShell>
  );
}

/* ----------------------------------------------------------------------------
   Simple labelled bars for small ranked lists (topics, overhead components)
   ---------------------------------------------------------------------------- */

export function RankBars({
  rows,
  unit = "",
  digits,
  colorVar = "var(--fg-3)",
}: {
  rows: { label: string; value: number; extra?: string }[];
  unit?: string;
  digits?: number;
  colorVar?: string;
}) {
  const format = (v: number) => (digits === undefined ? `${v}` : v.toFixed(digits));
  const t = useTip();
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ChartShell tipRef={t.ref} tip={t.tip} table={{ head: ["Item", unit || "Value"], rows: rows.map((r) => [r.label, format(r.value)]) }}>
      <ul className="space-y-2.5">
        {rows.map((r) => {
          const lines = [`${format(r.value)}${unit ? ` ${unit}` : ""}`, ...(r.extra ? [r.extra] : [])];
          return (
            <li
              key={r.label}
              className="grid grid-cols-[minmax(0,9.5rem)_1fr_auto] items-center gap-3 text-sm"
              tabIndex={0}
              onPointerMove={(e) => t.show(e, r.label, lines)}
              onPointerLeave={t.hide}
              onFocus={(e) => t.show(e, r.label, lines)}
              onBlur={t.hide}
              aria-label={`${r.label}: ${lines.join(", ")}`}
            >
              <span className="truncate text-[var(--fg-2)]">{r.label}</span>
              <span className="h-2 rounded-r-[4px] bg-[var(--line)]">
                <span className="block h-full rounded-r-[4px]" style={{ width: `${(r.value / max) * 100}%`, background: colorVar }} />
              </span>
              <span className="tabular w-12 text-right font-mono text-[12px] text-[var(--fg)]">{format(r.value)}</span>
            </li>
          );
        })}
      </ul>
    </ChartShell>
  );
}
