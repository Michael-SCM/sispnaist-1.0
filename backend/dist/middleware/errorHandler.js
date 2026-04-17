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
//# sourceMappingURL=errorHandler.js.map