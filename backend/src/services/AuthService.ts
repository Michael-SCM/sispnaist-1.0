import User, { IUserDocument } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { IUser } from '../types/index.js';
import { sendResetPasswordEmail } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export class AuthService {
  async register(userData: Partial<IUser> & { senha: string }): Promise<{ user: IUser; token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { cpf: userData.cpf }],
    });

    if (existingUser) {
      throw new AppError('Email ou CPF já cadastrado', 400);
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      cpf: user.cpf,
      email: user.email,
      perfil: user.perfil || 'trabalhador',
    });

    const userObj = user.toObject() as IUser;
    delete userObj.senha;

    return { user: userObj, token };
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    // Find user with password field
    const user = await User.findOne({ email }).select('+senha');

    if (!user) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // Compare password
    const isPasswordValid = await (user as IUserDocument).comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      cpf: user.cpf,
      email: user.email,
      perfil: user.perfil || 'trabalhador',
    });

    const userObj = user.toObject() as IUser;
    delete userObj.senha;

    return { user: userObj, token };
  }

  async me(userId: string): Promise<IUser> {
    const user = await User.findById(userId)
      .populate('empresa')
      .populate('unidade');

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const userObj = user.toObject() as IUser;
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

    const userObj = user.toObject() as IUser;
    delete userObj.senha;

    return userObj;
  }

  async forgotPassword(email: string, dataNascimento: string): Promise<void> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!user.dataNascimento) {
      throw new AppError('Data de nascimento não cadastrada para este usuário. Entre em contato com o administrador.', 400);
    }

    // Verificar data de nascimento (comparar apenas YYYY-MM-DD)
    const userBirthDate = user.dataNascimento.toISOString().split('T')[0];
    
    // Garantir que a data fornecida seja tratada como UTC para evitar problemas de fuso horário
    const providedBirthDate = new Date(dataNascimento + 'T12:00:00Z').toISOString().split('T')[0];

    if (userBirthDate !== providedBirthDate) {
      throw new AppError('Data de nascimento incorreta', 400);
    }

    // Gerar token de reset (expira em 1 hora)
    const resetToken = jwt.sign(
      { id: user._id.toString(), email: user.email, type: 'reset' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // Enviar email (simulado)
    await sendResetPasswordEmail(user.email, resetToken);
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
}

export default new AuthService();
