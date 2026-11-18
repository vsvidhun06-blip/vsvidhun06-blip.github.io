import type { Metadata } from "next";
import { CaseBody, CaseHeader, CaseSection, KeyList, NextProject, Prose, Shot } from "@/components/case";
import EventGraph from "@/components/event-graph";
import { Evidence, Figure } from "@/components/ui";

export const metadata: Metadata = {
  title: "WEV-SMT",
  description:
    "An SMT-based checker for six weak memory models that separates real dependencies from fake ones with a 32-bit constancy oracle, with its core theory machine-checked in Isabelle/HOL.",
  alternates: { canonical: "/work/wev-smt/" },
};

const toc = [
  { id: "problem", label: "The problem" },
  { id: "explore", label: "Explore executions" },
  { id: "pipeline", label: "How it works" },
  { id: "evidence", label: "Proved, tested, not proved" },
  { id: "correction", label: "A defect I found later" },
  { id: "origin", label: "Where it started" },
  { id: "decisions", label: "Decisions and trade-offs" },
  { id: "lessons", label: "Lessons" },
];

const f01 = [
  { model: "PSO", sub: "1,170 / 1,226", cor: "1,173 / 1,223" },
  { model: "RA", sub: "2,089 / 307", cor: "2,092 / 304" },
  { model: "WEAKEST", sub: "2,356 / 40", cor: "2,359 / 37" },
  { model: "RC11", sub: "2,169 / 227", cor: "2,172 / 224" },
];

export default function Page() {
  return (
    <article>
      <CaseHeader
        kicker="WEV-SMT"
        title={
          <>
            WEV<span className="text-[var(--fg-3)]">-</span>SMT
          </>
        }
        lede={
          <p>
            A checker that asks whether a small concurrent program can produce a given outcome under six weak memory
            models, and that asks Z3 whether a dependency is real before letting it forbid anything. The core theory is
            machine-checked in Isabelle/HOL.
          </p>
        }
        meta={[
          { label: "Role", value: "Design, implementation, proofs; TACAS paper co-authored with my supervisor" },
          { label: "Timeline", value: "Jan 2026 to Nov 2026" },
          { label: "Status", value: "Two manuscripts under review: TACAS 2027, FSEN 2027" },
          { label: "Stack", value: "Java 21, JavaSMT, Z3, Isabelle/HOL, Python, JUnit 5" },
        ]}
        links={[
          { label: "Source on GitHub", href: "https://github.com/vsvidhun06-blip/WEV-SMT" },
          { label: "FSEN submission", href: "https://github.com/vsvidhun06-blip/WEV-SMT/tree/main/fsen2027-41" },
        ]}
      />

      <CaseBody toc={toc}>
        <CaseSection id="problem" n="01" title="Values out of thin air">
          <Prose>
            <p>
              Modern CPUs and compilers reorder memory operations. A memory model says which reorderings a program may
              observe. Make the model too strict and it forbids optimisations real hardware performs; too weak and it
              allows a value to appear &ldquo;out of thin air&rdquo;, justified only by a circular argument in which a
              load reads a value that a later store wrote because of that very load.
            </p>
            <p>
              <strong>WEAKEST</strong> forbids those cycles only when they go through a real dependency. The hard part
              is the word &ldquo;real&rdquo;. In <code>x = r + 1</code> the stored value depends on <code>r</code>. In{" "}
              <code>x = r ^ r ^ 1</code> it mentions <code>r</code> but is always 1. A checker that reads syntax treats
              them the same. WEV-SMT asks a 32-bit bitvector solver whether the stored value can change when the loaded
              value changes, and keeps only the dependencies that can.
            </p>
          </Prose>
        </CaseSection>

        <CaseSection id="explore" n="02" title="Explore executions" wide>
          <div className="mb-8 max-w-3xl">
            <Prose>
              <p>
                Each graph is one candidate execution for a classic litmus test. Choose a model to see its verdict. When a
                model forbids the outcome, the edges that form the forbidden cycle are highlighted. Hover an event to
                isolate its edges, and switch relations on and off underneath. Compare LB-fake with LB-real: the shape
                is identical, only the classification of the dependency edges changes.
              </p>
            </Prose>
          </div>
          <EventGraph />
          <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-[var(--fg-3)]">
            Verdicts are copied from the tool&apos;s own output: the atlas run for the classic shapes (it has no RC11
            column for LB and 2+2W) and LbProbe for the dependency pair. The explanations and the highlighted cycles are
            my reading of why each verdict holds.
          </p>
        </CaseSection>

        <CaseSection id="pipeline" n="03" title="How it works">
          <Prose>
            <p>
              A litmus file goes through a parser for five dialects (x86, PowerPC, ARM, RISC-V and C), then the checker
              enumerates candidate executions that can produce the asked-for outcome. For every syntactic dependency,
              the constancy oracle asks Z3 a QF_BV question: is there any pair of loaded values for which the stored
              value differs? If not, the edge is fake. Each model&apos;s consistency axioms are then encoded as SMT
              constraints over the surviving relations.
            </p>
          </Prose>
          <div className="mt-10">
            <Figure n="1" caption="One query from litmus file to verdict. The dependency step is what separates WEAKEST from a syntax-based check." evidence={<Evidence kind="illustrative">pipeline</Evidence>}>
              <Pipeline />
            </Figure>
          </div>
          <div className="mt-10 grid gap-6">
            <Shot
              src="/images/wev/lbprobe-paper-examples.webp"
              w={1348}
              h={230}
              alt="Terminal output of LbProbe on LB-real and LB-fake-xor-cycle"
              caption="LbProbe on the two load-buffering programs from the paper. LB-real is unreachable once its dependencies are honoured; for LB-fake-xor-cycle both edges are classified fake, and WEAKEST and RA allow the outcome."
              evidence={<Evidence kind="tool">terminal capture</Evidence>}
            />
          </div>
        </CaseSection>

        <CaseSection id="evidence" n="04" title="Proved, tested, not proved">
          <Prose>
            <p>
              Formal methods projects are easy to oversell, so the repository separates three kinds of claim, and so
              does this page.
            </p>
          </Prose>
          <div className="mt-8">
            <KeyList
              items={[
                {
                  t: "Proved in Isabelle/HOL",
                  d: (
                    <>
                      <span className="mb-2 block">
                        <Evidence kind="proved">four sessions, no sorry, no oracles</Evidence>
                      </span>
                      The dependency detector never drops a semantic dependency; it is exact on branch-free code; and
                      WEAKEST consistency rules out thin-air cycles. These hold relative to stated assumptions about the
                      oracle, and a further theory shows those assumptions hold for the concrete 32-bit expression
                      semantics. The FSEN results on composed summaries are mechanised too.
                    </>
                  ),
                },
                {
                  t: "Tested",
                  d: (
                    <>
                      <span className="mb-2 block">
                        <Evidence kind="tool">mvn test, AtlasReconstruct</Evidence>
                      </span>
                      135 JUnit tests covering the parser, encoder, axioms, edge cases and the F-01 counterexample, plus 5
                      corpus regressions that need the base artifact (140 in total). The model atlas compares six models
                      against expected verdicts on classic shapes: 190 cells, 190 matches. A separate Python reference
                      checker agrees on 44 of 44 dependency pairs, though it shares Z3, so that is support rather than
                      proof.
                    </>
                  ),
                },
                {
                  t: "Not proved",
                  d: "The Java code is not verified, and nothing links the Isabelle definitions to the encoder mechanically. Z3 is trusted: a “constant” verdict is only as good as its unsat answer. The theorems cover data dependencies in branch-free straight-line code; address and most control dependencies are outside them.",
                },
              ]}
            />
          </div>
          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            <Shot
              src="/images/wev/isabelle-build.webp"
              w={1288}
              h={438}
              alt="Isabelle build output for four sessions"
              caption="Clean build of the four Isabelle sessions, followed by the oracle and ancestry checks."
              evidence={<Evidence kind="tool">capture</Evidence>}
            />
            <Shot
              src="/images/wev/mvn-test.webp"
              w={1008}
              h={490}
              alt="Maven test summary per test class"
              caption="mvn test per test class. The corpus regressions are excluded here; with the base artifact they pass too."
              evidence={<Evidence kind="tool">capture</Evidence>}
            />
          </div>
        </CaseSection>

        <CaseSection id="correction" n="05" title="A defect I found after submitting">
          <Prose>
            <p>
              After the TACAS submission I found that the encoder&apos;s well-formedness constraints rejected some
              candidate executions that no model forbids (finding F-01). Over the corpus, 12 of 14,376 verdicts were
              wrong: three files, each under four models, all reported forbidden where allowed is correct. I fixed the
              encoder and the witness extractor, added a minimal counterexample as a test, and published a correction
              notice with the corrected totals rather than quietly replacing them.
            </p>
          </Prose>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <caption className="mb-3 text-left text-[13px] text-[var(--fg-3)]">Corpus verdicts, allowed / forbidden, from the artifact&apos;s correction notice</caption>
              <thead>
                <tr className="border-b border-[var(--line-2)]">
                  {["Model", "As submitted", "Corrected", "Change"].map((h) => (
                    <th key={h} className="py-2 pr-4 font-mono text-[11px] font-normal uppercase tracking-wider text-[var(--fg-3)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {f01.map((r) => (
                  <tr key={r.model} className="border-b border-[var(--line)]">
                    <td className="py-2.5 pr-4 font-mono text-[var(--fg)]">{r.model}</td>
                    <td className="tabular py-2.5 pr-4 text-[var(--fg-2)]">{r.sub}</td>
                    <td className="tabular py-2.5 pr-4 text-[var(--fg)]">{r.cor}</td>
                    <td className="tabular py-2.5 pr-4 text-[var(--fg-2)]">3 forbidden → allowed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Evidence kind="tool">CORRECTION-NOTICE.md, corrected-v1 artifact</Evidence>
          </div>
        </CaseSection>

        <CaseSection id="origin" n="06" title="Where it started">
          <Prose>
            <p>
              WEV-SMT grew out of my MSc dissertation, a JavaFX tool for stepping through executions under WEAKEST and
              comparing them across models, evaluated with a nine-person user study and graded Exceptional. Its event
              structure classes are still the library WEV-SMT builds on.
            </p>
            <p>
              The visualiser&apos;s own consistency checks were written for teaching and have known bugs, which is one
              reason the SMT checker exists. I show it here as a design artifact, not as a source of verdicts.
            </p>
          </Prose>
          <div className="mt-10 grid gap-6">
            <Shot
              src="/images/wev/visualiser-mp-execution-graph.webp"
              w={1383}
              h={780}
              alt="WEAKEST Execution Visualiser showing the execution graph of message passing"
              caption="The dissertation visualiser on the message passing test, showing an execution graph with program order, reads-from and coherence edges."
              evidence={<Evidence kind="tool">screenshot</Evidence>}
            />
          </div>
        </CaseSection>

        <CaseSection id="decisions" n="07" title="Decisions and trade-offs">
          <KeyList
            items={[
              { t: "SMT over enumeration", d: "Encoding consistency as constraints lets Z3 search candidate executions instead of enumerating them, and the same solver answers the dependency question. The cost is trusting Z3." },
              { t: "32-bit bitvectors", d: "Fixed-width semantics match what hardware computes, so overflow and xor cancellations behave as they really would. Wider types and floats are out of scope." },
              { t: "Branch-free first", d: "The theorems are clean for straight-line code. Control dependencies are kept conservatively by the front end rather than analysed, which can over-forbid but never under-forbid." },
              { t: "Exclude, do not patch", d: "Known front-end defects are excluded from the corpus with a stated reason, so every reported verdict comes from a path I trust." },
            ]}
          />
        </CaseSection>

        <CaseSection id="lessons" n="08" title="Lessons">
          <Prose>
            <p>
              Separating &ldquo;proved&rdquo;, &ldquo;tested&rdquo; and &ldquo;assumed&rdquo; in the README changed how I
              wrote the papers. It made the gaps visible, and the F-01 fix came from looking hard at one of them.
            </p>
            <p>
              The FSEN paper ends with a negative empirical result: across 2,250 litmus tests and eight upstream
              concurrency code bases, the composed cancellations the theory handles never appeared in a store&apos;s data
              dependencies. I reported it as the finding it is.
            </p>
          </Prose>
        </CaseSection>
      </CaseBody>
      <NextProject current="wev-smt" />
    </article>
  );
}

function Pipeline() {
  const steps = [
    ["Litmus file", "x86, PPC, ARM, RISC-V, C"],
    ["Parser", "threads, events, outcome"],
    ["Candidate executions", "rf and co choices"],
    ["Constancy oracle", "Z3, QF_BV, 32-bit"],
    ["Model encoding", "SC to RC11 axioms"],
    ["Z3", "sat or unsat"],
    ["Verdict", "allowed, with a witness"],
  ];
  const W = 900;
  const bw = 112;
  const gap = (W - 20 - steps.length * bw) / (steps.length - 1);
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} 170`} className="min-w-[680px]" role="img" aria-label={`Pipeline: ${steps.map((s) => s[0]).join(", then ")}.`}>
        <defs>
          <marker id="pl" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--fg-3)" />
          </marker>
        </defs>
        {steps.map(([t, s], i) => {
          const x = 10 + i * (bw + gap);
          const key = i === 3;
          return (
            <g key={t}>
              <rect x={x} y={40} width={bw} height={74} rx={8} fill="var(--bg)" stroke={key ? "var(--accent)" : "var(--line-2)"} />
              <foreignObject x={x + 8} y={46} width={bw - 16} height={64}>
                <div className="flex h-full flex-col justify-center">
                  <p className="font-mono text-[11.5px] leading-tight text-[var(--fg)]">{t}</p>
                  <p className="mt-1 font-mono text-[10px] leading-tight text-[var(--fg-3)]">{s}</p>
                </div>
              </foreignObject>
              {i < steps.length - 1 && <path d={`M${x + bw + 2} 77 L${x + bw + gap - 3} 77`} stroke="var(--fg-3)" strokeWidth={1.3} markerEnd="url(#pl)" />}
            </g>
          );
        })}
        <text x={10 + 3 * (bw + gap) + bw / 2} y={28} textAnchor="middle" className="fill-[var(--accent)] font-mono text-[11px]">
          fake edges removed here
        </text>
        <text x={10 + 4 * (bw + gap) + bw / 2} y={142} textAnchor="middle" className="fill-[var(--fg-3)] font-mono text-[10.5px]">
          once per model
        </text>
      </svg>
    </div>
  );
}
