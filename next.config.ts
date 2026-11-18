import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fully static export into out/ so the site can be hosted on GitHub Pages.
  output: "export",
  // GitHub Pages serves /path/ as /path/index.html.
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
