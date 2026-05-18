# Portfolio v2 — Deploy Guide

Modern React + Vite + Tailwind + Framer Motion portfolio. Production-ready, ~96 KB gzipped, auto-deploys to GitHub Pages on push to `main`.

---

## 1. Preview locally first (recommended)

```powershell
cd C:\path\to\portfolio-react
npm install
npm run dev
```

Opens at `http://localhost:5173`. Scroll through, check responsiveness, verify everything looks right before deploying.

---

## 2. Deploy to your existing GitHub Pages repo

Your repo is `vsvidhun06-blip/vsvidhun06-blip.github.io`. Two options:

### Option A — Using Claude Code (recommended)

Open Claude Code in your project folder and paste:

```
I have a new portfolio at /mnt/user-data/outputs/portfolio-react/. It's a React + Vite project that needs to deploy to my GitHub Pages repo at https://github.com/vsvidhun06-blip/vsvidhun06-blip.github.io.

Tasks:
1. Clone https://github.com/vsvidhun06-blip/vsvidhun06-blip.github.io into a fresh local folder
2. Delete all files in that clone (except .git/)
3. Copy ALL files from /mnt/user-data/outputs/portfolio-react/ into the cloned repo (including .github/ folder for the GitHub Actions workflow)
4. Run `npm install` in the cloned repo to generate package-lock.json
5. git add -A
6. git commit -m "Redesign portfolio v2: React + Vite + Tailwind, custom dark theme"
7. git push to main
8. Show me git log --oneline -3

After push, the GitHub Actions workflow at .github/workflows/deploy.yml will auto-build and deploy. Confirm I need to set GitHub Pages Source to "GitHub Actions" in repo Settings.
```

### Option B — Manually in PowerShell

```powershell
# 1. Clone your portfolio repo (or pull latest if you already have it)
cd C:\dev
git clone https://github.com/vsvidhun06-blip/vsvidhun06-blip.github.io.git portfolio-repo
cd portfolio-repo

# 2. Remove existing files (keep .git/)
Get-ChildItem -Exclude .git | Remove-Item -Recurse -Force

# 3. Copy new project files in
xcopy /E /Y "C:\path\to\portfolio-react\*" .

# 4. Install dependencies (for local dev — the deploy workflow runs npm ci on its own)
npm install

# 5. Commit and push
git add -A
git commit -m "Redesign portfolio v2: React + Vite + Tailwind, custom dark theme"
git push
```

---

## 3. Enable GitHub Actions deployment (one-time setup)

1. Go to `https://github.com/vsvidhun06-blip/vsvidhun06-blip.github.io/settings/pages`
2. Under **Build and deployment** → **Source**, select **GitHub Actions**
3. Save

The first push will trigger the workflow at `.github/workflows/deploy.yml`. Builds + deploys in ~2 minutes. Subsequent pushes redeploy automatically.

---

## 4. Verify the live site

After ~2 minutes, visit `https://vsvidhun06-blip.github.io`. You should see:

- **Hero**: big serif name, 4 animated metric cards counting up (3.27×, 2.0×, 63.2%, 23+)
- **01. currently building**: large Mini-vLLM card with 4 metrics including 37.5% spec decode acceptance
- **02. selected work**: WEV Dissertation + E-commerce Microservices (2-column grid)
- **03. earlier work**: C# Web Browser + Document Tracker + Driver Drowsiness (3-column grid, compact)
- **04. about**: bio + experience/education timeline with hover effects
- **05. stack**: 6 skill categories with monospace tags
- **06. get in touch**: 4 contact link cards with icons
- **Footer**: copyright line

---

## 5. After deploy — verify the resume link works

The resume PDF is at `/Vidhun_Suja_Resume.pdf` in the project. Click the "resume" button in the nav and confirm the PDF opens.

If you update the resume later: drop the new `Vidhun_Suja_Resume.pdf` into `public/`, commit, push, done.

---

## What's different from v1

Old portfolio (the HTML file you uploaded):
- 5 projects (AI Resume Analyzer + 4 others)
- Lighter aesthetic
- Static, less interactive

New portfolio (v2):
- 3 main projects + 3 earlier-work cards
- **AI Resume Analyzer dropped** (commodity API wrapper, weakens AI infra signal)
- **CONCUR 2026 reference removed** (not selected)
- Custom "engineer's lab notebook" aesthetic — dark off-black, warm cream typography, sharp amber accents
- Distinctive Instrument Serif display font
- Scroll-triggered Framer Motion animations
- Animated metric counters
- Production component architecture (data-driven, reusable, easy to extend)
- 96 KB gzipped, loads in ~500ms

---

## Editing later

**Add a project**: edit `src/data/projects.js`. To make it earlier-work (compact card), add `secondary: true`.

**Update metrics**: edit values in `src/data/projects.js` (Mini-vLLM has both hero metrics and inline metrics).

**Change colors**: edit `tailwind.config.js` color tokens, or search/replace `#ffb627` (the amber accent).

**Update bio/contact**: edit `src/data/experience.js`.

Everything is data-driven — components don't need editing for content changes.

---

## Troubleshooting

**Site shows 404 after deploy**: GitHub Pages Source not set to "GitHub Actions" — check repo Settings → Pages.

**Build fails in Actions**: Check that `package-lock.json` is committed (the workflow uses `npm ci` which requires it).

**Animations don't trigger**: Open browser DevTools, check console for errors. Framer Motion needs JS enabled.

**Resume PDF 404**: Verify `public/Vidhun_Suja_Resume.pdf` is committed and present in `dist/` after build.
