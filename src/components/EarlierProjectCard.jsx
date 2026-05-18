import { ArrowUpRight } from 'lucide-react';
import FadeInSection from './ui/FadeInSection';
import { TagGroup } from './ui/Tag';

/**
 * Compact card for older / secondary projects.
 * Smaller footprint than ProjectCard. No highlights bullets.
 * Designed to live in a 3-up grid below the main featured + selected work.
 */
export default function EarlierProjectCard({ project, delay = 0 }) {
  const isLink = !!project.github;
  const Wrapper = isLink ? 'a' : 'div';
  const wrapperProps = isLink
    ? { href: project.github, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <FadeInSection delay={delay}>
      <Wrapper
        {...wrapperProps}
        className="project-card block p-6 rounded-lg h-full group"
      >
        {/* Header */}
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <span className="font-mono text-[10px] text-amber-400 uppercase tracking-[0.2em]">
            {project.category}
          </span>
          <span className="font-mono text-[10px] text-cream-400">
            {project.period}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-2xl text-cream-100 transition-colors group-hover:text-amber-400 leading-tight mb-3">
          {project.title}
        </h3>

        {/* Description (compact) */}
        <p className="text-cream-300 text-sm leading-relaxed mb-5">
          {project.description}
        </p>

        {/* Tags */}
        <TagGroup tags={project.tags} />

        {/* Repo link if exists */}
        {isLink && (
          <p className="mt-4 text-[10px] text-amber-400 font-mono inline-flex items-center gap-1">
            view repo
            <ArrowUpRight
              size={10}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </p>
        )}
      </Wrapper>
    </FadeInSection>
  );
}
