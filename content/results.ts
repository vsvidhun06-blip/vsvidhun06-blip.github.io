// Measured results used by the charts. Every number here is copied from a
// committed artifact; the `source` fields say which one. Nothing is simulated.

export const gpuBatching = {
  hardware: "RTX 4060 Laptop GPU, fp32, TinyLlama-1.1B-Chat",
  workload: "4 prompts, 32 tokens each (128 tokens total)",
  source: "mini-vllm docs/benchmarks/v0.2_gpu.txt",
  rows: [
    { label: "Sequential generate()", tps: 24.4, note: "baseline, 5.25 s" },
    { label: "Continuous batching, 64 KV blocks", tps: 44.6, note: "2.87 s, 31 steps, 1.83x" },
    { label: "Continuous batching, 6 KV blocks", tps: 33.3, note: "3.84 s, admission control queues requests, 1.37x" },
  ],
};

export const prefixCache = {
  hardware: "RTX 4060 Laptop GPU, fp32, TinyLlama-1.1B-Chat",
  workload: "4 requests sharing a 129-token system prompt, 16-token blocks",
  source: "mini-vllm docs/benchmarks/v0.2_prefix_cache.txt",
  hitRate: "24 of 38 prefill blocks (63.2%)",
  rows: [
    { id: "req-0", off: 63.4, on: 58.2, cached: "0/10" },
    { id: "req-1", off: 65.6, on: 31.3, cached: "8/10" },
    { id: "req-2", off: 58.3, on: 32.1, cached: "8/9" },
    { id: "req-3", off: 68.1, on: 26.6, cached: "8/9" },
  ],
};

/** Self-speculative (early-exit) decoding, single request, Tesla T4, seed 42. */
export const specBreakeven = {
  hardware: "Tesla T4, TinyLlama-1.1B-Chat, CUDA graphs off",
  source: "mini-vllm docs/eval/spec_breakeven_results.json",
  exitLayers: [4, 6, 8, 10, 12],
  ks: [1, 2, 4, 6, 8],
  // [exitLayer][k] = { acceptance, speedup, breakevenAlpha }
  grid: {
    4: [[0, 0.841, 0.189], [0, 0.729, 0.289], [0, 0.574, 0.435], [0, 0.476, 0.53], [0, 0.412, 0.592]],
    6: [[0, 0.79, 0.265], [0, 0.641, 0.401], [0, 0.493, 0.527], [0, 0.394, 0.62], [0, 0.331, 0.679]],
    8: [[0.0341, 0.773, 0.339], [0.0171, 0.621, 0.457], [0.0085, 0.443, 0.607], [0.0057, 0.35, 0.687], [0.0043, 0.289, 0.739]],
    10: [[0.0513, 0.737, 0.425], [0.0257, 0.568, 0.549], [0.0128, 0.394, 0.679], [0.0086, 0.307, 0.745], [0.0064, 0.251, 0.79]],
    12: [[0.0108, 0.67, 0.51], [0.0054, 0.498, 0.631], [0.0027, 0.345, 0.729], [0.0018, 0.26, 0.794], [0.0013, 0.214, 0.827]],
  } as Record<number, [number, number, number][]>,
};

export type Interval = {
  label: string;
  detail: string;
  mean: number;
  lo: number;
  hi: number;
};

/** Paired differences over seeds 42 to 51 (n = 10), 95% CI. */
export const carlSaturated = {
  setting: "Saturated burst, Tesla T4, TinyLlama-1.1B, fp16, 200 requests per run",
  source: "CLAIM_LEDGER.md section D (frozen) and the submitted manuscript",
  throughput: [
    { label: "Learning vs rule", detail: "CARL-Repaired minus RuleOnly", mean: 3.7633, lo: 3.2932, hi: 4.2335 },
    { label: "Controller vs best static", detail: "CARL-Repaired minus Static-Tput", mean: -3.3678, lo: -3.6633, hi: -3.0723 },
    { label: "Wider action space", detail: "CARL-Expanded minus CARL-Repaired", mean: -1.7956, lo: -2.2754, hi: -1.3158 },
  ] satisfies Interval[],
  utility: [
    { label: "Learning vs rule", detail: "CARL-Repaired minus RuleOnly", mean: 0.0363, lo: 0.0347, hi: 0.038 },
    { label: "Controller vs best static", detail: "CARL-Repaired minus Static-Utility", mean: -0.0245, lo: -0.0263, hi: -0.0227 },
    { label: "Wider action space", detail: "CARL-Expanded minus CARL-Repaired", mean: -0.0277, lo: -0.0295, hi: -0.026 },
  ] satisfies Interval[],
};

/** Campaign O of three sub-critical campaigns (S1, S2, O). Student-t 95% CI. */
export const carlSubcritical = {
  setting: "Open-loop Poisson arrivals at target load 0.40 (realised 0.38 to 0.46), Tesla T4",
  source: "CLAIM_LEDGER.md section E, campaign O",
  throughput: [
    { label: "Learning vs rule", detail: "CARL-Repaired minus RuleOnly", mean: -0.0325, lo: -0.0583, hi: -0.0066 },
    { label: "Controller vs best static", detail: "CARL-Repaired minus Static-Tput", mean: -0.0286, lo: -0.0459, hi: -0.0113 },
    { label: "Wider action space", detail: "CARL-Expanded minus CARL-Repaired", mean: 0.0031, lo: -0.0162, hi: 0.0224 },
  ] satisfies Interval[],
  utility: [
    { label: "Learning vs rule", detail: "CARL-Repaired minus RuleOnly", mean: -0.0196, lo: -0.0252, hi: -0.0139 },
    { label: "Controller vs best static", detail: "CARL-Repaired minus Static-Utility", mean: -0.14, lo: -0.159, hi: -0.12 },
    { label: "Wider action space", detail: "CARL-Expanded minus CARL-Repaired", mean: -0.0092, lo: -0.0171, hi: -0.0014 },
  ] satisfies Interval[],
};

/** Relative throughput range across the 28-configuration held-out grid. */
export const landscape = [
  { label: "Saturated burst", value: 53.15, note: "one campaign" },
  { label: "Sub-critical, S1", value: 0.39, note: "" },
  { label: "Sub-critical, S2", value: 0.75, note: "" },
  { label: "Sub-critical, O", value: 0.32, note: "" },
];

/** CARL control-step cost in isolation on CPU, 10,000 steps. */
export const controllerOverhead = {
  source: "mini-vllm docs/eval/overhead_results.json",
  meanUs: 79,
  p99Us: 102,
  memoryMb: 6.26,
  components: [
    { name: "Arm selection (LinUCB)", meanUs: 49.4, share: 61.9 },
    { name: "Context and classification", meanUs: 14.5, share: 18.2 },
    { name: "Reward computation", meanUs: 11.4, share: 14.3 },
    { name: "Apply configuration", meanUs: 3.5, share: 4.4 },
    { name: "Logging", meanUs: 1.0, share: 1.3 },
  ],
};

export const ecommerceBench = {
  environment: "Ryzen 9 7940HX, Docker Desktop, k6 v2.0.0, 13 Jun 2026, single host",
  source: "eCOMMERCE-MICROSERVICES docs/BENCHMARKS.md",
  productRead: [
    { k: "Peak virtual users", v: "200" },
    { k: "Requests", v: "42,921" },
    { k: "Throughput", v: "214.2 req/s" },
    { k: "p50 / p95 / p99", v: "1.06 / 2.02 / 2.39 ms" },
    { k: "Errors", v: "0 of 42,921" },
    { k: "Cache hit rate", v: "about 100% (one hot key, warmed)" },
  ],
  orderCreate: [
    { k: "Target rate", v: "ramp to 150 req/s" },
    { k: "Achieved", v: "50.7 req/s average over the ramp" },
    { k: "Orders created", v: "7,626, all 201" },
    { k: "p95 latency", v: "9.03 ms" },
    { k: "Bulkhead rejections", v: "0" },
    { k: "Dropped iterations", v: "98 (k6 VU pool limit)" },
  ],
  breakerTrip: [
    { k: "Calls while product-service down", v: "25" },
    { k: "Breaker state reached", v: "OPEN at 50% failure rate" },
    { k: "Fast-failed by fallback", v: "25 not-permitted calls" },
  ],
  rateLimit: [
    { k: "Burst of requests", v: "60" },
    { k: "Served", v: "39" },
    { k: "Rejected with 429", v: "21" },
  ],
};
