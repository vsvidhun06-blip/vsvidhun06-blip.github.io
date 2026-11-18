import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/archive/", ...projects.filter((p) => p.caseStudy).map((p) => p.caseStudy!)];
  return pages.map((p) => ({ url: `${site.url}${p}`, lastModified: new Date("2026-11-18") }));
}
