import User, { IUserDocument } from '../models/User.js';
import { generateToken, generateRefreshToken, verifyRefreshToken, generate2FAToken, verify2FAToken, generateTrustedDeviceToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { IUser } from '../types/index.js';
import { sendResetPasswordEmail, sendVerificationEmail, send2FACodigoEmail, validateEmailDomain } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/config.js';
import bcrypt from 'bcryptjs';

const CODIGO2FA_EXPIRA_MS = 5 * 60 * 1000; // 5 minutos
const PERFIS_COM_2FA_OBRIGATORIO = ['admin', 'gestor'];

export interface LoginResult {
  needs2FA: boolean;
  user?: IUser;
  accessToken?: string;
  refreshToken?: string;
  preAuthToken?: string;
  doisFatoresHabilitado?: boolean;
}

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
      consentimentoLGPD: userData.consentimentoLGPD || false,
      dataAceiteLGPD: userData.consentimentoLGPD ? new Date() : undefined,
      versaoTermo: userData.versaoTermo || '1.0',
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

  async login(email: string, password: string, confiarDispositivo?: boolean): Promise<LoginResult> {
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

    const perfil = user.perfil || 'trabalhador';
    const doisFatoresAtivos = user.doisFatoresHabilitado === true;
    // Perfis admin/gestor sempre passam pela etapa de código por e-mail no login
    const requer2FA = doisFatoresAtivos || PERFIS_COM_2FA_OBRIGATORIO.includes(perfil);

    if (requer2FA) {
      await this.gerarEEnviarCodigo2FA(user);

      const preAuthToken = generate2FAToken({
        id: user._id.toString(),
        email: user.email,
        perfil,
        confiarDispositivo: confiarDispositivo === true,
      });

      return {
        needs2FA: true,
        doisFatoresHabilitado: doisFatoresAtivos,
        preAuthToken,
      };
    }

    const tokens = await this.generateTokens(user);

    const userObj = user.toObject() as unknown as IUser;
    delete userObj.senha;

    return { needs2FA: false, user: userObj, ...tokens };
  }

  /**
   * Passo 1 alternativo do login (pós-senha): reenvia o código e gera um novo preAuthToken.
   * Usado pelo endpoint POST /auth/2fa/enviar-codigo.
   */
  async enviarCodigo2FA(email: string, password: string): Promise<{ preAuthToken: string; doisFatoresHabilitado: boolean }> {
    const user = await User.findOne({ email }).select('+senha');

    if (!user || user.isVerified === false) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    const isPasswordValid = await (user as IUserDocument).comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    await this.gerarEEnviarCodigo2FA(user);

    const preAuthToken = generate2FAToken({
      id: user._id.toString(),
      email: user.email,
      perfil: user.perfil || 'trabalhador',
    });

    return {
      preAuthToken,
      doisFatoresHabilitado: user.doisFatoresHabilitado === true,
    };
  }

  /**
   * Passo 2 do login: valida o código e emite os tokens de sessão.
   */
  async verificar2FA(preAuthToken: string, codigo: string): Promise<{ user: IUser; accessToken: string; refreshToken: string; doisFatoresHabilitado: boolean; confiarDispositivo?: boolean }> {
    const payload = verify2FAToken(preAuthToken);
    if (!payload) {
      throw new AppError('Token temporário inválido ou expirado. Faça o login novamente.', 401);
    }

    const user = await User.findById(payload.id).select('+senha');
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    await this.validarCodigo2FA(user._id.toString(), codigo);

    const tokens = await this.generateTokens(user);

    const userObj = user.toObject() as unknown as IUser;
    delete userObj.senha;

    return {
      user: userObj,
      ...tokens,
      doisFatoresHabilitado: user.doisFatoresHabilitado === true,
      confiarDispositivo: payload.confiarDispositivo,
    };
  }

  /**
   * Envia um código de confirmação genérico (endpoint POST /auth/2fa/habilitar).
   * Reaproveitado para habilitar 2FA ou confirmar a troca de senha por e-mail.
   */
  async enviarCodigoConfirmacao(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    await this.gerarEEnviarCodigo2FA(user);
  }

  async confirmar2FA(userId: string, codigo: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (user.doisFatoresHabilitado === true) {
      throw new AppError('A autenticação de dois fatores já está habilitada.', 400);
    }

    await this.validarCodigo2FA(userId, codigo);
    await User.findByIdAndUpdate(userId, { doisFatoresHabilitado: true });
  }

  async desabilitar2FA(userId: string, senhaAtual: string, codigo: string): Promise<void> {
    const user = await User.findById(userId).select('+senha');
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (PERFIS_COM_2FA_OBRIGATORIO.includes(user.perfil || '')) {
      throw new AppError('A autenticação de dois fatores é obrigatória para este perfil e não pode ser desabilitada.', 400);
    }

    const isPasswordValid = await (user as IUserDocument).comparePassword(senhaAtual);
    if (!isPasswordValid) {
      throw new AppError('Senha atual incorreta', 401);
    }

    await this.validarCodigo2FA(userId, codigo);
    await User.findByIdAndUpdate(userId, { doisFatoresHabilitado: false });
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

      const user = await User.findById(decoded.id).select('+senha +passwordHistory');
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      if (user.senha) {
        const sameAsCurrent = await bcrypt.compare(novaSenha, user.senha);
        if (sameAsCurrent) {
          throw new AppError('A nova senha deve ser diferente da senha atual.', 400);
        }
      }

      await this.checkReuse(user, novaSenha);

      const currentHash = user.senha;
      if (currentHash) {
        await this.pushPasswordHistory(user, currentHash);
      }

      // Atualizar senha
      user.senha = novaSenha;
      user.tokenVersion = (user.tokenVersion || 1) + 1;
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

  private async checkReuse(user: IUserDocument, newPassword: string): Promise<void> {
    if (user.passwordHistory && user.passwordHistory.length > 0) {
      const maxHistory = 5;
      const recent = user.passwordHistory.slice(-maxHistory);
      for (const entry of recent) {
        const match = await bcrypt.compare(newPassword, entry.hash);
        if (match) {
          throw new AppError('A nova senha não pode ser igual a uma das últimas 5 senhas utilizadas.', 400);
        }
      }
    }
  }

  private async pushPasswordHistory(user: IUserDocument, passwordHash: string): Promise<void> {
    const history = user.passwordHistory || [];
    history.push({ hash: passwordHash, dataAlteracao: new Date() });
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    user.passwordHistory = history;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, codigo: string): Promise<void> {
    const user = await User.findById(userId).select('+senha +passwordHistory');
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const isPasswordValid = await (user as IUserDocument).comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Senha atual incorreta', 401);
    }

    if (currentPassword === newPassword) {
      throw new AppError('A nova senha deve ser diferente da senha atual.', 400);
    }

    await this.checkReuse(user, newPassword);

    // Exigir código de confirmação enviado por e-mail antes de aplicar a nova senha
    await this.validarCodigo2FA(userId, codigo);

    const currentHash = user.senha;
    if (currentHash) {
      await this.pushPasswordHistory(user, currentHash);
    }

    user.senha = newPassword;
    user.tokenVersion = (user.tokenVersion || 1) + 1;
    user.refreshToken = undefined;
    user.refreshTokenExpires = undefined;
    user.ultimaTrocaSenha = new Date();
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

  /**
   * Login direto via trusted device cookie (bypass 2FA).
   * Valida email + senha; retorna null se não bater com o cookie.
   */
  async loginByTrustedDevice(trustedUserId: string, email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string } | null> {
    const trustedUser = await User.findById(trustedUserId);
    if (!trustedUser) return null;

    // Verificar se o email informado pertence ao usuário do cookie
    if (trustedUser.email !== email) return null;

    // Verificar senha
    const user = await User.findOne({ email }).select('+senha');
    if (!user) return null;

    const isPasswordValid = await (user as IUserDocument).comparePassword(password);
    if (!isPasswordValid) return null;

    if (user.isVerified === false) {
      throw new AppError('Conta não verificada', 401);
    }

    const tokens = await this.generateTokens(user);

    const userObj = user.toObject() as unknown as IUser;
    delete userObj.senha;

    return { user: userObj, ...tokens };
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

  // LGPD
  async registerConsent(userId: string, consentimentoLGPD: boolean, versaoTermo?: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      consentimentoLGPD,
      dataAceiteLGPD: consentimentoLGPD ? new Date() : undefined,
      ...(versaoTermo && { versaoTermo }),
    });
  }

  async exportData(userId: string): Promise<any> {
    const user = await User.findById(userId).select('-senha -verificationToken -verificationTokenExpires -refreshToken -refreshTokenExpires');
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const dados: any = {
      dadosCadastrais: user.toObject(),
      dataSolicitacao: new Date().toISOString(),
    };

    return dados;
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const anonimizadoEmail = `removido-${userId}@sispnaist.local`;
    const anonimizadoCpf = `000.000.000-${String(userId).slice(-2).padStart(2, '0')}`;

    await User.findByIdAndUpdate(userId, {
      $set: {
        nome: 'Usuário Removido',
        cpf: anonimizadoCpf,
        email: anonimizadoEmail,
        dataSolicitacaoExclusao: new Date(),
        anonimizado: true,
        dataAnonimizacao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ativo: false,
      },
      $unset: {
        telefone: '',
        endereco: '',
      },
    });
  }

  // =========== HELPERS 2FA (Autenticação de Dois Fatores por e-mail) ===========

  /**
   * Gera um código OTP de 6 dígitos, salva o hash com expiração de 5 minutos
   * e envia o código por e-mail ao usuário.
   */
  private async gerarEEnviarCodigo2FA(user: IUserDocument): Promise<string> {
    const codigo = String(crypto.randomInt(100000, 1000000));
    const hash = await bcrypt.hash(codigo, 10);
    const expira = new Date(Date.now() + CODIGO2FA_EXPIRA_MS);

    await User.findByIdAndUpdate(user._id, {
      codigo2FA: hash,
      codigo2FAExpira: expira,
    });

    await send2FACodigoEmail(user.email, codigo);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n=== CÓDIGO 2FA (DESENVOLVIMENTO) para ${user.email} ===`);
      console.log(codigo);
      console.log(`===============================================\n`);
    }

    return codigo;
  }

  /**
   * Valida o código informado contra o hash armazenado e o invalida em caso de sucesso.
   */
  private async validarCodigo2FA(userId: string, codigo: string): Promise<void> {
    const user = await User.findById(userId).select('+codigo2FA +codigo2FAExpira');
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!user.codigo2FA || !user.codigo2FAExpira) {
      throw new AppError('Nenhum código de confirmação pendente. Solicite um novo código.', 400);
    }

    if (user.codigo2FAExpira < new Date()) {
      await User.findByIdAndUpdate(userId, {
        $unset: { codigo2FA: '', codigo2FAExpira: '' },
      });
      throw new AppError('Código expirado. Solicite um novo código.', 400);
    }

    const isMatch = await bcrypt.compare(codigo, user.codigo2FA);
    if (!isMatch) {
      throw new AppError('Código inválido.', 400);
    }

    await User.findByIdAndUpdate(userId, {
      $unset: { codigo2FA: '', codigo2FAExpira: '' },
    });
  }
}

export default new AuthService();

