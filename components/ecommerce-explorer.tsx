"use client";

import { useEffect, useState } from "react";
import { Evidence, Segmented } from "./ui";

type NodeId = "client" | "gateway" | "eureka" | "user" | "product" | "order" | "inventory" | "notification" | "kafka" | "redis" | "zipkin";

const NODES: Record<NodeId, { x: number; y: number; title: string; sub: string; kind: "svc" | "infra" | "ext"; about: string }> = {
  client: { x: 70, y: 270, title: "Client", sub: "k6 or curl", kind: "ext", about: "Everything enters through the gateway. The load tests drive the same routes a client would." },
  gateway: { x: 240, y: 270, title: "API Gateway", sub: "Spring Cloud Gateway", kind: "svc", about: "Routes by path to services found through Eureka, and applies a Redis-backed token bucket per client IP: 10 requests per second steady, bursts to 20, HTTP 429 beyond that." },
  eureka: { x: 240, y: 80, title: "Eureka", sub: "service registry", kind: "infra", about: "Every service registers here; the gateway and the order service's load-balanced client resolve instances by name." },
  user: { x: 470, y: 70, title: "user-service", sub: "own PostgreSQL", kind: "svc", about: "Registration and lookup. Each service owns its database; nothing reads another service's tables." },
  product: { x: 470, y: 180, title: "product-service", sub: "own PostgreSQL", kind: "svc", about: "Catalogue reads are cache-aside over Redis with a distributed lock on a miss (SET NX PX plus a Lua compare-and-delete), so a cold key does not stampede the database. If Redis is down, the cache is bypassed." },
  order: { x: 470, y: 330, title: "order-service", sub: "own PostgreSQL", kind: "svc", about: "Creates orders as PENDING and publishes order-created. Its one synchronous call, the product price lookup, is wrapped in retry, circuit breaker and a thread-pool bulkhead, with a single typed fallback." },
  inventory: { x: 470, y: 460, title: "inventory-service", sub: "own PostgreSQL", kind: "svc", about: "Reserves all lines of an order or none, idempotently: each order's outcome is recorded by orderId, so a duplicate event replays the recorded result. An optimistic lock on the stock ledger prevents overselling." },
  notification: { x: 720, y: 70, title: "notification-service", sub: "Kafka consumer", kind: "svc", about: "Has a listener for user-created events, but no service publishes that topic yet. I list it as partial rather than pretending the flow works." },
  kafka: { x: 720, y: 395, title: "Kafka", sub: "saga topics + .DLT", kind: "infra", about: "Topics order-created, inventory-reserved, inventory-failed and order-cancelled, each with a dead-letter topic. A failing record is retried twice, then parked on .DLT instead of blocking the partition." },
  redis: { x: 720, y: 220, title: "Redis", sub: "cache + rate limit", kind: "infra", about: "Holds the product cache and the gateway's token buckets." },
  zipkin: { x: 880, y: 300, title: "Zipkin", sub: "tracing", kind: "infra", about: "Micrometer Tracing with Brave. HTTP hops and Kafka producers and listeners are instrumented, so create, reserve and confirm show up as one trace." },
};

type EdgeId = string;
const EDGES: { id: EdgeId; from: NodeId; to: NodeId; label?: string; async?: boolean; dashed?: boolean }[] = [
  { id: "c-g", from: "client", to: "gateway" },
  { id: "g-u", from: "gateway", to: "user" },
  { id: "g-p", from: "gateway", to: "product" },
  { id: "g-o", from: "gateway", to: "order" },
  { id: "g-r", from: "gateway", to: "redis" },
  { id: "o-p", from: "order", to: "product", label: "price lookup" },
  { id: "p-r", from: "product", to: "redis" },
  { id: "o-k", from: "order", to: "kafka", async: true },
  { id: "k-o", from: "kafka", to: "order", async: true },
  { id: "i-k", from: "inventory", to: "kafka", async: true },
  { id: "k-i", from: "kafka", to: "inventory", async: true },
  { id: "k-n", from: "kafka", to: "notification", async: true, dashed: true },
  { id: "g-e", from: "gateway", to: "eureka", dashed: true },
];

type Step = { text: string; edges: EdgeId[]; nodes: NodeId[]; state?: string; bad?: NodeId[] };
const SCENARIOS: Record<string, { label: string; steps: Step[] }> = {
  happy: {
    label: "Order succeeds",
    steps: [
      { text: "POST /orders arrives at the gateway, which spends one token from this client's bucket.", edges: ["c-g", "g-r"], nodes: ["client", "gateway", "redis"] },
      { text: "The gateway routes to order-service, which looks up the price through retry, breaker and bulkhead.", edges: ["g-o", "o-p"], nodes: ["order", "product"] },
      { text: "The order is saved as PENDING and order-created is published.", edges: ["o-k"], nodes: ["order", "kafka"], state: "PENDING" },
      { text: "inventory-service consumes it and reserves every line atomically, recording the outcome by orderId.", edges: ["k-i"], nodes: ["kafka", "inventory"], state: "PENDING" },
      { text: "It publishes inventory-reserved.", edges: ["i-k"], nodes: ["inventory", "kafka"], state: "PENDING" },
      { text: "order-service consumes it and moves the order from PENDING to CONFIRMED.", edges: ["k-o"], nodes: ["kafka", "order"], state: "CONFIRMED" },
    ],
  },
  stock: {
    label: "Out of stock",
    steps: [
      { text: "The order is created and order-created is published as usual.", edges: ["c-g", "g-o", "o-k"], nodes: ["client", "gateway", "order", "kafka"], state: "PENDING" },
      { text: "inventory-service cannot reserve one of the lines. It rolls back the partial reservation.", edges: ["k-i"], nodes: ["inventory"], bad: ["inventory"], state: "PENDING" },
      { text: "It publishes inventory-failed.", edges: ["i-k"], nodes: ["inventory", "kafka"], state: "PENDING" },
      { text: "order-service marks the order CANCELLED. A duplicate failure event would be a no-op, since transitions only fire from PENDING.", edges: ["k-o"], nodes: ["order"], state: "CANCELLED" },
    ],
  },
  cancel: {
    label: "Cancel and compensate",
    steps: [
      { text: "A user cancels an order that is already CONFIRMED.", edges: ["c-g", "g-o"], nodes: ["client", "gateway", "order"], state: "CONFIRMED" },
      { text: "order-service marks it CANCELLED and publishes order-cancelled.", edges: ["o-k"], nodes: ["order", "kafka"], state: "CANCELLED" },
      { text: "inventory-service releases the reservation, moving units from reserved back to available. This is the compensating action.", edges: ["k-i"], nodes: ["inventory"], state: "CANCELLED" },
    ],
  },
  breaker: {
    label: "Product service down",
    steps: [
      { text: "product-service is stopped. Orders keep arriving.", edges: ["c-g", "g-o"], nodes: ["client", "gateway", "order"], bad: ["product"] },
      { text: "Price lookups fail. Retry tries three times with back-off on connect and 5xx errors only.", edges: ["o-p"], nodes: ["order", "product"], bad: ["product"] },
      { text: "Half of the last calls in the window have failed, so the breaker opens. In the measured run, 25 calls were then fast-failed.", edges: [], nodes: ["order"], bad: ["product"] },
      { text: "The fallback returns a typed ProductLookupException instead of a hang, so order-service threads stay free. After 10 s, three half-open probes test recovery.", edges: [], nodes: ["order"], bad: ["product"] },
    ],
  },
};

export default function EcommerceExplorer() {
  const [scenario, setScenario] = useState("happy");
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<NodeId>("order");
  const [auto, setAuto] = useState(false);
  const steps = SCENARIOS[scenario]!.steps;
  const step = steps[i]!;

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setI((x) => (x + 1) % steps.length), 2600);
    return () => clearInterval(t);
  }, [auto, steps.length]);

  const W = 960;
  const H = 520;
  const BW = 150;
  const BH = 52;

  const anchor = (a: NodeId, b: NodeId) => {
    const A = NODES[a];
    const B = NODES[b];
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const sx = Math.abs(dx) / (BW / 2);
    const sy = Math.abs(dy) / (BH / 2);
    const s = Math.max(sx, sy) || 1;
    return { x: A.x + dx / s, y: A.y + dy / s };
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)]">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(v) => {
            setScenario(v);
            setI(0);
          }}
          options={Object.entries(SCENARIOS).map(([value, s]) => ({ value, label: s.label }))}
        />
        <div className="flex items-center gap-1.5">
          <Btn onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
            ← Back
          </Btn>
          <span className="tabular w-14 text-center font-mono text-[11.5px] text-[var(--fg-3)]">
            {i + 1} / {steps.length}
          </span>
          <Btn onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i === steps.length - 1}>
            Next →
          </Btn>
          <Btn onClick={() => setAuto((a) => !a)} aria-pressed={auto}>
            {auto ? "Stop" : "Auto"}
          </Btn>
        </div>
      </div>

      <div>
        <div className="min-w-0 border-b border-[var(--line)] p-3 sm:p-5">
          <p className="mb-2 px-1 font-mono text-[10.5px] text-[var(--fg-3)] sm:hidden">Swipe sideways to see the whole diagram.</p>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[640px]" role="img" aria-label="Architecture of the e-commerce backend. Select a service to read about it.">
              <defs>
                {["fg", "accent", "async"].map((k) => (
                  <marker key={k} id={`ec-${k}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6.5" markerHeight="6.5" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill={k === "accent" ? "var(--accent)" : k === "async" ? "var(--c-long)" : "var(--fg-3)"} />
                  </marker>
                ))}
              </defs>
              {EDGES.map((e) => {
                const p0 = anchor(e.from, e.to);
                const p1 = anchor(e.to, e.from);
                const reverse = EDGES.some((o) => o.from === e.to && o.to === e.from);
                const off = reverse ? 7 : 0;
                const nx = p1.y - p0.y;
                const ny = -(p1.x - p0.x);
                const len = Math.hypot(nx, ny) || 1;
                const ox = (nx / len) * off;
                const oy = (ny / len) * off;
                const on = step.edges.includes(e.id);
                const color = on ? "var(--accent)" : e.async ? "var(--c-long)" : "var(--fg-3)";
                return (
                  <g key={e.id} style={{ opacity: on ? 1 : 0.35 }} className="transition-opacity duration-300">
                    <line
                      x1={p0.x + ox}
                      y1={p0.y + oy}
                      x2={p1.x + ox}
                      y2={p1.y + oy}
                      stroke={color}
                      strokeWidth={on ? 2.2 : 1.3}
                      strokeDasharray={e.dashed ? "4 5" : on ? "6 6" : undefined}
                      className={on ? "eg-cycle" : undefined}
                      markerEnd={`url(#ec-${on ? "accent" : e.async ? "async" : "fg"})`}
                    />
                    {e.label && (
                      <text x={(p0.x + p1.x) / 2 + 8} y={(p0.y + p1.y) / 2} className="font-mono text-[10.5px]" fill={color}>
                        {e.label}
                      </text>
                    )}
                  </g>
                );
              })}
              {(Object.keys(NODES) as NodeId[]).map((id) => {
                const n = NODES[id];
                const active = step.nodes.includes(id);
                const bad = step.bad?.includes(id);
                const picked = sel === id;
                return (
                  <g
                    key={id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={picked}
                    aria-label={`${n.title}, ${n.sub}`}
                    onClick={() => setSel(id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSel(id);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    <rect
                      x={n.x - BW / 2}
                      y={n.y - BH / 2}
                      width={BW}
                      height={BH}
                      rx={n.kind === "infra" ? 26 : 8}
                      fill={bad ? "color-mix(in oklab, var(--neg) 14%, var(--bg))" : "var(--bg)"}
                      stroke={bad ? "var(--neg)" : picked ? "var(--fg)" : active ? "var(--accent)" : "var(--line-2)"}
                      strokeWidth={picked || active || bad ? 1.6 : 1}
                      strokeDasharray={bad ? "5 4" : undefined}
                    />
                    <text x={n.x} y={n.y - 2} textAnchor="middle" className="fill-[var(--fg)] font-mono text-[12.5px]">
                      {n.title}
                    </text>
                    <text x={n.x} y={n.y + 15} textAnchor="middle" className="fill-[var(--fg-3)] font-mono text-[10.5px]">
                      {bad ? "unavailable" : n.sub}
                    </text>
                  </g>
                );
              })}
              {step.state && (
                <g transform={`translate(${NODES.order.x - 75}, ${NODES.order.y + 34})`}>
                  <text className="fill-[var(--fg-3)] font-mono text-[10.5px]">order state</text>
                  <text x={76} className="font-mono text-[11px]" fill={step.state === "CONFIRMED" ? "var(--pos)" : step.state === "CANCELLED" ? "var(--neg)" : "var(--accent)"}>
                    {step.state}
                  </text>
                </g>
              )}
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 px-1 font-mono text-[11px] text-[var(--fg-3)]">
            <span className="flex items-center gap-2">
              <span className="h-px w-5 bg-[var(--fg-3)]" /> HTTP
            </span>
            <span className="flex items-center gap-2">
              <span className="h-px w-5 bg-[var(--c-long)]" /> Kafka event
            </span>
            <span className="flex items-center gap-2">
              <span className="h-px w-5 bg-[var(--accent)]" /> active in this step
            </span>
            <span>dashed: discovery, or not yet wired</span>
          </div>
        </div>
        <div className="grid gap-6 p-4 sm:grid-cols-2 sm:gap-8 sm:p-6">
          <div aria-live="polite">
            <p className="eyebrow">
              Step {i + 1} · {SCENARIOS[scenario]!.label}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--fg)]">{step.text}</p>
          </div>
          <div className="border-t border-[var(--line)] pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <p className="eyebrow">Selected · {NODES[sel].title}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--fg-2)]">{NODES[sel].about}</p>
            <p className="mt-3 text-[12px] text-[var(--fg-3)]">Click any box in the diagram to read about it.</p>
          </div>
          <div className="sm:col-span-2">
            <Evidence kind="illustrative">walkthrough of the documented design</Evidence>
          </div>
        </div>
      </div>
    </div>
  );
}

function Btn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className="whitespace-nowrap rounded-full border border-[var(--line-2)] px-3 py-1.5 font-mono text-[11.5px] text-[var(--fg-2)] transition-colors hover:border-[var(--fg-3)] hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
