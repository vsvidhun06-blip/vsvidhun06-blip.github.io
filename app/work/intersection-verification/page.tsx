import type { Metadata } from "next";
import { CaseBody, CaseHeader, CaseSection, KeyList, NextProject, Prose } from "@/components/case";
import SpinRace from "@/components/spin-race";
import { Evidence, Figure } from "@/components/ui";

export const metadata: Metadata = {
  title: "Verified autonomous intersection",
  description: "A Promela model of an intersection protocol between autonomous vehicles and two controllers, verified with SPIN against LTL safety and liveness properties.",
  alternates: { canonical: "/work/intersection-verification/" },
};

const toc = [
  { id: "model", label: "The model" },
  { id: "properties", label: "Properties" },
  { id: "race", label: "Race conditions" },
  { id: "retro", label: "Looking back" },
];

const props = [
  { name: "safety_type1", f: "[] (last_response_type1 != LEFT && last_response_type1 != RIGHT)", d: "A private car is only ever told to go straight." },
  { name: "safety_type2", f: "[] (last_response_type2 != STRAIGHT && last_response_type2 != RIGHT)", d: "A bus is only ever told to turn left." },
  { name: "safety_type3", f: "[] (last_response_type3 != STRAIGHT)", d: "A robotaxi is never told to go straight." },
  { name: "liveness_typeN", f: "[] (typeN_request_pending -> <> !typeN_request_pending)", d: "Every pending request is eventually answered, for each of the three types." },
];

export default function Page() {
  return (
    <article>
      <CaseHeader
        kicker="Intersection verification"
        title={
          <>
            An intersection, <em>checked exhaustively</em>
          </>
        }
        lede={
          <p>
            Autonomous vehicles ask two controllers for permission to move. A model checker explores every interleaving
            of their messages to show that no vehicle is ever given a movement it is not allowed, and that no request
            waits forever.
          </p>
        }
        meta={[
          { label: "Context", value: "MSc coursework (F21RS), individual" },
          { label: "Date", value: "Dec 2025" },
          { label: "Size", value: "407-line Promela model, six processes" },
          { label: "Stack", value: "Promela, SPIN, LTL" },
        ]}
        links={[]}
      />
      <CaseBody toc={toc}>
        <CaseSection id="model" n="01" title="The model">
          <Prose>
            <p>
              Three kinds of vehicle have different rights. A private car may only go straight, a city bus may only turn
              left, and a robotaxi alternates right and left turns. Controller Alpha serves straight and right; Controller
              Beta serves left and cannot grant right turns. Vehicles send requests over bounded channels of capacity two
              and wait on their own response channel. A separate monitor process asserts the permission rules and the
              channel bounds in every state.
            </p>
          </Prose>
          <div className="mt-10">
            <Figure n="1" caption="Processes and channels. Each vehicle blocks on its response channel until a controller answers." evidence={<Evidence kind="illustrative">model structure</Evidence>}>
              <Channels />
            </Figure>
          </div>
        </CaseSection>

        <CaseSection id="properties" n="02" title="What SPIN checked">
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {props.map((p) => (
              <li key={p.name} className="grid gap-2 py-5 sm:grid-cols-[12rem_1fr] sm:gap-8">
                <span className="font-mono text-[13px] text-[var(--fg)]">{p.name}</span>
                <span>
                  <code className="block overflow-x-auto whitespace-pre font-mono text-[12.5px] text-[var(--accent)]">{p.f}</code>
                  <span className="mt-2 block text-[15px] text-[var(--fg-2)]">{p.d}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Prose>
              <p>
                The report records zero errors for the monitor&apos;s assertions, the three safety properties and the
                three liveness properties. The search stored 3,291 states with 9,382 transitions and reached depth 627.
                Progress labels on each vehicle loop support checking under weak fairness, so an unscheduled process is
                not mistaken for starvation.
              </p>
            </Prose>
            <div className="mt-4">
              <Evidence kind="tool">SPIN output, as recorded in the report</Evidence>
            </div>
          </div>
        </CaseSection>

        <CaseSection id="race" n="03" title="How an update gets lost" wide>
          <div className="mb-8 max-w-3xl">
            <Prose>
              <p>
                The second half of the report studies a shared counter of vehicles inside the intersection. An increment
                written as read, add, write can interleave so that two vehicles enter and the counter shows one. Try both
                schedules, then switch to the atomic version.
              </p>
            </Prose>
          </div>
          <SpinRace />
          <div className="mt-8 max-w-3xl">
            <KeyList
              items={[
                { t: "Atomic sections", d: "Wrapping the increment in atomic { } makes it one indivisible step for the model checker, so no interleaving can split it." },
                { t: "A channel as a lock", d: "A rendezvous channel of capacity zero forces a handshake before the critical section, which behaves like a mutex. It works, but adds states, so atomic sections are the simpler choice in a model." },
              ]}
            />
          </div>
        </CaseSection>

        <CaseSection id="retro" n="04" title="Looking back">
          <Prose>
            <p>
              Re-reading the report, the safety and liveness runs show identical search statistics. A liveness property
              needs SPIN&apos;s acceptance-cycle search with weak fairness (<code>pan -a -f</code>), which explores
              differently from a plain safety search, so I would now re-run the liveness checks explicitly in that mode
              and report their numbers separately. It is a small thing, and exactly the kind of thing I check first
              today.
            </p>
          </Prose>
        </CaseSection>
      </CaseBody>
      <NextProject current="intersection-verification" />
    </article>
  );
}

function Channels() {
  const box = (x: number, y: number, t: string, s: string, accent?: boolean) => (
    <g>
      <rect x={x - 80} y={y - 24} width={160} height={48} rx={8} fill="var(--bg)" stroke={accent ? "var(--accent)" : "var(--line-2)"} />
      <text x={x} y={y - 2} textAnchor="middle" className="fill-[var(--fg)] font-mono text-[12.5px]">
        {t}
      </text>
      <text x={x} y={y + 14} textAnchor="middle" className="fill-[var(--fg-3)] font-mono text-[10.5px]">
        {s}
      </text>
    </g>
  );
  const a = (d: string, c = "var(--fg-3)") => <path d={d} fill="none" stroke={c} strokeWidth={1.3} markerEnd="url(#sp)" />;
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 860 330" className="min-w-[620px]" role="img" aria-label="Vehicle types 1 and 3 send requests to Controller Alpha, types 2 and 3 to Controller Beta; controllers answer on per-type response channels; a safety monitor observes all of them.">
        <defs>
          <marker id="sp" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--fg-3)" />
          </marker>
        </defs>
        {box(110, 60, "Private car", "STRAIGHT only")}
        {box(110, 165, "Robotaxi", "RIGHT, LEFT, RIGHT…")}
        {box(110, 270, "City bus", "LEFT only")}
        {box(560, 100, "Controller Alpha", "STRAIGHT, RIGHT")}
        {box(560, 230, "Controller Beta", "LEFT only")}
        {box(770, 165, "Safety monitor", "asserts every state", true)}
        {a("M190 60 C 320 60, 380 90, 476 96")}
        {a("M190 160 C 320 150, 380 110, 476 104")}
        {a("M190 172 C 320 182, 380 220, 476 226")}
        {a("M190 270 C 320 270, 380 240, 476 234")}
        <text x={330} y={44} className="fill-[var(--c-long)] font-mono text-[10.5px]">
          request_alpha [2]
        </text>
        <text x={330} y={296} className="fill-[var(--c-long)] font-mono text-[10.5px]">
          request_beta [2]
        </text>
        <path d="M640 100 L 690 150" stroke="var(--line-2)" strokeDasharray="3 4" />
        <path d="M640 230 L 690 180" stroke="var(--line-2)" strokeDasharray="3 4" />
        <text x={480} y={282} className="fill-[var(--fg-3)] font-mono text-[10.5px]">
          answers on response_type1..3 [2]
        </text>
      </svg>
    </div>
  );
}
