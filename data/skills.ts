import type { SkillCategory } from "@/types";

/**
 * Skills grouped by category. The Skills section consumes this exclusively —
 * add or reorder categories/skills here, never in the component.
 */
export const skills: SkillCategory[] = [
  {
    title: "LLM Infrastructure",
    skills: [
      "PyTorch",
      "CUDA",
      "Triton",
      "Continuous Batching",
      "Paged Attention",
      "Speculative Decoding",
      "KV Cache",
      "Contextual Bandits",
      "Online Learning",
      "HuggingFace",
    ],
  },
  {
    title: "Languages",
    skills: ["Python", "Java", "TypeScript", "JavaScript", "SQL", "C/C++"],
  },
  {
    title: "Backend and Distributed",
    skills: [
      "FastAPI",
      "Spring Boot",
      "RESTful APIs",
      "WebSocket",
      "Microservices",
      "Kafka",
      "Resilience4j",
      "Eureka",
    ],
  },
  {
    title: "Infra and Observability",
    skills: [
      "Docker",
      "GitHub Actions CI/CD",
      "Prometheus",
      "Grafana",
      "Redis",
      "PostgreSQL",
      "k6",
      "Zipkin",
    ],
  },
  {
    title: "Concurrency and Formal Methods",
    skills: [
      "Weak Memory Models (C11/C++11, ARM, POWER)",
      "Happens Before",
      "Race Condition Analysis",
      "Graph Algorithms",
      "Async I/O",
    ],
  },
];
