// The full project inventory. Featured projects have a case study route; the
// rest appear in the archive. Each summary was written from the repository,
// report or source code named in `source`. Add a project by appending here.

export const categories = [
  "AI Infrastructure",
  "Distributed Systems",
  "Backend Engineering",
  "Formal Methods",
  "Graphics",
  "Applications",
  "Coursework",
] as const;
export type Category = (typeof categories)[number];

export type ProjectKind =
  | "Research"
  | "Personal project"
  | "MSc dissertation"
  | "Coursework"
  | "Group coursework";

export type Link = { label: string; href: string };

export interface Project {
  slug: string;
  title: string;
  /** One line, shown in lists. */
  line: string;
  /** Short paragraph for cards and the archive. */
  summary: string;
  period: string;
  year: number;
  kind: ProjectKind;
  categories: Category[];
  tech: string[];
  highlights: string[];
  links: Link[];
  caseStudy?: string;
  featured?: "primary" | "secondary";
  /** Where the description was verified. Shown in the archive detail. */
  source: string;
}

export const projects: Project[] = [
  {
    slug: "mini-vllm-carl",
    title: "Mini-vLLM and CARL",
    line: "A from-scratch LLM inference engine and an online controller that tunes it",
    summary:
      "An educational reimplementation of vLLM's core ideas around TinyLlama-1.1B: continuous batching, a paged KV cache, radix-tree prefix caching, chunked prefill, speculative decoding and Prometheus metrics, with Hugging Face parity tests at every layer. CARL is a contextual-bandit controller that reconfigures the engine at run time, evaluated against offline-tuned static configurations on a Tesla T4.",
    period: "Jan 2026 to present",
    year: 2026,
    kind: "Research",
    categories: ["AI Infrastructure"],
    tech: ["Python", "PyTorch", "Triton", "CUDA Graphs", "FastAPI", "LinUCB", "Prometheus", "Grafana", "Docker"],
    highlights: [
      "1.83x aggregate throughput from continuous batching on an RTX 4060 Laptop GPU (44.6 vs 24.4 tok/s)",
      "Manuscript under review at MLSys 2027",
      "About 830 tests, including HF parity at atol 1e-4",
    ],
    links: [
      { label: "Source", href: "https://github.com/vsvidhun06-blip/mini-vllm" },
    ],
    caseStudy: "/work/mini-vllm-carl/",
    featured: "primary",
    source: "github.com/vsvidhun06-blip/mini-vllm README, docs/benchmarks, docs/paper/CLAIM_LEDGER.md, submitted manuscript",
  },
  {
    slug: "wev-smt",
    title: "WEV-SMT",
    line: "An SMT-based checker for weak memory models that separates real dependencies from fake ones",
    summary:
      "Reads a litmus test, builds candidate executions and encodes consistency for SC, TSO, PSO, RA, WEAKEST and RC11 as SMT queries solved by Z3 through JavaSMT. A 32-bit bitvector constancy oracle decides whether a store really depends on a load, so r + 1 and r ^ r ^ 1 get different verdicts. The core results are machine-checked in Isabelle/HOL.",
    period: "Jan 2026 to Nov 2026",
    year: 2026,
    kind: "Research",
    categories: ["Formal Methods"],
    tech: ["Java 21", "JavaSMT", "Z3", "Isabelle/HOL", "herd7", "Dat3M", "Python", "JUnit 5"],
    highlights: [
      "Two manuscripts under review: TACAS 2027 and FSEN 2027",
      "Four Isabelle/HOL sessions build with no sorry and no oracles",
      "Six-model atlas: 190 of 190 cells match expected verdicts",
    ],
    links: [{ label: "Source", href: "https://github.com/vsvidhun06-blip/WEV-SMT" }],
    caseStudy: "/work/wev-smt/",
    featured: "primary",
    source: "github.com/vsvidhun06-blip/WEV-SMT README (14 Nov 2026), TACAS #4549 and FSEN #41 manuscripts",
  },
  {
    slug: "ecommerce-microservices",
    title: "Event-driven e-commerce backend",
    line: "Seven Spring Boot services, a choreographed saga over Kafka, and measured resilience behaviour",
    summary:
      "An order and inventory saga over Kafka with compensation, Resilience4j bulkhead, retry and circuit breaker around product lookups, a dead-letter path for poison messages, Redis cache-aside reads, Redis token-bucket rate limiting at the gateway, Eureka discovery and Zipkin tracing. Load-tested with k6 and documented with the bugs found along the way.",
    period: "Feb 2026 to Jun 2026",
    year: 2026,
    kind: "Personal project",
    categories: ["Distributed Systems", "Backend Engineering"],
    tech: ["Java 17", "Spring Boot 3.2", "Kafka", "PostgreSQL", "Redis", "Resilience4j", "Eureka", "Zipkin", "Docker Compose", "k6"],
    highlights: [
      "Saga drives orders to CONFIRMED end to end",
      "Circuit breaker trip forced and observed: 25 calls fast-failed",
      "p99 2.39 ms on cached product reads at 200 virtual users",
    ],
    links: [{ label: "Source", href: "https://github.com/vsvidhun06-blip/eCOMMERCE-MICROSERVICES" }],
    caseStudy: "/work/ecommerce-microservices/",
    featured: "secondary",
    source: "Repository docs/ARCHITECTURE.md and docs/BENCHMARKS.md (run log 13 Jun 2026)",
  },
  {
    slug: "intersection-verification",
    title: "Verified autonomous intersection",
    line: "Two controllers, three vehicle types and six LTL properties, model checked in SPIN",
    summary:
      "A Promela model of an intersection where autonomous vehicles request movement permissions from two controllers over bounded channels. A safety monitor process checks assertions, and SPIN verifies three LTL safety properties and three liveness properties under weak fairness. The report also walks through a lost-update race and two ways to remove it.",
    period: "Nov 2025 to Dec 2025",
    year: 2025,
    kind: "Coursework",
    categories: ["Formal Methods", "Coursework"],
    tech: ["Promela", "SPIN", "LTL"],
    highlights: [
      "Six LTL properties and a monitor process, all verified with zero errors",
      "Race condition analysis with atomic sections and channel-based fixes",
    ],
    links: [],
    caseStudy: "/work/intersection-verification/",
    featured: "secondary",
    source: "Suja-H00490424-F21RS.pml (407 lines) and the F21RS CW2 report, Dec 2025",
  },
  {
    slug: "webgpu-diorama",
    title: "Winter cabin diorama in WebGPU",
    line: "A real-time scene with WGSL Phong shading, an OBJ loader and simple physics",
    summary:
      "The interactive part of a group 3D graphics coursework. Geometry is parsed from OBJ files, shaded per fragment with ambient, diffuse and specular terms in WGSL, and explored with a free camera. Buttons trigger a gravity freefall, a floating bob, a shake and continuous rotation, over a 2D snowfall layer with wind.",
    period: "Oct 2025 to Nov 2025",
    year: 2025,
    kind: "Group coursework",
    categories: ["Graphics", "Coursework"],
    tech: ["WebGPU", "WGSL", "JavaScript", "wgpu-matrix", "Blender"],
    highlights: [
      "Phong lighting written in WGSL",
      "Freefall integrates velocity under a constant gravity term",
      "Runs live in the browser on WebGPU hardware",
    ],
    links: [{ label: "Run the build", href: "/demos/winter-cabin/" }],
    caseStudy: "/work/webgpu-diorama/",
    featured: "secondary",
    source: "WinterCabinDiorama.html, ObjLoadAndParse.js and WGSL shaders, 26 Nov 2025 build",
  },
  {
    slug: "weakest-visualiser",
    title: "WEAKEST Execution Visualiser",
    line: "MSc dissertation: a JavaFX tool for stepping through concurrent executions",
    summary:
      "A desktop application for building event structures one step at a time and watching program order, reads-from, coherence and synchronises-with edges appear. It has a 16-test litmus library, a five-model comparison view, a branch explorer, a learning companion and a quiz mode. A nine-person user study rated graph clarity 4.56 out of 5. Its model classes later became the event-structure library underneath WEV-SMT.",
    period: "Submitted Apr 2026",
    year: 2026,
    kind: "MSc dissertation",
    categories: ["Formal Methods", "Applications"],
    tech: ["Java 21", "JavaFX", "GraphStream", "Maven"],
    highlights: [
      "Dissertation graded Exceptional, 78/100",
      "Supervised by Dr Marko Doko",
      "Known checker limitations are documented in the repository",
    ],
    links: [{ label: "Source", href: "https://github.com/vsvidhun06-blip/WEV-SMT" }],
    source: "Dissertation_Report_H00490424.pdf (Apr 2026), WEV-SMT README",
  },
  {
    slug: "stall-prevention-spark",
    title: "Stall prevention system in SPARK",
    line: "High-integrity Ada for an aircraft angle-of-attack monitor",
    summary:
      "SPARK Ada packages for a stall prevention system: majority voting over three angle-of-attack sensors, alarm logic and autonomous tailplane control, with Global, Depends, Pre and Post contracts. I treated an undefined sensor reading as a reason to stand down rather than act. Toolchain problems stopped GNATprove from completing, so the contracts were checked by testing and review, and the report says so.",
    period: "Sep 2025 to Oct 2025",
    year: 2025,
    kind: "Coursework",
    categories: ["Formal Methods", "Coursework"],
    tech: ["SPARK", "Ada", "GNAT"],
    highlights: [
      "Contracts on every sensor and control procedure",
      "Fail-safe handling of undefined readings",
    ],
    links: [],
    source: "F21RS_SPS sources (aoa, hsu, pcu, spu) and the CW1 report, Oct 2025",
  },
  {
    slug: "document-tracker",
    title: "Document Tracker analytics",
    line: "Views by country, reader profiles and an also-likes graph over Issuu logs",
    summary:
      "A pair project in Python that parses large Issuu event logs and answers questions about them: views by country and continent, browser histograms, top readers, and an also-likes recommendation graph rendered with Graphviz. It runs from the command line or through a Tkinter interface, with unit tests.",
    period: "Nov 2025",
    year: 2025,
    kind: "Coursework",
    categories: ["Applications", "Coursework"],
    tech: ["Python", "Tkinter", "matplotlib", "Graphviz"],
    highlights: ["Built with Abhinav Sreenivas", "CLI and GUI over the same analysis core"],
    links: [{ label: "Source", href: "https://github.com/vsvidhun06-blip/Document-Tracker" }],
    source: "github.com/vsvidhun06-blip/Document-Tracker README",
  },
  {
    slug: "csharp-browser",
    title: "Simple web browser in C#",
    line: "Raw HTTP, history, bookmarks and a homepage in Windows Forms",
    summary:
      "A Windows Forms application on .NET 8 that sends HTTP requests, shows status codes, page titles and raw HTML, and keeps history, bookmarks and a homepage across sessions. History ignores consecutive duplicates and a quick-links panel lists the first five links on each page. Persistence uses local files; a SQLite layer was started but not finished.",
    period: "Oct 2025",
    year: 2025,
    kind: "Coursework",
    categories: ["Applications", "Coursework"],
    tech: ["C#", ".NET 8", "Windows Forms"],
    highlights: ["Full bookmark CRUD", "Back and forward navigation over history"],
    links: [],
    source: "WebBrowserCW1 solution and the F21SC CW1 report, Oct 2025",
  },
  {
    slug: "ai-resume-analyzer",
    title: "AI resume analyser",
    line: "FastAPI and React app that scores a CV and checks it against a job description",
    summary:
      "Upload a PDF or DOCX and the backend extracts text, flags ATS formatting problems and asks a language model for structured feedback: scores, strengths, weaknesses and concrete suggestions, plus a match against a pasted job description. JWT accounts, async SQLAlchemy and rate limiting on the API.",
    period: "Feb 2026",
    year: 2026,
    kind: "Personal project",
    categories: ["Applications", "Backend Engineering"],
    tech: ["Python", "FastAPI", "SQLAlchemy", "React", "TypeScript", "Tailwind CSS", "OpenAI API", "Docker"],
    highlights: ["Deployed frontend on Vercel"],
    links: [
      { label: "Source", href: "https://github.com/vsvidhun06-blip/ai-resume-analyzer" },
      { label: "Live", href: "https://ai-resume-analyzer-eight-xi.vercel.app" },
    ],
    source: "github.com/vsvidhun06-blip/ai-resume-analyzer (backend services, requirements)",
  },
];

export const featured = projects.filter((p) => p.featured);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
