"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("./env");
const cfg = () => (0, env_1.getEnv)();
function signToken(user) {
    const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = cfg();
    return jsonwebtoken_1.default.sign({ sub: user.sub, role: user.role }, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1h',
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    });
}
function verifyToken(token) {
    try {
        const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = cfg();
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, {
            algorithms: ['HS256'],
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        });
        if (typeof decoded.sub !== 'string' || typeof decoded.role !== 'string')
            return null;
        return { sub: decoded.sub, role: decoded.role };
    }
    catch {
        return null;
    }
}
