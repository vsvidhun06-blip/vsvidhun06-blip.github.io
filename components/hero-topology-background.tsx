"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { theme } from "@/lib/theme";

/**
 * Interactive canvas background for the whole site: an abstract LLM-serving
 * topology (Router → Scheduler → 3 GPU Workers → KV Cache) echoing the
 * Mini-vLLM architecture. Mounted once at the root layout and positioned
 * `fixed`, so it persists behind every section as the user scrolls. Purely
 * decorative — `pointer-events: none` keeps all content fully interactive.
 *
 * Scroll behaviour: a single intensity (global-alpha) value fades the topology
 * from a slightly subtle level near the Hero to an even fainter level deeper in
 * the page, so it never competes with text-heavy sections (Skills, Experience,
 * Projects). The fade is driven inside the existing rAF loop — no second loop.
 */

type NodeId =
  | "router"
  | "scheduler"
  | "worker1"
  | "worker2"
  | "worker3"
  | "kvcache";

interface NodeDef {
  id: NodeId;
  /** Resting position in normalised [0,1] coordinates (resolution-independent). */
  fx: number;
  fy: number;
  label: string;
  /** Per-node drift parameters (organic sinusoidal motion, not per-frame RNG). */
  ampX: number;
  ampY: number;
  freqX: number;
  freqY: number;
  phaseX: number;
  phaseY: number;
}

/**
 * Topology definition. The fractional layout keeps the shape recognisable from
 * 320px phones up to wide desktops. Workers stack vertically and converge into
 * the KV Cache, suggesting a serving pipeline rather than a generic graph.
 */
const NODES: NodeDef[] = [
  { id: "router", fx: 0.12, fy: 0.5, label: "Router", ampX: 6, ampY: 8, freqX: 0.17, freqY: 0.13, phaseX: 0.0, phaseY: 1.1 },
  { id: "scheduler", fx: 0.34, fy: 0.5, label: "Scheduler", ampX: 7, ampY: 6, freqX: 0.15, freqY: 0.19, phaseX: 1.7, phaseY: 0.4 },
  { id: "worker1", fx: 0.62, fy: 0.27, label: "GPU Worker 1", ampX: 5, ampY: 9, freqX: 0.21, freqY: 0.16, phaseX: 2.3, phaseY: 0.9 },
  { id: "worker2", fx: 0.62, fy: 0.5, label: "GPU Worker 2", ampX: 6, ampY: 7, freqX: 0.18, freqY: 0.22, phaseX: 0.6, phaseY: 2.0 },
  { id: "worker3", fx: 0.62, fy: 0.73, label: "GPU Worker 3", ampX: 5, ampY: 9, freqX: 0.2, freqY: 0.15, phaseX: 3.0, phaseY: 1.5 },
  { id: "kvcache", fx: 0.86, fy: 0.5, label: "KV Cache", ampX: 7, ampY: 6, freqX: 0.14, freqY: 0.2, phaseX: 1.2, phaseY: 2.6 },
];

/** Edges, indexed into NODES. Order matters only for tidy drawing. */
const EDGES: Array<[NodeId, NodeId]> = [
  ["router", "scheduler"],
  ["scheduler", "worker1"],
  ["scheduler", "worker2"],
  ["scheduler", "worker3"],
  ["worker1", "kvcache"],
  ["worker2", "kvcache"],
  ["worker3", "kvcache"],
];

/** A request pulse travels Router → Scheduler → one Worker → KV Cache. */
interface Pulse {
  worker: 0 | 1 | 2; // which GPU worker this request is routed to
  t: number; // progress along the full 3-segment path, 0..1
  speed: number; // progress per second
}

const WORKER_IDS: NodeId[] = ["worker1", "worker2", "worker3"];

const INFLUENCE_RADIUS = 175; // px — mouse influence on nodes and edges
const MAX_NODE_DISPLACEMENT = 14; // px — cap on cursor-driven node push
const MAX_PULSES = 9;
const PULSE_SPAWN_INTERVAL = 1.1; // seconds between new requests
const MAX_DPR = 2;

// Global-alpha (overall opacity) applied to the whole topology. Lowered versus
// the old Hero-only version because it now sits behind dense content site-wide.
const HERO_INTENSITY = 0.85; // near the top of the page (over the Hero)
const MIN_INTENSITY = 0.4; // deep in the page, behind text-heavy sections
const STATIC_INTENSITY = 0.55; // fixed level used under prefers-reduced-motion
// Distance over which the fade completes, in viewport heights.
const FADE_VIEWPORTS = 2;

export function TopologyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const text = hexToRgb(theme.text); // [250,250,250]
    const muted = hexToRgb(theme.muted); // [161,161,170]

    // Logical (CSS-pixel) canvas size, kept in sync with the element.
    let width = 0;
    let height = 0;

    // Live displacement of each node from its drifting base (cursor push).
    const disp = NODES.map(() => ({ x: 0, y: 0 }));
    // Current resolved on-screen position of each node (base + drift + disp).
    const pos = NODES.map(() => ({ x: 0, y: 0 }));

    // Pointer state in canvas-local CSS pixels.
    const mouse = { x: 0, y: 0, active: false };

    const pulses: Pulse[] = [];
    let spawnAccumulator = 0;

    // Scroll-linked overall opacity. `intensity` is eased toward
    // `targetIntensity` (set by the scroll handler) inside the frame loop.
    let intensity = prefersReduced ? STATIC_INTENSITY : HERO_INTENSITY;
    let targetIntensity = intensity;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas!.width = Math.max(1, Math.round(width * dpr));
      canvas!.height = Math.max(1, Math.round(height * dpr));
      // Draw in CSS-pixel space; the transform handles the DPR scale.
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (prefersReduced) drawStatic();
    }

    function nodeBasePos(i: number, tSec: number) {
      const n = NODES[i];
      const bx = n.fx * width;
      const by = n.fy * height;
      // Sinusoidal drift — continuous and deterministic, never per-frame RNG.
      const dx = n.ampX * Math.sin(tSec * n.freqX * Math.PI * 2 + n.phaseX);
      const dy = n.ampY * Math.sin(tSec * n.freqY * Math.PI * 2 + n.phaseY);
      return { x: bx + dx, y: by + dy };
    }

    function indexOf(id: NodeId) {
      return NODES.findIndex((n) => n.id === id);
    }

    /** Position along a pulse's 3-segment path using the *current* node positions. */
    function pulsePosition(p: Pulse) {
      const sched = pos[indexOf("scheduler")];
      const router = pos[indexOf("router")];
      const worker = pos[indexOf(WORKER_IDS[p.worker])];
      const kv = pos[indexOf("kvcache")];
      const seg = Math.min(2, Math.floor(p.t * 3));
      const local = p.t * 3 - seg;
      if (seg === 0) return lerpPt(router, sched, local);
      if (seg === 1) return lerpPt(sched, worker, local);
      return lerpPt(worker, kv, local);
    }

    function drawScene(tSec: number, animate: boolean) {
      ctx!.clearRect(0, 0, width, height);
      // Apply the scroll-linked overall opacity once for the whole scene.
      // (clearRect ignores globalAlpha, so the wipe above is unaffected.)
      ctx!.globalAlpha = intensity;

      // Resolve node positions: drifting base + eased cursor displacement.
      for (let i = 0; i < NODES.length; i++) {
        const base = animate ? nodeBasePos(i, tSec) : { x: NODES[i].fx * width, y: NODES[i].fy * height };
        pos[i] = { x: base.x + disp[i].x, y: base.y + disp[i].y };
      }

      // Edges — brighten when the cursor is near the segment.
      for (const [a, b] of EDGES) {
        const pa = pos[indexOf(a)];
        const pb = pos[indexOf(b)];
        let alpha = 0.06;
        if (animate && mouse.active) {
          const d = distToSegment(mouse, pa, pb);
          if (d < INFLUENCE_RADIUS) {
            alpha += (1 - d / INFLUENCE_RADIUS) * 0.16;
          }
        }
        ctx!.strokeStyle = rgba(muted, alpha);
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(pa.x, pa.y);
        ctx!.lineTo(pb.x, pb.y);
        ctx!.stroke();
      }

      // Pulses — low-opacity request packets flowing down the pipeline.
      if (animate) {
        for (const p of pulses) {
          const pt = pulsePosition(p);
          const glow = ctx!.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 6);
          glow.addColorStop(0, rgba(text, 0.5));
          glow.addColorStop(1, rgba(text, 0));
          ctx!.fillStyle = glow;
          ctx!.beginPath();
          ctx!.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx!.fill();

          ctx!.fillStyle = rgba(text, 0.55);
          ctx!.beginPath();
          ctx!.arc(pt.x, pt.y, 1.6, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // Nodes — small dot with a faint ring; ring brightens near the cursor.
      for (let i = 0; i < NODES.length; i++) {
        const p = pos[i];
        let ringAlpha = 0.16;
        if (animate && mouse.active) {
          const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (d < INFLUENCE_RADIUS) ringAlpha += (1 - d / INFLUENCE_RADIUS) * 0.25;
        }
        ctx!.strokeStyle = rgba(text, ringAlpha);
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx!.stroke();

        ctx!.fillStyle = rgba(muted, 0.45);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
        ctx!.fill();

        // Very faint label — keeps the topology readable without competing.
        ctx!.fillStyle = rgba(muted, 0.16);
        ctx!.font = "10px ui-sans-serif, system-ui, sans-serif";
        ctx!.textAlign = "center";
        ctx!.fillText(NODES[i].label, p.x, p.y - 13);
      }
    }

    function drawStatic() {
      drawScene(0, false);
    }

    // --- Animated loop -------------------------------------------------------
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    function frame(now: number) {
      let dt = (now - last) / 1000;
      last = now;
      // Clamp dt so a backgrounded tab doesn't fling everything on return.
      if (dt > 0.05) dt = 0.05;
      elapsed += dt;

      // Ease the scroll-linked opacity toward its target (smooth, no jank).
      intensity += (targetIntensity - intensity) * Math.min(1, dt * 4);

      // Ease node displacement toward a cursor-driven target (smooth return).
      for (let i = 0; i < NODES.length; i++) {
        const base = nodeBasePos(i, elapsed);
        let tx = 0;
        let ty = 0;
        if (mouse.active) {
          const dx = base.x - mouse.x;
          const dy = base.y - mouse.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < INFLUENCE_RADIUS) {
            const push = (1 - dist / INFLUENCE_RADIUS) * MAX_NODE_DISPLACEMENT;
            tx = (dx / dist) * push;
            ty = (dy / dist) * push;
          }
        }
        const k = Math.min(1, dt * 6); // critically-damped-ish smoothing
        disp[i].x += (tx - disp[i].x) * k;
        disp[i].y += (ty - disp[i].y) * k;
      }

      // Advance and recycle pulses.
      spawnAccumulator += dt;
      if (spawnAccumulator >= PULSE_SPAWN_INTERVAL && pulses.length < MAX_PULSES) {
        spawnAccumulator = 0;
        pulses.push({
          worker: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
          t: 0,
          speed: 0.12 + Math.random() * 0.05, // slow, ~6–8s end-to-end
        });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].t += pulses[i].speed * dt;
        if (pulses[i].t >= 1) pulses.splice(i, 1);
      }

      drawScene(elapsed, true);
      raf = requestAnimationFrame(frame);
    }

    // --- Event handling ------------------------------------------------------
    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active =
        mouse.x >= 0 && mouse.y >= 0 && mouse.x <= width && mouse.y <= height;
    }
    function onPointerLeave() {
      mouse.active = false;
    }

    // Scroll handler only reads `scrollY`/`innerHeight` (no layout-forcing
    // reads) and writes a target; the frame loop does the actual easing/redraw.
    function onScroll() {
      const y = window.scrollY || 0;
      const vh = window.innerHeight || 1;
      const p = Math.min(1, y / (vh * FADE_VIEWPORTS));
      targetIntensity = HERO_INTENSITY - p * (HERO_INTENSITY - MIN_INTENSITY);
    }

    // ResizeObserver coalesces layout-driven size changes efficiently.
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    resize();

    if (prefersReduced) {
      // Static topology only — no rAF loop, no pulses, no cursor reaction.
      drawStatic();
      return () => ro.disconnect();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialise from current scroll position
    last = performance.now();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [prefersReduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}

// --- helpers ---------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba([r, g, b]: [number, number, number], a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

interface Pt {
  x: number;
  y: number;
}

function lerpPt(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Shortest distance from point `p` to segment `a`–`b`. */
function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
