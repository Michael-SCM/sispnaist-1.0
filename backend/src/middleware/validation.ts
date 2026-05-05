import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler.js';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log(`[Validation] Body BEFORE:`, JSON.stringify(req.body));
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: false, // TEMPORARILY DISABLED TO DEBUG
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

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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
