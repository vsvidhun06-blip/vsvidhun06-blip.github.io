import SectionHeading from './ui/SectionHeading';
import FeaturedProject from './FeaturedProject';
import ProjectCard from './ProjectCard';
import EarlierProjectCard from './EarlierProjectCard';
import {
  getFeaturedProject,
  getMainProjects,
  getSecondaryProjects,
} from '../data/projects';

export default function Work() {
  const featured = getFeaturedProject();
  const main = getMainProjects();
  const secondary = getSecondaryProjects();

  return (
    <>
      {/* Featured project */}
      <section id="work" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            number="01"
            title="latest work"
            meta={featured?.period?.toLowerCase()}
          />
          {featured && <FeaturedProject project={featured} />}
        </div>
      </section>

      <div className="hairline max-w-6xl mx-auto" />

      {/* Main selected work */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading number="02" title="selected work" />
          <div className="grid md:grid-cols-2 gap-6">
            {main.map((p, i) => (
              <ProjectCard key={p.id} project={p} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Earlier work (only renders if exists) */}
      {secondary.length > 0 && (
        <>
          <div className="hairline max-w-6xl mx-auto" />
          <section className="py-24 md:py-32">
            <div className="max-w-6xl mx-auto px-6">
              <SectionHeading
                number="03"
                title="earlier work"
                meta="msc coursework · b.tech project"
              />
              <div className="grid md:grid-cols-3 gap-5">
                {secondary.map((p, i) => (
                  <EarlierProjectCard key={p.id} project={p} delay={i * 0.08} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
