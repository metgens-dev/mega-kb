**379 of the 412 reports in #4471** (desk ticket #4471, "dates parse mm/dd in eu locales").

## What

The shared date parser reads every date **month first**. Tenants in day-first locales
(en-GB, de-DE, fr-FR, … — every tenant on file) write the day first, so their dates come out
with the month and day flipped: a 7 April reminder lands on 4 July.

This is the bug #4471 was opened for and merged into, and the fix already queued for #4471
is its fix. This ticket exists so the count of what that fix covers is exact.

## Count and scope

- **379 unique reports** (see "How counted").
- All 11 tenants on file; channels: app 204 · email 150 · form 25.
- First seen 2026-04-01, last seen 2026-10-04.

## How counted

The export (`src/lib/data/reports-4471.json`, 427 rows) ships in overlapping pages, so 15 ids
appear twice. Counted once by id — `uniqueById` in `src/lib/kb/causes.ts` — it is 412 reports,
all merged into #4471. Grouped by cause (`groupByCause` over the tenant directory in
`src/lib/data/tenants/`): **379 `parser`**, 33 `hint` (the other ticket). Rerun it with
`node analysis/analyze.ts`.

Five of these reports (R-41202, R-41209, R-41236, R-41344, R-41620 — `desk-notes.json`,
`oneDayMove`) were read by the desk as a one-day move. By tenant and locale they are this
cause: filed here, footnoted on the kb page, not a third problem.
