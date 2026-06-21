"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { fadeUp, reducedVariants, viewportOnce } from "@/lib/motion";

const BIO =
  "MSc Software Engineering graduate from Heriot-Watt University, specialising in LLM serving infrastructure and concurrent systems. Built Mini-vLLM, a from-scratch inference engine featuring custom Triton GPU kernels, production serving architecture, and CARL, a contextual bandit controller for adaptive runtime optimisation.";

export function About() {
  const reduce = useReducedMotion();
  const variants = reduce ? reducedVariants : fadeUp;

  return (
    <Section id="about" ariaLabel="About">
      <SectionHeading eyebrow="About" title="Engineer, focused on systems that serve intelligence" />
      <motion.p
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mt-8 max-w-3xl text-lg leading-relaxed text-muted"
      >
        {BIO}
      </motion.p>
    </Section>
  );
}
