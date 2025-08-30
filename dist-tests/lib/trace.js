"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRACE_HEADER = void 0;
exports.generateTraceId = generateTraceId;
exports.TRACE_HEADER = 'x-trace-id';
function generateTraceId() {
    // Use crypto.randomUUID when available in both browser and Node
    if (typeof globalThis.crypto?.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }
    // Fallback to Math.random (not cryptographically strong)
    return Math.random().toString(36).slice(2);
}
