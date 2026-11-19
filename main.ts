// Leonida Trophy Guide — a gta6-trophy-guide-01 entry (Node 22, standard library only).
// The guide is this directory's app/ folder: plain static files a browser opens at
// app/index.html (ES modules, CSS, no build step), offline: it loads nothing over the
// network, and its trophy list and guides are app/data/trophies.json — 55 official
// trophies, each with a guide in our own words that cites its sources, a roadmap to
// the platinum, and a tracker saved in the browser. The program hands it in: it copies
// app/ and screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads (your screenshots, the first load's files and bytes, and
// your source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts as
// it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Guard: the trophy file is the entry's data — refuse to hand in an entry whose
// 55 trophies are not all named with a non-blank guide (the gate's trophies row).
const trophyData = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8'));
const trophyList = Array.isArray(trophyData) ? trophyData : trophyData.trophies;
if (!Array.isArray(trophyList) || trophyList.length !== 55) throw new Error(`expected 55 trophies, found ${Array.isArray(trophyList) ? trophyList.length : 'no list'}`);
for (const t of trophyList) {
  if (typeof t.name !== 'string' || !t.name.trim()) throw new Error('a trophy has no name');
  if (typeof t.guide !== 'string' || !t.guide.trim()) throw new Error(`trophy "${t.name}" has no guide`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Guard: the screenshots are the judge's view of the guide — hand in 3 or 4,
// each a whole PNG or JPEG within the gate's 256 KiB cap, or refuse loudly.
import { readdirSync, statSync } from 'node:fs';
const shotDir = join(here, 'screenshots');
const shots = readdirSync(shotDir).filter((f) => !f.startsWith('.') && statSync(join(shotDir, f)).isFile());
if (shots.length < 3 || shots.length > 4) throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
for (const f of shots) {
  const size = statSync(join(shotDir, f)).size;
  if (size > 262144) throw new Error(`screenshot ${f} is ${size} bytes, over the 256 KiB cap`);
  if (!/\.(png|jpe?g)$/i.test(f)) throw new Error(`screenshot ${f} is not a PNG or JPEG`);
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
