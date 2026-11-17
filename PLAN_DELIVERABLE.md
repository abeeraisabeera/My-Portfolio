# Plan deliverable — portfolio restoration & upgrade

## 1. Summary of changes

- Restored local `main` to live GitHub (`origin/main` @ `fe94e82`) after backing up local edits to `_local_backup_pre_restore/` and git stash.
- Kept editorial identity (cream palette, Cormorant + Manrope, “I interrogate data until it confesses.”).
- Added featured **technical case studies** (static HTML for SEO crawlability).
- Curated homepage projects (no more dumping every public repo).
- Integrated **tsParticles** (MIT) as a subtle hero network animation.
- Added SEO foundation: meta, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`.
- Split styles into `css/portfolio.css` and interaction into `js/main.js`.

## 2. Files modified / added

| Path | Change |
|------|--------|
| `index.html` | Full presentation upgrade + case studies + SEO |
| `css/portfolio.css` | New stylesheet |
| `js/main.js` | Nav, reveals, case tabs, tsParticles |
| `js/projects.js` | Curated-first GitHub enrichment |
| `data/projects.json` | Featured project curation + ignore list |
| `robots.txt` | New |
| `sitemap.xml` | New |
| `.github/workflows/sync-projects.yml` | Expanded ignore list |
| `plan.md` | User plan (kept) |
| `PLAN_DELIVERABLE.md` | This summary |

## 3. Animation repository selected

**Selected:** [tsparticles/tsparticles](https://github.com/tsparticles/tsparticles) (MIT) via CDN `tsparticles@2.12.0`.

**Why:** Mature library, MIT licence, vanilla JS CDN, interactive linked particles that fit a data/ML network metaphor without overpowering typography. Disabled on mobile and `prefers-reduced-motion`.

**Strong alternatives considered (not used):**
- [DavidHDev/canvas-ui](https://github.com/DavidHDev/canvas-ui) — very recent/high-signal creative canvas; licence marked “Other”, heavier for a static portfolio.
- [pbakaus/radiant](https://github.com/pbakaus/radiant) — excellent MIT zero-dep shaders; stronger as a full shader gallery than a quiet hero backdrop.
- Classic [particles.js](https://github.com/VincentGarreau/particles.js) — popular but older/unmaintained relative to tsParticles.

## 4. Homepage projects & reasoning

| Project | Why featured |
|---------|----------------|
| **HydroSight** | Differentiator: climate-aware AI infra, provenance-first research prototype (FortyGuard Hackathon 2026). |
| **TouchStone** | Statistical foundations / A/B decisioning workstation. |
| **FraudLab** | Anomaly detection + responsible explainable evaluation (EBM + policy evidence). |
| **TabNet study** | Experimental ML vs conventional baselines on Telco churn. |
| **RAG Research Assistant** | Applied AI systems: retrieval-grounded LLM pipeline. |

Also curated in the projects grid (secondary): Parallel Genetic Algorithm, Clio, Pakistan Mutual Fund Intelligence.

## 5. Case studies

Static HTML case studies cover problem, motivation, approach, architecture diagrams, tech, limitations, and next iteration — sourced from repository READMEs. No invented metrics or deployments. HydroSight limitations (no measured WUE / not a scheduler) and FraudLab “synthetic / not a bank” caveats are explicit.

## 6. SEO checklist

- [x] Unique title + meta description
- [x] Canonical URL
- [x] Open Graph / Twitter cards
- [x] Heading hierarchy (one `h1`, section `h2`s, case `h3`s)
- [x] JSON-LD: `Person`, `WebSite`, `ProfilePage`, `SoftwareSourceCode`
- [x] `robots.txt` + `sitemap.xml`
- [x] Crawlable case-study content (not JS-only)
- [x] Internal hash links + sameAs GitHub/LinkedIn
- [ ] Google Search Console verification (you must add ownership meta/DNS)
- [ ] Confirm live Pages URL if different from `abeeraisabeera.github.io/My-Portfolio/`

## 7. Build / performance / accessibility

- Static site (no build step / no TypeScript).
- Async font loading; deferred scripts; particles capped + pauseOnBlur.
- Reduced-motion disables particles and reveal motion.
- Keyboard focus styles; hamburger ARIA; semantic sections/articles.
- Responsive breakpoints retained (desktop / tablet / mobile).

## 8. Remaining recommendations

1. Verify GitHub Pages base URL and update `canonical`, `sitemap.xml`, and `robots.txt` if using a custom domain.
2. Add Search Console verification + submit sitemap.
3. Optionally add OG image (`og:image`) once you have a branded screenshot.
4. Disable or further restrict the daily sync workflow if auto-appended repos keep polluting `projects.json`.
5. When TabNet README publishes full metric tables, add those numbers to the case study (currently qualitative by design).

**Not pushed to GitHub** — awaiting your explicit approval to commit/push.
