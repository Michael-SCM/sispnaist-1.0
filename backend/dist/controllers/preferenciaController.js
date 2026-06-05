"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PreferenciaUsuario_1 = __importDefault(require("../models/PreferenciaUsuario"));
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_js_1 = require("../utils/auditLogger.js");
class PreferenciaController {
    // GET /api/preferencias/minhas - Obter preferências do usuário logado
    async obterMinhas(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            let preferencia = await PreferenciaUsuario_1.default.findOne({ usuarioId: req.user.id });
            if (!preferencia) {
                // Cria preferências padrão se não existir
                preferencia = await PreferenciaUsuario_1.default.create({
                    usuarioId: req.user.id
                });
            }
            return res.status(200).json({ data: preferencia });
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/preferencias/minhas - Atualizar preferências do usuário logado
    async atualizarMinhas(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const preferenciasAntiga = await PreferenciaUsuario_1.default.findOne({ usuarioId: req.user.id });
            const preferencia = await PreferenciaUsuario_1.default.findOneAndUpdate({ usuarioId: req.user.id }, req.body, { new: true, runValidators: true, upsert: true });
            if (preferenciasAntiga) {
                const mudancas = (0, auditLogger_js_1.compararDados)(preferenciasAntiga, preferencia);
                await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'Preferencia', preferencia._id.toString(), mudancas);
            }
            else {
                await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'Preferencia', preferencia._id.toString(), preferencia);
            }
            return res.status(200).json({ data: preferencia });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/preferencias/usuario/:usuarioId - Obter preferências de outro usuário (admin)
    async obter(req, res, next) {
        try {
            const { usuarioId } = req.params;
            const preferencia = await PreferenciaUsuario_1.default.findOne({ usuarioId });
            if (!preferencia) {
                throw new errorHandler_1.AppError('Preferências não encontradas', 404);
            }
            return res.status(200).json({ data: preferencia });
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/preferencias/usuario/:usuarioId - Atualizar preferências de outro usuário (admin)
    async atualizar(req, res, next) {
        try {
            const { usuarioId } = req.params;
            const preferenciasAntiga = await PreferenciaUsuario_1.default.findOne({ usuarioId });
            const preferencia = await PreferenciaUsuario_1.default.findOneAndUpdate({ usuarioId }, req.body, { new: true, runValidators: true, upsert: true });
            if (preferenciasAntiga) {
                const mudancas = (0, auditLogger_js_1.compararDados)(preferenciasAntiga, preferencia);
                await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'Preferencia', preferencia._id.toString(), mudancas);
            }
            else {
                await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'Preferencia', preferencia._id.toString(), preferencia);
            }
            return res.status(200).json({ data: preferencia });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new PreferenciaController();
