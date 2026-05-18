import { ArrowUpRight } from 'lucide-react';
import FadeInSection from './ui/FadeInSection';
import { TagGroup } from './ui/Tag';

export default function ProjectCard({ project, delay = 0 }) {
  const isLink = !!project.github;
  const Wrapper = isLink ? 'a' : 'div';
  const wrapperProps = isLink
    ? { href: project.github, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <FadeInSection delay={delay}>
      <Wrapper
        {...wrapperProps}
        className="project-card block p-8 rounded-xl h-full group"
      >
        {/* Header row */}
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <span className="font-mono text-[11px] text-amber-400 uppercase tracking-[0.2em]">
            {project.category}
          </span>
          <span className="font-mono text-[11px] text-cream-400">
            {project.period}
          </span>
        </div>

        {/* Title with hover arrow */}
        <h3 className="font-display text-3xl md:text-4xl mb-2 text-cream-100 transition-colors group-hover:text-amber-400 leading-tight">
          {project.title}
        </h3>

        {project.subtitle && (
          <p className="text-sm text-cream-400 mb-5 font-mono">
            {project.subtitle}
          </p>
        )}

        {/* Description */}
        <p className="text-cream-300 text-sm md:text-base leading-relaxed mb-6">
          {project.description}
        </p>

        {/* Highlights */}
        {project.highlights && (
          <ul className="text-sm text-cream-400 space-y-2 mb-6">
            {project.highlights.map((h, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span className="text-amber-400 font-mono shrink-0 mt-1">
                  →
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Tags */}
        <div className="mb-6">
          <TagGroup tags={project.tags} />
        </div>

        {/* Supervisor / repo link */}
        <div className="mt-6 pt-4 border-t border-cream-100/5 flex items-center justify-between flex-wrap gap-2">
          {project.supervisor && (
            <p className="text-[11px] text-cream-400 font-mono">
              {project.supervisor}
            </p>
          )}
          {isLink && (
            <p className="text-[11px] text-amber-400 font-mono inline-flex items-center gap-1 ml-auto">
              view repo
              <ArrowUpRight
                size={11}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </p>
          )}
        </div>
      </Wrapper>
    </FadeInSection>
  );
}
