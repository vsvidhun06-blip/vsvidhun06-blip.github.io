"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { skillAreas } from "@/content/skills";
import { projects } from "@/content/projects";
import { SectionHeader } from "@/components/ui";

const projectBySlug = new Map(projects.map((p) => [p.slug, p]));

export default function Skills() {
  const [areaId, setAreaId] = useState(skillAreas[0]!.id);
  const [skill, setSkill] = useState<string | null>(null);
  const area = skillAreas.find((a) => a.id === areaId)!;
  const selected = area.skills.find((s) => s.name === skill) ?? null;
  const evidence = selected
    ? selected.projects
    : Array.from(new Set(area.skills.flatMap((s) => s.projects)));

  return (
    <section id="skills" aria-labelledby="skills-title" className="container-x mt-32 sm:mt-40">
      <SectionHeader
        id="skills-title"
        index="05"
        label="Skills"
        title={<>Skills, each with <em>a receipt</em></>}
        intro={<p>Pick an area, then a skill, to see which projects actually use it.</p>}
      />
      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        <div role="tablist" aria-label="Skill areas" aria-orientation="vertical" className="flex gap-2 overflow-x-auto pb-2 lg:col-span-4 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
          {skillAreas.map((a, i) => (
            <button
              key={a.id}
              role="tab"
              id={`tab-${a.id}`}
              aria-selected={a.id === areaId}
              aria-controls="skill-panel"
              onClick={() => {
                setAreaId(a.id);
                setSkill(null);
              }}
              onKeyDown={(e) => {
                const idx = skillAreas.findIndex((x) => x.id === areaId);
                const next = e.key === "ArrowDown" || e.key === "ArrowRight" ? idx + 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? idx - 1 : null;
                if (next === null) return;
                e.preventDefault();
                const target = skillAreas[(next + skillAreas.length) % skillAreas.length]!;
                setAreaId(target.id);
                setSkill(null);
                document.getElementById(`tab-${target.id}`)?.focus();
              }}
              tabIndex={a.id === areaId ? 0 : -1}
              className={`group flex shrink-0 items-baseline gap-4 whitespace-nowrap rounded-full border px-4 py-2 text-left text-sm transition-colors lg:rounded-none lg:border-0 lg:border-t lg:px-0 lg:py-4 lg:text-lg ${
                a.id === areaId
                  ? "border-[var(--fg)] text-[var(--fg)] lg:border-[var(--line)]"
                  : "border-[var(--line-2)] text-[var(--fg-3)] hover:text-[var(--fg-2)] lg:border-[var(--line)]"
              }`}
            >
              <span className="hidden font-mono text-[11px] lg:inline">0{i + 1}</span>
              <span className="flex-1">{a.title}</span>
              <span className={`hidden h-px w-8 bg-[var(--accent)] transition-opacity lg:block ${a.id === areaId ? "opacity-100" : "opacity-0"}`} aria-hidden />
            </button>
          ))}
        </div>

        <div id="skill-panel" role="tabpanel" aria-labelledby={`tab-${areaId}`} className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div key={areaId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <p className="max-w-xl text-[16px] leading-relaxed text-[var(--fg-2)]">{area.blurb}</p>
              <ul className="mt-8 flex flex-wrap gap-2" aria-label={`${area.title} skills`}>
                {area.skills.map((s) => (
                  <li key={s.name}>
                    <button
                      type="button"
                      aria-pressed={skill === s.name}
                      onClick={() => setSkill((cur) => (cur === s.name ? null : s.name))}
                      className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                        skill === s.name
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--fg)]"
                          : "border-[var(--line-2)] text-[var(--fg-2)] hover:border-[var(--fg-3)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {s.name}
                      <span className="ml-2 font-mono text-[11px] text-[var(--fg-3)]">{s.projects.length || "·"}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6" aria-live="polite">
                <p className="eyebrow">{selected ? `Where “${selected.name}” shows up` : `Projects behind ${area.title.toLowerCase()}`}</p>
                {selected?.note && <p className="mt-3 text-sm text-[var(--fg-2)]">{selected.note}</p>}
                {evidence.length > 0 ? (
                  <ul className="mt-4 divide-y divide-[var(--line)]">
                    {evidence.map((slug) => {
                      const p = projectBySlug.get(slug);
                      if (!p) return null;
                      return (
                        <li key={slug}>
                          <Link href={p.caseStudy ?? `/archive/#${p.slug}`} className="group flex items-baseline justify-between gap-4 py-3">
                            <span className="text-[var(--fg)] transition-colors group-hover:text-[var(--accent)]">{p.title}</span>
                            <span className="text-right font-mono text-[11px] text-[var(--fg-3)]">{p.kind}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  !selected?.note && <p className="mt-3 text-sm text-[var(--fg-3)]">No public project yet.</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
