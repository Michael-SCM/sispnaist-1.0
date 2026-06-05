"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateRequest = void 0;
const errorHandler_js_1 = require("./errorHandler.js");
const validateRequest = (schema) => {
    return (req, res, next) => {
        console.log(`[Validation] Body BEFORE:`, JSON.stringify(req.body));
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            console.log(`[Validation] Error:`, error.details);
            const messages = error.details.map(d => d.message).join('; ');
            throw new errorHandler_js_1.AppError(messages, 400);
        }
        console.log(`[Validation] Body AFTER (value):`, JSON.stringify(value));
        req.body = value;
        next();
    };
};
exports.validateRequest = validateRequest;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const messages = error.details.map(d => d.message).join('; ');
            throw new errorHandler_js_1.AppError(messages, 400);
        }
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
