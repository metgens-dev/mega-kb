**33 of the 412 reports in #4471 — a second bug, wrongly merged.** Needs its own fix; it must
not be closed with #4471's parser fix.

## What

On the `booking-v3` booking form, the hint under the date field says **`MM/DD/YYYY`**. The
tenants that run booking-v3 are in day-first locales (copper.studio es-ES, alder.physio de-DE,
pale.harbour pt-PT): their people read the field the tenant's way and type the day first, or
follow the hint and get read the tenant's way — either way the date flips. Different code from
the parser bug, and a different fix (the hint, not the parser).

## Why it hid inside #4471

The desk merges duplicates on the subject line alone (kb decision 0001). Both bugs produce the
same words — "booking on the wrong day" — so these 33 reports were merged into the parser ticket.

## Count and scope

- **33 unique reports** (counted the same way as the parser ticket: dedupe by id, then
  `groupByCause`; rerun with `node analysis/analyze.ts`).
- Exactly the 3 booking-v3 tenants: alder.physio 12 · copper.studio 11 · pale.harbour 10.
- All 33 arrived through the **form** channel.
- First seen 2026-04-17, last seen 2026-09-22.
