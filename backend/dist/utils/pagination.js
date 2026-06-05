"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = getPaginationParams;
exports.getPaginationResult = getPaginationResult;
function getPaginationParams(query, defaults = { page: 1, limit: 10 }) {
    const page = Math.max(1, parseInt(query.page || String(defaults.page), 10) || defaults.page);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || String(defaults.limit), 10) || defaults.limit));
    return { page, limit, skip: (page - 1) * limit };
}
function getPaginationResult(total, page, limit) {
    return { page, limit, total, pages: Math.ceil(total / limit) };
}
