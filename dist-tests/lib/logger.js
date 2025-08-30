"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
function log(level, msg, fields) {
    const base = { ts: new Date().toISOString(), level, msg };
    console.log(JSON.stringify({ ...base, ...fields }));
}
