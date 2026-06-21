"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  staggerContainer,
  staggerItem,
  fadeUp,
  reducedVariants,
  viewportOnce,
} from "@/lib/motion";
import { experience } from "@/data/experience";

export function Experience() {
  const reduce = useReducedMotion();
  const header = reduce ? reducedVariants : fadeUp;
  const container = reduce ? reducedVariants : staggerContainer;
  const item = reduce ? reducedVariants : staggerItem;

  return (
    <Section id="experience" ariaLabel="Experience">
      <SectionHeading eyebrow="Experience" title="Where the work shipped" />

      <div className="mt-12 space-y-12">
        {experience.map((role) => (
          <div key={role.id}>
            <motion.div
              variants={header}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-text">
                  {role.role}
                </h3>
                <p className="mt-1 text-base text-muted">{role.company}</p>
              </div>
              <p className="text-sm text-muted">{role.dates}</p>
            </motion.div>

            <motion.ul
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              {role.achievements.map((achievement) => (
                <motion.li key={achievement.metric} variants={item}>
                  <Card interactive className="h-full p-6">
                    <Badge variant="metric">{achievement.metric}</Badge>
                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      {achievement.description}
                    </p>
                  </Card>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
