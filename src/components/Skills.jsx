import SectionHeading from './ui/SectionHeading';
import FadeInSection from './ui/FadeInSection';
import { TagGroup } from './ui/Tag';
import { skillGroups } from '../data/skills';

export default function Skills() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading number="05" title="stack" />

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          {skillGroups.map((group, i) => (
            <FadeInSection key={group.title} delay={(i % 2) * 0.1}>
              <h3 className="font-mono text-xs text-amber-400 uppercase tracking-[0.2em] mb-4 prompt">
                {group.title}
              </h3>
              <TagGroup tags={group.skills} />
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
