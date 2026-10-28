# mega-kb — ticket #4471 split into its problems

Work for challenge **S01E03 · what it shows** (MEGA.dev course): the support desk's ticket **#4471**
holds **412 reports** about dates, merged as one "known" issue. Read by cause — with the desk's own
code (`src/lib/kb/causes.ts`) over the desk's own export — it is **two problems**, not one:

| problem | reports | scope |
|---|---|---|
| `parser` — shared date parser reads month-first in day-first locales | **379** | all 11 tenants · app 204 / email 150 / form 25 · 2026-04-01 → 2026-10-04 |
| `hint` — booking-v3 form's date hint shows `MM/DD/YYYY` to day-first tenants | **33** | the 3 booking-v3 tenants · all via form · 2026-04-17 → 2026-09-22 |

379 + 33 = 412. The export's 427 rows are 412 reports: it ships in overlapping pages, 15 ids come
twice; counts are made after dedupe by id, the way the desk counts.

Each problem has its own ticket here (GitHub issues: #1 parser, #2 hint), and the kb page about
them is [`src/routes/kb/incidents/4471-split/+page.svx`](src/routes/kb/incidents/4471-split/+page.svx).

## What is where

- `src/` — the desk's kb export from the course challenge, plus two additions:
  - `src/routes/kb/incidents/4471-split/+page.svx` — the new page (signed, ends with `RenderStamp`)
  - `src/lib/kb/SplitTable.svelte` — the component that computes every number on it
- `rendered/4471-split.html` — the page as the desk will see it (standalone, CSS inlined)
- `rendered/4471-split.png` — the same, as a picture
- `tickets/` — the text of each GitHub issue, for reading without GitHub
- `analysis/analyze.ts` — reruns the kb's cause logic over the export and prints the split
- `kb-README.md` — the desk's own README, as it came in the export

## Reproduce the counts

```bash
npm ci
node analysis/analyze.ts        # the split, from the kb's own causes.ts
npm run build                   # renders every kb page, incl. /kb/incidents/4471-split
```
