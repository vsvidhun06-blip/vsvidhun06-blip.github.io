# Vidhun Suja — Portfolio

Personal portfolio site. Built with React 18, Vite 5, Tailwind CSS, and Framer Motion. Single-page application with scroll-triggered animations and a custom "engineer's lab notebook" visual identity.

Live: [vsvidhun06-blip.github.io](https://vsvidhun06-blip.github.io)

## Stack

- **React 18** — UI framework
- **Vite 5** — build tool and dev server
- **Tailwind CSS 3** — styling
- **Framer Motion** — animations and scroll-triggered reveals
- **Lucide React** — icons
- **GitHub Pages** — hosting, with auto-deploy via GitHub Actions

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Hot reload enabled.

## Production build

```bash
npm run build       # outputs to dist/
npm run preview     # serve the production build locally at :4173
```

Bundle size: ~96 KB gzipped (React + Framer Motion + app code).

## Architecture

```
src/
├── main.jsx              ← entry point
├── App.jsx               ← composes all sections
├── index.css             ← global styles + design tokens
├── components/
│   ├── Nav.jsx           ← sticky blurred navigation
│   ├── Hero.jsx          ← landing section with animated metrics
│   ├── FeaturedProject.jsx    ← large Mini-vLLM card
│   ├── ProjectCard.jsx        ← main project cards (WEV, e-commerce)
│   ├── EarlierProjectCard.jsx ← compact cards (B.Tech + MSc coursework)
│   ├── Work.jsx          ← wraps featured + main + earlier
│   ├── About.jsx         ← bio + experience/education timeline
│   ├── Skills.jsx        ← grouped skill tags
│   ├── Contact.jsx       ← link cards with icons
│   ├── Footer.jsx
│   └── ui/
│       ├── FadeInSection.jsx   ← scroll-triggered reveal wrapper
│       ├── AnimatedCounter.jsx ← number-counts-up animation
│       ├── SectionHeading.jsx  ← numbered section headers
│       ├── MetricCard.jsx      ← stat cards (two variants)
│       └── Tag.jsx             ← monospace pill + group helper
└── data/
    ├── projects.js       ← project objects (add new ones here)
    ├── skills.js         ← skill groups by category
    └── experience.js     ← work, education, contact info
```

### Design system

Defined in `tailwind.config.js` and `src/index.css`:

- **Colors**: `ink-{900-500}` (dark backgrounds), `cream-{50-500}` (off-white text), `amber-{50-700}` (accent)
- **Fonts**: Instrument Serif (display), Inter (body), JetBrains Mono (code)
- **Components**: `.tag`, `.btn-primary`, `.btn-secondary`, `.project-card`, `.featured-card`, `.metric-card`, `.hairline`, `.prompt`, `.cursor-blink`

### Adding a new project

Edit `src/data/projects.js`:

```js
{
  id: 'unique-id',
  title: 'Project Name',
  subtitle: 'Short tagline',
  period: 'Month Year — Month Year',
  category: 'category · subcategory',
  description: 'One paragraph describing the project.',
  highlights: ['bullet 1', 'bullet 2'],
  tags: ['tech', 'stack', 'tags'],
  stack: 'comma · separated · stack · summary',
  github: 'https://github.com/...',  // optional
  // featured: true,  // uncomment to make this the featured (large) project
}
```

The first project with `featured: true` becomes the hero card. All others render in the grid below.

### Adding/removing skill groups

Edit `src/data/skills.js` — straightforward array of `{title, skills: []}` objects.

### Updating bio, experience, education, contact

Edit `src/data/experience.js`.

## Deployment

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that auto-builds and deploys on every push to `main`.

### First-time deploy setup

1. Push this repo's contents to `vsvidhun06-blip.github.io`
2. Go to repo Settings → Pages
3. Under "Build and deployment", set Source to **GitHub Actions**
4. Push to `main` — the workflow will run and deploy automatically
5. Site goes live at `https://vsvidhun06-blip.github.io` (1-2 mins after first push)

### Subsequent updates

Just edit, commit, push. The workflow auto-deploys.

## Resume PDF

The current resume lives at `public/Vidhun_Suja_Resume.pdf`. Replace this file to update the download in the nav.

## License

Personal portfolio — please don't copy directly. Inspiration welcome.
