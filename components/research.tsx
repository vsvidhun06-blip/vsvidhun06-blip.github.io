"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeUp, reducedVariants, viewportOnce } from "@/lib/motion";
import { research } from "@/data/research";

/**
 * Research & Formal Methods. Deliberately distinct from Projects (centred
 * eyebrow, accent rule, larger card) because it is the strongest differentiator.
 */
export function Research() {
  const reduce = useReducedMotion();
  const variants = reduce ? reducedVariants : fadeUp;

  return (
    <Section id="research" ariaLabel="Research and formal methods" className="bg-surface/30">
      <SectionHeading
        eyebrow="Research & Formal Methods"
        title="Decidable thin-air detection for weak memory"
        description="Formal-methods research sits at the core of this work — a dedicated track, not a side project."
      />

      <div className="mt-12 space-y-8">
        {research.map((item) => (
          <motion.div
            key={item.id}
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <Card className="relative overflow-hidden p-8 sm:p-10">
              {/* Left accent rail to set the research track apart visually. */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-muted/40 to-transparent"
              />
              <h3 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-muted">{item.subtitle}</p>

              <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">
                {item.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {item.badges.map((badge) => (
                  <Badge key={badge} variant="metric">
                    {badge}
                  </Badge>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {item.tech.map((tech) => (
                  <Badge key={tech} variant="tech">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
