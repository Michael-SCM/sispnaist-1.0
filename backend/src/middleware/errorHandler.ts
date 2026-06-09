import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

const isProduction = () => process.env.NODE_ENV === 'production';

function genericResponse(res: Response, statusCode: number, genericMsg: string, detail: string, stack?: string) {
  if (!isProduction()) {
    console.error(`[${statusCode}] ${detail}`, stack ? '\n' + stack : '');
  } else {
    console.error(`[${statusCode}] ${detail}`);
  }
  res.status(statusCode).json({
    status: 'error',
    message: genericMsg,
    ...(!isProduction() && { detail, stack }),
  });
}

export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  // AppError intencional
  if (err instanceof AppError) {
    const isServerError = err.statusCode >= 500;
    if (isServerError && isProduction()) {
      genericResponse(res, err.statusCode, 'Erro interno do servidor', err.message, err.stack);
      return;
    }
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(!isProduction() && { stack: err.stack }),
    });
    return;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const mongooseErr = err as any;
    const fieldErrors = Object.values(mongooseErr.errors).map((e: any) => e.message).join('; ');
    genericResponse(
      res, 400,
      'Erro de validação dos dados enviados',
      `ValidationError: ${fieldErrors}`,
    );
    return;
  }

  // Mongoose CastError (ID inválido, tipo inválido)
  if (err.name === 'CastError') {
    const castErr = err as any;
    genericResponse(
      res, 400,
      'Parâmetro inválido na requisição',
      `CastError: invalid value "${castErr.value}" for field "${castErr.path}" (${castErr.kind})`,
    );
    return;
  }

  // MongoDB duplicate key (11000)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const value = (err as any).keyValue[field];
    genericResponse(
      res, 409,
      'Já existe um registro com este valor',
      `DuplicateKey: ${field} = "${value}"`,
    );
    return;
  }

  // Erro inesperado
  genericResponse(
    res, 500,
    'Erro interno do servidor',
    `Unexpected: ${err instanceof Error ? err.message : 'Unknown error'}`,
    err instanceof Error ? err.stack : undefined,
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  genericResponse(
    res, 404,
    'Rota não encontrada',
    `Route not found: ${req.method} ${req.originalUrl}`,
  );
};

