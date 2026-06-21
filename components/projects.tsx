"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  staggerContainer,
  staggerItem,
  reducedVariants,
  viewportOnce,
} from "@/lib/motion";
import { projects } from "@/data/projects";
import type { Project } from "@/types";

export function Projects() {
  const reduce = useReducedMotion();
  const container = reduce ? reducedVariants : staggerContainer;
  const item = reduce ? reducedVariants : staggerItem;

  return (
    <Section id="projects" ariaLabel="Featured projects">
      <SectionHeading
        eyebrow="Featured Projects"
        title="From LLM systems to research to production"
      />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mt-12 grid gap-6 lg:grid-cols-3"
      >
        {projects.map((project) => (
          <motion.div key={project.id} variants={item} className="h-full">
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card interactive className="flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-text">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-muted">{project.tagline}</p>
        </div>
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${project.title} on GitHub`}
          className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:text-text"
        >
          <GitHubIcon />
        </a>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted">{project.description}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.metrics.map((metric) => (
          <Badge key={metric} variant="metric">
            {metric}
          </Badge>
        ))}
      </div>

      {/* Tech tags pinned to the bottom so cards of differing height align. */}
      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        {project.tech.map((tech) => (
          <Badge key={tech} variant="tech">
            {tech}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56v-1.95c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.03 11.03 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  );
}
