import SectionHeading from './ui/SectionHeading';
import FadeInSection from './ui/FadeInSection';
import { experience, education } from '../data/experience';

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading number="04" title="about" />

        <div className="grid md:grid-cols-3 gap-12">
          {/* Bio (2/3) */}
          <FadeInSection className="md:col-span-2">
            <p className="text-cream-100 text-xl md:text-3xl leading-relaxed font-display mb-8 text-balance">
              I'm a software engineer focused on the systems layer of AI — how
              models are served, scheduled, batched, and made fast enough to be
              useful at scale.
            </p>
            <div className="space-y-5 text-cream-300 text-base leading-relaxed">
              <p>
                My MSc dissertation explored how programmers reason about
                concurrent executions under weak memory models — the kind of
                low-level reasoning that underpins lock-free data structures,
                GPU programming, and ultimately how systems like vLLM achieve
                their throughput. Building Mini-vLLM was the natural next step:
                taking those concurrency foundations and applying them to the
                most interesting systems problem of the moment.
              </p>
              <p>
                Before the MSc, I worked as a Full-Stack Software Engineer at
                Kompetenzen Technologies in India, shipping production
                Java/Spring Boot modules — tuning thread pools, reducing P95
                latency by 30%, and learning what production-grade backend
                engineering actually demands.
              </p>
              <p>
                Outside of work, I play football, compete in PUBG eSports, and
                play chess. I currently live in Edinburgh and am open to
                graduate engineering roles in AI infrastructure and distributed
                systems.
              </p>
            </div>
          </FadeInSection>

          {/* Timeline (1/3) */}
          <FadeInSection delay={0.2}>
            {/* Experience */}
            <h3 className="font-mono text-xs text-amber-400 uppercase tracking-[0.2em] mb-6 prompt">
              experience
            </h3>
            {experience.map((e) => (
              <div
                key={e.org}
                className="mb-8 border-l-2 border-cream-100/10 pl-5 hover:border-amber-400 transition-colors"
              >
                <div className="font-mono text-[11px] text-cream-400 mb-1.5">
                  {e.period}
                </div>
                <h4 className="font-display text-xl text-cream-100 mb-1 leading-tight">
                  {e.title}
                </h4>
                <p className="text-sm text-cream-300 mb-3">
                  {e.org}, {e.location}
                </p>
                {e.metrics && (
                  <div className="space-y-1 mt-3">
                    {e.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="font-mono text-[11px] text-cream-400"
                      >
                        <span className="text-amber-400">{m.value}</span>{' '}
                        {m.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Education */}
            <h3 className="font-mono text-xs text-amber-400 uppercase tracking-[0.2em] mb-6 mt-10 prompt">
              education
            </h3>
            {education.map((ed) => (
              <div
                key={ed.school}
                className="mb-6 border-l-2 border-cream-100/10 pl-5 hover:border-amber-400 transition-colors"
              >
                <div className="font-mono text-[11px] text-cream-400 mb-1.5">
                  {ed.period}
                </div>
                <h4 className="font-display text-xl text-cream-100 mb-1 leading-tight">
                  {ed.degree}
                </h4>
                <p className="text-sm text-cream-300">
                  {ed.school}
                  <br />
                  <span className="text-cream-400">{ed.location}</span>
                </p>
              </div>
            ))}
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
