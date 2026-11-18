// Skills grouped by engineering area. Each skill lists the project slugs that
// actually use it, so the explorer can show evidence instead of a badge wall.

export interface Skill {
  name: string;
  projects: string[];
  /** Evidence when no public project demonstrates the skill. */
  note?: string;
}

export interface SkillArea {
  id: string;
  title: string;
  blurb: string;
  skills: Skill[];
}

export const skillAreas: SkillArea[] = [
  {
    id: "inference",
    title: "AI systems and inference",
    blurb: "How a serving engine decides what runs on the GPU next, and how to tell whether a change helped.",
    skills: [
      { name: "Continuous batching", projects: ["mini-vllm-carl"] },
      { name: "Paged KV cache", projects: ["mini-vllm-carl"] },
      { name: "Radix-tree prefix caching", projects: ["mini-vllm-carl"] },
      { name: "Chunked prefill", projects: ["mini-vllm-carl"] },
      { name: "Speculative decoding", projects: ["mini-vllm-carl"] },
      { name: "Contextual bandits (LinUCB)", projects: ["mini-vllm-carl"] },
      { name: "Hybrid retrieval and reranking", projects: [], note: "Kompetenzen internship" },
      { name: "LLM application backends", projects: ["ai-resume-analyzer"] },
    ],
  },
  {
    id: "gpu",
    title: "GPU and performance engineering",
    blurb: "Measuring before optimising, and keeping numerical parity while doing it.",
    skills: [
      { name: "PyTorch", projects: ["mini-vllm-carl"] },
      { name: "Triton kernels", projects: ["mini-vllm-carl"] },
      { name: "CUDA Graphs", projects: ["mini-vllm-carl"] },
      { name: "CUDA-event benchmarking", projects: ["mini-vllm-carl"] },
      { name: "Load testing (k6, Locust)", projects: ["ecommerce-microservices"], note: "Locust at Kompetenzen" },
      { name: "WebGPU and WGSL", projects: ["webgpu-diorama"] },
    ],
  },
  {
    id: "backend",
    title: "Backend and distributed systems",
    blurb: "Services that fail in known ways, recover, and leave traces of what happened.",
    skills: [
      { name: "Spring Boot", projects: ["ecommerce-microservices"] },
      { name: "Kafka and sagas", projects: ["ecommerce-microservices"] },
      { name: "Resilience4j", projects: ["ecommerce-microservices"] },
      { name: "Redis", projects: ["ecommerce-microservices"] },
      { name: "PostgreSQL", projects: ["ecommerce-microservices", "ai-resume-analyzer"] },
      { name: "FastAPI", projects: ["mini-vllm-carl", "ai-resume-analyzer"] },
      { name: "Prometheus and Grafana", projects: ["mini-vllm-carl"] },
      { name: "Zipkin tracing", projects: ["ecommerce-microservices"] },
      { name: "Docker", projects: ["mini-vllm-carl", "ecommerce-microservices", "ai-resume-analyzer"] },
    ],
  },
  {
    id: "formal",
    title: "Formal verification and research",
    blurb: "Saying exactly what is proved, what is tested, and what is only believed.",
    skills: [
      { name: "Weak memory models", projects: ["wev-smt", "weakest-visualiser"] },
      { name: "SMT (Z3, JavaSMT)", projects: ["wev-smt"] },
      { name: "Isabelle/HOL", projects: ["wev-smt"] },
      { name: "SPIN and LTL", projects: ["intersection-verification"] },
      { name: "SPARK Ada contracts", projects: ["stall-prevention-spark"] },
      { name: "Pre-registered evaluation", projects: ["mini-vllm-carl"] },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    blurb: "Chosen for the job: Python for ML systems, Java for verification tools and services.",
    skills: [
      { name: "Python", projects: ["mini-vllm-carl", "document-tracker", "ai-resume-analyzer"] },
      { name: "Java", projects: ["wev-smt", "weakest-visualiser", "ecommerce-microservices"] },
      { name: "TypeScript", projects: ["ai-resume-analyzer"] },
      { name: "C and C++", projects: [], note: "Coursework and CV; no public repository yet" },
      { name: "C#", projects: ["csharp-browser"] },
      { name: "SQL", projects: ["ecommerce-microservices", "ai-resume-analyzer"] },
      { name: "Ada", projects: ["stall-prevention-spark"] },
    ],
  },
  {
    id: "tooling",
    title: "Cloud and developer infrastructure",
    blurb: "Reproducible runs: pinned environments, hashed artifacts and CI that fails loudly.",
    skills: [
      { name: "Docker Compose", projects: ["mini-vllm-carl", "ecommerce-microservices"] },
      { name: "GitHub Actions", projects: [], note: "Builds and deploys this site" },
      { name: "Maven", projects: ["wev-smt", "ecommerce-microservices"] },
      { name: "Google Colab GPU runs with checkpointing", projects: ["mini-vllm-carl"] },
      { name: "SHA-256 artifact provenance", projects: ["mini-vllm-carl", "wev-smt"] },
    ],
  },
];
