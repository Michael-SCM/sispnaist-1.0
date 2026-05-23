export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }
    // Erros específicos do Mongoose
    if (err.name === 'ValidationError') {
        res.status(400).json({
            status: 'error',
            message: 'Erro de validação de dados',
            errors: Object.values(err.errors).map((e) => e.message),
            receivedBody: err.receivedBody // Debug
        });
        return;
    }
    if (err.name === 'CastError') {
        res.status(400).json({
            status: 'error',
            message: `Formato inválido para o campo ${err.path}: ${err.value}`,
        });
        return;
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        res.status(409).json({
            status: 'error',
            message: `Já existe um registro com este ${field}`,
        });
        return;
    }
    console.error('Unexpected error:', err);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? 'Erro interno do servidor'
            : err instanceof Error ? err.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && { stack: err instanceof Error ? err.stack : undefined }),
    });
};
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Rota ${req.originalUrl} não encontrada`,
    });
};
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
