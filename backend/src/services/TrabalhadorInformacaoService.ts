import TrabalhadorInformacao from '../models/TrabalhadorInformacao';
import { ITrabalhadorInformacao } from '../models/TrabalhadorInformacao';

class TrabalhadorInformacaoService {
  // Listar informações de um trabalhador
  async listarPorTrabalhador(trabalhadorId: string, page = 1, limit = 10): Promise<{ informacoes: ITrabalhadorInformacao[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const [resultados, total] = await Promise.all([
      TrabalhadorInformacao.find({
        trabalhadorId,
        ativo: true,
      }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      TrabalhadorInformacao.countDocuments({ trabalhadorId, ativo: true }),
    ]);

    const pages = Math.ceil(total / limit);

    return { informacoes: resultados as unknown as ITrabalhadorInformacao[], total, pages };
  }

  async obterPorId(id: string): Promise<ITrabalhadorInformacao | null> {
    const item = await TrabalhadorInformacao.findById(id).lean();
    return item as unknown as ITrabalhadorInformacao | null;
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
