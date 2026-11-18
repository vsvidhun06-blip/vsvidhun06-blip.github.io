import Link from "next/link";
import { projects } from "@/content/projects";
import { publications, researchTimeline } from "@/content/research";
import { journey } from "@/content/journey";
import { site } from "@/content/site";
import { Arrow, Evidence, Magnetic, Reveal, SectionHeader } from "@/components/ui";
import CopyEmail from "./copy-email";

/* ---------------------------------------------------------------------------
   At a glance: what a recruiter needs in fifteen seconds
   --------------------------------------------------------------------------- */
export function AtAGlance() {
  const items = [
    { k: "Focus", v: "LLM serving, adaptive runtime control, weak memory verification" },
    { k: "Education", v: "MSc Software Engineering, Heriot-Watt. Dissertation graded Exceptional (78/100)" },
    { k: "Research", v: "Three manuscripts under review: MLSys, TACAS and FSEN 2027" },
    { k: "Experience", v: "Research software engineering intern, retrieval and RAG, Dec 2023 to Aug 2024" },
  ];
  return (
    <section aria-label="At a glance" className="container-x mt-24 sm:mt-28">
      <dl className="grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i, n) => (
          <Reveal key={i.k} delay={n * 0.05} className="bg-[var(--bg)] p-6">
            <dt className="eyebrow">{i.k}</dt>
            <dd className="mt-3 text-[15px] leading-snug text-[var(--fg)]">{i.v}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   About
   --------------------------------------------------------------------------- */
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="container-x mt-32 sm:mt-40">
      <SectionHeader id="about-title" index="01" label="About" title={<>From retrieval pipelines to <em>memory models</em></>} />
      <div className="mt-12 grid gap-12 md:grid-cols-12">
        <Reveal className="prose-body space-y-5 md:col-span-7 md:col-start-4">
          <p>
            I studied computer science in Kerala, then spent eight months as a research software engineering intern on a
            five-person team building retrieval systems. That is where I learned that the interesting failures live in
            the plumbing: a reranker that dominates p95 latency, or an ingestion job that duplicates records after a crash.
          </p>
          <p>
            At Heriot-Watt I took concurrency and formal methods seriously for the first time. My dissertation became a
            tool for stepping through executions under <strong>WEAKEST</strong>, a memory model that is as permissive as
            possible while still ruling out values that appear out of thin air. That tool grew into{" "}
            <Link href="/work/wev-smt/">WEV-SMT</Link>, an SMT-backed checker, and into two papers about what dependency
            analyses can and cannot know.
          </p>
          <p>
            Alongside it I wanted to understand LLM serving from the inside, so I wrote an engine:{" "}
            <Link href="/work/mini-vllm-carl/">Mini-vLLM</Link>. Then I built CARL, a controller meant to tune it online,
            and spent longer auditing CARL than building it. Several of my early numbers did not survive that audit. The
            paper that came out of it reports what did.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-2 md:col-start-11">
          <ul className="space-y-6 text-sm">
            {[
              ["Measure first", "Numbers here say where they came from: a log, a results file, a manuscript, or my own report."],
              ["State the scope", "One GPU, one model and two knobs is exactly that, and I say so."],
              ["Make it recoverable", "Checkpoints, hashes and regression tests for the boring parts."],
            ].map(([t, d]) => (
              <li key={t}>
                <p className="text-[var(--fg)]">{t}</p>
                <p className="mt-1 leading-relaxed text-[var(--fg-3)]">{d}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Featured work
   --------------------------------------------------------------------------- */
export function FeaturedWork() {
  const carl = projects.find((p) => p.slug === "mini-vllm-carl")!;
  const wev = projects.find((p) => p.slug === "wev-smt")!;
  const secondary = projects.filter((p) => p.featured === "secondary");
  return (
    <section id="work" aria-labelledby="work-title" className="container-x mt-32 sm:mt-40">
      <SectionHeader
        id="work-title"
        index="02"
        label="Selected work"
        title={<>Two research systems, <em>and the rest</em></>}
        intro={<p>The first two are where most of my time went this year. Each case study has interactive figures, the measured results, and the parts that did not work.</p>}
      />

      <div className="mt-14 space-y-6">
        <FeatureCard
          n="01"
          href={carl.caseStudy!}
          title="Mini-vLLM and CARL"
          kicker="LLM inference · adaptive serving"
          body="A from-scratch serving engine on TinyLlama-1.1B, and an online contextual-bandit controller evaluated honestly against static configurations on a Tesla T4."
          facts={[
            ["1.83x", "throughput from continuous batching, RTX 4060 Laptop"],
            ["+3.76", "tok/s for learning over a fixed rule, saturated T4"],
            ["~830", "tests, with Hugging Face parity at 1e-4"],
          ]}
          tags={carl.tech.slice(0, 6)}
          preview={<CarlPreview />}
          evidence={<Evidence kind="measured" />}
        />
        <FeatureCard
          n="02"
          href={wev.caseStudy!}
          title="WEV-SMT"
          kicker="Weak memory · SMT · Isabelle/HOL"
          body="A Z3-backed checker for six memory models that asks whether a dependency is real before letting it forbid an execution, with the core theory machine-checked."
          facts={[
            ["6", "memory models encoded: SC to RC11"],
            ["190/190", "atlas cells match expected verdicts"],
            ["4", "Isabelle/HOL sessions, no sorry, no oracles"],
          ]}
          tags={wev.tech.slice(0, 6)}
          preview={<WevPreview />}
          evidence={<Evidence kind="tool" />}
          flip
        />
      </div>

      <div className="mt-20">
        <p className="eyebrow mb-4">Also featured</p>
        <ul className="border-t border-[var(--line)]">
          {secondary.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.04}>
              <Link
                href={p.caseStudy!}
                className="group grid gap-2 border-b border-[var(--line)] py-6 transition-colors md:grid-cols-12 md:items-baseline md:gap-6"
              >
                <span className="font-mono text-[12px] text-[var(--fg-3)] md:col-span-1">0{i + 3}</span>
                <span className="display text-3xl transition-colors group-hover:text-[var(--accent)] md:col-span-4 md:text-4xl">{p.title}</span>
                <span className="text-[15px] leading-relaxed text-[var(--fg-2)] md:col-span-5">{p.line}</span>
                <span className="flex items-center justify-between gap-3 font-mono text-[11px] text-[var(--fg-3)] md:col-span-2 md:justify-end">
                  {p.kind}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    <Arrow />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeatureCard({
  n,
  href,
  title,
  kicker,
  body,
  facts,
  tags,
  preview,
  evidence,
  flip,
}: {
  n: string;
  href: string;
  title: string;
  kicker: string;
  body: string;
  facts: [string, string][];
  tags: string[];
  preview: React.ReactNode;
  evidence: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <Reveal>
      <Link
        href={href}
        className="group grid overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] transition-colors duration-500 hover:border-[var(--line-2)] lg:grid-cols-2"
      >
        <div className={`flex flex-col justify-between gap-10 p-6 sm:p-10 ${flip ? "lg:order-2" : ""}`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="eyebrow">
                <span className="text-[var(--accent)]">{n}</span> · {kicker}
              </span>
              {evidence}
            </div>
            <h3 className="display mt-6 text-5xl sm:text-6xl">{title}</h3>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[var(--fg-2)]">{body}</p>
          </div>
          <div>
            <dl className="grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-6">
              {facts.map(([v, d]) => (
                <div key={d}>
                  <dt className="tabular display text-3xl text-[var(--fg)]">{v}</dt>
                  <dd className="mt-1 text-[12px] leading-snug text-[var(--fg-3)]">{d}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex items-center justify-between gap-4">
              <ul className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <li key={t} className="rounded-full border border-[var(--line)] px-2.5 py-1 font-mono text-[10.5px] text-[var(--fg-3)]">
                    {t}
                  </li>
                ))}
              </ul>
              <span className="flex shrink-0 items-center gap-2 text-sm text-[var(--fg)]">
                Case study
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <Arrow />
                </span>
              </span>
            </div>
          </div>
        </div>
        <div
          className={`relative min-h-[280px] border-t border-[var(--line)] bg-[var(--bg)] lg:border-t-0 ${flip ? "lg:order-1 lg:border-r" : "lg:border-l"}`}
          aria-hidden
        >
          {preview}
        </div>
      </Link>
    </Reveal>
  );
}

function CarlPreview() {
  // Static illustration: a paged KV cache with four requests, and the measured batching result.
  const owners = [0, 0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 0, 1, 2, 3, -1, -1, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
  const colors = ["var(--c-chat)", "var(--c-long)", "var(--c-shared)", "var(--violet)"];
  return (
    <svg viewBox="0 0 480 360" className="absolute inset-0 h-full w-full">
      <text x="40" y="52" className="fill-[var(--fg-3)] font-mono text-[11px] uppercase tracking-wider">
        paged kv cache · 16-token blocks
      </text>
      {owners.map((o, i) => (
        <rect
          key={i}
          x={40 + (i % 8) * 50}
          y={70 + Math.floor(i / 8) * 42}
          width={42}
          height={34}
          rx={4}
          fill={o < 0 ? "transparent" : colors[o]}
          fillOpacity={o < 0 ? 0 : 0.7}
          stroke="var(--line-2)"
          className="transition-[fill-opacity] duration-500 group-hover:[fill-opacity:0.9]"
        />
      ))}
      <text x="40" y="276" className="fill-[var(--fg-3)] font-mono text-[11px] uppercase tracking-wider">
        tok/s, 4 prompts, RTX 4060 Laptop
      </text>
      <rect x="40" y="290" width={(24.4 / 46) * 400} height="12" rx="3" fill="var(--fg-3)" />
      <text x={48 + (24.4 / 46) * 400} y="301" className="fill-[var(--fg-2)] font-mono text-[11px]">
        24.4 sequential
      </text>
      <rect x="40" y="312" width={(44.6 / 46) * 400 - 90} height="12" rx="3" fill="var(--c-long)" />
      <text x={48 + (44.6 / 46) * 400 - 90} y="323" className="fill-[var(--fg)] font-mono text-[11px]">
        44.6 batched
      </text>
    </svg>
  );
}

function WevPreview() {
  const n = (x: number, y: number, label: string) => (
    <g>
      <rect x={x - 62} y={y - 18} width={124} height={36} rx={8} fill="var(--bg-2)" stroke="var(--line-2)" />
      <text x={x} y={y + 4} textAnchor="middle" className="fill-[var(--fg)] font-mono text-[12px]">
        {label}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 480 360" className="absolute inset-0 h-full w-full">
      <defs>
        <marker id="wp-a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--fg-3)" />
        </marker>
        <marker id="wp-b" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--c-long)" />
        </marker>
      </defs>
      <text x="40" y="52" className="fill-[var(--fg-3)] font-mono text-[11px] uppercase tracking-wider">
        lb with a fake dependency
      </text>
      <path d="M120 120 L120 202" stroke="var(--fg-3)" strokeWidth="1.5" markerEnd="url(#wp-a)" />
      <path d="M360 120 L360 202" stroke="var(--fg-3)" strokeWidth="1.5" markerEnd="url(#wp-a)" />
      <path d="M138 120 Q 150 160 138 200" stroke="var(--neg)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      <path d="M378 120 Q 390 160 378 200" stroke="var(--neg)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      <path d="M182 220 C 260 220, 240 102, 296 102" stroke="var(--c-long)" strokeWidth="1.5" fill="none" markerEnd="url(#wp-b)" />
      <path d="M298 220 C 220 220, 240 102, 184 102" stroke="var(--c-long)" strokeWidth="1.5" fill="none" markerEnd="url(#wp-b)" />
      {n(120, 102, "R y = 1")}
      {n(120, 220, "W x = r^r^1")}
      {n(360, 102, "R x = 1")}
      {n(360, 220, "W y = r^r^1")}
      <g className="font-mono text-[11px]">
        {[
          ["SC", "F"],
          ["TSO", "F"],
          ["PSO", "F"],
          ["RA", "A"],
          ["WEAKEST", "A"],
          ["RC11", "F"],
        ].map(([m, v], i) => (
          <g key={m} transform={`translate(${40 + i * 70}, 290)`}>
            <text className="fill-[var(--fg-3)]">{m}</text>
            <text y="20" className={v === "A" ? "fill-[var(--pos)]" : "fill-[var(--fg-2)]"}>
              {v === "A" ? "allowed" : "forbid"}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Research
   --------------------------------------------------------------------------- */
export function Research() {
  return (
    <section id="research" aria-labelledby="research-title" className="container-x mt-32 sm:mt-40">
      <SectionHeader
        id="research-title"
        index="03"
        label="Research"
        title={<>Papers in <em>review</em>, and how they got there</>}
        intro={
          <p>
            Nothing below is accepted or published yet, and the labels say so. Each manuscript has its code public, and
            each states its scope: one model and one GPU for CARL, straight-line 32-bit code for the dependency theorems.
          </p>
        }
      />
      <ol className="mt-14 border-t border-[var(--line)]">
        {publications.map((p, i) => (
          <Reveal as="li" key={p.id} delay={i * 0.04} className="grid gap-4 border-b border-[var(--line)] py-8 md:grid-cols-12 md:gap-8">
            <div className="flex items-start gap-3 md:col-span-3 md:flex-col md:gap-2">
              <StatusPill status={p.status} />
              <span className="font-mono text-[12px] text-[var(--fg-3)]">
                {p.venue} · {p.date}
              </span>
            </div>
            <div className="md:col-span-7">
              <h3 className="text-[19px] leading-snug text-[var(--fg)] sm:text-[21px]">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--fg-3)]">{p.authors}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--fg-2)]">{p.summary}</p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 md:col-span-2 md:flex-col md:items-end">
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-u inline-flex items-center gap-1.5 text-sm text-[var(--fg)]">
                  {l.label} <Arrow dir="up-right" />
                </a>
              ))}
              <Link href={`/work/${p.project === "weakest-visualiser" ? "wev-smt" : p.project}/`} className="link-u text-sm text-[var(--fg-2)]">
                Case study
              </Link>
            </div>
          </Reveal>
        ))}
      </ol>

      <div className="mt-20">
        <p className="eyebrow mb-8">Research timeline</p>
        <ol className="relative grid gap-8 border-l border-[var(--line-2)] pl-6 md:grid-cols-7 md:gap-4 md:border-l-0 md:border-t md:pl-0 md:pt-8">
          {researchTimeline.map((t, i) => (
            <Reveal as="li" key={t.title} delay={i * 0.05} className="relative">
              <span
                className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full border border-[var(--accent)] bg-[var(--bg)] md:-top-[37px] md:left-0"
                aria-hidden
              />
              <p className="font-mono text-[11px] text-[var(--accent)]">{t.date}</p>
              <p className="mt-2 text-[15px] leading-snug text-[var(--fg)]">{t.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--fg-3)]">{t.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const color = status === "Accepted" || status === "Published" ? "var(--pos)" : status === "Dissertation" ? "var(--violet)" : "var(--accent)";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line-2)] px-2.5 py-1 font-mono text-[11px] text-[var(--fg)]">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden />
      {status}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Archive preview
   --------------------------------------------------------------------------- */
export function AlsoBuilt() {
  const rest = projects.filter((p) => !p.featured);
  return (
    <section aria-labelledby="also-title" className="container-x mt-32 sm:mt-40">
      <SectionHeader
        id="also-title"
        index="04"
        label="Archive"
        title={<>Everything else, <em>filed properly</em></>}
        intro={<p>Coursework and side projects, described from their source code and reports. The archive has filters by category, technology and type.</p>}
      />
      <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p, i) => (
          <Reveal as="li" key={p.slug} delay={i * 0.04} className="bg-[var(--bg)]">
            <Link href={`/archive/#${p.slug}`} className="group flex h-full flex-col justify-between gap-8 p-6 transition-colors hover:bg-[var(--bg-2)]">
              <div>
                <p className="eyebrow">
                  {p.kind} · {p.year}
                </p>
                <h3 className="mt-3 text-xl text-[var(--fg)]">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-2)]">{p.line}</p>
              </div>
              <p className="font-mono text-[11px] text-[var(--fg-3)]">{p.tech.slice(0, 4).join(" · ")}</p>
            </Link>
          </Reveal>
        ))}
        <li className="bg-[var(--bg)]">
          <Link href="/archive/" className="group flex h-full min-h-[180px] flex-col justify-between p-6 transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]">
            <p className="eyebrow group-hover:text-current">Full archive</p>
            <p className="display flex items-center gap-3 text-4xl">
              All {projects.length} projects <Arrow />
            </p>
          </Link>
        </li>
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Journey
   --------------------------------------------------------------------------- */
export function Journey() {
  return (
    <section id="journey" aria-labelledby="journey-title" className="container-x mt-32 sm:mt-40">
      <SectionHeader id="journey-title" index="07" label="Journey" title={<>Where I have <em>been</em></>} />
      <ol className="mt-14">
        {journey.map((j, i) => (
          <Reveal as="li" key={j.title} delay={i * 0.04} className="grid gap-4 border-t border-[var(--line)] py-8 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-3">
              <p className="font-mono text-[12px] text-[var(--fg-2)]">{j.period}</p>
              <p className="eyebrow mt-2">{j.kind}</p>
            </div>
            <div className="md:col-span-8">
              <h3 className="text-xl text-[var(--fg)] sm:text-2xl">{j.title}</h3>
              <p className="mt-1 text-sm text-[var(--fg-3)]">{j.place}</p>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--fg-2)]">{j.body}</p>
              {j.points && (
                <>
                  <ul className="mt-5 max-w-2xl space-y-3">
                    {j.points.map((p) => (
                      <li key={p} className="flex gap-3 text-[14.5px] leading-relaxed text-[var(--fg-2)]">
                        <span className="mt-2.5 h-px w-3 shrink-0 bg-[var(--fg-3)]" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    <Evidence kind="self-reported">figures from internal evaluation; no public artifact</Evidence>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Contact
   --------------------------------------------------------------------------- */
export function Contact() {
  const links = [
    { label: "GitHub", value: "vsvidhun06-blip", href: site.links.github },
    { label: "LinkedIn", value: "vidhun-suja", href: site.links.linkedin },
    { label: "LeetCode", value: "VidhuViny", href: site.links.leetcode },
    { label: "CV", value: "PDF, one page", href: site.resume },
  ];
  return (
    <section id="contact" aria-labelledby="contact-title" className="container-x mb-24 mt-32 sm:mt-40">
      <div className="border-t border-[var(--line)] pt-6">
        <p className="eyebrow flex gap-3">
          <span className="text-[var(--accent)]">08</span> Contact
        </p>
        <h2 id="contact-title" className="display mt-10 max-w-5xl text-[clamp(2.8rem,8vw,7.5rem)]">
          If you work on serving, schedulers or <em className="text-[var(--accent)]">correctness</em>, I would like to hear
          from you.
        </h2>
        <div className="mt-14 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="max-w-md text-[16px] leading-relaxed text-[var(--fg-2)]">
              I am looking for software engineering roles in AI infrastructure, inference and systems. I am based in
              Edinburgh with the right to work in the UK ({site.rightToWork}).
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic href={`mailto:${site.email}`} variant="solid">
                {site.email}
              </Magnetic>
              <CopyEmail />
            </div>
          </div>
          <ul className="md:col-span-5 md:col-start-8">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel={l.href.startsWith("http") ? "noopener noreferrer" : "noopener"}
                  className="group flex items-baseline justify-between border-b border-[var(--line)] py-4 transition-colors hover:text-[var(--accent)]"
                >
                  <span className="text-lg">{l.label}</span>
                  <span className="flex items-center gap-3 font-mono text-[12px] text-[var(--fg-3)] group-hover:text-current">
                    {l.value} <Arrow dir="up-right" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
