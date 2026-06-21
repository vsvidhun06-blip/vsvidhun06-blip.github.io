import type { Project } from "@/types";

/**
 * Featured projects. Order is deliberate — it tells a story from LLM systems,
 * to research, to production engineering. Do not reorder without intent.
 */
export const projects: Project[] = [
  {
    id: "mini-vllm",
    title: "Mini-vLLM",
    tagline: "From-scratch LLM Inference Engine",
    description:
      "A from-scratch LLM inference engine on TinyLlama-1.1B. Custom Triton GPU kernels (fused RoPE, Flash Attention 2, W8A8 INT8 quantization, CUDA graph decode), disaggregated prefill/decode architecture, SLA-aware priority scheduling, radix tree prefix caching, multi-LoRA serving, and CARL, a contextual bandit controller jointly optimising batching, speculation, routing, and eviction across non-stationary workloads.",
    metrics: ["7.4x RoPE speedup", "71.5% cost reduction", "166 tests passing"],
    tech: ["Python", "PyTorch", "CUDA", "Triton", "FastAPI", "Prometheus", "Grafana", "Docker"],
    github: "https://github.com/vsvidhun06-blip/mini-vllm",
  },
  {
    id: "wev-smt",
    title: "WEV-SMT",
    tagline: "Weak Memory Consistency Checker",
    description:
      "A Java tool stepping through concurrent executions with live happens-before graph rendering, extended into a full SMT-based consistency checker using Z3.",
    metrics: ["12,324 litmus tests", "POPL 2027 submission", "Z3-based verification"],
    tech: ["Java", "JavaFX", "Z3", "Formal Methods", "Docker"],
    // TODO: replace with the real WEV-SMT repository URL once published.
    github: "https://github.com/vsvidhun06-blip",
  },
  {
    id: "ecommerce-microservices",
    title: "Cloud-Native E-Commerce Microservices Platform",
    tagline: "Event-driven Saga architecture",
    description:
      "An event-driven backend across seven Spring Boot microservices using a choreography-based Saga pattern over Kafka for eventual consistency. Layered resilience with Resilience4j bulkheads, retries, and circuit breakers.",
    metrics: ["Around 100% cache hit rate", "214 req/s", "2.39ms P99 latency"],
    tech: [
      "Java",
      "Spring Boot",
      "Kafka",
      "Docker Compose",
      "PostgreSQL",
      "Redis",
      "Resilience4j",
      "Zipkin",
    ],
    github: "https://github.com/vsvidhun06-blip/ecommerce-microservices",
  },
];
