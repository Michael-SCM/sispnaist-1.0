import TrabalhadorInformacao from '../models/TrabalhadorInformacao';
import { ITrabalhadorInformacao } from '../models/TrabalhadorInformacao';

class TrabalhadorInformacaoService {
  // Listar informações de um trabalhador
  async listarPorTrabalhador(trabalhadorId: string): Promise<ITrabalhadorInformacao[]> {
    const resultados = await TrabalhadorInformacao.find({
      trabalhadorId,
      ativo: true,
    }).sort({ createdAt: -1 }).lean();

    return resultados as unknown as ITrabalhadorInformacao[];
  }

  // Obter uma informação específica
  async obterPorId(id: string): Promise<ITrabalhadorInformacao | null> {
    return await TrabalhadorInformacao.findById(id).lean();
  }

  // Criar nova informação
  async criar(dados: Partial<ITrabalhadorInformacao>): Promise<ITrabalhadorInformacao> {
    const informacao = await TrabalhadorInformacao.create(dados);
    return informacao as unknown as ITrabalhadorInformacao;
  }

  // Atualizar informação
  async atualizar(id: string, dados: Partial<ITrabalhadorInformacao>): Promise<ITrabalhadorInformacao | null> {
    const resultado = await TrabalhadorInformacao.findByIdAndUpdate(
      id,
      dados,
      { new: true, runValidators: true }
    ).lean();

    return resultado as unknown as ITrabalhadorInformacao | null;
  }

  // Deletar informação (hard delete)
  async deletar(id: string): Promise<boolean> {
    const resultado = await TrabalhadorInformacao.deleteOne({ _id: id });
    return resultado.deletedCount > 0;
  }
}

export default new TrabalhadorInformacaoService();
