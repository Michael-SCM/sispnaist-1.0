"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOuGestorMiddleware = exports.adminMiddleware = exports.authorize = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = __importDefault(require("../config/config.js"));
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.log('[Auth] token não fornecido - header authorization vazio');
            res.status(401).json({ message: 'Token não fornecido' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_js_1.default.jwtSecret);
        if (typeof decoded === 'object' && decoded !== null) {
            req.user = {
                id: decoded.id || '',
                cpf: decoded.cpf || '',
                email: decoded.email || '',
                perfil: decoded.perfil || '',
            };
            console.log('[Auth] perfil decodificado:', req.user.perfil, 'id:', req.user.id);
        }
        else {
            console.log('[Auth] decoded inesperado:', typeof decoded);
        }
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};
exports.authMiddleware = authMiddleware;
const authorize = (...roles) => {
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
exports.authorize = authorize;
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.perfil !== 'admin') {
        res.status(403).json({ message: 'Sem permissão de administrador' });
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
const adminOuGestorMiddleware = (req, res, next) => {
    console.log('[Auth] adminOuGestorMiddleware perfil recebido:', req.user?.perfil, 'user:', req.user?.id);
    if (!req.user || !['admin', 'gestor'].includes(req.user.perfil)) {
        res.status(403).json({ message: 'Sem permissão de administrador/gestor' });
        return;
    }
    next();
};
exports.adminOuGestorMiddleware = adminOuGestorMiddleware;
