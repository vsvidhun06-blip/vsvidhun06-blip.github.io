"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import {
  staggerContainer,
  staggerItem,
  reducedVariants,
  viewportOnce,
} from "@/lib/motion";
import { skills } from "@/data/skills";

export function Skills() {
  const reduce = useReducedMotion();
  const container = reduce ? reducedVariants : staggerContainer;
  const item = reduce ? reducedVariants : staggerItem;

  return (
    <Section id="skills" ariaLabel="Skills">
      <SectionHeading eyebrow="Skills" title="The toolkit, by domain" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {skills.map((category) => (
          <motion.div key={category.title} variants={item}>
            <Card className="h-full p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                {category.title}
              </h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <li key={skill}>
                    <span className="inline-flex cursor-default rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted transition-colors duration-200 hover:border-muted/50 hover:text-text">
                      {skill}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
