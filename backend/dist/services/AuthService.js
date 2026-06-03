"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_js_1 = __importDefault(require("../models/User.js"));
const jwt_js_1 = require("../utils/jwt.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const emailService_js_1 = require("../utils/emailService.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = __importDefault(require("../config/config.js"));
class AuthService {
    async register(userData) {
        // Check if user already exists
        const existingUser = await User_js_1.default.findOne({
            $or: [{ email: userData.email }, { cpf: userData.cpf }],
        });
        if (existingUser) {
            throw new errorHandler_js_1.AppError('Email ou CPF já cadastrado', 400);
        }
        // Validar se o domínio do e-mail realmente existe e está ativo (registros MX)
        const isDomainValid = await (0, emailService_js_1.validateEmailDomain)(userData.email);
        if (!isDomainValid) {
            throw new errorHandler_js_1.AppError('O domínio do e-mail informado não é válido ou não está configurado para receber mensagens. Por favor, informe um e-mail com domínio existente.', 400);
        }
        // Gerar token de verificação de e-mail (expira em 24 horas)
        const verificationToken = jsonwebtoken_1.default.sign({ email: userData.email, type: 'verify' }, config_js_1.default.jwtSecret, { expiresIn: '24h' });
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        // 1. Tentar enviar o e-mail de verificação primeiro
        try {
            await (0, emailService_js_1.sendVerificationEmail)(userData.email, verificationToken);
        }
        catch (emailError) {
            console.error('ERRO NO ENVIO DO E-MAIL DE CADASTRO:', emailError);
            throw new errorHandler_js_1.AppError('Não foi possível enviar o e-mail de confirmação. Por favor, verifique se o e-mail digitado realmente existe e está correto.', 400);
        }
        // 2. Criar e salvar o usuário no banco apenas se o envio do e-mail foi bem-sucedido
        const user = new User_js_1.default({
            ...userData,
            isVerified: false,
            verificationToken,
            verificationTokenExpires,
        });
        await user.save();
        // Em desenvolvimento, logar o link para facilitar testes
        if (process.env.NODE_ENV !== 'production') {
            console.log(`\n=== LINK DE CONFIRMAÇÃO DE E-MAIL (DESENVOLVIMENTO) ===`);
            console.log(`${config_js_1.default.frontendUrl}/verify-email?token=${verificationToken}`);
            console.log(`======================================================\n`);
        }
        const userObj = user.toObject();
        delete userObj.senha;
        return { user: userObj };
    }
    async generateTokens(user) {
        const payload = {
            id: user._id.toString(),
            cpf: user.cpf,
            email: user.email,
            perfil: user.perfil || 'trabalhador',
        };
        const accessToken = (0, jwt_js_1.generateToken)(payload);
        const refreshToken = (0, jwt_js_1.generateRefreshToken)(payload);
        const refreshExpires = new Date();
        refreshExpires.setDate(refreshExpires.getDate() + 7);
        await User_js_1.default.findByIdAndUpdate(user._id, {
            refreshToken,
            refreshTokenExpires: refreshExpires,
        });
        return { accessToken, refreshToken };
    }
    async login(email, password) {
        const user = await User_js_1.default.findOne({ email }).select('+senha');
        if (!user) {
            throw new errorHandler_js_1.AppError('Email ou senha inválidos', 401);
        }
        if (user.isVerified === false) {
            throw new errorHandler_js_1.AppError('O e-mail desta conta ainda não foi verificado! Por favor, verifique sua caixa de entrada (ou spam) para ativar sua conta.', 401);
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new errorHandler_js_1.AppError('Email ou senha inválidos', 401);
        }
        const tokens = await this.generateTokens(user);
        const userObj = user.toObject();
        delete userObj.senha;
        return { user: userObj, ...tokens };
    }
    async me(userId) {
        const user = await User_js_1.default.findById(userId)
            .populate('empresa')
            .populate('unidade');
        if (!user) {
            throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
        }
        const userObj = user.toObject();
        delete userObj.senha;
        return userObj;
    }
    async updateProfile(userId, userData) {
        // Don't allow password changes via this method
        if ('senha' in userData) {
            delete userData.senha;
        }
        const user = await User_js_1.default.findByIdAndUpdate(userId, userData, {
            new: true,
            runValidators: true,
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
        }
        const userObj = user.toObject();
        delete userObj.senha;
        return userObj;
    }
    async forgotPassword(email, dataNascimento) {
        const user = await User_js_1.default.findOne({ email });
        if (!user) {
            throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
        }
        if (!user.dataNascimento) {
            throw new errorHandler_js_1.AppError('Data de nascimento não cadastrada para este usuário. Entre em contato com o administrador.', 400);
        }
        // Verificar data de nascimento (comparar apenas YYYY-MM-DD)
        const userBirthDate = new Date(user.dataNascimento).toISOString().split('T')[0];
        const providedBirthDate = new Date(dataNascimento).toISOString().split('T')[0];
        if (userBirthDate !== providedBirthDate) {
            throw new errorHandler_js_1.AppError('Data de nascimento incorreta', 400);
        }
        // Gerar token de reset (expira em 1 hora)
        const resetToken = jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email, type: 'reset' }, config_js_1.default.jwtSecret, { expiresIn: '1h' });
        // Enviar e-mail de redefinição de senha
        await (0, emailService_js_1.sendResetPasswordEmail)(user.email, resetToken);
        return resetToken;
    }
    async resetPassword(token, novaSenha) {
        try {
            // Verificar token
            const decoded = jsonwebtoken_1.default.verify(token, config_js_1.default.jwtSecret);
            if (decoded.type !== 'reset') {
                throw new errorHandler_js_1.AppError('Token inválido', 400);
            }
            const user = await User_js_1.default.findById(decoded.id);
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
            }
            // Atualizar senha
            user.senha = novaSenha;
            await user.save();
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            throw new errorHandler_js_1.AppError('Token de recuperação inválido ou expirado', 400);
        }
    }
    async refreshToken(token) {
        const payload = (0, jwt_js_1.verifyRefreshToken)(token);
        if (!payload) {
            throw new errorHandler_js_1.AppError('Refresh token inválido ou expirado', 401);
        }
        const user = await User_js_1.default.findById(payload.id).select('+refreshToken +refreshTokenExpires');
        if (!user || user.refreshToken !== token) {
            throw new errorHandler_js_1.AppError('Refresh token inválido ou revogado', 401);
        }
        if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
            throw new errorHandler_js_1.AppError('Refresh token expirado', 401);
        }
        return this.generateTokens(user);
    }
    async logout(userId) {
        await User_js_1.default.findByIdAndUpdate(userId, {
            $unset: { refreshToken: '', refreshTokenExpires: '' },
        });
    }
    async verifyEmail(token) {
        try {
            // Verificar token JWT
            const decoded = jsonwebtoken_1.default.verify(token, config_js_1.default.jwtSecret);
            if (decoded.type !== 'verify') {
                throw new errorHandler_js_1.AppError('Token de verificação inválido', 400);
            }
            // Encontrar usuário com o token correspondente
            const user = await User_js_1.default.findOne({
                email: decoded.email,
                verificationToken: token
            }).select('+verificationToken +verificationTokenExpires');
            if (!user) {
                throw new errorHandler_js_1.AppError('Token inválido ou conta já ativada', 400);
            }
            // Verificar se expirou
            if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
                throw new errorHandler_js_1.AppError('Link de verificação expirado. Por favor, faça um novo cadastro.', 400);
            }
            // Ativar e salvar usuário
            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            throw new errorHandler_js_1.AppError('Link de verificação inválido ou expirado', 400);
        }
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
