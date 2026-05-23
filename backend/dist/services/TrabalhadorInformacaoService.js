import TrabalhadorInformacao from '../models/TrabalhadorInformacao';
class TrabalhadorInformacaoService {
    // Listar informações de um trabalhador
    async listarPorTrabalhador(trabalhadorId) {
        const resultados = await TrabalhadorInformacao.find({
            trabalhadorId,
            ativo: true,
        }).sort({ createdAt: -1 }).lean();
        return resultados;
    }
    // Obter uma informação específica
    async obterPorId(id) {
        return await TrabalhadorInformacao.findById(id).lean();
    }
    // Criar nova informação
    async criar(dados) {
        const informacao = await TrabalhadorInformacao.create(dados);
        return informacao;
    }
    // Atualizar informação
    async atualizar(id, dados) {
        const resultado = await TrabalhadorInformacao.findByIdAndUpdate(id, dados, { new: true, runValidators: true }).lean();
        return resultado;
    }
    // Deletar informação (hard delete)
    async deletar(id) {
        const resultado = await TrabalhadorInformacao.deleteOne({ _id: id });
        return resultado.deletedCount > 0;
    }
}
export default new TrabalhadorInformacaoService();
