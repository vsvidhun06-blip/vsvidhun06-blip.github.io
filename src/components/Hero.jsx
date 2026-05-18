import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import MetricCard from './ui/MetricCard';
import { contact } from '../data/experience';

const heroMetrics = [
  { value: '3.27×', label: 'scheduler throughput' },
  { value: '2.0×', label: 'prefill speedup' },
  { value: '63.2%', label: 'prefix cache hit rate' },
  { value: '23+', label: 'parity tests passing' },
];

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-24 pb-24 relative overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="hero-orb w-[600px] h-[600px]"
        style={{ top: '-180px', right: '-120px' }}
      />
      <div
        className="hero-orb w-[500px] h-[500px]"
        style={{ bottom: '-200px', left: '-120px', animationDelay: '2s' }}
      />

      <motion.div
        className="max-w-6xl mx-auto px-6 relative z-10 w-full"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Location strip */}
        <motion.p
          variants={fadeUp}
          className="font-mono text-sm text-amber-400 mb-6 prompt"
        >
          {contact.location.toLowerCase()} · open to opportunities
        </motion.p>

        {/* Big serif name */}
        <motion.h1
          variants={fadeUp}
          className="font-display text-[3.5rem] sm:text-7xl lg:text-[7.5rem] leading-[0.92] tracking-tightest mb-8 text-balance"
        >
          Vidhun
          <br />
          <span className="italic text-cream-300">Vijayakumar</span> Suja
          <span className="cursor-blink" />
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          className="text-xl md:text-2xl text-cream-300 max-w-3xl leading-relaxed text-balance"
        >
          Building{' '}
          <span className="text-glow-amber font-display italic">
            LLM serving infrastructure
          </span>{' '}
          with deep foundations in{' '}
          <span className="text-glow-amber font-display italic">
            concurrent systems
          </span>
          .
        </motion.p>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-sm md:text-base text-cream-400 mt-4 font-mono"
        >
          MSc Software Engineering · Heriot-Watt University · June 2026
        </motion.p>

        {/* Metric strip */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mt-12"
        >
          {heroMetrics.map((m) => (
            <MetricCard key={m.label} value={m.value} label={m.label} />
          ))}
        </motion.div>

        {/* CTA strip */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-12"
        >
          <a
            href="#work"
            className="text-cream-300 hover:text-amber-400 transition-colors text-sm font-mono inline-flex items-center gap-2 group"
          >
            <ArrowDown
              size={14}
              className="group-hover:translate-y-0.5 transition-transform"
            />
            explore work
          </a>
          <span className="text-cream-500 text-sm font-mono">·</span>
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream-300 hover:text-amber-400 transition-colors text-sm font-mono inline-flex items-center gap-1.5"
          >
            github.com/vsvidhun06-blip
            <ArrowUpRight size={12} />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
