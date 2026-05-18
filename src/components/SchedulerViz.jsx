import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

/**
 * Live simulation of the Mini-vLLM continuous batching scheduler.
 *
 * Visualises:
 *  - WAITING → PREFILL → DECODE → DONE state machine
 *  - Paged KV cache (32 blocks) with per-request ownership
 *  - Concurrent decode across multiple in-flight requests
 *  - Live throughput counter (tokens/sec rolling average)
 *
 * Self-contained: no backend, no external state. Pure client simulation
 * driven by a fixed-interval tick loop.
 */

const TOTAL_BLOCKS = 32;
const MAX_IN_FLIGHT = 5; // max requests across PREFILL + DECODE
const MAX_QUEUE = 4;
const TICK_MS = 500;
const THROUGHPUT_WINDOW_MS = 4000;

// Distinct colors per request — visually identifies which blocks belong to whom.
// Palette is intentionally chosen from blue/cyan/violet family to reinforce
// the "data flow" semantic of the cyan accent — these are tokens flowing
// through the scheduler.
const REQUEST_COLORS = [
  { stroke: '#22D3EE', fill: 'rgba(34, 211, 238, 0.18)', name: 'cyan' },
  { stroke: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.18)', name: 'violet' },
  { stroke: '#3B82F6', fill: 'rgba(59, 130, 246, 0.18)', name: 'blue' },
  { stroke: '#60A5FA', fill: 'rgba(96, 165, 250, 0.18)', name: 'sky' },
  { stroke: '#A78BFA', fill: 'rgba(167, 139, 250, 0.18)', name: 'lavender' },
  { stroke: '#06B6D4', fill: 'rgba(6, 182, 212, 0.18)', name: 'cyan-deep' },
  { stroke: '#7C3AED', fill: 'rgba(124, 58, 237, 0.18)', name: 'violet-deep' },
];

let _idCounter = 0;
const nextId = () => `R${++_idCounter}`;

/**
 * Allocate `n` blocks from the cache for the given request id.
 * Returns updated cache and the new block indices, or null if not enough free blocks.
 */
function allocateBlocks(cache, requestId, n) {
  const free = [];
  for (let i = 0; i < cache.length; i++) {
    if (cache[i] === null) free.push(i);
    if (free.length === n) break;
  }
  if (free.length < n) return null;
  const next = cache.slice();
  free.forEach((i) => (next[i] = requestId));
  return { cache: next, indices: free };
}

function freeBlocks(cache, requestId) {
  return cache.map((b) => (b === requestId ? null : b));
}

function spawnRequest(colorIdx) {
  const promptTokens = 3 + Math.floor(Math.random() * 4); // 3-6 prompt tokens
  const blocksNeeded = Math.max(2, Math.ceil(promptTokens / 2));
  const maxOutputTokens = 6 + Math.floor(Math.random() * 8); // 6-13 output tokens
  return {
    id: nextId(),
    color: REQUEST_COLORS[colorIdx % REQUEST_COLORS.length],
    state: 'waiting',
    promptTokens,
    blocksNeeded,
    outputTokens: 0,
    maxOutputTokens,
    prefillRemaining: blocksNeeded,
    blockIndices: [],
  };
}

export default function SchedulerViz() {
  const reducedMotion = useReducedMotion();

  const [running, setRunning] = useState(true);
  const [requests, setRequests] = useState([]);
  const [kvCache, setKvCache] = useState(Array(TOTAL_BLOCKS).fill(null));
  const [totalTokens, setTotalTokens] = useState(0);
  const [tokensPerSec, setTokensPerSec] = useState(0);

  // Rolling throughput window: list of {timestamp, tokens}
  const tokenEventsRef = useRef([]);
  const colorIdxRef = useRef(0);

  // ----- Reset -----
  const reset = useCallback(() => {
    setRequests([]);
    setKvCache(Array(TOTAL_BLOCKS).fill(null));
    setTotalTokens(0);
    setTokensPerSec(0);
    tokenEventsRef.current = [];
    colorIdxRef.current = 0;
    _idCounter = 0;
  }, []);

  // ----- Single simulation tick -----
  const step = useCallback(() => {
    setRequests((prev) => {
      let cache = kvCache;
      let next = prev.map((r) => ({ ...r }));
      let tokensThisTick = 0;

      // 1. Retire DONE requests (after one tick of being shown DONE)
      next = next.filter((r) => !(r.state === 'done' && r.doneTicks >= 2));
      next.forEach((r) => {
        if (r.state === 'done') r.doneTicks = (r.doneTicks || 0) + 1;
      });

      // 2. Move DECODE → DONE if output reached max
      next.forEach((r) => {
        if (r.state === 'decode' && r.outputTokens >= r.maxOutputTokens) {
          r.state = 'done';
          r.doneTicks = 0;
          cache = freeBlocks(cache, r.id);
        }
      });

      // 3. Tick DECODE — each active decode produces 1 token (batched)
      next.forEach((r) => {
        if (r.state === 'decode') {
          r.outputTokens += 1;
          tokensThisTick += 1;
        }
      });

      // 4. Tick PREFILL — each prefill consumes one tick of work
      next.forEach((r) => {
        if (r.state === 'prefill') {
          r.prefillRemaining -= 1;
          if (r.prefillRemaining <= 0) r.state = 'decode';
        }
      });

      // 5. Promote WAITING → PREFILL if cache has space
      const inFlightCount = () =>
        next.filter((r) => r.state === 'prefill' || r.state === 'decode')
          .length;

      for (const r of next) {
        if (r.state !== 'waiting') continue;
        if (inFlightCount() >= MAX_IN_FLIGHT) break;
        const alloc = allocateBlocks(cache, r.id, r.blocksNeeded);
        if (!alloc) continue;
        cache = alloc.cache;
        r.state = 'prefill';
        r.blockIndices = alloc.indices;
      }

      // 6. Admit new requests to WAITING queue
      const waitingCount = next.filter((r) => r.state === 'waiting').length;
      if (waitingCount < MAX_QUEUE && Math.random() < 0.42) {
        next.push(spawnRequest(colorIdxRef.current++));
      }

      // Commit cache and tokens
      setKvCache(cache);

      if (tokensThisTick > 0) {
        const now = Date.now();
        tokenEventsRef.current.push({ t: now, n: tokensThisTick });
        setTotalTokens((t) => t + tokensThisTick);
      }

      return next;
    });
  }, [kvCache]);

  // ----- Tick loop -----
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(step, TICK_MS);
    return () => clearInterval(id);
  }, [running, step]);

  // ----- Throughput rolling window (updates every 400ms) -----
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      tokenEventsRef.current = tokenEventsRef.current.filter(
        (e) => now - e.t < THROUGHPUT_WINDOW_MS
      );
      const totalInWindow = tokenEventsRef.current.reduce(
        (s, e) => s + e.n,
        0
      );
      const tps = (totalInWindow / (THROUGHPUT_WINDOW_MS / 1000)).toFixed(1);
      setTokensPerSec(parseFloat(tps));
    }, 400);
    return () => clearInterval(id);
  }, []);

  // ----- Pause when tab hidden -----
  useEffect(() => {
    const handler = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // Group requests by state for column rendering
  const waiting = requests.filter((r) => r.state === 'waiting');
  const prefill = requests.filter((r) => r.state === 'prefill');
  const decode = requests.filter((r) => r.state === 'decode');
  const done = requests.filter((r) => r.state === 'done');

  return (
    <div className="my-8 rounded-xl border border-cream-100/10 bg-ink-900/40 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-cream-100/5 bg-ink-800/50">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-amber-400 ${
                running ? 'animate-ping opacity-60' : 'opacity-0'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                running ? 'bg-amber-400' : 'bg-cream-400'
              }`}
            />
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream-300">
            scheduler · live simulation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="p-1.5 rounded border border-cream-100/10 hover:border-amber-400/40 hover:text-amber-400 text-cream-300 transition-colors"
            aria-label={running ? 'pause' : 'play'}
          >
            {running ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            type="button"
            onClick={reset}
            className="p-1.5 rounded border border-cream-100/10 hover:border-amber-400/40 hover:text-amber-400 text-cream-300 transition-colors"
            aria-label="reset"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 md:p-6 space-y-6">
        {/* Pipeline columns */}
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          <PipelineColumn label="waiting" requests={waiting} compact />
          <PipelineColumn label="prefill" requests={prefill} />
          <PipelineColumn label="decode" requests={decode} showProgress />
          <PipelineColumn label="done" requests={done} fade />
        </div>

        {/* KV Cache grid */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream-400">
              kv cache · {TOTAL_BLOCKS} blocks · paged attention
            </p>
            <p className="font-mono text-[10px] text-cream-400">
              {kvCache.filter((b) => b !== null).length}/{TOTAL_BLOCKS}{' '}
              <span className="text-cream-500">allocated</span>
            </p>
          </div>
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(${TOTAL_BLOCKS}, minmax(0, 1fr))`,
            }}
          >
            {kvCache.map((owner, i) => {
              const req = owner
                ? requests.find((r) => r.id === owner)
                : null;
              const color = req?.color;
              return (
                <motion.div
                  key={i}
                  animate={{
                    backgroundColor: color?.fill ?? 'rgba(255,255,255,0.02)',
                    borderColor: color?.stroke
                      ? `${color.stroke}66`
                      : 'rgba(196,187,168,0.08)',
                  }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="aspect-square border rounded-[2px]"
                  title={owner ? `Block ${i} · ${owner}` : `Block ${i} · free`}
                />
              );
            })}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-cream-100/5">
          <Stat
            label="throughput"
            value={`${tokensPerSec.toFixed(1)}`}
            unit="tok/s"
          />
          <Stat label="total tokens" value={totalTokens.toString()} />
          <Stat
            label="in flight"
            value={(prefill.length + decode.length).toString()}
            sub={`${prefill.length}p / ${decode.length}d`}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function PipelineColumn({ label, requests, compact, showProgress, fade }) {
  return (
    <div className="min-h-[110px]">
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.25em] mb-2 ${
          requests.length > 0 ? 'text-amber-400' : 'text-cream-500'
        }`}
      >
        {label}
        {requests.length > 0 && (
          <span className="ml-1.5 text-cream-400">· {requests.length}</span>
        )}
      </p>
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {requests.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: fade ? 0.4 : 1, x: 0 }}
              exit={{ opacity: 0, x: 8, transition: { duration: 0.2 } }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="rounded border px-2 py-1.5"
              style={{
                borderColor: `${r.color.stroke}66`,
                backgroundColor: r.color.fill,
              }}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="font-mono text-[11px] font-medium"
                  style={{ color: r.color.stroke }}
                >
                  {r.id}
                </span>
                {!compact && (
                  <span className="font-mono text-[9px] text-cream-400">
                    {r.blocksNeeded}b
                  </span>
                )}
              </div>
              {showProgress && (
                <div className="mt-1 h-0.5 bg-cream-100/5 rounded overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: r.color.stroke }}
                    animate={{
                      width: `${
                        (r.outputTokens / r.maxOutputTokens) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.4, ease: 'linear' }}
                  />
                </div>
              )}
              {showProgress && (
                <p className="font-mono text-[9px] text-cream-400 mt-0.5">
                  {r.outputTokens}/{r.maxOutputTokens} tok
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value, unit, sub }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream-400 mb-1">
        {label}
      </p>
      <p className="font-display text-2xl md:text-3xl text-amber-400 leading-none tabular-nums">
        {value}
        {unit && (
          <span className="text-sm text-cream-400 font-mono ml-1.5">
            {unit}
          </span>
        )}
      </p>
      {sub && (
        <p className="font-mono text-[10px] text-cream-500 mt-1">{sub}</p>
      )}
    </div>
  );
}
