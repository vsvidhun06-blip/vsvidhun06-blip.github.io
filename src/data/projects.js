/**
 * Project data. Add new projects to the `projects` array.
 * The first item is featured (large card). Rest render as a grid.
 *
 * Required fields:
 *   id, title, subtitle, period, description, tags, stack
 *
 * Optional fields:
 *   metrics: [{value, label}]  — large numeric highlights
 *   highlights: [string]       — bulleted achievements
 *   github: URL                — external GitHub link
 *   live: URL                  — live demo link
 *   supervisor: string         — for academic projects
 *   image: path                — hero image (placed in public/)
 *   featured: true             — promotes to featured card slot
 */

export const projects = [
  {
    id: 'mini-vllm',
    featured: true,
    title: 'Mini-vLLM',
    subtitle: 'From-scratch LLM inference engine',
    period: 'Apr 2026 — May 2026',
    category: 'LLM infrastructure',
    description:
      "An educational, from-scratch reimplementation of vLLM's core ideas on TinyLlama-1.1B. Continuous batching, paged attention, prefix caching, GPU acceleration, speculative decoding, live visualiser — built to understand modern LLM serving from the ground up.",
    metrics: [
      { value: '3.27×', label: 'cpu scheduler throughput', sub: '4 concurrent requests' },
      { value: '1.95×', label: 'gpu batched vs solo', sub: 'rtx 4060' },
      { value: '2.0×', label: 'prefill speedup', sub: '63.2% hit rate' },
      { value: '37.5%', label: 'spec decode acceptance', sub: 'k=2, exit_layer=18' },
    ],
    highlights: [
      'Built vLLM-pattern continuous batching scheduler with paged KV cache (block_size=16, layer-major K/V split, admission control) for TinyLlama-1.1B',
      'Reference-counted prefix cache with chained position-aware block hashing — 2.0× prefill speedup, 63.2% hit rate on shared-prefix workloads',
      'Extended scheduler with speculative decoding; characterised acceptance/speedup tradeoff across (K, exit_layer) configs and designed pluggable draft interface for trained-head extensions (EAGLE/Medusa)',
      'Verified byte-identical correctness against HuggingFace reference via parity tests at every engine layer — 23+ tests passing',
      'Live D3 WebSocket visualiser exposing scheduler state machine and per-request KV block ownership in real time',
      'Prometheus /metrics endpoint with TTFT/TPOT/p50-p95-p99 latency histograms',
    ],
    tags: [
      'continuous batching',
      'paged kv cache',
      'prefix caching',
      'gpu acceleration',
      'speculative decoding',
      'sse streaming',
      'prometheus metrics',
      'live websocket visualiser',
      'byte-identical hf parity',
    ],
    stack: 'python · pytorch · cuda · fastapi · websocket · prometheus · d3.js · pytest',
    github: 'https://github.com/vsvidhun06-blip/mini-vllm',
  },

  {
    id: 'wev',
    title: 'WEAKEST Execution Visualiser',
    subtitle: 'MSc Dissertation — Interactive concurrency exploration',
    period: 'Sep 2025 — Apr 2026',
    category: 'concurrency · formal methods',
    description:
      'Interactive Java 21/JavaFX tool for stepping through concurrent program executions under five memory models. Visualises memory operations as live graph nodes with happens-before edges updating in real time as each execution choice is made.',
    highlights: [
      'Closes a gap left by herd7 and CDSChecker — guides step-by-step construction of each execution rather than enumerating all outcomes, making it easier to reason about ARM/POWER weak memory behaviours',
      'Validated correctness across 80/80 model-test combinations covering SC, TSO, PSO, RA, WEAKEST memory models',
      'Structured user study (n=9) measuring time-to-understanding for advanced concurrency concepts',
    ],
    tags: [
      'java 21',
      'javafx',
      'weak memory models',
      'arm/power',
      'formal methods',
      'graph algorithms',
    ],
    stack: 'java 21 · javafx · graph algorithms · c11/c++11 memory models',
    supervisor: 'Prof. Marko Doko, Heriot-Watt University',
  },

  {
    id: 'ecommerce',
    title: 'Cloud-Native E-Commerce Microservices',
    subtitle: 'Distributed systems platform',
    period: 'Dec 2025 — Feb 2026',
    category: 'distributed systems · backend',
    description:
      'Distributed e-commerce backend across independently deployable Spring Boot microservices orchestrated with Docker Compose. Kafka event streaming, Eureka service discovery, Resilience4j circuit breakers, and tuned thread pools for consistent throughput.',
    highlights: [
      'Independently deployable Spring Boot microservices with Kafka event streaming and Eureka service discovery',
      'Redis caching layer reducing backend database load on hot paths',
      'Collaborative filtering recommendation engine over user-item interaction data',
      'Automated build, test, and image publishing pipeline via GitHub Actions',
    ],
    tags: [
      'spring boot',
      'kafka',
      'eureka',
      'resilience4j',
      'postgresql',
      'redis',
      'docker compose',
      'github actions',
    ],
    stack: 'java · spring boot · kafka · docker compose · postgresql · redis · eureka · resilience4j',
    github: 'https://github.com/vsvidhun06-blip/ecommerce-microservices',
  },

  // ===========================================================================
  // EARLIER WORK — compact cards, MSc coursework + B.Tech project
  // ===========================================================================

  {
    id: 'c-sharp-browser',
    secondary: true,
    title: 'C# Web Browser',
    period: 'MSc · 2025',
    category: 'full-stack',
    description:
      'Windows Forms web browser with HTTP GET/POST, SQLite persistence via Entity Framework Core, bookmark and history management, and multi-user authentication. Built for F21SC coursework.',
    tags: ['c#', '.net', 'windows forms', 'sqlite', 'ef core'],
  },

  {
    id: 'doc-tracker',
    secondary: true,
    title: 'Document Tracker Analysis',
    period: 'MSc · 2025',
    category: 'data analysis',
    description:
      'Python analytics system for issuu.com document engagement data. Implements seven analytical tasks including a collaborative filtering recommender, continent/country breakdowns, and reader-device visualisations with a Tkinter GUI.',
    tags: ['python', 'tkinter', 'pandas', 'matplotlib', 'collaborative filtering'],
  },

  {
    id: 'drowsiness',
    secondary: true,
    title: 'Driver Drowsiness Detection',
    period: 'B.Tech · 2023',
    category: 'computer vision',
    description:
      "Real-time computer-vision system that monitors the driver's eye aspect ratio (EAR) using dlib's 68-point facial landmarks and triggers an alert when drowsiness is detected. Final-year B.Tech project.",
    tags: ['python', 'opencv', 'dlib', 'imutils', 'numpy'],
  },
];

export const getFeaturedProject = () => projects.find((p) => p.featured);
export const getMainProjects = () =>
  projects.filter((p) => !p.featured && !p.secondary);
export const getSecondaryProjects = () =>
  projects.filter((p) => p.secondary);

// Kept for backwards compat with earlier import sites
export const getOtherProjects = getMainProjects;
