import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopologyBackground } from "@/components/hero-topology-background";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Production origin. Drives canonical URLs and absolute OpenGraph/Twitter asset
 * paths, and must match the sitemap (`app/sitemap.ts`). Set to the GitHub Pages
 * user-site URL; change this if a custom domain is added later.
 */
const siteUrl = "https://vsvidhun06-blip.github.io";

const title = "Vidhun Vijayakumar Suja | Software Engineer";
const description =
  "MSc Software Engineering graduate specialising in LLM serving infrastructure, concurrent systems, and distributed platforms.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Vidhun Suja — Portfolio",
  authors: [{ name: "Vidhun Vijayakumar Suja" }],
  creator: "Vidhun Vijayakumar Suja",
  keywords: [
    "Vidhun Vijayakumar Suja",
    "Software Engineer",
    "LLM Infrastructure",
    "LLM serving",
    "Concurrent systems",
    "Distributed systems",
    "Formal methods",
    "Weak memory models",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "Vidhun Suja — Portfolio",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background text-text antialiased">
        {/*
         * Site-wide fixed topology background. The body's own background paints
         * behind its children, so this canvas (z-0) layers above the page colour
         * but below all content, which sits in the `relative z-10` wrapper.
         */}
        <TopologyBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
