import jwt from 'jsonwebtoken';
import config from '../config/config.js';
export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Token não fornecido' });
            return;
        }
        const decoded = jwt.verify(token, config.jwtSecret);
        if (typeof decoded === 'object' && decoded !== null) {
            req.user = {
                id: decoded.id || '',
                cpf: decoded.cpf || '',
                email: decoded.email || '',
                perfil: decoded.perfil || '',
            };
        }
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Não autenticado' });
            return;
        }
        if (!roles.includes(req.user.perfil)) {
            res.status(403).json({ message: 'Sem permissão para acessar este recurso' });
            return;
        }
        next();
    };
};
export const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.perfil !== 'admin') {
        res.status(403).json({ message: 'Sem permissão de administrador' });
        return;
    }
    next();
};
//# sourceMappingURL=auth.js.map