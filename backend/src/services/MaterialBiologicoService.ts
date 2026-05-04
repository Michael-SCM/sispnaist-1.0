import MaterialBiologico, { IMaterialBiologicoDocument } from '../models/MaterialBiologico.js';
import Acidente from '../models/Acidente.js';
import Trabalhador from '../models/Trabalhador.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { IMaterialBiologico } from '../models/MaterialBiologico.js';
import mongoose from 'mongoose';

export class MaterialBiologicoService {
  async criar(data: Partial<IMaterialBiologico>): Promise<IMaterialBiologico> {
    // Verificar se o acidente existe
    const acidente = await Acidente.findById(data.acidenteId);
    if (!acidente) {
      throw new AppError('Acidente base não encontrado', 404);
    }

    // Verificar se já existe uma ficha para este acidente
    const existeFicha = await MaterialBiologico.findOne({ acidenteId: data.acidenteId });
    if (existeFicha) {
      throw new AppError('Já existe uma ficha de material biológico para este acidente', 400);
    }

    const ficha = new MaterialBiologico(data);
    await ficha.save();
    return ficha.toObject() as IMaterialBiologico;
  }

  async obter(id: string): Promise<IMaterialBiologico> {
    const ficha = await MaterialBiologico.findById(id).populate({
      path: 'acidenteId',
      populate: { path: 'trabalhadorId', select: 'nome cpf' }
    }).lean();

    if (!ficha) {
      throw new AppError('Ficha de material biológico não encontrada', 404);
    }

    // Corrigir população falha de trabalhadorId dentro de acidenteId
    if (ficha.acidenteId && !(ficha.acidenteId as any).trabalhadorId?.nome) {
      const acidenteIdObj = ficha.acidenteId as any;
      let trabalhadorIdValue = acidenteIdObj.trabalhadorId;
      
      if (!trabalhadorIdValue) {
        const acidenteDoc = await Acidente.findById(acidenteIdObj._id).select('trabalhadorId').lean();
        if (acidenteDoc) trabalhadorIdValue = acidenteDoc.trabalhadorId;
      }

      if (trabalhadorIdValue) {
        const identifier = trabalhadorIdValue.toString();
        let t = null;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
          t = await Trabalhador.findById(identifier).select('nome cpf').lean();
          if (!t) t = await User.findById(identifier).select('nome cpf').lean();
        } else {
          t = await Trabalhador.findOne({ cpf: identifier }).select('nome cpf').lean();
          if (!t) t = await User.findOne({ cpf: identifier }).select('nome cpf').lean();
        }
        if (t) {
          acidenteIdObj.trabalhadorId = t;
        }
      }
    }

    return ficha as unknown as IMaterialBiologico;
  }

  async obterPorAcidente(acidenteId: string): Promise<IMaterialBiologico | null> {
    const ficha = await MaterialBiologico.findOne({ acidenteId }).lean();
    return ficha as unknown as IMaterialBiologico;
  }

  async listar(
    page: number = 1,
    limit: number = 10,
    filtros?: {
      tipoExposicao?: string;
      agente?: string;
    }
  ): Promise<{ fichas: IMaterialBiologico[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filtros?.tipoExposicao) {
      query.tipoExposicao = filtros.tipoExposicao;
    }

    if (filtros?.agente) {
      query.agente = filtros.agente;
    }

    const total = await MaterialBiologico.countDocuments(query);
    const fichasBrutas = await MaterialBiologico.find(query)
      .populate({
        path: 'acidenteId',
        populate: { path: 'trabalhadorId', select: 'nome cpf' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Corrigir população falha
    const fichas = await Promise.all(fichasBrutas.map(async (ficha: any) => {
      if (ficha.acidenteId && !ficha.acidenteId.trabalhadorId?.nome) {
        let trabalhadorIdValue = ficha.acidenteId.trabalhadorId;
        
        if (!trabalhadorIdValue) {
           const acidenteDoc = await Acidente.findById(ficha.acidenteId._id).select('trabalhadorId').lean();
           if (acidenteDoc) trabalhadorIdValue = acidenteDoc.trabalhadorId;
        }

        if (trabalhadorIdValue) {
          const identifier = trabalhadorIdValue.toString();
          let t = null;
          if (mongoose.Types.ObjectId.isValid(identifier)) {
            t = await Trabalhador.findById(identifier).select('nome cpf').lean();
            if (!t) t = await User.findById(identifier).select('nome cpf').lean();
          } else {
            t = await Trabalhador.findOne({ cpf: identifier }).select('nome cpf').lean();
            if (!t) t = await User.findOne({ cpf: identifier }).select('nome cpf').lean();
          }
          if (t) {
            ficha.acidenteId.trabalhadorId = t;
          }
        }
      }
      return ficha;
    }));

    const pages = Math.ceil(total / limit);

    return {
      fichas: fichas as unknown as IMaterialBiologico[],
      total,
      pages,
    };
  }

  async atualizar(id: string, data: Partial<IMaterialBiologico>): Promise<IMaterialBiologico> {
    const ficha = await MaterialBiologico.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!ficha) {
      throw new AppError('Ficha de material biológico não encontrada', 404);
    }

    return ficha as unknown as IMaterialBiologico;
  }

  async deletar(id: string): Promise<void> {
    const result = await MaterialBiologico.findByIdAndDelete(id);

    if (!result) {
      throw new AppError('Ficha de material biológico não encontrada', 404);
    }
  }
}

export default new MaterialBiologicoService();
