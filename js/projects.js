/**
 * Loads curated projects from data/projects.json.
 * Optionally enriches listed repos via the GitHub API (descriptions stay curated-first).
 * Homepage renders curated entries only — no auto-dump of every public repo.
 */
(function () {
  const GRID_ID = 'projectsGrid';
  const SUB_ID = 'projectsSub';
  const DEFAULT_USER = 'abeeraisabeera';

  const FALLBACK = {
    githubUsername: DEFAULT_USER,
    projects: [
      { repo: 'Hydrosight', tags: ['ml', 'ai', 'featured'], category: 'AI Infra · Climate', title: 'HydroSight', highlight: 'FortyGuard Hackathon 2026 · Observe-first research prototype', description: 'Maps FortyGuard thermal conditions and models water/carbon tradeoffs for AI workloads with honest provenance labels.', stack: ['Next.js', 'FastAPI', 'FortyGuard'], status: null },
      { repo: 'TouchStone', tags: ['ml', 'fintech', 'featured'], category: 'Experimentation · Stats', title: 'TouchStone (Kasauti)', highlight: null, description: 'A/B experimentation workstation with synthetic datasets, statistical evaluation, and Product Analytics-style exports.', stack: ['Next.js', 'FastAPI', 'TypeScript'], status: null },
      { repo: 'FraudLab', tags: ['ml', 'fintech', 'featured'], category: 'Fraud · Explainability', title: 'FraudLab', highlight: null, description: 'Synthetic fraud scoring with explainable EBM models and ALLOW / REVIEW / BLOCK evidence.', stack: ['EBM', 'FastAPI', 'Next.js'], status: null },
      { repo: 'Tabnet_-_Conventional_Tabular_ML_Baselines', tags: ['ml', 'featured'], category: 'Tabular DL · Research', title: 'TabNet vs Tabular Baselines', highlight: null, description: 'Telco churn study comparing TabNet to LR, Random Forest, and XGBoost with interpretability focus.', stack: ['TabNet', 'XGBoost', 'Python'], status: null },
      { repo: 'Rag-Research-Assistant', tags: ['ml', 'ai', 'featured'], category: 'RAG · LLMs', title: 'RAG Research Assistant', highlight: null, description: 'PDF → embeddings → FAISS → Groq pipeline for grounded research Q&A.', stack: ['FAISS', 'Groq', 'Sentence-Transformers'], status: null }
    ]
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderCard(project, username, index) {
    const tags = (project.tags || []).join(' ');
    const url = project.repo ? `https://github.com/${username}/${project.repo}` : null;
    const delay = index > 0 ? ` reveal-delay-${Math.min(index, 3)}` : '';
    const tag = project.category
      ? `<span class="project-tag">${escapeHtml(project.category)}</span>`
      : '';
    const status = project.status
      ? `<span class="project-status">${escapeHtml(project.status)}</span>`
      : '<span class="project-arrow" aria-hidden="true">↗</span>';

    const el = url ? document.createElement('a') : document.createElement('article');
    el.className = `project-card reveal${delay}`;
    el.dataset.tags = tags;
    if (url) {
      el.href = url;
      el.target = '_blank';
      el.rel = 'noopener';
    } else {
      el.setAttribute('role', 'group');
    }

    el.innerHTML = [
      '<div class="project-meta">',
      tag,
      status,
      '</div>',
      `<div class="project-title">${escapeHtml(project.title)}</div>`,
      project.highlight ? `<div class="project-highlight">${escapeHtml(project.highlight)}</div>` : '',
      `<p class="project-desc">${escapeHtml(project.description)}</p>`,
      '<div class="project-stack">',
      (project.stack || []).map(s => `<span class="stack-tag">${escapeHtml(s)}</span>`).join(''),
      '</div>'
    ].join('');

    return el;
  }

  function updateSubtitle(count) {
    const sub = document.getElementById(SUB_ID);
    if (!sub) return;
    const label = count === 1 ? 'project' : 'projects';
    sub.textContent = `${count} curated ${label} in ML, AI systems, and applied research.`;
  }

  function renderAll(data) {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;
    const username = data.githubUsername || DEFAULT_USER;
    const projects = data.projects || [];
    grid.replaceChildren();
    projects.forEach((p, i) => grid.appendChild(renderCard(p, username, i)));
    updateSubtitle(projects.length);
    if (typeof window.initProjectFilters === 'function') window.initProjectFilters();
    if (typeof window.observeReveals === 'function') window.observeReveals(grid.querySelectorAll('.reveal'));
  }

  async function loadConfig() {
    try {
      const res = await fetch('data/projects.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch {
      return FALLBACK;
    }
  }

  async function enrichFromGitHub(config) {
    if (config.fetchFromGitHub === false) return config.projects || [];
    const username = config.githubUsername || DEFAULT_USER;
    const curated = config.projects || [];
    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`,
        { headers: { Accept: 'application/vnd.github+json' } }
      );
      if (!res.ok) return curated;
      const repos = await res.json();
      const byName = new Map(repos.map(r => [r.name, r]));
      return curated.map(p => {
        if (!p.repo || !byName.has(p.repo)) return p;
        const gh = byName.get(p.repo);
        return {
          ...p,
          description: p.description || gh.description || '',
          // Keep curated title/tags/stack; only fill blanks from GitHub
          stack: p.stack?.length ? p.stack : (gh.language ? [gh.language] : [])
        };
      });
    } catch {
      return curated;
    }
  }

  async function load() {
    const config = await loadConfig();
    const projects = await enrichFromGitHub(config);
    renderAll({
      githubUsername: config.githubUsername || DEFAULT_USER,
      projects
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
