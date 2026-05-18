import AnimatedCounter from './AnimatedCounter';

/**
 * Compact metric card with animated counter and label.
 * Variants:
 *   - 'hero'  → large amber numbers, full card with border
 *   - 'inline' → smaller, used inside the featured project card
 */
export default function MetricCard({ value, label, sub, variant = 'hero' }) {
  if (variant === 'inline') {
    return (
      <div className="border-l-2 border-amber-400 pl-4">
        <div className="font-display text-3xl text-cream-100 leading-none">
          <AnimatedCounter value={value} />
        </div>
        <div className="text-[11px] text-cream-400 font-mono uppercase tracking-wider mt-2 leading-tight">
          {label}
          {sub && (
            <>
              <br />
              <span className="text-cream-500">{sub}</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="metric-card p-5 rounded">
      <div className="font-display text-4xl md:text-5xl text-amber-400 leading-none">
        <AnimatedCounter value={value} />
      </div>
      <div className="text-[11px] text-cream-400 mt-3 font-mono uppercase tracking-wider leading-tight">
        {label}
      </div>
    </div>
  );
}
