import SectionHeading from './ui/SectionHeading';
import FadeInSection from './ui/FadeInSection';
import GitHubActivity from './GitHubActivity';

export default function GitHubSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          number="06"
          title="commit activity"
          meta="live · auto-updated"
        />
        <FadeInSection>
          <p className="text-cream-300 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
            Live snapshot of my GitHub activity. The graphs below pull
            directly from public repos and refresh on every page load —
            no stale stats.
          </p>
          <GitHubActivity />
        </FadeInSection>
      </div>
    </section>
  );
}
