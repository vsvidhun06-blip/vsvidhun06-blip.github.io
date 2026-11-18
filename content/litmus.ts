// Litmus tests for the interactive event graph.
//
// Verdicts are tool output, not my recollection:
//  - Classic shapes: wev-smt/eval/atlas-canonical.csv (PSO column = pso_canonical).
//  - Dependency pair: LbProbe run on 14 Nov 2026, docs/captures/lbprobe-paper-examples.txt.
// The explanations and highlighted cycles are my reading of why each verdict holds.

export type Model = "SC" | "TSO" | "PSO" | "RA" | "WEAKEST" | "RC11";
export type Verdict = "allowed" | "forbidden";
export type Rel = "po" | "rf" | "co" | "fr" | "dep" | "fakedep";

export interface LEvent {
  id: string;
  /** Column, 0-based. Use -1 for the initial-state node. */
  thread: number;
  /** Row inside the column. */
  row: number;
  label: string;
}

export interface LEdge {
  from: string;
  to: string;
  rel: Rel;
}

export interface ModelNote {
  verdict: Verdict;
  why: string;
  /** Edges ("from>to", optionally "from>to:rel") that form the violating cycle. Without a rel, non-dependency edges match. */
  cycle?: string[];
}

export interface LitmusTest {
  id: string;
  name: string;
  idea: string;
  threads: string[][];
  outcome: string;
  events: LEvent[];
  edges: LEdge[];
  models: Partial<Record<Model, ModelNote>>;
  source: string;
  toolLine?: string;
  /** Display order of thread columns, left to right. Defaults to 0..n-1. */
  order?: number[];
}

const ATLAS = "WEV-SMT atlas run, eval/atlas-canonical.csv";

export const litmusTests: LitmusTest[] = [
  {
    id: "SB",
    name: "Store buffering",
    idea: "Each thread writes one variable, then reads the other. Can both reads miss both writes?",
    threads: [["x = 1", "r1 = y"], ["y = 1", "r2 = x"]],
    outcome: "r1 = 0 and r2 = 0",
    events: [
      { id: "i", thread: -1, row: 0, label: "init x = 0, y = 0" },
      { id: "a", thread: 0, row: 1, label: "W x = 1" },
      { id: "b", thread: 0, row: 2, label: "R y = 0" },
      { id: "c", thread: 1, row: 1, label: "W y = 1" },
      { id: "d", thread: 1, row: 2, label: "R x = 0" },
    ],
    edges: [
      { from: "a", to: "b", rel: "po" },
      { from: "c", to: "d", rel: "po" },
      { from: "i", to: "b", rel: "rf" },
      { from: "i", to: "d", rel: "rf" },
      { from: "b", to: "c", rel: "fr" },
      { from: "d", to: "a", rel: "fr" },
    ],
    models: {
      SC: {
        verdict: "forbidden",
        why: "Sequential consistency needs one global order that respects every edge. Here a comes before b in program order, b reads the old y so it precedes c, c precedes d, and d reads the old x so it precedes a. That is a cycle.",
        cycle: ["a>b", "b>c", "c>d", "d>a"],
      },
      TSO: {
        verdict: "allowed",
        why: "TSO puts each store in a FIFO buffer, so a later load can run before an earlier store reaches memory. Write-to-read program order is not enforced, which removes both po edges from the cycle.",
      },
      PSO: { verdict: "allowed", why: "PSO relaxes everything TSO relaxes, plus store-to-store order. The outcome stays allowed." },
      RA: {
        verdict: "allowed",
        why: "Release/acquire does not order a store before a later load to a different location. Both reads seeing the initial values breaks no coherence rule.",
      },
      WEAKEST: {
        verdict: "allowed",
        why: "WEAKEST keeps per-location coherence and forbids cycles through semantic dependencies. There are no dependencies here at all.",
      },
    },
    source: ATLAS,
  },
  {
    id: "MP",
    name: "Message passing",
    idea: "Thread 1 writes data, then a flag. If thread 2 sees the flag, must it see the data?",
    threads: [["x = 1", "y = 1"], ["r1 = y", "r2 = x"]],
    outcome: "r1 = 1 and r2 = 0",
    events: [
      { id: "i", thread: -1, row: 0, label: "init x = 0, y = 0" },
      { id: "a", thread: 0, row: 1, label: "W x = 1" },
      { id: "b", thread: 0, row: 2, label: "W y = 1" },
      { id: "c", thread: 1, row: 1, label: "R y = 1" },
      { id: "d", thread: 1, row: 2, label: "R x = 0" },
    ],
    edges: [
      { from: "a", to: "b", rel: "po" },
      { from: "c", to: "d", rel: "po" },
      { from: "b", to: "c", rel: "rf" },
      { from: "i", to: "d", rel: "rf" },
      { from: "d", to: "a", rel: "fr" },
    ],
    models: {
      SC: {
        verdict: "forbidden",
        why: "a before b (po), b before c (c reads b), c before d (po), and d reads the old x so it precedes a. No single interleaving satisfies all four.",
        cycle: ["a>b", "b>c", "c>d", "d>a"],
      },
      TSO: {
        verdict: "forbidden",
        why: "The store buffer drains in order, and loads are not reordered with each other, so the same cycle survives.",
        cycle: ["a>b", "b>c", "c>d", "d>a"],
      },
      PSO: {
        verdict: "allowed",
        why: "PSO lets stores to different locations leave the buffer out of order, so y = 1 can become visible before x = 1. The a to b edge stops constraining the global order.",
      },
      RA: {
        verdict: "allowed",
        why: "With a release store and an acquire load on y this would be forbidden. In this test both accesses are plain, so reading y = 1 creates no happens-before edge and the stale read of x is allowed.",
      },
      WEAKEST: { verdict: "allowed", why: "Plain accesses, no synchronisation and no dependencies: nothing forbids it." },
    },
    source: ATLAS,
  },
  {
    id: "LB",
    name: "Load buffering",
    idea: "Each thread reads one variable, then writes a constant to the other. Can each read see the other thread's later write?",
    threads: [["r1 = x", "y = 1"], ["r2 = y", "x = 1"]],
    outcome: "r1 = 1 and r2 = 1",
    events: [
      { id: "a", thread: 0, row: 1, label: "R x = 1" },
      { id: "b", thread: 0, row: 2, label: "W y = 1" },
      { id: "c", thread: 1, row: 1, label: "R y = 1" },
      { id: "d", thread: 1, row: 2, label: "W x = 1" },
    ],
    edges: [
      { from: "a", to: "b", rel: "po" },
      { from: "c", to: "d", rel: "po" },
      { from: "b", to: "c", rel: "rf" },
      { from: "d", to: "a", rel: "rf" },
    ],
    models: {
      SC: {
        verdict: "forbidden",
        why: "Each read would have to come after the write it reads from, which comes after the other read in program order. po and rf form a cycle.",
        cycle: ["a>b", "b>c", "c>d", "d>a"],
      },
      TSO: { verdict: "forbidden", why: "TSO never lets a store overtake an earlier load, so the po edges hold and the cycle remains.", cycle: ["a>b", "b>c", "c>d", "d>a"] },
      PSO: { verdict: "forbidden", why: "PSO also keeps load-to-store order. Same cycle.", cycle: ["a>b", "b>c", "c>d", "d>a"] },
      RA: {
        verdict: "allowed",
        why: "The tool's RA checks RC11's release/acquire coherence axiom. Plain reads-from edges add no happens-before, so this axiom alone does not forbid the cycle. Full RC11 adds acyclic(po ∪ rf) and would.",
      },
      WEAKEST: {
        verdict: "allowed",
        why: "The stores write constants, so neither store depends on its load. WEAKEST only forbids cycles through semantic dependencies, and there are none.",
      },
    },
    source: ATLAS,
  },
  {
    id: "IRIW",
    name: "Independent reads of independent writes",
    idea: "Two writers, two readers. Can the readers disagree about which write happened first?",
    threads: [["x = 1"], ["y = 1"], ["r1 = x", "r2 = y"], ["r3 = y", "r4 = x"]],
    outcome: "r1 = 1, r2 = 0, r3 = 1, r4 = 0",
    order: [2, 0, 1, 3],
    events: [
      { id: "i", thread: -1, row: 0, label: "init x = 0, y = 0" },
      { id: "a", thread: 0, row: 1, label: "W x = 1" },
      { id: "b", thread: 1, row: 1, label: "W y = 1" },
      { id: "c", thread: 2, row: 1, label: "R x = 1" },
      { id: "d", thread: 2, row: 2, label: "R y = 0" },
      { id: "e", thread: 3, row: 1, label: "R y = 1" },
      { id: "f", thread: 3, row: 2, label: "R x = 0" },
    ],
    edges: [
      { from: "c", to: "d", rel: "po" },
      { from: "e", to: "f", rel: "po" },
      { from: "a", to: "c", rel: "rf" },
      { from: "b", to: "e", rel: "rf" },
      { from: "d", to: "b", rel: "fr" },
      { from: "f", to: "a", rel: "fr" },
    ],
    models: {
      SC: {
        verdict: "forbidden",
        why: "One global order must put x = 1 before thread 3's reads and y = 1 before thread 4's, yet thread 3 says x came first and thread 4 says y did. The edges close into a cycle.",
        cycle: ["a>c", "c>d", "d>b", "b>e", "e>f", "f>a"],
      },
      TSO: { verdict: "forbidden", why: "TSO is multi-copy atomic: a store becomes visible to every other thread at the same moment, so all readers agree on the order.", cycle: ["a>c", "c>d", "d>b", "b>e", "e>f", "f>a"] },
      PSO: { verdict: "forbidden", why: "PSO is still multi-copy atomic. Readers cannot disagree.", cycle: ["a>c", "c>d", "d>b", "b>e", "e>f", "f>a"] },
      RA: { verdict: "allowed", why: "Release/acquire is not multi-copy atomic. With plain reads, nothing makes the two readers agree on an order." },
      WEAKEST: { verdict: "allowed", why: "Allowed for the same reason, and there are no dependencies to create a cycle." },
    },
    source: ATLAS,
  },
  {
    id: "2+2W",
    name: "Two plus two writes",
    idea: "Both threads write both variables in opposite orders. Can each variable end with the value written first?",
    threads: [["x = 1", "y = 2"], ["y = 1", "x = 2"]],
    outcome: "final x = 1 and y = 1",
    events: [
      { id: "a", thread: 0, row: 1, label: "W x = 1" },
      { id: "b", thread: 0, row: 2, label: "W y = 2" },
      { id: "c", thread: 1, row: 1, label: "W y = 1" },
      { id: "d", thread: 1, row: 2, label: "W x = 2" },
    ],
    edges: [
      { from: "a", to: "b", rel: "po" },
      { from: "c", to: "d", rel: "po" },
      { from: "b", to: "c", rel: "co" },
      { from: "d", to: "a", rel: "co" },
    ],
    models: {
      SC: { verdict: "forbidden", why: "For x to end at 1, x = 2 must be ordered before x = 1 in coherence; for y to end at 1, y = 2 before y = 1. Together with program order that is a cycle.", cycle: ["a>b", "b>c", "c>d", "d>a"] },
      TSO: { verdict: "forbidden", why: "TSO keeps store-to-store order, so the cycle stays.", cycle: ["a>b", "b>c", "c>d", "d>a"] },
      PSO: { verdict: "allowed", why: "PSO drops store-to-store order between different locations, which breaks both po edges in the cycle." },
      RA: { verdict: "allowed", why: "Plain stores to different locations are unordered for other threads under this axiom." },
      WEAKEST: { verdict: "allowed", why: "Only per-location coherence applies, and each location's order is consistent on its own." },
    },
    source: ATLAS,
  },
  {
    id: "LB-fake",
    name: "LB with a fake dependency",
    idea: "The paper example. Each store mentions the loaded register, but r ^ r ^ 1 is always 1. Is the dependency real?",
    threads: [["r0 = y", "x = r0 ^ r0 ^ 1"], ["r1 = x", "y = r1 ^ r1 ^ 1"]],
    outcome: "r0 = 1 and r1 = 1",
    events: [
      { id: "a", thread: 0, row: 1, label: "R y = 1" },
      { id: "b", thread: 0, row: 2, label: "W x = r0^r0^1" },
      { id: "c", thread: 1, row: 1, label: "R x = 1" },
      { id: "d", thread: 1, row: 2, label: "W y = r1^r1^1" },
    ],
    edges: [
      { from: "a", to: "b", rel: "po" },
      { from: "c", to: "d", rel: "po" },
      { from: "a", to: "b", rel: "fakedep" },
      { from: "c", to: "d", rel: "fakedep" },
      { from: "b", to: "c", rel: "rf" },
      { from: "d", to: "a", rel: "rf" },
    ],
    models: {
      SC: { verdict: "forbidden", why: "po and rf form a cycle, as in plain LB.", cycle: ["a>b", "b>c", "c>d", "d>a"] },
      TSO: { verdict: "forbidden", why: "Load-to-store order is kept, so po ∪ rf is cyclic.", cycle: ["a>b", "b>c", "c>d", "d>a"] },
      PSO: { verdict: "forbidden", why: "Same as TSO.", cycle: ["a>b", "b>c", "c>d", "d>a"] },
      RA: { verdict: "allowed", why: "As in plain LB, the release/acquire coherence axiom does not see a cycle through plain reads-from." },
      WEAKEST: {
        verdict: "allowed",
        why: "The Z3 constancy oracle shows each stored value is 1 whatever the load returns, so both edges are classified fake and left out of sdep. acyclic(sdep ∪ rf) has nothing to reject.",
      },
      RC11: { verdict: "forbidden", why: "RC11 forbids every po ∪ rf cycle, real dependency or not.", cycle: ["a>b", "b>c", "c>d", "d>a"] },
    },
    source: "LbProbe, corrected-v1 build, 14 Nov 2026",
    toolLine: "LB-fake-xor-cycle   SC=F TSO=F PSO=F RA=A WEAKEST=A RC11=F | edges DATA:fake DATA:fake",
  },
  {
    id: "LB-real",
    name: "LB with a real dependency",
    idea: "Same shape, but each store writes r + 1. Now the stored value genuinely depends on the load.",
    threads: [["r0 = y", "x = r0 + 1"], ["r1 = x", "y = r1 + 1"]],
    outcome: "r0 = 1 and r1 = 1",
    events: [
      { id: "a", thread: 0, row: 1, label: "R y = 1" },
      { id: "b", thread: 0, row: 2, label: "W x = r0 + 1" },
      { id: "c", thread: 1, row: 1, label: "R x = 1" },
      { id: "d", thread: 1, row: 2, label: "W y = r1 + 1" },
    ],
    edges: [
      { from: "a", to: "b", rel: "po" },
      { from: "c", to: "d", rel: "po" },
      { from: "a", to: "b", rel: "dep" },
      { from: "c", to: "d", rel: "dep" },
      { from: "b", to: "c", rel: "rf" },
      { from: "d", to: "a", rel: "rf" },
    ],
    models: {
      SC: { verdict: "forbidden", why: "No candidate execution even exists: reading 1 makes the store write 2, so the other thread can never read 1. The tool reports the outcome unreachable before any model is applied." },
      TSO: { verdict: "forbidden", why: "Unreachable before any model applies." },
      PSO: { verdict: "forbidden", why: "Unreachable before any model applies." },
      RA: { verdict: "forbidden", why: "Unreachable before any model applies." },
      WEAKEST: {
        verdict: "forbidden",
        why: "Unreachable here. The point of the pair is the edge classification: both data edges are semantic, so if a matching candidate existed they would sit in sdep and close a cycle with rf.",
        cycle: ["a>b:dep", "b>c", "c>d:dep", "d>a"],
      },
      RC11: { verdict: "forbidden", why: "Unreachable before any model applies." },
    },
    source: "LbProbe, corrected-v1 build, 14 Nov 2026",
    toolLine: "LB-real   WF-only=UNREACHABLE  SC=F TSO=F PSO=F RA=F WEAKEST=F RC11=F | edges DATA:semantic DATA:semantic",
  },
];
