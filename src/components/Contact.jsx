import { Mail, Linkedin, Github, Code2 } from 'lucide-react';
import SectionHeading from './ui/SectionHeading';
import FadeInSection from './ui/FadeInSection';
import { contact } from '../data/experience';

const links = [
  {
    label: 'email',
    value: 'vsvidhun06@gmail.com',
    sub: 'usually replies within a day',
    href: `mailto:${contact.email}`,
    icon: Mail,
  },
  {
    label: 'linkedin',
    value: 'vidhun-suja',
    sub: 'based in edinburgh, scotland',
    href: contact.linkedin,
    icon: Linkedin,
  },
  {
    label: 'github',
    value: 'vsvidhun06-blip',
    sub: 'where the actual work lives',
    href: contact.github,
    icon: Github,
  },
  {
    label: 'leetcode',
    value: 'VidhuViny',
    sub: contact.leetcodeStats,
    href: contact.leetcode,
    icon: Code2,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading number="07" title="get in touch" />

        <FadeInSection>
          <p className="font-display text-3xl md:text-5xl leading-tight text-cream-300 mb-14 max-w-4xl text-balance">
            Looking for engineers who care about{' '}
            <span className="text-glow-amber italic">how things work</span>, not
            just <span className="italic">that they work</span>?
            <br />
            <span className="text-cream-100">Let's talk.</span>
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-3xl">
          {links.map(({ label, value, sub, href, icon: Icon }, i) => (
            <FadeInSection key={label} delay={i * 0.08}>
              <a
                href={href}
                target={label === 'email' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="project-card block p-6 rounded-xl group h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-mono text-[11px] text-cream-400 uppercase tracking-[0.2em] prompt">
                    {label}
                  </p>
                  <Icon
                    size={16}
                    className="text-cream-500 group-hover:text-amber-400 transition-colors"
                  />
                </div>
                <p className="font-display text-2xl md:text-3xl text-cream-100 group-hover:text-amber-400 transition-colors leading-tight mb-2">
                  {value}
                </p>
                <p className="text-[11px] text-cream-400 font-mono">{sub}</p>
              </a>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
