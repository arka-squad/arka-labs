"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuth = withAuth;
const server_1 = require("next/server");
const auth_1 = require("./auth");
const logger_1 = require("./logger");
const db_1 = require("./db");
const trace_1 = require("./trace");
function withAuth(allowed, handler) {
    return async (req, context = {}) => {
        const traceId = req.headers.get(trace_1.TRACE_HEADER) || (0, trace_1.generateTraceId)();
        const start = Date.now();
        let res;
        if (allowed.includes('public') || allowed.includes('github-webhook')) {
            res = await handler(req, null, context);
        }
        else {
            const auth = req.headers.get('authorization');
            if (!auth || !auth.startsWith('Bearer ')) {
                res = server_1.NextResponse.json({ error: 'unauthorized' }, { status: 401 });
            }
            else {
                const token = auth.slice(7);
                const user = (0, auth_1.verifyToken)(token);
                if (!user || !allowed.includes(user.role)) {
                    res = server_1.NextResponse.json({ error: 'forbidden' }, { status: 403 });
                }
                else {
                    res = await handler(req, user, context);
                }
            }
        }
        const duration_ms = Date.now() - start;
        const route = req.nextUrl.pathname;
        (0, logger_1.log)('info', 'api', { route, status: res.status, trace_id: traceId });
        try {
            await (0, db_1.sql) `insert into metrics_raw (trace_id, route, status, duration_ms) values (${traceId}, ${route}, ${res.status}, ${duration_ms})`;
            const buf = globalThis.__TRACE_BUFFER__;
            if (Array.isArray(buf))
                buf.push(traceId);
        }
        catch (e) {
            console.error('metrics_raw_insert_fail', e);
        }
        res.headers.set(trace_1.TRACE_HEADER, traceId);
        return res;
    };
}
