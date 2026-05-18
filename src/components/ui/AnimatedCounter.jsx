import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Animates a numeric value from 0 to target when scrolled into view.
 * Handles integers, decimals, and units (×, %).
 *
 * Examples:
 *   <AnimatedCounter value="3.27×" />     → counts 0 to 3.27, appends ×
 *   <AnimatedCounter value="63.2%" />     → counts 0 to 63.2, appends %
 *   <AnimatedCounter value="23+" />       → counts 0 to 23, appends +
 *   <AnimatedCounter value="37.5%" />     → counts 0 to 37.5, appends %
 */
export default function AnimatedCounter({
  value,
  duration = 1800,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayed, setDisplayed] = useState('0');

  // Parse value into number + suffix
  const match = String(value).match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const isDecimal = String(target).includes('.');

  useEffect(() => {
    if (!isInView) return;

    let frameId;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      if (isDecimal) {
        setDisplayed(current.toFixed(target % 1 === 0 ? 0 : (target < 10 ? 2 : 1)));
      } else {
        setDisplayed(Math.round(current).toString());
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayed(String(target));
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, target, duration, isDecimal]);

  return (
    <span ref={ref} className={className}>
      {displayed}
      {suffix}
    </span>
  );
}
