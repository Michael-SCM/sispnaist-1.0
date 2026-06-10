import User, { IUserDocument } from '../models/User.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { IUser } from '../types/index.js';
import { sendResetPasswordEmail, sendVerificationEmail, validateEmailDomain } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import bcrypt from 'bcryptjs';

export class AuthService {
  async register(userData: Partial<IUser> & { senha: string }): Promise<{ user: IUser; verificationLink?: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { cpf: userData.cpf }],
    });

    if (existingUser) {
      throw new AppError('Email ou CPF já cadastrado', 400);
    }

    // Validar se o domínio do e-mail realmente existe e está ativo (registros MX)
    const isDomainValid = await validateEmailDomain(userData.email);
    if (!isDomainValid) {
      throw new AppError(
        'O domínio do e-mail informado não é válido ou não está configurado para receber mensagens. Por favor, informe um e-mail com domínio existente.',
        400
      );
    }

    // Gerar token de verificação de e-mail (expira em 24 horas)
    const verificationToken = jwt.sign(
      { email: userData.email, type: 'verify' },
      config.jwtSecret,
      { expiresIn: '24h' }
    );
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // 1. Tentar enviar o e-mail de verificação primeiro
    try {
      await sendVerificationEmail(userData.email, verificationToken);
    } catch (emailError: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('ERRO NO ENVIO DO E-MAIL DE CADASTRO:', emailError);
      }
      throw new AppError(
        'Não foi possível enviar o e-mail de confirmação. Por favor, verifique se o e-mail digitado realmente existe e está correto.',
        400
      );
    }

    // 2. Criar e salvar o usuário no banco apenas se o envio do e-mail foi bem-sucedido
    const user = new User({
      ...userData,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });
    await user.save();

    // Em desenvolvimento, logar o link para facilitar testes
    const verificationLink = `${config.frontendUrl}/verify-email?token=${verificationToken}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n=== LINK DE CONFIRMAÇÃO DE E-MAIL (DESENVOLVIMENTO) ===`);
      console.log(verificationLink);
      console.log(`======================================================\n`);
    }

    const userObj = user.toObject() as unknown as IUser;
    delete userObj.senha;

    return { user: userObj, verificationLink: process.env.NODE_ENV !== 'production' ? verificationLink : undefined };
  }

  private async generateTokens(user: IUserDocument): Promise<{ accessToken: string; refreshToken: string }> {
    // Garantir que o tokenVersion esteja definido
    const tokenVersion = user.tokenVersion ?? 1;
    if (user.tokenVersion === undefined) {
      await User.findByIdAndUpdate(user._id, { tokenVersion: 1 });
    }

    const payload = {
      id: user._id.toString(),
      cpf: user.cpf,
      email: user.email,
      perfil: user.perfil || 'trabalhador',
      tokenVersion,
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Hash do refreshToken antes de armazenar (bcrypt)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7);

    await User.findByIdAndUpdate(user._id, {
      refreshToken: refreshTokenHash,
      refreshTokenExpires: refreshExpires,
    });

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email }).select('+senha');

    if (!user) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    if (user.isVerified === false) {
      throw new AppError('O e-mail desta conta ainda não foi verificado! Por favor, verifique sua caixa de entrada (ou spam) para ativar sua conta.', 401);
    }

    const isPasswordValid = await (user as IUserDocument).comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    const tokens = await this.generateTokens(user);

    const userObj = user.toObject() as unknown as IUser;
    delete userObj.senha;

    return { user: userObj, ...tokens };
  }

  async me(userId: string): Promise<IUser> {
    const user = await User.findById(userId)
      .populate('empresa')
      .populate('unidade');

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const userObj = user.toObject() as unknown as IUser;
    delete userObj.senha;

    return userObj;
  }

  async updateProfile(userId: string, userData: Partial<IUser>): Promise<IUser> {
    // Don't allow password changes via this method
    if ('senha' in userData) {
      delete userData.senha;
    }

    const user = await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const userObj = user.toObject() as unknown as IUser;
    delete userObj.senha;

    return userObj;
  }

  async forgotPassword(email: string, dataNascimento: string): Promise<string> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!user.dataNascimento) {
      throw new AppError('Data de nascimento não cadastrada para este usuário. Entre em contato com o administrador.', 400);
    }

    // Verificar data de nascimento (comparar apenas YYYY-MM-DD)
    const userBirthDate = new Date(user.dataNascimento).toISOString().split('T')[0];
    const providedBirthDate = new Date(dataNascimento).toISOString().split('T')[0];

    if (userBirthDate !== providedBirthDate) {
      throw new AppError('Data de nascimento incorreta', 400);
    }

    // Gerar token de reset (expira em 1 hora)
    const resetToken = jwt.sign(
      { id: user._id.toString(), email: user.email, type: 'reset' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // Enviar e-mail de redefinição de senha
    await sendResetPasswordEmail(user.email, resetToken);

    return resetToken;
  }

  async resetPassword(token: string, novaSenha: string): Promise<void> {
    try {
      // Verificar token
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      
      if (decoded.type !== 'reset') {
        throw new AppError('Token inválido', 400);
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Atualizar senha
      user.senha = novaSenha;
      await user.save();

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Token de recuperação inválido ou expirado', 400);
    }
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(token);
    if (!payload) {
      throw new AppError('Refresh token inválido ou expirado', 401);
    }

    const user = await User.findById(payload.id).select('+refreshToken +refreshTokenExpires');
    if (!user || !user.refreshToken) {
      throw new AppError('Refresh token inválido ou revogado', 401);
    }

    if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
      throw new AppError('Refresh token expirado', 401);
    }

    // Comparar o token recebido com o hash armazenado via bcrypt
    const isTokenValid = await bcrypt.compare(token, user.refreshToken);
    if (!isTokenValid) {
      throw new AppError('Refresh token inválido ou revogado', 401);
    }

    return this.generateTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: '', refreshTokenExpires: '' },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId).select('+senha');
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const isPasswordValid = await (user as IUserDocument).comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Senha atual incorreta', 401);
    }

    user.senha = newPassword;
    user.tokenVersion = (user.tokenVersion || 1) + 1;
    user.refreshToken = undefined;
    user.refreshTokenExpires = undefined;
    await user.save();
  }

  async revokeAllSessions(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    user.tokenVersion = (user.tokenVersion || 1) + 1;
    user.refreshToken = undefined;
    user.refreshTokenExpires = undefined;
    await user.save();
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      // Verificar token JWT
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      
      if (decoded.type !== 'verify') {
        throw new AppError('Token de verificação inválido', 400);
      }

      // Encontrar usuário com o token correspondente
      const user = await User.findOne({ 
        email: decoded.email,
        verificationToken: token 
      }).select('+verificationToken +verificationTokenExpires');

      if (!user) {
        throw new AppError('Token inválido ou conta já ativada', 400);
      }

      // Verificar se expirou
      if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
        throw new AppError('Link de verificação expirado. Por favor, faça um novo cadastro.', 400);
      }

      // Ativar e salvar usuário
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Link de verificação inválido ou expirado', 400);
    }
  }
}

export default new AuthService();

