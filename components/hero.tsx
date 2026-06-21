"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/motion";
import { RESUME_PATH } from "@/lib/utils";

const ROLES = [
  "Software Engineer",
  "LLM Infrastructure Engineer",
  "AI Systems Researcher",
];

const SUBTITLE =
  "Building LLM inference systems, concurrent runtimes, and distributed platforms.";

/**
 * Full-screen hero.
 * - Typewriter cycles through {@link ROLES}; with reduced motion it shows the
 *   first role statically (no looping animation).
 * - The interactive canvas LLM-serving topology now renders site-wide from the
 *   root layout (see `TopologyBackground`), so the Hero no longer owns it.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const role = useTypewriter(ROLES, !reduce);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const item = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
      };

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-5 sm:px-8"
    >
      {/* Static ambient vignette for depth (site-wide topology lives in layout). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(250,250,250,0.04),transparent_60%)]"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto w-full max-w-6xl"
      >
        <motion.p
          variants={item}
          className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-muted"
        >
          MSc Software Engineering — Heriot-Watt University
        </motion.p>

        <motion.h1
          variants={item}
          className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-text sm:text-6xl lg:text-7xl"
        >
          Vidhun Vijayakumar Suja
        </motion.h1>

        <motion.div
          variants={item}
          className="mt-6 flex min-h-[2.25rem] items-center text-xl font-medium text-muted sm:text-2xl"
          aria-live="polite"
        >
          <span className="text-text">{role}</span>
          <Caret animate={!reduce} />
        </motion.div>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
        >
          {SUBTITLE}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap gap-3">
          <Button as="a" href="#projects" variant="primary">
            View Projects
          </Button>
          <Button as="a" href="#contact" variant="secondary">
            Contact Me
          </Button>
          <Button as="a" href={RESUME_PATH} download variant="ghost">
            Download Resume
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Caret({ animate }: { animate: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        "ml-1 inline-block h-6 w-[2px] translate-y-[2px] bg-text sm:h-7" +
        (animate ? " animate-pulse" : "")
      }
    />
  );
}

/**
 * Typewriter that types a phrase, pauses, deletes, then advances to the next.
 * When `enabled` is false (reduced motion), it returns the first phrase and
 * never animates.
 */
function useTypewriter(phrases: string[], enabled: boolean): string {
  const [text, setText] = useState(enabled ? "" : phrases[0]);

  useEffect(() => {
    if (!enabled) {
      setText(phrases[0]);
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = phrases[phraseIndex];
      charIndex += deleting ? -1 : 1;
      setText(current.slice(0, charIndex));

      let delay = deleting ? 45 : 90;

      if (!deleting && charIndex === current.length) {
        delay = 1600; // pause at full word
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 350; // pause before next word
      }

      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [phrases, enabled]);

  return text;
}
