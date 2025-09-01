"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.runtime = exports.dynamic = void 0;
const server_1 = require("next/server");
const db_1 = require("../../../lib/db");

const metrics_api_1 = require("../../../lib/metrics-api");
const logger_1 = require("../../../lib/logger");
exports.dynamic = 'force-dynamic';
exports.runtime = 'nodejs';
const GET = async (req) => {
    const start = Date.now();
    const trace_id = req.headers.get('x-trace-id') ?? crypto.randomUUID();
    try {
        const { rows } = await (0, db_1.sql) `
      select (payload_json->>'ttft_ms')::int as ttft_ms,
             (payload_json->>'rtt_ms')::int as rtt_ms,
             (payload_json->>'status') as status
      from agent_events
      where event='metrics_run' and ts > now() - interval '24 hours'
      order by ts desc
    `;
        const body = (0, metrics_api_1.computeOverview)(rows);
        const res = server_1.NextResponse.json(body);
        res.headers.set('x-trace-id', trace_id);
        (0, logger_1.log)('info', 'metrics_overview', {
            route: '/api/metrics',
            status: res.status,
            duration_ms: Date.now() - start,
            trace_id,
        });
        return res;
    }
    catch {
        const res = server_1.NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
        res.headers.set('x-trace-id', trace_id);
        (0, logger_1.log)('info', 'metrics_overview', {
            route: '/api/metrics',
            status: res.status,
            duration_ms: Date.now() - start,
            trace_id,
        });
        return res;
    }
};
exports.GET = GET;

