import { leetcode } from "@/content/leetcode";
import { site } from "@/content/site";
import { RankBars } from "@/components/charts";
import { Arrow, Reveal, SectionHeader } from "@/components/ui";

export default function LeetCode() {
  const { solved, available } = leetcode;
  const diffs = [
    { name: "Easy", n: solved.easy, of: available.easy },
    { name: "Medium", n: solved.medium, of: available.medium },
    { name: "Hard", n: solved.hard, of: available.hard },
  ];
  return (
    <section id="problem-solving" aria-labelledby="lc-title" className="container-x mt-32 sm:mt-40">
      <SectionHeader
        id="lc-title"
        index="06"
        label="Problem solving"
        title={<>Mostly mediums, <em>all in Java</em></>}
        intro={
          <p>
            A snapshot of my public LeetCode profile, taken on {leetcode.snapshotDate}. LeetCode has no stable public
            API, so these numbers are cached rather than live.
          </p>
        }
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <Reveal className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6 sm:p-8 lg:col-span-5">
          <p className="eyebrow">Solved</p>
          <p className="tabular display mt-4 text-[6.5rem] leading-none">{solved.total}</p>
          <p className="mt-2 text-sm text-[var(--fg-3)]">problems · {leetcode.language} for every one</p>

          {/* One segmented bar: share of solved problems by difficulty. */}
          <div className="mt-10 flex h-3 gap-[2px] overflow-hidden rounded-[4px]" role="img" aria-label={`Easy ${solved.easy}, Medium ${solved.medium}, Hard ${solved.hard}`}>
            {diffs.map((d, i) => (
              <span
                key={d.name}
                className="h-full"
                style={{
                  width: `${(d.n / solved.total) * 100}%`,
                  background: ["var(--c-shared)", "var(--c-chat)", "var(--c-long)"][i],
                }}
              />
            ))}
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-4">
            {diffs.map((d, i) => (
              <div key={d.name}>
                <dt className="flex items-center gap-2 text-sm text-[var(--fg-2)]">
                  <span className="h-2 w-2 rounded-full" style={{ background: ["var(--c-shared)", "var(--c-chat)", "var(--c-long)"][i] }} aria-hidden />
                  {d.name}
                </dt>
                <dd className="tabular mt-1 text-2xl text-[var(--fg)]">{d.n}</dd>
                <dd className="font-mono text-[11px] text-[var(--fg-3)]">of {d.of.toLocaleString("en-GB")}</dd>
              </div>
            ))}
          </dl>
          <a href={site.links.leetcode} target="_blank" rel="noopener noreferrer" className="link-u mt-10 inline-flex items-center gap-2 text-sm">
            Full profile on LeetCode <Arrow dir="up-right" />
          </a>
        </Reveal>

        <Reveal delay={0.08} className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6 sm:p-8 lg:col-span-7">
          <p className="eyebrow">Most practised topics</p>
          <p className="mt-2 text-sm text-[var(--fg-3)]">Problems solved per tag. A problem can carry several tags.</p>
          <div className="mt-6">
            <RankBars rows={leetcode.topics.map((t) => ({ label: t.name, value: t.solved }))} unit="solved" colorVar="var(--c-long)" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
