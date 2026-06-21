import type { ResearchItem } from "@/types";

/**
 * Research & Formal Methods outputs. This is the strongest differentiator and
 * is rendered as a dedicated section, visually distinct from Projects.
 */
export const research: ResearchItem[] = [
  {
    id: "wev-smt",
    title: "WEV-SMT: Weak Memory Consistency Checker",
    subtitle: "Independent MSc dissertation supervised by Dr. Marko Doko",
    description:
      "Developed a full SMT-based consistency checker for weak memory models (SC, TSO, PSO, RA, WEAKEST), validated against 12,324 litmus tests. Core contribution is the semantic-dependency subrelation sdep ⊆ dep and jfCoherence condition enabling decidable per-execution thin-air detection. Prepared for POPL 2027 submission.",
    badges: ["12,324 litmus tests", "POPL 2027 submission", "Z3-based verification"],
    tech: ["Java", "JavaFX", "Z3", "Formal Methods", "Docker"],
    // TODO: add paperUrl once the POPL 2027 preprint is public.
  },
];
