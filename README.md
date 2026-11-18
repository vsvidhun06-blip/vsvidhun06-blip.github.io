# vidhun-portfolio

Personal site of Vidhun Vijayakumar Suja. Next.js App Router, exported as static files for GitHub Pages.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (Node 20+; built with Node 22) |
| `npm run dev` | Dev server at http://localhost:3000 |
| `npm run build` | Static export to `out/`, then `scripts/flatten-rsc.mjs` (postbuild) |
| `npm start` | Serve `out/` at http://localhost:3000 |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run check:copy` | Fails on em dashes or double hyphens in user-facing text (run after build) |
| `python scripts/check-links.py` | Internal links and anchors in `out/` (run after build) |
| `npm run assets` | Converts `assets-src/**/*.png` into WebP under `public/images/` |
| `node scripts/capture.mjs <url> <out.png> [w] [h] [wait] [full] [mobile] [scrollY]` | Screenshots through local Chrome (env `EVAL` runs JS first) |

## Where things live

- `content/` holds every fact on the site as typed data: `site.ts`, `projects.ts`, `research.ts`, `journey.ts`, `skills.ts`, `leetcode.ts`, `results.ts` (measured numbers, each with its source file), `litmus.ts` (tool verdicts). Edit these, not the components, to change text or numbers.
- `components/inference/` is the serving-engine simulator (`sim.ts`) and its SVG view. It is a teaching model with a made-up cost model, and it is labelled Simulated wherever it appears.
- `components/event-graph.tsx`, `ecommerce-explorer.tsx`, `spin-race.tsx`, `charts.tsx` are the other interactive figures.
- `public/demos/winter-cabin/` is the WebGPU coursework build, loaded on request.
- `app/` has the routes: `/`, `/archive/`, and five case studies under `/work/`.

## Evidence labels

Every figure carries one: Measured (from a committed log or results file), Tool output, Machine-checked, Simulated, Illustrative, or Self-reported. Keep that rule when adding content.

## Updating

- Publication decided: change `status` in `content/research.ts` (`Accepted`, `Published`).
- LeetCode: update `content/leetcode.ts` and its `snapshotDate`.
- New project: append to `content/projects.ts`; it appears in the archive and the command menu automatically.
