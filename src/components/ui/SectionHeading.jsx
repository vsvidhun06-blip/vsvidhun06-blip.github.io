import FadeInSection from './FadeInSection';

/**
 * Numbered section heading: "01. currently building"
 * Includes optional right-side metadata (e.g., date range).
 */
export default function SectionHeading({ number, title, meta }) {
  return (
    <FadeInSection className="flex items-baseline justify-between flex-wrap gap-4 mb-16">
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
        <span className="font-mono text-amber-400 text-xl md:text-2xl mr-3 align-middle">
          {number}.
        </span>
        {title}
      </h2>
      {meta && (
        <span className="font-mono text-xs text-cream-400 hidden md:block">{meta}</span>
      )}
    </FadeInSection>
  );
}
