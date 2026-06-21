/**
 * Tiny class-name combiner. Filters out falsy values so conditional classes can
 * be written inline without pulling in a dependency.
 *
 * @example cn("px-4", isActive && "text-text", !isActive && "text-muted")
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Navigation / section anchors. Shared by the navbar and section components. */
export const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#impact", label: "Impact" },
  { href: "#research", label: "Research" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
] as const;

/** Path to the résumé asset in `/public`. Single source of truth for links. */
export const RESUME_PATH = "/Vidhun_Suja_Resume.pdf";

/** Canonical social / contact links, reused by the hero, contact, and footer. */
export const SOCIAL_LINKS = {
  github: "https://github.com/vsvidhun06-blip",
  linkedin: "https://linkedin.com/in/vidhun-suja",
  email: "vsvidhun06@gmail.com",
} as const;

/** Validates an email address with a pragmatic (not RFC-exhaustive) pattern. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
