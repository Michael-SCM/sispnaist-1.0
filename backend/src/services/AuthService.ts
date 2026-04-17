import User, { IUserDocument } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { IUser } from '../types/index.js';

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
}

export default new AuthService();
