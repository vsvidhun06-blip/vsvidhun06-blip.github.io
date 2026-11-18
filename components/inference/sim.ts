// A small, deterministic, discrete-step model of an LLM serving engine.
//
// It exists to explain mechanisms (continuous batching, paged KV blocks,
// chunked prefill, prefix sharing, preemption), not to predict performance.
// Step costs are illustrative constants, and every number it produces is
// labelled as simulated wherever it is shown.

export type Policy = "static" | "continuous" | "chunked" | "prefix" | "adaptive";
export type Workload = "chat" | "long" | "mixed" | "shared" | "burst";
export type ReqClass = "chat" | "long" | "shared";
export type Phase = "queued" | "prefill" | "decode" | "done";

export interface Req {
  id: number;
  cls: ReqClass;
  prompt: number;
  out: number;
  /** Tokens that must be in cache before decoding (prompt, plus output if recomputed). */
  prefillTarget: number;
  prefilled: number;
  generated: number;
  arrivalMs: number;
  firstTokenMs?: number;
  doneMs?: number;
  phase: Phase;
  blocks: number[];
  /** Shared prefix blocks this request reads but does not own. */
  sharedBlocks: number[];
  preempted: number;
  admittedStep?: number;
  doneStep?: number;
}

export interface Block {
  owner: number | null; // request id, or null if free
  shared: boolean; // part of the cached shared prefix
  refs: number;
}

export interface Config {
  totalBlocks: number;
  blockSize: number;
  maxBatch: number;
  chunkBudget: number;
}

export interface StepInfo {
  step: number;
  prefillTokens: number;
  decodeTokens: number;
  stepMs: number;
  kind: "idle" | "prefill" | "decode" | "mixed";
  events: string[];
}

export interface SimState {
  step: number;
  clockMs: number;
  nextId: number;
  queue: Req[];
  running: Req[];
  finished: Req[];
  blocks: Block[];
  prefixBlocks: number[]; // block indices holding the shared system prompt, if cached
  policy: Policy;
  workload: Workload;
  cfg: Config;
  last: StepInfo;
  arm: { regime: "interactive" | "long context"; maxBatch: number; chunk: number } | null;
  totals: { tokens: number; preemptions: number; prefixHits: number; prefixLookups: number };
  history: { ms: number; tokens: number }[];
  seed: number;
}

export const SHARED_PREFIX = 64; // tokens of shared system prompt

const DEFAULT_CFG: Config = { totalBlocks: 48, blockSize: 16, maxBatch: 6, chunkBudget: 96 };

// Mulberry32: small seeded PRNG so runs are reproducible.
function rng(state: SimState) {
  let t = (state.seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const between = (s: SimState, lo: number, hi: number) => Math.round(lo + rng(s) * (hi - lo));

export function createSim(policy: Policy, workload: Workload, seed = 7, cfg: Partial<Config> = {}): SimState {
  const c = { ...DEFAULT_CFG, ...cfg };
  return {
    step: 0,
    clockMs: 0,
    nextId: 1,
    queue: [],
    running: [],
    finished: [],
    blocks: Array.from({ length: c.totalBlocks }, () => ({ owner: null, shared: false, refs: 0 })),
    prefixBlocks: [],
    policy,
    workload,
    cfg: c,
    last: { step: 0, prefillTokens: 0, decodeTokens: 0, stepMs: 0, kind: "idle", events: [] },
    arm: null,
    totals: { tokens: 0, preemptions: 0, prefixHits: 0, prefixLookups: 0 },
    history: [],
    seed,
  };
}

function classFor(s: SimState): ReqClass {
  const r = rng(s);
  switch (s.workload) {
    case "chat":
      return "chat";
    case "long":
      return r < 0.75 ? "long" : "chat";
    case "shared":
      return r < 0.8 ? "shared" : "chat";
    case "burst":
      return r < 0.7 ? "chat" : "long";
    case "mixed":
    default:
      return r < 0.5 ? "chat" : r < 0.75 ? "long" : "shared";
  }
}

export function makeRequest(s: SimState, cls: ReqClass = classFor(s)): Req {
  const prompt =
    cls === "chat" ? between(s, 18, 56) : cls === "long" ? between(s, 150, 300) : SHARED_PREFIX + between(s, 10, 36);
  const out = cls === "long" ? between(s, 10, 22) : between(s, 12, 30);
  return {
    id: s.nextId++,
    cls,
    prompt,
    out,
    prefillTarget: prompt,
    prefilled: 0,
    generated: 0,
    arrivalMs: s.clockMs,
    phase: "queued",
    blocks: [],
    sharedBlocks: [],
    preempted: 0,
  };
}

export function inject(s: SimState, n = 1, cls?: ReqClass) {
  for (let i = 0; i < n; i++) s.queue.push(makeRequest(s, cls));
}

function arrivals(s: SimState) {
  const busy = s.queue.length + s.running.length;
  let p: number;
  switch (s.workload) {
    case "burst":
      // Quiet, then a burst every 28 steps.
      if (s.step % 28 === 3) {
        inject(s, 7);
        return;
      }
      p = 0.06;
      break;
    case "long":
      p = 0.22;
      break;
    default:
      p = 0.42;
  }
  if (busy > 18) p *= 0.3; // keep the picture readable
  if (rng(s) < p) inject(s, 1);
}

const freeBlocks = (s: SimState) => s.blocks.filter((b) => b.owner === null && !b.shared).length;
const evictablePrefix = (s: SimState) =>
  s.prefixBlocks.length > 0 && s.prefixBlocks.every((i) => s.blocks[i]!.refs === 0);

function evictPrefix(s: SimState, events: string[]) {
  for (const i of s.prefixBlocks) s.blocks[i] = { owner: null, shared: false, refs: 0 };
  s.prefixBlocks = [];
  events.push("Evicted cached prefix to make room");
}

function alloc(s: SimState, req: Req, events: string[]): boolean {
  let idx = s.blocks.findIndex((b) => b.owner === null && !b.shared);
  if (idx < 0 && evictablePrefix(s)) {
    evictPrefix(s, events);
    idx = s.blocks.findIndex((b) => b.owner === null && !b.shared);
  }
  if (idx < 0) return false;
  s.blocks[idx] = { owner: req.id, shared: false, refs: 1 };
  req.blocks.push(idx);
  return true;
}

function release(s: SimState, req: Req) {
  for (const i of req.blocks) s.blocks[i] = { owner: null, shared: false, refs: 0 };
  req.blocks = [];
  for (const i of req.sharedBlocks) {
    const b = s.blocks[i];
    if (b) b.refs = Math.max(0, b.refs - 1);
  }
  req.sharedBlocks = [];
}

const usesPrefix = (s: SimState) => s.policy === "prefix" || s.policy === "adaptive";
const usesChunks = (s: SimState) => s.policy === "chunked" || s.policy === "prefix" || s.policy === "adaptive";

function effectiveLimits(s: SimState) {
  if (s.policy !== "adaptive") return { maxBatch: s.cfg.maxBatch, chunk: s.cfg.chunkBudget };
  // Concept only: classify the waiting work by prompt length and pick an arm
  // from a fixed table, the way CARL's regime classifier chooses an arm table.
  const pending = [...s.queue, ...s.running.filter((r) => r.phase === "prefill")];
  const meanPrompt = pending.length ? pending.reduce((a, r) => a + r.prompt, 0) / pending.length : 40;
  const regime = meanPrompt > 120 ? "long context" : "interactive";
  const arm = regime === "interactive" ? { maxBatch: 8, chunk: 64 } : { maxBatch: 4, chunk: 160 };
  s.arm = { regime, ...arm };
  return { maxBatch: arm.maxBatch, chunk: arm.chunk };
}

function admit(s: SimState, maxBatch: number, events: string[]) {
  const bs = s.cfg.blockSize;
  if (s.policy === "static" && s.running.length > 0) return; // wait for the whole batch
  while (s.queue.length && s.running.length < maxBatch) {
    const req = s.queue[0]!;
    let sharedHit = false;
    if (usesPrefix(s) && req.cls === "shared" && req.preempted === 0) {
      s.totals.prefixLookups++;
      sharedHit = s.prefixBlocks.length > 0;
    }
    const cachedTokens = sharedHit ? SHARED_PREFIX : 0;
    const need = Math.ceil((req.prefillTarget - cachedTokens) / bs);
    const available = freeBlocks(s) + (evictablePrefix(s) && !sharedHit ? s.prefixBlocks.length : 0);
    if (available < need + 1) break; // keep one block of headroom for decode growth
    s.queue.shift();
    if (sharedHit) {
      s.totals.prefixHits++;
      for (const i of s.prefixBlocks) s.blocks[i]!.refs++;
      req.sharedBlocks = [...s.prefixBlocks];
      req.prefilled = SHARED_PREFIX;
      events.push(`#${req.id} reused ${s.prefixBlocks.length} cached prefix blocks`);
    }
    for (let i = 0; i < need; i++) alloc(s, req, events);
    req.phase = req.prefilled >= req.prefillTarget ? "decode" : "prefill";
    req.admittedStep = s.step;
    s.running.push(req);
    events.push(`#${req.id} admitted (${req.prefillTarget} prompt tokens, ${need} blocks)`);
  }
}

/** After a shared request finishes prefill, keep its first blocks as the cached prefix. */
function publishPrefix(s: SimState, req: Req) {
  if (!usesPrefix(s) || req.cls !== "shared" || s.prefixBlocks.length || req.sharedBlocks.length) return;
  const n = SHARED_PREFIX / s.cfg.blockSize;
  const take = req.blocks.splice(0, n);
  for (const i of take) s.blocks[i] = { owner: null, shared: true, refs: 1 };
  s.prefixBlocks = take;
  req.sharedBlocks = take;
}

function preemptOne(s: SimState, events: string[]): boolean {
  // Recompute-style preemption: drop the most recently admitted request's
  // blocks and send it back to the front of the queue.
  const victim = [...s.running].sort((a, b) => (b.admittedStep ?? 0) - (a.admittedStep ?? 0))[0];
  if (!victim) return false;
  release(s, victim);
  victim.prefillTarget = victim.prompt + victim.generated;
  victim.prefilled = 0;
  victim.phase = "queued";
  victim.preempted++;
  s.running = s.running.filter((r) => r !== victim);
  s.queue.unshift(victim);
  s.totals.preemptions++;
  events.push(`#${victim.id} preempted: KV cache full, will recompute`);
  return true;
}

export function step(s: SimState): SimState {
  const events: string[] = [];
  s.step++;
  arrivals(s);
  const { maxBatch, chunk } = effectiveLimits(s);
  admit(s, maxBatch, events);

  const bs = s.cfg.blockSize;
  let prefillTokens = 0;
  let decodeTokens = 0;
  const prefilling = s.running.filter((r) => r.phase === "prefill");
  const decoding = s.running.filter((r) => r.phase === "decode");

  if (usesChunks(s)) {
    // Decodes go first, then the remaining token budget feeds prefill chunks.
    let budget = Math.max(chunk, decoding.length + 8);
    for (const r of decoding) {
      decodeOne(r);
      decodeTokens++;
      budget--;
    }
    for (const r of prefilling) {
      if (budget <= 0) break;
      const take = Math.min(budget, r.prefillTarget - r.prefilled);
      r.prefilled += take;
      prefillTokens += take;
      budget -= take;
      if (r.prefilled >= r.prefillTarget) finishPrefill(s, r);
    }
  } else if (prefilling.length) {
    // Without chunking, a step that has prefill work runs only prefill.
    for (const r of prefilling) {
      prefillTokens += r.prefillTarget - r.prefilled;
      r.prefilled = r.prefillTarget;
      finishPrefill(s, r);
    }
  } else {
    for (const r of decoding) {
      decodeOne(r);
      decodeTokens++;
    }
  }

  // Grow KV blocks for decoding requests; preempt if the cache is full.
  for (const r of [...s.running]) {
    if (r.phase !== "decode" || !s.running.includes(r)) continue;
    const ctx = r.prompt + r.generated;
    const have = (r.blocks.length + r.sharedBlocks.length) * bs;
    if (ctx > have && !alloc(s, r, events)) {
      if (!preemptOne(s, events)) break;
      if (s.running.includes(r)) alloc(s, r, events);
    }
  }

  // Completions.
  for (const r of [...s.running]) {
    if (r.phase === "decode" && r.generated >= r.out) {
      r.phase = "done";
      r.doneStep = s.step;
      release(s, r);
      s.running = s.running.filter((x) => x !== r);
      s.finished.unshift(r);
      events.push(`#${r.id} finished, ${r.out} tokens`);
    }
  }
  if (s.finished.length > 40) s.finished.length = 40;

  // Illustrative cost model: fixed overhead, per-token prefill cost, per-sequence decode cost.
  const stepMs = prefillTokens + decodeTokens === 0 ? 4 : 6 + 0.035 * prefillTokens + 0.9 * decodeTokens;
  s.clockMs += stepMs;
  for (const r of s.running) {
    if (r.firstTokenMs === undefined && r.generated > 0) r.firstTokenMs = s.clockMs;
  }
  for (const r of s.finished) {
    if (r.doneStep === s.step) {
      if (r.firstTokenMs === undefined) r.firstTokenMs = s.clockMs;
      r.doneMs = s.clockMs;
    }
  }
  s.totals.tokens += decodeTokens;
  s.history.push({ ms: s.clockMs, tokens: decodeTokens });
  if (s.history.length > 60) s.history.shift();

  s.last = {
    step: s.step,
    prefillTokens,
    decodeTokens,
    stepMs,
    kind: prefillTokens && decodeTokens ? "mixed" : prefillTokens ? "prefill" : decodeTokens ? "decode" : "idle",
    events,
  };
  return s;
}

function finishPrefill(s: SimState, r: Req) {
  r.phase = "decode";
  publishPrefix(s, r);
}

function decodeOne(r: Req) {
  r.generated++;
}

export interface Metrics {
  ttftP50: number | null;
  ttftP95: number | null;
  throughput: number;
  kvUsed: number;
  kvShared: number;
  queue: number;
  batch: number;
  preemptions: number;
  prefixHitRate: number | null;
}

const pct = (xs: number[], p: number) => {
  if (!xs.length) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]!;
};

export function metrics(s: SimState): Metrics {
  const ttfts = s.finished
    .slice(0, 30)
    .filter((r) => r.firstTokenMs !== undefined)
    .map((r) => r.firstTokenMs! - r.arrivalMs);
  const h = s.history;
  const span = h.length > 1 ? h[h.length - 1]!.ms - h[0]!.ms : 0;
  const toks = h.slice(1).reduce((a, x) => a + x.tokens, 0);
  return {
    ttftP50: pct(ttfts, 50),
    ttftP95: pct(ttfts, 95),
    throughput: span > 0 ? (toks / span) * 1000 : 0,
    kvUsed: s.blocks.filter((b) => b.owner !== null).length,
    kvShared: s.prefixBlocks.length,
    queue: s.queue.length,
    batch: s.running.length,
    preemptions: s.totals.preemptions,
    prefixHitRate: s.totals.prefixLookups ? s.totals.prefixHits / s.totals.prefixLookups : null,
  };
}

/** Deep-ish clone so React sees a new object each step. */
export function snapshot(s: SimState): SimState {
  return {
    ...s,
    queue: s.queue.map((r) => ({ ...r })),
    running: s.running.map((r) => ({ ...r })),
    finished: s.finished.map((r) => ({ ...r })),
    blocks: s.blocks.map((b) => ({ ...b })),
    prefixBlocks: [...s.prefixBlocks],
    history: [...s.history],
    totals: { ...s.totals },
    last: { ...s.last, events: [...s.last.events] },
    arm: s.arm ? { ...s.arm } : null,
  };
}

/** Warm the simulation up so the first rendered frame already shows activity. */
export function warm(s: SimState, steps: number) {
  for (let i = 0; i < steps; i++) step(s);
  return s;
}
