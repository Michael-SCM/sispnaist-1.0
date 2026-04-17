import { AppError } from './errorHandler.js';
export const validateRequest = (schema) => {
    return (req, res, next) => {
        console.log(`[Validation] Body BEFORE:`, JSON.stringify(req.body));
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            console.log(`[Validation] Error:`, error.details);
            const messages = error.details.map(d => `${d.path.join('.')}: ${d.message}`).join('; ');
            throw new AppError(messages, 400);
        }
        console.log(`[Validation] Body AFTER (value):`, JSON.stringify(value));
        req.body = value;
        next();
    };
};
export const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const messages = error.details.map(d => `${d.path.join('.')}: ${d.message}`).join('; ');
            throw new AppError(messages, 400);
        }
        req.query = value;
        next();
    };
};
//# sourceMappingURL=validation.js.map