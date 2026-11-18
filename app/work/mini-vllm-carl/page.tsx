import type { Metadata } from "next";
import { CaseBody, CaseHeader, CaseSection, KeyList, NextProject, Prose, Shot } from "@/components/case";
import Explorer from "@/components/inference/Explorer";
import CarlResults from "@/components/carl-results";
import { Dumbbell, HBars, RankBars, SpecGrid } from "@/components/charts";
import { Evidence, Figure } from "@/components/ui";
import { controllerOverhead, gpuBatching, landscape, prefixCache, specBreakeven } from "@/content/results";

export const metadata: Metadata = {
  title: "Mini-vLLM and CARL",
  description:
    "A from-scratch LLM inference engine with continuous batching, a paged KV cache, prefix caching and chunked prefill, and CARL, an online contextual-bandit controller evaluated against offline-tuned static configurations.",
  alternates: { canonical: "/work/mini-vllm-carl/" },
};

const toc = [
  { id: "problem", label: "The problem" },
  { id: "explore", label: "Explore the engine" },
  { id: "architecture", label: "What I built" },
  { id: "results", label: "Measured results" },
  { id: "carl", label: "CARL" },
  { id: "audit", label: "What I took back" },
  { id: "decisions", label: "Decisions and trade-offs" },
  { id: "lessons", label: "Lessons" },
];

export default function Page() {
  return (
    <article>
      <CaseHeader
        kicker="Mini-vLLM and CARL"
        title={
          <>
            Mini-vLLM <span className="text-[var(--fg-3)]">and</span> <em>CARL</em>
          </>
        }
        lede={
          <p>
            An LLM serving engine written from scratch around TinyLlama-1.1B, so that every idea inside vLLM is visible
            and testable. Then an online controller that reconfigures it while it runs, and a careful answer to whether
            that controller helps.
          </p>
        }
        meta={[
          { label: "Role", value: "Sole engineer and author" },
          { label: "Timeline", value: "Jan 2026 to present" },
          { label: "Status", value: "Manuscript under review, MLSys 2027" },
          { label: "Stack", value: "Python, PyTorch, Triton, FastAPI, Prometheus, Grafana, Docker" },
        ]}
        links={[
          { label: "Source on GitHub", href: "https://github.com/vsvidhun06-blip/mini-vllm" },
          { label: "Evaluation docs", href: "https://github.com/vsvidhun06-blip/mini-vllm/tree/main/docs/eval" },
        ]}
      />

      <CaseBody toc={toc}>
        <CaseSection id="problem" n="01" title="Serving is a scheduling problem">
          <Prose>
            <p>
              Generating text with an LLM happens in two phases. <strong>Prefill</strong> pushes the whole prompt
              through the model at once and is compute-bound. <strong>Decode</strong> then produces one token per step
              per request and is limited by memory bandwidth, because every step rereads the weights and the request&apos;s
              key/value cache.
            </p>
            <p>
              A server has to decide, every step, which requests run, how much prompt to prefill, and where each
              request&apos;s KV cache lives in a fixed amount of GPU memory. Get it wrong and the GPU idles between
              requests, or one long prompt freezes everyone else&apos;s tokens, or memory fragments until nothing new
              fits. vLLM&apos;s answers are continuous batching and a paged KV cache. I wanted to understand those
              answers well enough to rebuild them, test them against Hugging Face, and then ask a research question on
              top.
            </p>
          </Prose>
        </CaseSection>

        <CaseSection id="explore" n="02" title="Explore the engine" wide>
          <div className="mb-8 max-w-3xl">
            <Prose>
              <p>
                This is a small simulation of the same mechanisms, running in your browser. Switch the policy to see
                what each technique fixes. Hover a request to see its KV blocks light up in the cache. The numbers it
                shows are simulated; the measured results are in the next sections.
              </p>
            </Prose>
          </div>
          <Explorer />
        </CaseSection>

        <CaseSection id="architecture" n="03" title="What I built">
          <Prose>
            <p>
              Everything below the FastAPI layer is hand-written: the model, the attention, the cache and the
              scheduler. Each layer has a parity test against <code>transformers</code> at <code>atol=1e-4</code>, so
              a faster path is only accepted if it produces the same tokens. The suite has about 830 tests.
            </p>
          </Prose>
          <div className="mt-10">
            <Figure n="1" caption="The engine and its observability path. CARL attaches to the scheduler only when enabled." evidence={<Evidence kind="illustrative">architecture</Evidence>}>
              <ArchitectureDiagram />
            </Figure>
          </div>
          <div className="mt-10">
            <KeyList
              items={[
                { t: "Model", d: <>Llama architecture from scratch: RoPE, grouped-query attention, SwiGLU, RMSNorm in fp32. A fused Triton RoPE kernel with numerical parity tests against the PyTorch version.</> },
                { t: "Paged KV cache", d: <>16-token blocks in split K and V pools, stored layer-major with block size before KV heads, so attention reads views instead of strided copies. Each layer tracks its own cache length, which fixed an off-by-one in cached generation.</> },
                { t: "Scheduler", d: <>Continuous batching with admission control under block pressure, a priority and deadline-aware SLA scheduler, chunked prefill with a per-step token budget, and a radix-tree prefix cache.</> },
                { t: "Speculative decoding", d: <>Self-speculation by early exit, with KV rewind and byte-identical output to greedy decoding. Off by default, for reasons shown below.</> },
                { t: "Experimental paths", d: <>CUDA Graph decode, multi-LoRA adapter routing, W8A8 quantisation, FlashAttention, disaggregated prefill and decode, each with its own benchmark script. I do not quote numbers for them here because their raw logs are not committed.</> },
                { t: "Observability", d: <>Prometheus metrics and a pre-provisioned Grafana dashboard: TTFT and TPOT percentiles, queue depth, KV utilisation, batch-size heatmap, CUDA Graph hit rate, and the profiler&apos;s bottleneck over time. A WebSocket visualiser streams every scheduler event.</> },
              ]}
            />
          </div>
          <div className="mt-10 grid gap-6">
            <Shot
              src="/images/minivllm/visualiser_batched_decode.webp"
              w={1568}
              h={772}
              alt="The Mini-vLLM live visualiser showing four requests in DECODE and 12 of 64 KV blocks in use"
              caption="The live visualiser: four concurrent requests decoding in one batch, each with its own colour in the paged cache grid (12 of 64 blocks). A CPU run, so the throughput in the corner is not a benchmark."
              evidence={<Evidence kind="tool">screenshot, CPU run</Evidence>}
            />
            <Shot
              src="/images/minivllm/prefix_cache_chunked_prefill.webp"
              w={1568}
              h={778}
              alt="Visualiser showing a prefix cache hit with chunked prefill"
              caption="Prefix caching with chunked prefill. Requests share a system prompt, so a new request starts prefill at token 32 of 51 while another request keeps decoding."
              evidence={<Evidence kind="tool">screenshot</Evidence>}
            />
          </div>
        </CaseSection>

        <CaseSection id="results" n="04" title="Measured results" wide>
          <div className="max-w-3xl">
            <Prose>
              <p>
                Three measurements with committed raw logs. They are small and specific on purpose: one laptop GPU or
                one T4, one 1.1B model, fp32 where parity matters.
              </p>
            </Prose>
          </div>
          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            <Figure
              n="2"
              caption={<>Continuous batching on {gpuBatching.workload}. With only 6 KV blocks the scheduler must queue requests, and still beats sequential decoding. {gpuBatching.hardware}.</>}
              evidence={<Evidence kind="measured">v0.2_gpu.txt</Evidence>}
            >
              <p className="eyebrow mb-5">Aggregate throughput</p>
              <HBars rows={gpuBatching.rows.map((r) => ({ label: r.label, value: r.tps, note: r.note }))} unit="tok/s" highlight={1} max={48} />
            </Figure>
            <Figure
              n="3"
              caption={<>Prefill time per request with radix-tree prefix caching off and on. The first request pays full price and publishes 8 blocks; the next three reuse them. Hit rate {prefixCache.hitRate}.</>}
              evidence={<Evidence kind="measured">v0.2_prefix_cache.txt</Evidence>}
            >
              <p className="eyebrow mb-5">Prefill latency, ms</p>
              <Dumbbell rows={prefixCache.rows} />
            </Figure>
          </div>
          <div className="mt-6">
            <Figure
              n="4"
              caption={<>Self-speculative decoding on a Tesla T4, across exit layer and draft length. Every one of the 25 configurations is slower than plain decoding. Acceptance peaks at 5.1% where 42.5% would be needed to break even, because TinyLlama was never trained to exit early. Single seed, single request.</>}
              evidence={<Evidence kind="measured">spec_breakeven_results.json</Evidence>}
            >
              <p className="eyebrow mb-5">Speedup over plain decoding</p>
              <SpecGrid exitLayers={specBreakeven.exitLayers} ks={specBreakeven.ks} grid={specBreakeven.grid} />
            </Figure>
          </div>
          <div className="mt-10 max-w-3xl">
            <Prose>
              <p>
                The speculative decoding result is a negative one, and I kept it. The machinery is correct (it matches
                greedy output byte for byte), so the path forward is a trained draft mechanism such as a LayerSkip
                fine-tune or an EAGLE-style head, not more tuning. A separate comparison script runs both engines on
                identical workloads; Mini-vLLM is roughly an order of magnitude slower per token than vLLM, and each
                part of that gap maps to a technique I left out for readability.
              </p>
            </Prose>
          </div>
        </CaseSection>

        <CaseSection id="carl" n="05" title="CARL: does online tuning help?" wide>
          <div className="max-w-3xl">
            <Prose>
              <p>
                Serving engines expose knobs such as the maximum batch size and the prefill chunk size. They are usually
                tuned offline and frozen. CARL is the alternative: a regime classifier plus a LinUCB contextual bandit
                per regime, choosing from a table of configurations while the engine runs.
              </p>
              <p>
                The question is easy to ask unfairly. A static baseline can be tuned for the wrong objective, a reward
                can depend on latencies not yet measured, and &ldquo;convergence&rdquo; can be read off a controller
                that never explored. So the final study varies only the two knobs verified to be live, picks static
                baselines by exhaustive search of all 28 configurations on a held-out seed, withholds rewards built from
                unmeasured latencies, and compares paired runs over ten seeds.
              </p>
            </Prose>
          </div>
          <div className="mt-10">
            <CarlResults />
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Figure
              n="6"
              caption="How much the best configuration beats the worst, over the 28-point grid. At saturation the choice matters a lot; below saturation, throughput is set by arrivals and the grid is almost flat, so there is little for any controller to win."
              evidence={<Evidence kind="measured">claim ledger D and E</Evidence>}
            >
              <p className="eyebrow mb-5">Relative throughput range, %</p>
              <HBars rows={landscape.map((l) => ({ label: l.label, value: l.value }))} unit="%" highlight={0} max={56} />
            </Figure>
            <Figure
              n="7"
              caption={<>Cost of one CARL control step in isolation on CPU, over 10,000 steps: {controllerOverhead.meanUs} µs mean, {controllerOverhead.p99Us} µs p99, {controllerOverhead.memoryMb} MB of state. Flat in the number of requests seen.</>}
              evidence={<Evidence kind="measured">overhead_results.json</Evidence>}
            >
              <p className="eyebrow mb-5">Mean time per component, µs</p>
              <RankBars rows={controllerOverhead.components.map((c) => ({ label: c.name, value: c.meanUs, extra: `${c.share}% of the step` }))} unit="µs" digits={1} />
            </Figure>
          </div>
          <div className="mt-10 max-w-3xl">
            <Prose>
              <p>
                <strong>The finding.</strong> At the saturated operating point, learning is worth +3.76 tok/s over a
                fixed rule with the same classifier and arm table (95% CI +3.29 to +4.23), but the controller stays
                below static configurations chosen offline for the same objective. At a sub-critical Poisson load it
                trails both on end-of-run utility. No run in any treatment met the pre-stated convergence diagnostic.
                These findings are about this system, one model and one GPU, not about online adaptation in general.
              </p>
            </Prose>
          </div>
        </CaseSection>

        <CaseSection id="audit" n="06" title="What I took back">
          <Prose>
            <p>
              An earlier draft of this work claimed that CARL reached 108% of a tuned static configuration, converged
              deterministically at cycle 9, and had an effect size of d = 23. I wrote a claim ledger that checked every
              sentence against the repository&apos;s own artifacts. Those claims, and several others, did not survive.
            </p>
          </Prose>
          <div className="mt-8">
            <KeyList
              items={[
                { t: "The reward was constant", d: "On the GPU, reward v1 took exactly two values ever: 0.8 for three cycles, then 0.3 forever. All four terms were pinned by their clips. A bandit cannot learn from a constant, which also explained why three “independent” seeds were byte-identical." },
                { t: "The bandit never explored", d: "At α = 0.5, untried arms scored zero against strictly positive rewards, so LinUCB played arm 0 every time. Adding an intercept feature and centring the reward fixed it; removing both reproduced the lock-in exactly, as a test." },
                { t: "The baseline was circular", d: "In the old simulator the oracle, the bandit's first arm and most static candidates were the same configuration. It was replaced by a substrate that imports nothing from the controller, which a test asserts." },
                { t: "The workload flattered tails", d: "Dumping 25 requests at once behind a concurrency cap turned queueing delay into apparent tail-latency wins. Poisson arrivals at a derived load replaced it." },
              ]}
            />
          </div>
          <div className="mt-8">
            <Prose>
              <p>
                This was not the paper I set out to write. It is a better one: the methods that caught these problems (a
                null ablation that freezes learning, a circularity check, and an arm-set coverage check) are cheap and
                would have caught them on day one.
              </p>
            </Prose>
          </div>
        </CaseSection>

        <CaseSection id="decisions" n="07" title="Decisions and trade-offs">
          <KeyList
            items={[
              { t: "fp32 for parity", d: "Running in fp32 lets every layer match Hugging Face at 1e-4. It roughly doubles memory traffic in a bandwidth-bound decode, which is part of the gap to vLLM. Correctness first, then speed behind a test." },
              { t: "Python step loop", d: "Readable and easy to instrument, but host overhead grows with batch size. vLLM's C++ scheduler and CUDA Graph replay are the production answers; the profiler shows where this engine pays for the choice." },
              { t: "Synchronous event bus", d: "The scheduler emits events synchronously from worker threads, and each WebSocket subscriber owns an asyncio queue fed through call_soon_threadsafe. The bus never needs to know about asyncio." },
              { t: "Speculation off by default", d: "At measured acceptance rates, enabling it slows every request. The interface stays so a trained draft head can be dropped in." },
              { t: "Reproducible GPU runs", d: "Colab runs with incremental checkpoints, verified resume after interruption, and SHA-256 hashes for source and artifacts, so a result can be traced to the exact code that produced it." },
            ]}
          />
        </CaseSection>

        <CaseSection id="lessons" n="08" title="Lessons">
          <Prose>
            <p>
              Correctness tests against a reference implementation are what made the engine trustworthy enough to
              experiment on. Without them, every speed-up would have been a guess.
            </p>
            <p>
              On the research side, the most useful thing I built was not the controller but the ledger: a table where
              each claim has evidence and a status, and where a contradicted claim is retracted rather than softened.
              The final result is smaller than the first draft and I trust all of it.
            </p>
          </Prose>
        </CaseSection>
      </CaseBody>
      <NextProject current="mini-vllm-carl" />
    </article>
  );
}

function ArchitectureDiagram() {
  const box = (x: number, y: number, w: number, h: number, title: string, sub?: string, accent?: boolean) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="var(--bg)" stroke={accent ? "var(--accent)" : "var(--line-2)"} />
      <text x={x + 14} y={y + 24} className="fill-[var(--fg)] font-mono text-[13px]">
        {title}
      </text>
      {sub && (
        <text x={x + 14} y={y + 44} className="fill-[var(--fg-3)] font-mono text-[11px]">
          {sub}
        </text>
      )}
    </g>
  );
  const arrow = (d: string, dashed?: boolean) => (
    <path d={d} fill="none" stroke="var(--fg-3)" strokeWidth={1.3} strokeDasharray={dashed ? "4 4" : undefined} markerEnd="url(#ar)" />
  );
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 900 400" className="min-w-[640px]" role="img" aria-label="Mini-vLLM architecture: FastAPI server feeds the continuous batch scheduler, which drives the model and paged KV cache; events flow to a WebSocket visualiser and metrics to Prometheus and Grafana; CARL observes and reconfigures the scheduler.">
        <defs>
          <marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--fg-3)" />
          </marker>
        </defs>
        {box(20, 40, 150, 60, "FastAPI", "/generate, /stream")}
        {box(230, 40, 220, 60, "Scheduler", "FIFO or SLA, chunked", true)}
        {box(520, 20, 170, 60, "LlamaModel", "RoPE, GQA, SwiGLU")}
        {box(520, 100, 170, 60, "PagedKVCache", "16-token blocks")}
        {box(730, 100, 150, 60, "Prefix cache", "radix tree")}
        {box(230, 180, 220, 60, "EventBus", "sync, thread-safe")}
        {box(520, 200, 170, 60, "WebSocket", "/events")}
        {box(730, 200, 150, 60, "Visualiser", "single-file SPA")}
        {box(20, 300, 150, 60, "/metrics", "Prometheus format")}
        {box(230, 300, 220, 60, "Prometheus", "scrape every 5 s")}
        {box(520, 300, 170, 60, "Grafana", "9 panels")}
        {box(20, 180, 150, 60, "CARL", "LinUCB per regime")}
        {arrow("M170 70 L226 70")}
        {arrow("M450 60 L516 50")}
        {arrow("M450 80 L516 125")}
        {arrow("M690 130 L726 130")}
        {arrow("M340 100 L340 176")}
        {arrow("M450 210 L516 225")}
        {arrow("M690 230 L726 230")}
        {arrow("M95 300 L95 304")}
        {arrow("M170 330 L226 330")}
        {arrow("M450 330 L516 330")}
        {arrow("M170 200 C 200 200, 200 90, 226 90", true)}
        {arrow("M228 220 C 200 220, 196 222, 174 216", true)}
        <text x={176} y={150} className="fill-[var(--fg-3)] font-mono text-[10.5px]">
          configure
        </text>
        <text x={176} y={262} className="fill-[var(--fg-3)] font-mono text-[10.5px]">
          observe
        </text>
        <path d="M340 240 L340 260 L95 260 L95 296" fill="none" stroke="var(--fg-3)" strokeWidth={1.3} markerEnd="url(#ar)" />
      </svg>
    </div>
  );
}
