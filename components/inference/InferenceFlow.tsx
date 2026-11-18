"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createSim,
  inject,
  metrics,
  snapshot,
  step,
  warm,
  type Policy,
  type Req,
  type ReqClass,
  type SimState,
  type Workload,
} from "./sim";

type Layout = "wide" | "tall";
type Rect = { x: number; y: number; w: number; h: number };

interface Geometry {
  vb: { w: number; h: number };
  router: Rect;
  queue: Rect;
  batch: Rect;
  gpu: Rect;
  output: Rect;
  kv: Rect;
  kvCols: number;
  metrics?: Rect;
  log?: Rect;
  queueCols: number;
  chipW: number;
  rowH: number;
}

function geometry(layout: Layout, compact: boolean): Geometry {
  if (layout === "wide") {
    const h = compact ? 470 : 600;
    return {
      vb: { w: 1200, h },
      router: { x: 20, y: 52, w: 150, h: 300 },
      queue: { x: 196, y: 52, w: 190, h: 300 },
      batch: { x: 412, y: 52, w: 400, h: 300 },
      gpu: { x: 838, y: 52, w: 150, h: 300 },
      output: { x: 1014, y: 52, w: 166, h: 300 },
      kv: { x: 412, y: compact ? 384 : 392, w: 576, h: compact ? 72 : 108 },
      kvCols: compact ? 24 : 16,
      metrics: compact ? undefined : { x: 20, y: 392, w: 366, h: 190 },
      log: compact ? undefined : { x: 1014, y: 392, w: 166, h: 190 },
      queueCols: 1,
      chipW: 172,
      rowH: 34,
    };
  }
  const h = compact ? 820 : 1040;
  return {
    vb: { w: 600, h },
    router: { x: 16, y: 48, w: 180, h: 214 },
    queue: { x: 214, y: 48, w: 370, h: 214 },
    batch: { x: 16, y: 300, w: 568, h: 268 },
    gpu: { x: 16, y: 606, w: 270, h: compact ? 196 : 190 },
    output: { x: 304, y: 606, w: 280, h: compact ? 196 : 190 },
    kv: { x: 16, y: compact ? 838 : 836, w: 568, h: 96 },
    kvCols: 16,
    metrics: compact ? undefined : { x: 16, y: 954, w: 568, h: 80 },
    queueCols: 2,
    chipW: 176,
    rowH: 32,
  };
}

const CLASS_LABEL: Record<ReqClass, string> = { chat: "chat", long: "long ctx", shared: "shared prefix" };
const CLASS_VAR: Record<ReqClass, string> = {
  chat: "var(--c-chat)",
  long: "var(--c-long)",
  shared: "var(--c-shared)",
};

export interface InferenceFlowProps {
  policy?: Policy;
  workload?: Workload;
  compact?: boolean;
  /** Called with a fresh snapshot after every step (used by the explorer panel). */
  onStep?: (s: SimState) => void;
  speed?: number;
  playing?: boolean;
  injectRef?: React.MutableRefObject<((cls?: ReqClass, n?: number) => void) | null>;
  stepRef?: React.MutableRefObject<(() => void) | null>;
  label?: string;
}

export default function InferenceFlow({
  policy = "prefix",
  workload = "mixed",
  compact = false,
  onStep,
  speed = 1,
  playing = true,
  injectRef,
  stepRef,
  label = "Animated diagram of a miniature LLM serving engine",
}: InferenceFlowProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [initial] = useState(() => warm(createSim(policy, workload, 11), compact ? 22 : 14));
  const simRef = useRef<SimState | null>(initial);
  const [state, setState] = useState<SimState>(() => snapshot(initial));
  const [layout, setLayout] = useState<Layout>("wide");
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [focusId, setFocusId] = useState<number | null>(null);
  const onStepRef = useRef(onStep);
  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  // The simulation is built once per mount. Callers change policy, workload or
  // reset by remounting with a new key (see simKey).
  useEffect(() => {
    if (simRef.current) onStepRef.current?.(snapshot(simRef.current));
  }, []);

  const advance = useCallback(() => {
    const s = simRef.current;
    if (!s) return;
    step(s);
    const snap = snapshot(s);
    setState(snap);
    onStepRef.current?.(snap);
  }, []);

  const add = useCallback((cls?: ReqClass, n = 1) => {
    const s = simRef.current;
    if (!s) return;
    inject(s, n, cls);
    setState(snapshot(s));
  }, []);

  useEffect(() => {
    if (injectRef) injectRef.current = add;
    if (stepRef) stepRef.current = advance;
  }, [add, advance, injectRef, stepRef]);

  // Layout follows the container width, not the viewport.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setLayout(entry.contentRect.width < 680 ? "tall" : "wide");
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => {
      io.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);

  const running = playing && visible && !reduced;
  useEffect(() => {
    if (!running) return;
    const ms = 560 / speed;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") advance();
    }, ms);
    return () => window.clearInterval(id);
  }, [running, speed, advance]);

  const g = useMemo(() => geometry(layout, compact), [layout, compact]);
  const m = metrics(state);
  const focusReq: Req | undefined =
    focusId !== null
      ? [...state.running, ...state.queue, ...state.finished].find((r) => r.id === focusId)
      : undefined;

  const positions = useMemo(() => {
    const pos = new Map<number, { x: number; y: number; kind: "queue" | "run" | "done"; slot: number }>();
    const qRows = Math.floor((g.queue.h - 30) / g.rowH);
    state.queue.forEach((r, i) => {
      const col = i % g.queueCols;
      const row = Math.floor(i / g.queueCols);
      if (row >= qRows) return;
      pos.set(r.id, { x: g.queue.x + 8 + col * (g.chipW + 8), y: g.queue.y + 30 + row * g.rowH, kind: "queue", slot: i });
    });
    state.running.forEach((r, i) =>
      pos.set(r.id, { x: g.batch.x + 8, y: g.batch.y + 30 + i * g.rowH, kind: "run", slot: i }),
    );
    const outRows = Math.floor((g.output.h - 30) / 26);
    state.finished.slice(0, outRows).forEach((r, i) =>
      pos.set(r.id, { x: g.output.x + 8, y: g.output.y + 30 + i * 26, kind: "done", slot: i }),
    );
    return pos;
  }, [state, g]);

  const hiddenQueued = Math.max(0, state.queue.length - [...positions.values()].filter((p) => p.kind === "queue").length);
  const all = [...state.queue, ...state.running, ...state.finished].filter((r) => positions.has(r.id));
  const kvRows = Math.ceil(state.blocks.length / g.kvCols);
  const kvGap = 5;
  const kvW = (g.kv.w - (g.kvCols - 1) * kvGap) / g.kvCols;
  const kvH = Math.min(kvW, (g.kv.h - 26 - (kvRows - 1) * kvGap) / kvRows);
  const kindColor =
    state.last.kind === "prefill"
      ? "var(--c-chat)"
      : state.last.kind === "decode"
        ? "var(--c-long)"
        : state.last.kind === "mixed"
          ? "var(--c-shared)"
          : "var(--fg-3)";
  const workCells = 30;
  const lit = Math.min(
    workCells,
    Math.round(state.last.prefillTokens / 6 + state.last.decodeTokens * 2.2),
  );

  return (
    <div ref={wrapRef} className="inference-flow relative w-full">
      <svg
        viewBox={`0 0 ${g.vb.w} ${g.vb.h}`}
        className="block h-auto w-full select-none"
        role="img"
        aria-label={label}
        onClick={(e) => {
          if ((e.target as Element).closest("[data-chip]")) return;
          add();
        }}
      >
        <defs>
          <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke="var(--c-shared)" strokeWidth="2" opacity="0.6" />
          </pattern>
          <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--fg-3)" />
          </marker>
        </defs>

        {/* Region frames and labels */}
        {(
          [
            ["01", "Router", g.router],
            ["02", "Scheduler queue", g.queue],
            ["03", compact ? "Running batch" : "Running batch: prefill, then decode", g.batch],
            ["04", "GPU step", g.gpu],
            ["05", "Output", g.output],
          ] as const
        ).map(([n, t, r]) => (
          <g key={t}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={10} className="fill-[var(--bg-2)] stroke-[var(--line)]" />
            <text x={r.x + 12} y={r.y + 19} className="flow-label">
              <tspan className="fill-[var(--fg-3)]">{n}</tspan>
              <tspan dx={8}>{t}</tspan>
            </text>
          </g>
        ))}

        {/* Flow arrows between regions (wide layout only) */}
        {layout === "wide" &&
          [
            [g.router, g.queue],
            [g.queue, g.batch],
            [g.batch, g.gpu],
            [g.gpu, g.output],
          ].map(([a, b], i) => (
            <line
              key={i}
              x1={a!.x + a!.w + 2}
              y1={a!.y + a!.h / 2}
              x2={b!.x - 4}
              y2={b!.y + b!.h / 2}
              stroke="var(--fg-3)"
              strokeWidth={1}
              markerEnd="url(#arrow)"
            />
          ))}

        {/* Router: three lanes with counts of waiting requests by class */}
        <Router g={g} state={state} />

        {/* KV cache */}
        <g>
          <text x={g.kv.x} y={g.kv.y + 12} className="flow-label">
            <tspan className="fill-[var(--fg-3)]">06</tspan>
            <tspan dx={8}>Paged KV cache</tspan>
            <tspan dx={10} className="fill-[var(--fg-3)]">
              {m.kvUsed + m.kvShared}/{state.blocks.length} blocks
              {m.kvShared ? ` · ${m.kvShared} shared` : ""}
            </tspan>
          </text>
          {state.blocks.map((b, i) => {
            const col = i % g.kvCols;
            const row = Math.floor(i / g.kvCols);
            const x = g.kv.x + col * (kvW + kvGap);
            const y = g.kv.y + 24 + row * (kvH + kvGap);
            const owner = b.owner !== null ? state.running.find((r) => r.id === b.owner) : undefined;
            const isFocus =
              focusReq && (b.owner === focusReq.id || (b.shared && focusReq.sharedBlocks.includes(i)));
            const fill = b.shared ? "url(#hatch)" : owner ? CLASS_VAR[owner.cls] : "transparent";
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={kvW}
                height={kvH}
                rx={3}
                fill={fill}
                fillOpacity={b.shared ? 1 : owner ? (isFocus ? 0.95 : 0.55) : 0}
                stroke={isFocus ? "var(--fg)" : b.shared ? "var(--c-shared)" : "var(--line-2)"}
                strokeWidth={isFocus ? 2 : 1}
                className="kv-block"
              />
            );
          })}
        </g>

        {/* GPU step: a grid of work cells lit by this step's work */}
        <g>
          {Array.from({ length: workCells }, (_, i) => {
            const cols = layout === "wide" ? 5 : 10;
            const cw = layout === "wide" ? 22 : 21;
            const x = g.gpu.x + 14 + (i % cols) * (cw + 5);
            const y = g.gpu.y + 34 + Math.floor(i / cols) * (cw + 5);
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={cw}
                height={cw}
                rx={3}
                fill={i < lit ? kindColor : "transparent"}
                fillOpacity={i < lit ? 0.75 : 0}
                stroke="var(--line-2)"
                className="gpu-cell"
              />
            );
          })}
          <text x={g.gpu.x + 14} y={g.gpu.y + g.gpu.h - 52} className="flow-small fill-[var(--fg-2)]">
            {state.last.kind === "idle" ? "idle" : `${state.last.kind} step`}
          </text>
          <text x={g.gpu.x + 14} y={g.gpu.y + g.gpu.h - 34} className="flow-small fill-[var(--fg-3)]">
            prefill {state.last.prefillTokens} tok
          </text>
          <text x={g.gpu.x + 14} y={g.gpu.y + g.gpu.h - 16} className="flow-small fill-[var(--fg-3)]">
            decode {state.last.decodeTokens} seq
          </text>
        </g>

        {/* Request chips: keyed by id, so CSS transitions move them between stages */}
        {all.map((r) => {
          const p = positions.get(r.id)!;
          const focused = focusId === r.id;
          return (
            <g
              key={r.id}
              data-chip
              className="flow-chip"
              style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
              tabIndex={0}
              role="button"
              aria-label={describe(r)}
              onMouseEnter={() => setFocusId(r.id)}
              onMouseLeave={() => setFocusId(null)}
              onFocus={() => setFocusId(r.id)}
              onBlur={() => setFocusId(null)}
            >
              <g className="flow-chip-enter">
                {p.kind === "done" ? (
                  <DoneRow r={r} w={g.output.w - 16} />
                ) : p.kind === "run" ? (
                  <RunRow r={r} w={g.batch.w - 16} focused={focused} bs={state.cfg.blockSize} />
                ) : (
                  <QueueChip r={r} w={g.chipW} focused={focused} />
                )}
              </g>
            </g>
          );
        })}
        {hiddenQueued > 0 && (
          <text x={g.queue.x + g.queue.w - 12} y={g.queue.y + 19} textAnchor="end" className="flow-small fill-[var(--fg-3)]">
            +{hiddenQueued} more
          </text>
        )}
        {state.running.length === 0 && (
          <text x={g.batch.x + g.batch.w / 2} y={g.batch.y + g.batch.h / 2} textAnchor="middle" className="flow-small fill-[var(--fg-3)]">
            waiting for work
          </text>
        )}

        {/* Metrics and log (full mode) */}
        {g.metrics && <MetricsPanel g={g.metrics} m={m} state={state} layout={layout} />}
        {g.log && (
          <g>
            <rect x={g.log.x} y={g.log.y} width={g.log.w} height={g.log.h} rx={10} className="fill-[var(--bg-2)] stroke-[var(--line)]" />
            <text x={g.log.x + 12} y={g.log.y + 19} className="flow-label">
              Scheduler log
            </text>
            {(state.last.events.length ? state.last.events : ["no events this step"]).slice(0, 6).map((e, i) => (
              <text key={i} x={g.log!.x + 12} y={g.log!.y + 44 + i * 24} className="flow-tiny fill-[var(--fg-2)]">
                {e.length > 26 ? e.slice(0, 25) + "…" : e}
              </text>
            ))}
          </g>
        )}
        <title>{label}</title>
      </svg>
      <p className="sr-only" aria-live="polite">
        {focusReq ? describe(focusReq) : ""}
      </p>
      <div className="mt-3 min-h-[1.5rem] font-mono text-[11px] leading-relaxed text-[var(--fg-2)] sm:text-xs">
        {focusReq ? (
          <span>
            <span style={{ color: CLASS_VAR[focusReq.cls] }}>#{focusReq.id}</span> {describe(focusReq)}
          </span>
        ) : (
          <span className="text-[var(--fg-3)]">
            Hover or tab to a request to see its KV blocks. Click empty space to send one.
          </span>
        )}
      </div>
    </div>
  );
}

function describe(r: Req) {
  const blocks = r.blocks.length + r.sharedBlocks.length;
  const parts = [
    `${CLASS_LABEL[r.cls]}`,
    `${r.prompt} prompt tokens`,
    r.phase === "queued" ? (r.preempted ? "waiting to recompute after preemption" : "waiting") : r.phase,
    r.phase !== "queued" ? `${r.generated}/${r.out} generated` : "",
    blocks ? `${blocks} KV blocks${r.sharedBlocks.length ? ` (${r.sharedBlocks.length} shared)` : ""}` : "",
  ].filter(Boolean);
  return parts.join(" · ");
}

function QueueChip({ r, w, focused }: { r: Req; w: number; focused: boolean }) {
  return (
    <g>
      <rect
        width={w}
        height={26}
        rx={6}
        fill={CLASS_VAR[r.cls]}
        fillOpacity={focused ? 0.28 : 0.12}
        stroke={CLASS_VAR[r.cls]}
        strokeOpacity={focused ? 1 : 0.5}
      />
      <text x={10} y={17} className="flow-small" fill="var(--fg)">
        #{r.id}
      </text>
      <text x={48} y={17} className="flow-tiny fill-[var(--fg-2)]">
        {CLASS_LABEL[r.cls]} · {r.prompt} tok{r.preempted ? " · retry" : ""}
      </text>
    </g>
  );
}

function RunRow({ r, w, focused, bs }: { r: Req; w: number; focused: boolean; bs: number }) {
  const barX = 104;
  const barW = w - barX - 78;
  const pf = Math.min(1, r.prefilled / r.prefillTarget);
  const dc = Math.min(1, r.generated / r.out);
  return (
    <g>
      <rect width={w} height={28} rx={6} fill="var(--bg)" stroke={focused ? CLASS_VAR[r.cls] : "var(--line)"} />
      <rect x={6} y={6} width={4} height={16} rx={2} fill={CLASS_VAR[r.cls]} />
      <text x={18} y={18} className="flow-small" fill="var(--fg)">
        #{r.id}
      </text>
      <text x={52} y={18} className="flow-tiny fill-[var(--fg-3)]">
        {r.phase === "prefill" ? "prefill" : "decode"}
      </text>
      {/* prefill progress, measured in KV blocks */}
      <rect x={barX} y={7} width={barW} height={5} rx={2.5} fill="var(--line)" />
      <rect className="flow-bar" x={barX} y={7} width={barW * pf} height={5} rx={2.5} fill={CLASS_VAR[r.cls]} fillOpacity={0.5} />
      {/* decode progress, one tick per generated token */}
      <rect x={barX} y={16} width={barW} height={5} rx={2.5} fill="var(--line)" />
      <rect className="flow-bar" x={barX} y={16} width={barW * dc} height={5} rx={2.5} fill={CLASS_VAR[r.cls]} />
      <text x={w - 8} y={18} textAnchor="end" className="flow-tiny fill-[var(--fg-2)]">
        {r.generated}/{r.out} · {Math.ceil((r.prompt + r.generated) / bs)}b
      </text>
    </g>
  );
}

function DoneRow({ r, w }: { r: Req; w: number }) {
  const ttft = r.firstTokenMs !== undefined ? Math.round(r.firstTokenMs - r.arrivalMs) : null;
  return (
    <g className="flow-done">
      <rect width={w} height={20} rx={5} fill={CLASS_VAR[r.cls]} fillOpacity={0.08} />
      <rect x={0} y={0} width={3} height={20} rx={1.5} fill={CLASS_VAR[r.cls]} />
      <text x={10} y={14} className="flow-tiny" fill="var(--fg)">
        #{r.id}
      </text>
      <text x={w - 6} y={14} textAnchor="end" className="flow-tiny fill-[var(--fg-2)]">
        {r.out} tok{ttft !== null ? ` · ${ttft}ms` : ""}
      </text>
    </g>
  );
}

function Router({ g, state }: { g: Geometry; state: SimState }) {
  const lanes: ReqClass[] = ["chat", "long", "shared"];
  const counts = lanes.map((c) => state.queue.filter((r) => r.cls === c).length);
  const newest = state.queue[state.queue.length - 1];
  const r = g.router;
  const laneH = (r.h - 70) / 3;
  return (
    <g>
      {lanes.map((c, i) => {
        const y = r.y + 34 + i * laneH;
        return (
          <g key={c}>
            <rect x={r.x + 10} y={y} width={r.w - 20} height={laneH - 8} rx={6} fill={CLASS_VAR[c]} fillOpacity={0.07} stroke={CLASS_VAR[c]} strokeOpacity={0.35} />
            <text x={r.x + 20} y={y + 20} className="flow-tiny" fill={CLASS_VAR[c]}>
              {CLASS_LABEL[c]}
            </text>
            <text x={r.x + r.w - 20} y={y + laneH - 18} textAnchor="end" className="flow-num" fill="var(--fg)">
              {counts[i]}
            </text>
            <text x={r.x + 20} y={y + laneH - 18} className="flow-tiny fill-[var(--fg-3)]">
              waiting
            </text>
          </g>
        );
      })}
      <text x={r.x + 12} y={r.y + r.h - 14} className="flow-tiny fill-[var(--fg-3)]">
        {newest ? `last: #${newest.id} → ${CLASS_LABEL[newest.cls]}` : "classifies by prompt"}
      </text>
    </g>
  );
}

function MetricsPanel({ g, m, state, layout }: { g: Rect; m: ReturnType<typeof metrics>; state: SimState; layout: Layout }) {
  const items: [string, string][] = [
    ["TTFT p50", m.ttftP50 !== null ? `${Math.round(m.ttftP50)} ms` : "n/a"],
    ["TTFT p95", m.ttftP95 !== null ? `${Math.round(m.ttftP95)} ms` : "n/a"],
    ["Decode rate", `${Math.round(m.throughput)} tok/s`],
    ["Batch / queue", `${m.batch} / ${m.queue}`],
    ["Preemptions", `${m.preemptions}`],
    ["Prefix hits", m.prefixHitRate !== null ? `${Math.round(m.prefixHitRate * 100)}%` : "n/a"],
  ];
  const cols = layout === "wide" ? 2 : 3;
  const cw = (g.w - 24) / cols;
  const rh = layout === "wide" ? 44 : 30;
  return (
    <g>
      {layout === "wide" && (
        <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={10} className="fill-[var(--bg-2)] stroke-[var(--line)]" />
      )}
      {layout === "wide" && (
        <text x={g.x + 12} y={g.y + 19} className="flow-label">
          Live metrics <tspan className="fill-[var(--fg-3)]">(simulated)</tspan>
        </text>
      )}
      {items.map(([k, v], i) => {
        const x = g.x + 12 + (i % cols) * cw;
        const y = g.y + (layout === "wide" ? 50 : 14) + Math.floor(i / cols) * rh;
        return (
          <g key={k}>
            <text x={x} y={y} className="flow-tiny fill-[var(--fg-3)]">
              {k}
            </text>
            <text x={x} y={y + (layout === "wide" ? 20 : 15)} className="flow-num" fill="var(--fg)">
              {v}
            </text>
          </g>
        );
      })}
      {state.arm && (
        <text x={g.x + 12} y={g.y + g.h - 12} className="flow-tiny" fill="var(--accent)">
          controller: {state.arm.regime} → batch {state.arm.maxBatch}, chunk {state.arm.chunk}
        </text>
      )}
    </g>
  );
}
