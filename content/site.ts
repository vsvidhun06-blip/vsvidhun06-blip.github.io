// Identity, links and contact details. Every value here was checked against the
// CV (OneDrive/Documents/Vidhun_Suja.pdf, 15 Nov 2026) or a public profile.
// Edit this file to change contact links site-wide.

export const site = {
  name: "Vidhun Vijayakumar Suja",
  shortName: "Vidhun Suja",
  initials: "VVS",
  role: "Software Engineer",
  focus: "AI infrastructure and systems research",
  location: "Edinburgh, UK",
  url: "https://www.vidhunsuja.com",
  description:
    "Software engineer in Edinburgh working on LLM inference engines, adaptive serving, weak memory models and SMT-based verification. MSc Software Engineering, Heriot-Watt University.",
  specialisations: [
    "LLM inference and serving",
    "Adaptive runtime control",
    "Weak memory and concurrency",
    "SMT and Isabelle/HOL",
    "Distributed backends",
  ],
  rightToWork: "UK Graduate Route visa, valid through October 2028",
  email: "vsvidhun06@gmail.com",
  resume: "/resume/Vidhun_Vijayakumar_Suja_CV.pdf",
  links: {
    github: "https://github.com/vsvidhun06-blip",
    linkedin: "https://www.linkedin.com/in/vidhun-suja",
    leetcode: "https://leetcode.com/u/VidhuViny/",
  },
} as const;

export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: "Work", href: "/#work" },
  { label: "Research", href: "/#research" },
  { label: "Archive", href: "/archive/" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];
