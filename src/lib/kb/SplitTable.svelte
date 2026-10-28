<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, ticketCause, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket }: { ticket: number } = $props();

  const rowsRaw = (reports as Report[]).length;
  const rows = uniqueById(reports as Report[]);
  const merged = $derived(rows.filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByCause(merged, tenantOf));
  const owner = $derived(ticketCause(groups, ticket));
  const tags = (g: { taggedAs: Record<string, number> }) =>
    Object.entries(g.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
  const channels = (g: { reports: Report[] }) =>
    Object.entries(
      g.reports.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    )
      .sort((a, b) => b[1] - a[1])
      .map(([c, n]) => `${c} ${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{rowsRaw}</strong> export rows · <strong>{merged.length}</strong> unique reports merged into
  #{ticket} · <strong>{groups.length}</strong> {groups.length === 1 ? 'cause' : 'causes'}
</p>

<table>
  <thead>
    <tr><th>cause</th><th>reports</th><th>tenants</th><th>channels</th><th>tagged as</th><th>seen</th><th></th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.cause)}
      <tr class:owner={g.cause === owner}>
        <td><code>{g.cause}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{channels(g)}</td>
        <td class="tags">{tags(g)}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{g.cause === owner ? `#${ticket} as merged` : 'own ticket — not this one'}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.cause)}
  {@const moved = readAs(g, notes.oneDayMove)}
  {#if moved}
    <p class="note">{moved} reports read as a one-day move; filed under <code>{g.cause}</code> by tenant.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
  .owner td:first-child { font-weight: 600; }
</style>
