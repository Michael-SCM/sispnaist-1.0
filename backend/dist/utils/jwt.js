"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyRefreshToken = exports.generateRefreshToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = __importDefault(require("../config/config.js"));
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign({ ...payload, type: 'access' }, config_js_1.default.jwtSecret, {
        expiresIn: config_js_1.default.jwtExpire,
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_js_1.default.jwtSecret);
        if (decoded.type && decoded.type !== 'access')
            return null;
        return decoded;
    }
    catch {
        return null;
    }
};
exports.verifyToken = verifyToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign({ ...payload, type: 'refresh' }, config_js_1.default.jwtSecret, {
        expiresIn: config_js_1.default.jwtRefreshExpire,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyRefreshToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_js_1.default.jwtSecret);
        if (decoded.type !== 'refresh')
            return null;
        return decoded;
    }
    catch {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const decodeToken = (token) => {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch {
        return null;
    }
};
exports.decodeToken = decodeToken;
