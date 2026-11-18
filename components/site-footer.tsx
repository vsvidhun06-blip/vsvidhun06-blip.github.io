import Link from "next/link";
import { site } from "@/content/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="container-x grid gap-8 py-10 text-sm text-[var(--fg-3)] md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <p className="text-[var(--fg-2)]">{site.name}</p>
          <p>
            Built with Next.js, TypeScript and hand-drawn SVG. Each figure is labelled measured, tool output,
            simulated, illustrative or self-reported.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px]">
          <li>
            <a className="link-u" href={site.links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a className="link-u" href={site.links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="link-u" href={site.links.leetcode} target="_blank" rel="noopener noreferrer">
              LeetCode
            </a>
          </li>
          <li>
            <Link className="link-u" href="/archive/">
              Archive
            </Link>
          </li>
          <li>
            <a className="link-u" href={site.resume} target="_blank" rel="noopener">
              CV
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
