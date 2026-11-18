// Education and experience timeline. Dates checked against the CV, the
// internship certificate and the official transcript.

export interface JourneyItem {
  period: string;
  title: string;
  place: string;
  kind: "Education" | "Experience" | "Research" | "Milestone";
  body: string;
  points?: string[];
}

export const journey: JourneyItem[] = [
  {
    period: "Until Jul 2023",
    title: "BTech, Computer Science",
    place: "College of Engineering Muttathara, Kerala",
    kind: "Education",
    body: "Undergraduate computer science: data structures, operating systems, networks and databases.",
  },
  {
    period: "Dec 2023 to Aug 2024",
    title: "Research Software Engineer Intern, Retrieval and RAG",
    place: "Kompetenzen Technologies, Thiruvananthapuram",
    kind: "Experience",
    body: "Part of a five-person research team building document intelligence and retrieval systems.",
    points: [
      "Hybrid retrieval with BM25, dense embeddings and cross-encoder reranking. nDCG@10 went from 0.58 to 0.68 on 500 held-out queries.",
      "Citation mapping and evidence-based abstention cut unsupported claims from 18% to 9% at 80% answer coverage.",
      "Bounded candidate sets, batched reranking and async handling took p95 retrieval latency from 1.2 s to 0.8 s at 20 users.",
      "Checkpointed, transactional ingestion with content-hash deduplication: zero duplicate records across 100 injected-failure tests.",
    ],
  },
  {
    period: "Awarded Jun 2026",
    title: "MSc Software Engineering",
    place: "Heriot-Watt University, Edinburgh",
    kind: "Education",
    body: "Machine Learning, Concurrent Systems, Formal Methods, Distributed Computing, Rigorous Methods, Industrial Programming and 3D Graphics. Dissertation graded Exceptional, 78/100.",
  },
  {
    period: "Jan 2026 to present",
    title: "Independent systems research",
    place: "Edinburgh",
    kind: "Research",
    body: "Mini-vLLM and CARL on the inference side; WEV-SMT and two dependency-summary papers on the verification side. Three manuscripts under review.",
  },
];
