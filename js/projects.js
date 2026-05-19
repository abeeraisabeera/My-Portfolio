/**
 * Fetches public repos from the GitHub API and merges with curated overrides
 * in data/projects.json (custom copy, tags, WIP items without repos).
 */
(function () {
  const GRID_ID = 'projectsGrid';
  const SUB_ID = 'projectsSub';
  const DEFAULT_USER = 'abeeraisabeera';

  const FALLBACK_CONFIG = {
    githubUsername: DEFAULT_USER,
    ignoreRepos: ['Portfolio', 'abeeraisabeera', 'nexus-project-tracker'],
    projects: [
      { repo: 'Pakistan_MutualFund_Intelligence', tags: ['ml', 'fintech'], category: 'Fintech · Forecasting', title: 'Pakistan Mutual Fund Intelligence Platform', highlight: null, description: 'Data science system to analyse, compare, and forecast mutual fund performance using ML and macroeconomic indicators.', stack: ['Python', 'Prophet', 'Scikit-learn'], status: null },
      { repo: 'Clio-Video-Recommendation-System', tags: ['ml'], category: 'ML · Recommendation', title: 'Clio — Video Recommendation System', highlight: null, description: 'Full-stack recommendation system using ALS collaborative filtering on the MovieLens 100K dataset.', stack: ['Python', 'ALS'], status: null },
      { repo: null, tags: ['wip', 'ml'], category: 'AI · Generative', title: 'Text-to-Video Generation Engine', highlight: null, description: 'Generative AI engine for converting structured text prompts into video sequences.', stack: ['Python', 'PyTorch'], status: 'In Progress' }
    ]
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatTitle(repoName) {
    return repoName.replace(/[-_]/g, ' ');
  }

  function inferTags(repo) {
    const tags = new Set();
    const topics = (repo.topics || []).map(t => t.toLowerCase());
    const mlTopics = ['machine-learning', 'ml', 'deep-learning', 'pytorch', 'tensorflow', 'nlp', 'ai'];
    const fintechTopics = ['fintech', 'finance', 'forecasting', 'trading'];
    if (topics.some(t => mlTopics.includes(t))) tags.add('ml');
    if (topics.some(t => fintechTopics.includes(t))) tags.add('fintech');
    if (topics.some(t => ['bi', 'dashboard', 'analytics', 'data-engineering'].includes(t))) tags.add('bi');
    if (!tags.size && ['Python', 'R', 'Jupyter Notebook'].includes(repo.language)) tags.add('ml');
    return [...tags];
  }

  function formatCategory(repo, curated) {
    if (curated?.category) return curated.category;
    if (repo.topics?.length) {
      return repo.topics.slice(0, 2).map(t => t.replace(/-/g, ' ')).join(' · ');
    }
    return repo.language || 'Open Source';
  }

  function buildStack(repo, curated) {
    if (curated?.stack?.length) return curated.stack;
    const stack = [];
    if (repo.language) stack.push(repo.language);
    (repo.topics || []).slice(0, 4).forEach(t => {
      const label = t.replace(/-/g, ' ');
      if (!stack.includes(label)) stack.push(label);
    });
    return stack;
  }

  function projectFromRepo(repo, curated) {
    return {
      repo: repo.name,
      tags: curated?.tags?.length ? curated.tags : inferTags(repo),
      category: formatCategory(repo, curated),
      title: curated?.title || formatTitle(repo.name),
      highlight: curated?.highlight ?? null,
      description: curated?.description || repo.description || 'Open-source project on GitHub.',
      stack: buildStack(repo, curated),
      status: curated?.status ?? null,
      updatedAt: repo.updated_at
    };
  }

  function projectFromCuratedOnly(curated) {
    return {
      repo: curated.repo,
      tags: curated.tags || [],
      category: curated.category || '',
      title: curated.title || 'Untitled',
      highlight: curated.highlight ?? null,
      description: curated.description || '',
      stack: curated.stack || [],
      status: curated.status ?? null
    };
  }

  async function fetchGitHubRepos(username) {
    const repos = [];
    let page = 1;

    while (true) {
      const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated&type=owner`;
      const res = await fetch(url, {
        headers: { Accept: 'application/vnd.github+json' }
      });

      if (res.status === 403) {
        const reset = res.headers.get('X-RateLimit-Reset');
        throw new Error('GitHub API rate limit reached. Try again later.');
      }
      if (!res.ok) throw new Error(`GitHub API error (${res.status})`);

      const batch = await res.json();
      if (!batch.length) break;
      repos.push(...batch.filter(r => !r.fork && !r.private));
      if (batch.length < 100) break;
      page += 1;
    }

    return repos;
  }

  function mergeProjects(config, githubRepos) {
    const username = config.githubUsername || DEFAULT_USER;
    const ignore = new Set(config.ignoreRepos || ['Portfolio', 'abeeraisabeera', 'nexus-project-tracker']);
    const curatedList = config.projects || [];
    const curatedByRepo = new Map();
    const orderedRepos = [];
    const wip = [];

    curatedList.forEach(p => {
      if (!p.repo) wip.push(p);
      else {
        curatedByRepo.set(p.repo, p);
        orderedRepos.push(p.repo);
      }
    });

    const ghByName = new Map(githubRepos.map(r => [r.name, r]));
    const merged = [];
    const seen = new Set();

    orderedRepos.forEach(repoName => {
      if (ignore.has(repoName)) return;
      const gh = ghByName.get(repoName);
      const curated = curatedByRepo.get(repoName);
      if (gh) {
        merged.push(projectFromRepo(gh, curated));
        seen.add(repoName);
      } else if (config.showOfflineCurated !== false && curated) {
        merged.push(projectFromCuratedOnly(curated));
        seen.add(repoName);
      }
    });

    githubRepos
      .filter(r => !ignore.has(r.name) && !seen.has(r.name))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .forEach(repo => {
        merged.push(projectFromRepo(repo, curatedByRepo.get(repo.name)));
        seen.add(repo.name);
      });

    wip.forEach(p => merged.push(projectFromCuratedOnly(p)));

    return { githubUsername: username, projects: merged };
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

  function showError(message) {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;
    grid.innerHTML = `<p class="projects-loading" role="alert">${escapeHtml(message)}</p>`;
  }

  function updateSubtitle(count, fromGitHub) {
    const sub = document.getElementById(SUB_ID);
    if (!sub) return;
    const label = count === 1 ? 'project' : 'projects';
    const source = fromGitHub ? ' · synced from GitHub' : '';
    sub.textContent = `${count} ${label} across ML, fintech, data engineering, and BI${source}`;
  }

  function renderAll(data, fromGitHub = false) {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    const username = data.githubUsername || DEFAULT_USER;
    const projects = data.projects || [];
    grid.replaceChildren();
    projects.forEach((p, i) => grid.appendChild(renderCard(p, username, i)));
    updateSubtitle(projects.length, fromGitHub);

    if (typeof window.initProjectFilters === 'function') window.initProjectFilters();
    if (typeof window.observeReveals === 'function') window.observeReveals(grid.querySelectorAll('.reveal'));
  }

  async function loadConfig() {
    try {
      const res = await fetch('data/projects.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch {
      return FALLBACK_CONFIG;
    }
  }

  async function load() {
    const config = await loadConfig();
    const username = config.githubUsername || DEFAULT_USER;
    const useGitHub = config.fetchFromGitHub !== false;

    if (!useGitHub) {
      renderAll({
        githubUsername: username,
        projects: (config.projects || []).map(projectFromCuratedOnly)
      });
      return;
    }

    try {
      const repos = await fetchGitHubRepos(username);
      renderAll(mergeProjects(config, repos), true);
    } catch (err) {
      console.warn('GitHub fetch failed, using projects.json only:', err);
      const fallback = mergeProjects(config, []);
      if (fallback.projects.length) {
        renderAll(fallback, false);
      } else {
        showError(err.message || 'Could not load projects.');
        renderAll(FALLBACK_CONFIG, false);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
