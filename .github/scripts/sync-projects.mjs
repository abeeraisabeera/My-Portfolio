/**
 * Fetches public repos for GITHUB_USERNAME and appends any missing entries
 * to data/projects.json. Existing curated fields are never overwritten.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const username = process.env.GITHUB_USERNAME || 'abeeraisabeera';
const ignore = new Set(
  (process.env.IGNORE_REPOS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
);
const dataPath = join(process.cwd(), 'data', 'projects.json');

const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-sync',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
};

async function fetchRepos() {
  const repos = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    if (!batch.length) break;
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return repos.filter(r => !r.fork && !r.private && !ignore.has(r.name));
}

function inferTags(topics, language) {
  const tags = new Set();
  const t = (topics || []).map(x => x.toLowerCase());
  if (t.some(x => ['machine-learning', 'ml', 'deep-learning', 'pytorch', 'tensorflow'].includes(x))) tags.add('ml');
  if (t.some(x => ['fintech', 'finance', 'forecasting'].includes(x))) tags.add('fintech');
  if (language === 'JavaScript' || t.includes('dashboard')) tags.add('bi');
  if (!tags.size && ['Python', 'R', 'Jupyter Notebook'].includes(language)) tags.add('ml');
  return [...tags];
}

const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const known = new Set(
  (data.projects || [])
    .map(p => p.repo)
    .filter(Boolean)
);

const remote = await fetchRepos();
let added = 0;

for (const repo of remote) {
  if (known.has(repo.name)) continue;
  data.projects.push({
    repo: repo.name,
    tags: inferTags(repo.topics, repo.language),
    category: repo.topics?.[0] || repo.language || 'Open Source',
    title: repo.name.replace(/[-_]/g, ' '),
    highlight: null,
    description: repo.description || 'New repository — add a curated description in projects.json.',
    stack: repo.language ? [repo.language] : [],
    status: null,
    _autoAdded: true
  });
  known.add(repo.name);
  added += 1;
}

data.githubUsername = username;
data.lastSynced = new Date().toISOString();

writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`Synced ${remote.length} repos; added ${added} new project(s).`);
