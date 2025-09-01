"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccess = canAccess;
exports.withRole = withRole;
exports.Guard = Guard;
exports.withAuth = withAuth;
const server_1 = require("next/server");
const react_1 = __importDefault(require("react"));
const auth_1 = require("./auth");
const logger_1 = require("./logger");
const db_1 = require("./db");
const trace_1 = require("./trace");
const RBAC_MATRIX = {
    '/api/projects': {
        GET: ['viewer', 'editor', 'admin', 'owner'],
        POST: ['editor', 'admin', 'owner'],
    },
    '/api/metrics': {
        GET: ['admin', 'owner'],
    },
    '/api/prompt-blocks': {
        GET: ['viewer', 'editor', 'admin', 'owner'],
        POST: ['editor', 'admin', 'owner'],
    },
};
function canAccess(route, method, role) {
    const perms = RBAC_MATRIX[route];
    if (!perms)
        return false;
    const allowed = perms[method];
    if (!allowed)
        return false;
    return allowed.includes(role);
}
function withRole(Component, roles) {
    return (props) => roles.includes(props.role) ? react_1.default.createElement(Component, props) : null;
}
function Guard({ role, roles, children }) {
    return roles.includes(role) ? react_1.default.createElement(react_1.default.Fragment, null, children) : null;
}
function withAuth(allowed, handler) {
    return async (req, context = {}) => {
        const traceId = req.headers.get(trace_1.TRACE_HEADER) || (0, trace_1.generateTraceId)();
        const start = Date.now();
        let res;
        let user = null;
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
                user = (0, auth_1.verifyToken)(token);
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
        const actor = user?.id || 'anonymous';
        const role = user?.role || 'public';
        (0, logger_1.log)('info', 'api', { route, status: res.status, trace_id: traceId, actor, role });
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
