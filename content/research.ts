// Publications and research outputs. Status values are deliberately literal:
// nothing here is accepted or published. Update `status` when a decision arrives.

export type PubStatus = "Under review" | "Submitted" | "Dissertation" | "Accepted" | "Published" | "Preprint";

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  status: PubStatus;
  date: string;
  summary: string;
  project: string;
  links: { label: string; href: string }[];
}

export const publications: Publication[] = [
  {
    id: "carl-mlsys27",
    title:
      "CARL: Comparing an Online Contextual-Bandit Reconfiguration System with Offline-Tuned Static Configurations of an LLM Serving Engine",
    authors: "V. Vijayakumar Suja",
    venue: "MLSys 2027",
    status: "Under review",
    date: "Oct 2026",
    summary:
      "A paired comparison over ten seeds on a Tesla T4. At a saturated burst point the controller beat a non-learning rule by 3.76 tok/s but stayed below static configurations chosen offline for the same objective. At a sub-critical Poisson load it trailed both on end-of-run utility, and no run met the convergence diagnostic.",
    project: "mini-vllm-carl",
    links: [{ label: "Code", href: "https://github.com/vsvidhun06-blip/mini-vllm" }],
  },
  {
    id: "tacas27",
    title: "The Limits of Instruction-Local Dependency Summaries, with an Application to Thin-Air Reads",
    authors: "V. Vijayakumar Suja, M. Doko",
    venue: "TACAS 2027, submission #4549",
    status: "Under review",
    date: "Oct 2026",
    summary:
      "Proves in Isabelle/HOL that no Boolean depends-or-not summary restricted to an instruction's read registers stays exact under composition, and that composed expression labels do. With an exact per-instruction SMT oracle, the prototype's closure catches all 66 single-instruction fake dependencies but none of the 72 written as chains, while keeping all 171 real ones.",
    project: "wev-smt",
    links: [{ label: "Code", href: "https://github.com/vsvidhun06-blip/WEV-SMT" }],
  },
  {
    id: "fsen27",
    title: "The Limits of Read-Restricted Dependency Summaries",
    authors: "V. Vijayakumar Suja",
    venue: "FSEN 2027, submission 41",
    status: "Under review",
    date: "Nov 2026",
    summary:
      "Characterises what an exact instruction-local summary must keep and when Cousot's composition is already exact. The empirical side is negative and reported as such: across 2,250 litmus tests and eight upstream concurrency code bases, no composed cancellation appeared in a store's data dependencies.",
    project: "wev-smt",
    links: [
      { label: "Code and paper", href: "https://github.com/vsvidhun06-blip/WEV-SMT/tree/main/fsen2027-41" },
    ],
  },
  {
    id: "msc-dissertation",
    title: "Visualising WEAKEST Executions",
    authors: "V. Vijayakumar Suja, supervised by Dr M. Doko",
    venue: "MSc dissertation, Heriot-Watt University",
    status: "Dissertation",
    date: "Apr 2026",
    summary:
      "Design, implementation and evaluation of an interactive JavaFX tool for exploring executions under the WEAKEST memory model, including a user study with nine participants. Graded Exceptional (78/100).",
    project: "weakest-visualiser",
    links: [{ label: "Code", href: "https://github.com/vsvidhun06-blip/WEV-SMT" }],
  },
];

/** Research journey for the timeline. Months come from file and commit dates. */
export const researchTimeline = [
  { date: "Oct 2025", title: "Ethics approval and project proposal", body: "Proposed an interactive tool for exploring executions of concurrent programs and applied for ethics approval for a user study." },
  { date: "Apr 2026", title: "Dissertation submitted", body: "WEAKEST Execution Visualiser, with a five-model comparison view and a nine-person user study." },
  { date: "May 2026", title: "Mini-vLLM engine work begins in earnest", body: "Continuous batching, paged KV cache and HF parity tests, then prefix caching, chunked prefill and metrics." },
  { date: "Aug 2026", title: "WEV-SMT reaches real corpora", body: "Litmus parser for five architectures, validation over herd7 and Dat3M tests, fence and RMW encoding." },
  { date: "Sep 2026", title: "CARL audit and repair", body: "A claim ledger retracted results the repository's own artifacts contradicted. The controller and reward were repaired and re-run on a T4." },
  { date: "Oct 2026", title: "Two submissions", body: "TACAS 2027 on dependency summaries, and MLSys 2027 on CARL, each with three-campaign provenance and stated scope." },
  { date: "Nov 2026", title: "FSEN 2027 submission", body: "Read-restricted dependency summaries, with a negative result from real code reported alongside the theorems." },
] as const;
