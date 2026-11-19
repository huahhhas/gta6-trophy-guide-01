// Leonida Trophy Guide — tracker + guide for the 55 GTA VI trophies.
// Loads app/data/trophies.json, renders the checklist, roadmap and filters.
// Progress lives in localStorage; export/import move it as a JSON file.
// No network at run time: the only fetch is the trophy data file beside this script.
const KEY = 'gta6-trophy-guide-progress-v1';
const params = new URLSearchParams(location.search);

const ROADMAP = [
  { title: 'Story first — Chapters 1–5', text: 'Play the campaign through. Chapter trophies, mission trophies and the final mission all pop as you go. Do Lucia\u2019s balcony meditation before you leave Chapter 1.' },
  { title: 'Stranger strands', text: 'Finish the five side-character finals (Andy, Kenton, Billy, Randy, Tyrone), Bret\u2019s hunt and the other stranger strands — 8 in all. Their chains have windows tied to story progress, so start them when they appear.' },
  { title: 'Activities', text: 'Shooting range golds, drone races, races, fishing, arcade games, bowling, meditation spots and stunts. Dip into each activity type once for Master of None.' },
  { title: 'Robberies & free roam', text: 'Shops, bank vaults, armored trucks, gang operations, the tank, the airliner, Combat Focus and the money trophies. Robbery content opens in Chapters 3–4.' },
  { title: 'Collectibles & cleanup', text: 'Cards, WAiNK scans, vehicles, areas, garages, marked bills and challenges — then the 100% checklist for A Long Road, and the Platinum pops right after.' },
];

const KIND_LABELS = { all: 'All', story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', platinum: 'Platinum', online: 'Online' };

let doc;
let earned = new Set();
let kind = 'all';
let grade = 'all';
let spoiler = false;
let earnedOnly = false;
let query = '';
let openId = null;

const listEl = document.getElementById('list');
const statsEl = document.getElementById('stats');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const listCount = document.getElementById('listCount');
const listTitle = document.getElementById('listTitle');

function load() {
  try { earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { earned = new Set(); }
}
function save() { localStorage.setItem(KEY, JSON.stringify([...earned])); }

function seedDemo() {
  // Fixed demo set for screenshots: a plausible early-game checklist.
  earned = new Set([2, 3, 8, 21, 46, 53].map(String));
  save();
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function isHidden(t) { return spoiler && t.kind === 'story' && !earned.has(String(t.id)); }

function renderStats() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of doc.trophies) counts[t.grade]++;
  statsEl.innerHTML = [
    `55 trophies · ${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`,
    '28 hidden until earned',
    '1 missable',
    'No online trophies',
    '~200 hours to platinum',
  ].map((s) => `<span class="chip-stat">${esc(s)}</span>`).join('');
}

function renderRoadmap() {
  const stagesEl = document.getElementById('stages');
  stagesEl.innerHTML = ROADMAP.map((s, i) => {
    const n = doc.trophies.filter((t) => t.stage === i + 1).length;
    return `<li><b>${esc(s.title)} — ${n} trophies</b><p>${esc(s.text)}</p></li>`;
  }).join('');
}

function renderChips() {
  const chipsEl = document.getElementById('kindChips');
  const kinds = ['all', 'story', 'missable', 'collectibles', 'activities', 'platinum', 'online'];
  chipsEl.innerHTML = '';
  for (const k of kinds) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = KIND_LABELS[k];
    b.setAttribute('aria-pressed', String(kind === k));
    b.addEventListener('click', () => { kind = k; renderChips(); renderList(); });
    chipsEl.append(b);
  }
}

function visible(t) {
  if (kind === 'online') return false;
  if (kind !== 'all' && t.kind !== kind) return false;
  if (grade !== 'all' && t.grade !== grade) return false;
  if (earnedOnly && !earned.has(String(t.id))) return false;
  if (query) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function renderList() {
  const shown = doc.trophies.filter(visible);
  listCount.textContent = `${shown.length} of ${doc.trophies.length} shown · ${earned.size} earned`;
  listTitle.textContent = kind === 'all' ? 'All 55 trophies' : `${KIND_LABELS[kind]} trophies`;
  listEl.innerHTML = '';
  if (kind === 'online') {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No online trophies: every one of the 55 is single-player, so the Platinum needs no online play. (KeenGamer, OutputLag.)';
    listEl.append(p);
    return;
  }
  if (!shown.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No trophies match these filters.';
    listEl.append(p);
    return;
  }
  for (const t of shown) {
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(String(t.id)) ? ' earned' : '') + (openId === t.id ? ' open' : '');
    const hidden = isHidden(t);
    const top = document.createElement('div');
    top.className = 'card-top';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(String(t.id));
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(String(t.id)); else earned.delete(String(t.id));
      save();
      renderProgress();
      renderList();
    });
    const main = document.createElement('div');
    main.className = 'card-main';
    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = hidden ? `Hidden story trophy #${t.id}` : t.name;
    if (hidden) {
      const tag = document.createElement('span');
      tag.className = 'hidden-tag';
      tag.textContent = ' — earn it to reveal (spoilers hidden)';
      name.append(tag);
    }
    const desc = document.createElement('div');
    desc.className = 'card-desc';
    desc.textContent = hidden ? 'Story trophy — name and description hidden until earned.' : t.description;
    main.append(name, desc);
    const badges = document.createElement('div');
    badges.className = 'badges';
    const gb = document.createElement('span');
    gb.className = `badge ${t.grade}`;
    gb.textContent = t.grade;
    badges.append(gb);
    const kb = document.createElement('span');
    kb.className = 'badge kind';
    kb.textContent = KIND_LABELS[t.kind] ?? t.kind;
    badges.append(kb);
    if (t.missable) {
      const mb = document.createElement('span');
      mb.className = 'badge miss';
      mb.textContent = 'Missable';
      badges.append(mb);
    }
    top.append(box, main, badges);
    top.addEventListener('click', () => { openId = openId === t.id ? null : t.id; renderList(); });
    card.append(top);
    const guide = document.createElement('div');
    guide.className = 'card-guide';
    const gp = document.createElement('p');
    gp.textContent = t.guide;
    guide.append(gp);
    const src = document.createElement('p');
    src.className = 'src';
    src.textContent = 'Sources: ';
    (t.sources ?? []).forEach((s, i) => {
      if (i) src.append(document.createTextNode(' · '));
      if (s.url) {
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        a.target = '_blank';
        a.rel = 'noopener';
        src.append(a);
      } else {
        src.append(document.createTextNode(s.name));
      }
    });
    guide.append(src);
    const hint = document.createElement('p');
    hint.className = 'toggle-hint';
    hint.textContent = 'Click the trophy to open or close its guide. Tick the box when you earn it — progress is saved in this browser.';
    guide.append(hint);
    card.append(guide);
    listEl.append(card);
  }
}

function renderProgress() {
  const pct = Math.round((earned.size / doc.trophies.length) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${earned.size} of ${doc.trophies.length} earned · ${pct}% to the platinum`;
}

function renderAll() {
  renderStats();
  renderRoadmap();
  renderChips();
  renderProgress();
  renderList();
}

document.getElementById('search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); renderList(); });
document.getElementById('grade').addEventListener('change', (e) => { grade = e.target.value; renderList(); });
document.getElementById('spoiler').addEventListener('change', (e) => { spoiler = e.target.checked; renderList(); });
document.getElementById('earnedOnly').addEventListener('change', (e) => { earnedOnly = e.target.checked; renderList(); });
document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned].map(Number).sort((x, y) => x - y))], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const ids = JSON.parse(await file.text());
    earned = new Set(ids.map(String));
    save();
    renderProgress();
    renderList();
  } catch { alert('That file is not a progress export from this guide.'); }
});
document.getElementById('reset').addEventListener('click', () => {
  earned = new Set();
  save();
  renderProgress();
  renderList();
});

load();
doc = await (await fetch('data/trophies.json')).json();

// Screenshot modes (?shot=cover|roadmap|guide|spoiler) and demo seeding (?demo=1).
if (params.get('demo') === '1') seedDemo();
if (params.get('spoiler') === '1') { spoiler = true; document.getElementById('spoiler').checked = true; }
if (params.get('guide')) openId = Number(params.get('guide'));
if (params.get('kind')) { kind = params.get('kind'); }
const shot = params.get('shot');
if (shot === 'cover') { openId = 1; document.body.classList.add('shot-cover'); }
if (shot === 'guide') { openId = 28; kind = 'missable'; document.body.classList.add('shot-guide'); }
if (shot === 'spoiler') { spoiler = true; document.getElementById('spoiler').checked = true; kind = 'story'; document.body.classList.add('shot-spoiler'); }
if (shot === 'roadmap') { document.body.classList.add('shot-roadmap'); }
renderAll();
