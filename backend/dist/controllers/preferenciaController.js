import PreferenciaUsuario from '../models/PreferenciaUsuario';
import { AppError } from '../middleware/errorHandler';
import { logAction, compararDados } from '../utils/auditLogger.js';
class PreferenciaController {
    // GET /api/preferencias/minhas - Obter preferências do usuário logado
    async obterMinhas(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError('Usuário não autenticado', 401);
            }
            let preferencia = await PreferenciaUsuario.findOne({ usuarioId: req.user.id });
            if (!preferencia) {
                // Cria preferências padrão se não existir
                preferencia = await PreferenciaUsuario.create({
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
                throw new AppError('Usuário não autenticado', 401);
            }
            const preferenciasAntiga = await PreferenciaUsuario.findOne({ usuarioId: req.user.id });
            const preferencia = await PreferenciaUsuario.findOneAndUpdate({ usuarioId: req.user.id }, req.body, { new: true, runValidators: true, upsert: true });
            if (preferenciasAntiga) {
                const mudancas = compararDados(preferenciasAntiga, preferencia);
                await logAction(req, 'UPDATE', 'Preferencia', preferencia._id.toString(), mudancas);
            }
            else {
                await logAction(req, 'CREATE', 'Preferencia', preferencia._id.toString(), preferencia);
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
            const preferencia = await PreferenciaUsuario.findOne({ usuarioId });
            if (!preferencia) {
                throw new AppError('Preferências não encontradas', 404);
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
            const preferenciasAntiga = await PreferenciaUsuario.findOne({ usuarioId });
            const preferencia = await PreferenciaUsuario.findOneAndUpdate({ usuarioId }, req.body, { new: true, runValidators: true, upsert: true });
            if (preferenciasAntiga) {
                const mudancas = compararDados(preferenciasAntiga, preferencia);
                await logAction(req, 'UPDATE', 'Preferencia', preferencia._id.toString(), mudancas);
            }
            else {
                await logAction(req, 'CREATE', 'Preferencia', preferencia._id.toString(), preferencia);
            }
            return res.status(200).json({ data: preferencia });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new PreferenciaController();
