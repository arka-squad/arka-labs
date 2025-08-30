"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const server_1 = require("next/server");
const trace_1 = require("../lib/trace");
const postgres = __importStar(require("@vercel/postgres"));
// route handler will be loaded after env + mocks
// buffer to capture trace ids during simulated DB inserts
globalThis.__TRACE_BUFFER__ = [];
process.env.AUTH_SECRET = 'test';
// load auth utils after secret set
const { signToken } = require('../lib/auth');
// mock sql to avoid real DB access and capture trace_id
postgres.sql = async (strings, ...values) => {
    if (strings[0].includes('insert into metrics_raw')) {
        const [traceId] = values;
        globalThis.__TRACE_BUFFER__.push(traceId);
        return { rows: [] };
    }
    return { rows: [{ ttft_ms: 0, rtt_ms: 0, err_pct: 0 }] };
};
// load route after mocks are ready
const { GET } = require('../app/api/metrics/route');
(0, node_test_1.default)('trace_id propagates UI→API→DB', async () => {
    const trace_id = 'trc_e2e_001';
    const token = signToken({ id: 'u1', email: 'a@b.c', role: 'viewer' });
    const req = new server_1.NextRequest('http://test/api/metrics', {
        headers: { [trace_1.TRACE_HEADER]: trace_id, authorization: `Bearer ${token}` },
    });
    const res = await GET(req);
    strict_1.default.equal(res.status, 200);
    strict_1.default.equal(res.headers.get(trace_1.TRACE_HEADER), trace_id);
    strict_1.default.ok(globalThis.__TRACE_BUFFER__.includes(trace_id));
});
