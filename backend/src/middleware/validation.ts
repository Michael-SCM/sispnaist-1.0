import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler.js';
import { checkEmailDomainExists } from '../utils/emailValidator.js';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      // Validar existência real do domínio do e-mail
      if (value && typeof value.email === 'string' && value.email.trim() !== '') {
        const emailValido = await checkEmailDomainExists(value.email);
        if (!emailValido) {
          throw new AppError(`O e-mail informado (${value.email}) possui um domínio inválido ou inexistente. Por favor, utilize um e-mail real.`, 400);
        }
      }

      console.log(`[Validation] Body AFTER (value):`, JSON.stringify(value));
      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
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
