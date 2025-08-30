"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const server_1 = require("next/server");
const rbac_1 = require("../../../lib/rbac");
const db_1 = require("../../../lib/db");
exports.GET = (0, rbac_1.withAuth)(['viewer', 'operator', 'owner'], async (req) => {
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project');
    const lot = searchParams.get('lot');
    const sprint = searchParams.get('sprint');
    // Basic aggregation using message meta fields if present
    const sqlAny = db_1.sql;
    const { rows } = await sqlAny `
    select
      coalesce(percentile_cont(0.95) within group (order by (meta->>'ttft_ms')::int),0) as ttft_ms,
      coalesce(percentile_cont(0.95) within group (order by (meta->>'rtt_ms')::int),0) as rtt_ms,
      coalesce(avg((meta->>'error')::float),0) as err_pct
    from messages
      ${project ? sqlAny `where project_id = ${project}` : sqlAny ``}
  `;
    const kpis = {
        ttft_ms: Number(rows[0]?.ttft_ms) || 0,
        rtt_ms: Number(rows[0]?.rtt_ms) || 0,
        err_pct: Number(rows[0]?.err_pct) || 0,
    };
    return server_1.NextResponse.json({ kpis });
});
