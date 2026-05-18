import { motion } from 'framer-motion';

/**
 * Reveals children with a fade + upward translate when scrolled into view.
 * Uses Framer Motion's `whileInView` for performance (one-time trigger).
 */
export default function FadeInSection({
  children,
  delay = 0,
  duration = 0.8,
  y = 24,
  className = '',
  as: Component = 'div',
  once = true,
  amount = 0.2,
}) {
  const MotionComp = motion[Component] || motion.div;

  return (
    <MotionComp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionComp>
  );
}
