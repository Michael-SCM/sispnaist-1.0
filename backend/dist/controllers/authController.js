"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.logout = exports.refreshToken = exports.resetPassword = exports.forgotPassword = exports.updateProfile = exports.me = exports.login = exports.register = void 0;
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const AuthService_js_1 = __importDefault(require("../services/AuthService.js"));
exports.register = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { user } = await AuthService_js_1.default.register(req.body);
    res.status(201).json({
        status: 'success',
        message: 'Cadastro realizado com sucesso! Por favor, verifique seu e-mail para ativar sua conta.',
        data: {
            user,
        },
    });
});
exports.login = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { email, senha } = req.body;
    const { user, accessToken, refreshToken } = await AuthService_js_1.default.login(email, senha);
    res.status(200).json({
        status: 'success',
        data: {
            user,
            token: accessToken,
            refreshToken,
        },
    });
});
exports.me = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Não autenticado' });
        return;
    }
    const user = await AuthService_js_1.default.me(req.user.id);
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
exports.updateProfile = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Não autenticado' });
        return;
    }
    const user = await AuthService_js_1.default.updateProfile(req.user.id, req.body);
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
exports.forgotPassword = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { email, dataNascimento } = req.body;
    const resetToken = await AuthService_js_1.default.forgotPassword(email, dataNascimento);
    // Em desenvolvimento, logar o link para facilitar testes locais
    if (process.env.NODE_ENV !== 'production') {
        console.log(`\n=== LINK DE RECUPERAÇÃO DE SENHA (DESENVOLVIMENTO) ===`);
        console.log(`http://localhost:5173/reset-password?token=${resetToken}`);
        console.log(`======================================================\n`);
    }
    res.status(200).json({
        status: 'success',
        message: 'Solicitação de redefinição de senha enviada com sucesso! Verifique sua caixa de e-mail.',
    });
});
exports.resetPassword = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { token, novaSenha } = req.body;
    await AuthService_js_1.default.resetPassword(token, novaSenha);
    res.status(200).json({
        status: 'success',
        message: 'Senha atualizada com sucesso!',
    });
});
exports.refreshToken = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { refreshToken: token } = req.body;
    if (!token) {
        res.status(400).json({ status: 'error', message: 'Refresh token é obrigatório' });
        return;
    }
    const tokens = await AuthService_js_1.default.refreshToken(token);
    res.status(200).json({
        status: 'success',
        data: tokens,
    });
});
exports.logout = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (req.user) {
        await AuthService_js_1.default.logout(req.user.id);
    }
    res.status(200).json({
        status: 'success',
        message: 'Logout realizado com sucesso',
    });
});
exports.verifyEmail = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { token } = req.body;
    await AuthService_js_1.default.verifyEmail(token);
    res.status(200).json({
        status: 'success',
        message: 'E-mail verificado e conta ativada com sucesso! Você já pode fazer login.',
    });
});
