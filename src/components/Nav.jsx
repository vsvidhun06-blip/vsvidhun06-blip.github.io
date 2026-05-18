import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const links = [
  { href: '#work', label: 'work' },
  { href: '#about', label: 'about' },
  { href: '#contact', label: 'contact' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'nav-blur border-b border-cream-100/5 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a
          href="#"
          className="font-mono text-sm tracking-tight text-cream-100 hover:text-amber-400 transition-colors"
        >
          <span className="text-amber-400">vs</span>/vidhun-suja
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="link-underline text-cream-300 hover:text-cream-100 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/Vidhun_Suja_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            resume
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </a>
        </div>

        <a
          href="/Vidhun_Suja_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden px-3 py-1.5 bg-amber-400 text-ink-900 rounded text-sm font-medium"
        >
          cv
        </a>
      </div>
    </motion.nav>
  );
}
