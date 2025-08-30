"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = void 0;
exports.getDb = getDb;
const pg_1 = require("pg");
const postgres_1 = require("@vercel/postgres");
Object.defineProperty(exports, "sql", { enumerable: true, get: function () { return postgres_1.sql; } });
let pool = null;
function getDb() {
    if (!pool) {
        pool = new pg_1.Pool({ connectionString: process.env.POSTGRES_URL });
    }
    return pool;
}
