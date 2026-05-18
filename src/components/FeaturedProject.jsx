import { ArrowUpRight } from 'lucide-react';
import FadeInSection from './ui/FadeInSection';
import MetricCard from './ui/MetricCard';
import { TagGroup } from './ui/Tag';
import SchedulerViz from './SchedulerViz';

export default function FeaturedProject({ project }) {
  return (
    <FadeInSection className="featured-card rounded-2xl p-8 md:p-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono text-[11px] text-amber-400 uppercase tracking-[0.2em] mb-3">
            featured project · {project.category}
          </p>
          <h3 className="font-display text-4xl md:text-6xl lg:text-7xl mb-3 leading-none">
            {project.title}
          </h3>
          <p className="font-mono text-xs text-cream-400 mb-6">
            {project.period}
          </p>
          <p className="text-cream-200 text-base md:text-lg max-w-2xl leading-relaxed">
            {project.description}
          </p>
        </div>

        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary whitespace-nowrap mt-2"
          >
            view repo
            <ArrowUpRight size={14} />
          </a>
        )}
      </div>

      {/* Metric grid */}
      {project.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {project.metrics.map((m) => (
            <MetricCard
              key={m.label}
              variant="inline"
              value={m.value}
              label={m.label}
              sub={m.sub}
            />
          ))}
        </div>
      )}

      {/* Interactive scheduler simulation — only for Mini-vLLM */}
      {project.id === 'mini-vllm' && <SchedulerViz />}

      {/* Highlights bullets */}
      {project.highlights && (
        <ul className="space-y-3 mb-8">
          {project.highlights.map((h, i) => (
            <li
              key={i}
              className="flex gap-3 text-cream-300 text-sm md:text-base leading-relaxed"
            >
              <span className="text-amber-400 font-mono shrink-0 mt-1">→</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Tags */}
      <div className="mb-8">
        <TagGroup tags={project.tags} />
      </div>

      {/* Stack */}
      <div className="pt-6 border-t border-cream-100/5">
        <p className="font-mono text-[11px] text-cream-400 uppercase tracking-[0.2em] mb-2">
          stack
        </p>
        <p className="font-mono text-xs md:text-sm text-cream-300">
          {project.stack}
        </p>
      </div>
    </FadeInSection>
  );
}
