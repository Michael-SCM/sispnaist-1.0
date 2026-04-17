import User, { IUserDocument } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { IUser } from '../types/index.js';

export class UserService {
  async listar(
    page: number = 1,
    limit: number = 10,
    filtros?: {
      nome?: string;
      email?: string;
      perfil?: string;
    }
  ): Promise<{ usuarios: IUser[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filtros?.nome) {
      query.nome = { $regex: filtros.nome, $options: 'i' };
    }

    if (filtros?.email) {
      query.email = { $regex: filtros.email, $options: 'i' };
    }

    if (filtros?.perfil) {
      query.perfil = filtros.perfil;
    }

    const total = await User.countDocuments(query);
    const usuarios = await User.find(query)
      .select('-senha') // Nunca retornar a senha
      .sort({ nome: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = Math.ceil(total / limit);

    return {
      usuarios: usuarios as unknown as IUser[],
      total,
      pages,
    };
  }

  async obter(id: string): Promise<IUser> {
    const usuario = await User.findById(id).select('-senha').lean();

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return usuario as unknown as IUser;
  }

  async atualizar(id: string, userData: Partial<IUser>): Promise<IUser> {
    // Campos que um Admin pode atualizar
    const updateFields: any = {};
    
    if (userData.perfil) updateFields.perfil = userData.perfil;
    if (userData.ativo !== undefined) updateFields.ativo = userData.ativo;
    if (userData.nome) updateFields.nome = userData.nome;
    if (userData.email) updateFields.email = userData.email;
    if (userData.telefone) updateFields.telefone = userData.telefone;
    if (userData.empresa) updateFields.empresa = userData.empresa;
    if (userData.unidade) updateFields.unidade = userData.unidade;

    const usuario = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-senha').lean();

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return usuario as unknown as IUser;
  }

  async deletar(id: string): Promise<void> {
    const usuario = await User.findById(id);
    
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Não permitir deletar o próprio usuário ou o último admin (opcional, mas seguro)
    await User.findByIdAndDelete(id);
  }
}

export default new UserService();
