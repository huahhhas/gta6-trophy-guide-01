# Leonida Trophy Guide — GTA VI, all 55 trophies

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/huahhhas/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/huahhhas/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for the 55 PlayStation 5 trophies of **Grand Theft Auto VI** — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01). [Join make.fun with my referral link](https://make.fun/r/4bs5ey91).

## What it is

Open `app/index.html` in a desktop browser (or `node serve.ts` and visit http://localhost:8080). It works with the network off: every file it loads lives under `app/`, and nothing is fetched at run time except the trophy data file beside the app.

- **All 55 trophies** with their official name, description and grade as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden until earned).
- **A guide for every trophy, in our own words, that cites its sources** — KeenGamer, OutputLag, EGamers (PowerPyx, GTABase, TechWiser), GTAVibes, GTAViceCityHub and u7buy. Where a method was still unconfirmed at launch (19 November 2026), the guide says so instead of guessing.
- **A roadmap to the platinum** in five stages, built from the official descriptions — about 200 hours, one playthrough, no online trophies.
- **One trophy can be missed: Positive Mental Attitude.** The first meditation, Lucia's on the balcony at Jason's house in Chapter 1, is reported to disappear once that chapter ends, and the game has no mission replay. The guide flags it everywhere and tells you to keep a manual save at the start of every chapter.
- **A tracker**: tick trophies off and the checklist is saved in the browser (localStorage), exportable to a file and importable back. Filters by kind (story, missable, collectibles, activities, platinum, online), by grade, by search, and by earned-only. A spoiler setting hides the names and descriptions of story trophies until they are earned.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide itself (static files, no build step).
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, kind, missable flag, roadmap stage, guide and sources.
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged).
- `screenshots/` — 4 screenshots of the app running in a browser.

## Run it

```sh
node serve.ts            # serves app/ at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build the entry
```

## License

MIT — see `LICENSE`. No Rockstar Games logo, artwork or font is used anywhere in this guide.
