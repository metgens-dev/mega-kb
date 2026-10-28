// Run the kb's own causes.ts over the kb's own data — the same computation CauseTable.svelte does.
import { readFileSync, readdirSync } from "node:fs";
import { groupByCause, ticketCause, readAs, uniqueById, causeOf, dayFirst } from "../src/lib/kb/causes.ts";
import type { Report, Tenant } from "../src/lib/kb/causes.ts";

const dir = "src/lib/data";
const reports = JSON.parse(readFileSync(`${dir}/reports-4471.json`, "utf8")) as Report[];
const notes = JSON.parse(readFileSync(`${dir}/desk-notes.json`, "utf8"));

// tenantOf, as locales.ts builds it (map handle -> tenant json)
const tenants = new Map<string, Tenant>();
for (const f of readdirSync(`${dir}/tenants`)) {
  const t: Tenant = JSON.parse(readFileSync(`${dir}/tenants/${f}`, "utf8"));
  tenants.set(t.handle, t);
}
const tenantOf = (r: Pick<Report, "tenant">): Tenant | undefined => tenants.get(r.tenant);

console.log("== tenants on file ==");
for (const t of tenants.values())
  console.log(`  ${t.handle.padEnd(16)} locale ${t.locale.padEnd(6)} form ${t.form.padEnd(11)} dayFirst ${dayFirst(t.locale)}`);

console.log("\n== export rows vs unique ==");
console.log(`  rows ${reports.length}, unique ${uniqueById(reports).length}`);
const seen = new Map<string, number>();
for (const r of reports) seen.set(r.id, (seen.get(r.id) ?? 0) + 1);
const dups = [...seen.entries()].filter(([, n]) => n > 1);
console.log(`  duplicated ids: ${dups.length} -> ${dups.map(([id, n]) => `${id}×${n}`).join(", ")}`);

const merged = uniqueById(reports).filter((r) => r.mergedInto === 4471);
const groups = groupByCause(merged, tenantOf);
const owner = ticketCause(groups, 4471);

console.log(`\n== groups in #4471 (owner cause: ${owner}) ==`);
for (const g of groups) {
  console.log(`  ${g.cause}: ${g.reports.length} reports, ${g.tenants} tenants, ${g.firstSeen} -> ${g.lastSeen}`);
  console.log(`    taggedAs: ${JSON.stringify(g.taggedAs)}`);
  console.log(`    mergedInto: ${JSON.stringify(g.mergedInto)}`);
  const moved = readAs(g, notes.oneDayMove);
  if (moved) console.log(`    desk read ${moved} of these as oneDayMove: ${notes.oneDayMove.join(", ")}`);
}

console.log("\n== per-group detail ==");
for (const g of groups) {
  console.log(`\n  -- ${g.cause} --`);
  const byTenant = new Map<string, number>();
  const byChannel = new Map<string, number>();
  for (const r of g.reports) {
    byTenant.set(r.tenant, (byTenant.get(r.tenant) ?? 0) + 1);
    byChannel.set(r.channel, (byChannel.get(r.channel) ?? 0) + 1);
  }
  console.log(`    by tenant: ${JSON.stringify([...byTenant.entries()])}`);
  console.log(`    by channel: ${JSON.stringify([...byChannel.entries()])}`);
  const wrongTag = g.reports.filter((r) => r.meta.intakeTag !== g.cause);
  console.log(`    intakeTag != cause: ${wrongTag.length} (tagged ${JSON.stringify([...new Set(wrongTag.map((r) => r.meta.intakeTag))])})`);
  if (g.cause === "unplaced") {
    for (const r of g.reports.slice(0, 25))
      console.log(`      ${r.id} ${r.tenant} (${tenants.get(r.tenant)?.locale ?? "?"}/${tenants.get(r.tenant)?.form ?? "?"}) via ${r.channel} "${r.subject}" tag=${r.meta.intakeTag}`);
  }
}

console.log("\n== desk-notes oneDayMove ids by cause ==");
for (const id of notes.oneDayMove) {
  const r = merged.find((x) => x.id === id);
  if (!r) { console.log(`  ${id}: NOT in #4471 merge set`); continue; }
  const t = tenantOf(r);
  console.log(`  ${id}: ${r.tenant} (${t?.locale}/${t?.form}) via ${r.channel} -> cause ${causeOf(r, t)} (tag ${r.meta.intakeTag})`);
}
