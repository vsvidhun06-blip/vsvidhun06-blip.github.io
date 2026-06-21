/**
 * Shared type definitions for the portfolio.
 *
 * All data files (`/data/*.ts`) import their types from this module so the
 * content layer has a single source of truth. Future phases (GitHub activity
 * dashboard, live metrics, publications) should extend these interfaces here
 * rather than redeclaring shapes locally.
 */

/** A featured project shown in the Projects section. */
export interface Project {
  /** Stable identifier used as a React key and scroll target. */
  id: string;
  /** Project name, e.g. "Mini-vLLM". */
  title: string;
  /** Short tagline shown under the title. */
  tagline: string;
  /** Long-form description paragraph. */
  description: string;
  /** Headline metrics rendered as badges. */
  metrics: string[];
  /** Technologies rendered as tech tags. */
  tech: string[];
  /** Public repository URL. May be a placeholder until published. */
  github: string;
  /** Optional live demo / deployment URL for future phases. */
  demo?: string;
}

/** A research output shown in the Research & Formal Methods section. */
export interface ResearchItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badges: string[];
  tech: string[];
  /** Optional link to a paper / preprint for future phases. */
  paperUrl?: string;
}

/** A single achievement within a role. */
export interface ExperienceAchievement {
  /** Headline metric rendered as a badge, e.g. "30% P95 latency reduction". */
  metric: string;
  /** Supporting description of how the metric was achieved. */
  description: string;
}

/** A professional role shown in the Experience section. */
export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  dates: string;
  achievements: ExperienceAchievement[];
}

/** An animated counting-up statistic in the Selected Impact section. */
export interface Stat {
  id: string;
  /** Numeric value used to drive the count-up animation. */
  value: number;
  /** Text rendered before the number, e.g. "" or "~". */
  prefix?: string;
  /** Text rendered after the number, e.g. "x", "%", "+". */
  suffix?: string;
  /** Number of decimal places to display (e.g. 1 for "7.4"). */
  decimals?: number;
  /** Label describing the statistic, e.g. "RoPE speedup". */
  label: string;
}

/** A named group of skills in the Skills section. */
export interface SkillCategory {
  title: string;
  skills: string[];
}
