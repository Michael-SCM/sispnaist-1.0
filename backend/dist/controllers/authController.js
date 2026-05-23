import { asyncHandler } from '../middleware/asyncHandler.js';
import authService from '../services/AuthService.js';
export const register = asyncHandler(async (req, res) => {
    const { user } = await authService.register(req.body);
    res.status(201).json({
        status: 'success',
        message: 'Cadastro realizado com sucesso! Por favor, verifique seu e-mail para ativar sua conta.',
        data: {
            user,
        },
    });
});
export const login = asyncHandler(async (req, res) => {
    const { email, senha } = req.body;
    const { user, token } = await authService.login(email, senha);
    res.status(200).json({
        status: 'success',
        data: {
            user,
            token,
        },
    });
});
export const me = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Não autenticado' });
        return;
    }
    const user = await authService.me(req.user.id);
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
export const updateProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Não autenticado' });
        return;
    }
    const user = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email, dataNascimento } = req.body;
    const resetToken = await authService.forgotPassword(email, dataNascimento);
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
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, novaSenha } = req.body;
    await authService.resetPassword(token, novaSenha);
    res.status(200).json({
        status: 'success',
        message: 'Senha atualizada com sucesso!',
    });
});
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;
    await authService.verifyEmail(token);
    res.status(200).json({
        status: 'success',
        message: 'E-mail verificado e conta ativada com sucesso! Você já pode fazer login.',
    });
});
