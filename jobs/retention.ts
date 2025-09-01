import { sql } from '../lib/db';

export async function run({ apply = false } = {}) {
  const { rows } = await sql`
    select count(*)::int as count
    from agent_events
    where ts < now() - interval '30 days'
  `;
  const count = rows[0]?.count ?? 0;
  if (apply) {
    await sql`delete from agent_events where ts < now() - interval '30 days'`;
    console.log(`deleted ${count} rows`);
  } else {
    console.log(`dry-run: ${count} rows would be deleted`);
  }
}

if (require.main === module) {
  const apply = process.argv.includes('--apply');
  run({ apply }).then(() => process.exit(0));
}
