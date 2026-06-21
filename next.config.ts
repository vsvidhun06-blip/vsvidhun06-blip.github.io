import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Static HTML export — emits a fully static site into `out/` for GitHub Pages.
  output: "export",

  // GitHub Pages has no image optimisation server, so disable the Next.js
  // Image Optimization API. (No <Image> is used yet, but this keeps a future
  // <Image> compatible with the static export.)
  images: {
    unoptimized: true,
  },

  // This deploys to a *user* Pages repo (vsvidhun06-blip.github.io), which is
  // served from the domain root — so NO basePath / assetPrefix are needed.
  // (A project repo served from /<repo> would require them; this one does not.)
};

export default nextConfig;
