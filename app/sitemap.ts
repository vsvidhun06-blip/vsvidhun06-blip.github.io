import type { MetadataRoute } from "next";

/**
 * Minimal sitemap. Keep the base URL in sync with `metadataBase` in
 * `app/layout.tsx`. As future phases add routes (e.g. a publications page),
 * append entries here.
 */
const siteUrl = "https://vsvidhun06-blip.github.io";

// Required for `output: 'export'` — emit sitemap.xml as a static file at build.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
