import type { ExperienceItem } from "@/types";

/** Professional experience. Each achievement carries a metric badge. */
export const experience: ExperienceItem[] = [
  {
    id: "kompetenzen-2023",
    role: "Full-Stack Software Engineer Intern",
    company: "Kompetenzen Technologies",
    dates: "Dec 2023 to Aug 2024",
    achievements: [
      {
        metric: "30% P95 latency reduction",
        description:
          "performance profiling, thread pool tuning, and executor optimisation across a distributed Java/React platform",
      },
      {
        metric: "25% throughput increase",
        description:
          "connection-level optimisations and async patterns, load-tested with k6 under sustained traffic",
      },
      {
        metric: "95% fewer session failures",
        description:
          "redesigned Spring Boot session management with idempotent request handling and exponential backoff",
      },
      {
        metric: "99%+ uptime",
        description: "restored through the above reliability work",
      },
    ],
  },
];
