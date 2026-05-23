import Trabalhador from '../models/Trabalhador.js';
import TrabalhadorVinculo from '../models/TrabalhadorVinculo.js';
import TrabalhadorInformacao from '../models/TrabalhadorInformacao.js';
import TrabalhadorDependente from '../models/TrabalhadorDependente.js';
import TrabalhadorAfastamento from '../models/TrabalhadorAfastamento.js';
import TrabalhadorProcessoTrabalho from '../models/TrabalhadorProcessoTrabalho.js';
import TrabalhadorReadaptacao from '../models/TrabalhadorReadaptacao.js';
import TrabalhadorOcorrenciaViolencia from '../models/TrabalhadorOcorrenciaViolencia.js';
import { AppError } from '../middleware/errorHandler.js';
export class TrabalhadorService {
    async listar(page = 1, limit = 10, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros?.nome) {
            // Filtrar começando pelas iniciais do nome (prefixo)
            // Ex: "jo" -> nomes que começam com "Jo" (ignora acentos)
            const nome = String(filtros.nome).trim();
            const pattern = new RegExp('^' + nome, 'i');
            query.nome = { $regex: pattern };
        }
        if (filtros?.cpf) {
            // Normaliza para bater com o padrão do banco (XXX.XXX.XXX-XX) ou pelo menos remove máscara.
            // O backend aceita tanto CPF mascarado quanto apenas dígitos.
            const { toCPFMaskedOrDigits } = await import('../utils/cpf.js');
            query.cpf = toCPFMaskedOrDigits(filtros.cpf);
        }
        if (filtros?.matricula) {
            query.matricula = filtros.matricula;
        }
        if (filtros?.setor) {
            query['trabalho.setor'] = { $regex: filtros.setor, $options: 'i' };
        }
        const [total, trabalhadores] = await Promise.all([
            Trabalhador.countDocuments(query),
            Trabalhador.find(query)
                .sort({ nome: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);
        const pages = Math.ceil(total / limit);
        return {
            trabalhadores: trabalhadores,
            total,
            pages,
        };
    }
    async obter(id) {
        const trabalhador = await Trabalhador.findById(id).lean();
        if (!trabalhador) {
            throw new AppError('Trabalhador não encontrado', 404);
        }
        return trabalhador;
    }
    async obterComSubmodulos(id) {
        const trabalhador = await Trabalhador.findById(id).lean();
        if (!trabalhador) {
            throw new AppError('Trabalhador não encontrado', 404);
        }
        // Buscar todos os submódulos
        const [vinculo, informacao, dependentes, afastamentos, processosTrabalho, readaptacoes, ocorrenciasViolencia] = await Promise.all([
            TrabalhadorVinculo.find({ trabalhadorId: id }).lean(),
            TrabalhadorInformacao.findOne({ trabalhadorId: id.toString() }).lean(),
            TrabalhadorDependente.find({ trabalhadorId: id }).lean(),
            TrabalhadorAfastamento.find({ trabalhadorId: id }).lean(),
            TrabalhadorProcessoTrabalho.find({ trabalhadorId: id }).lean(),
            TrabalhadorReadaptacao.find({ trabalhadorId: id }).lean(),
            TrabalhadorOcorrenciaViolencia.find({ trabalhadorId: id }).lean(),
        ]);
        return {
            ...trabalhador,
            submodulos: {
                vinculos: vinculo || [],
                informacao: informacao || null,
                dependentes: dependentes || [],
                afastamentos: afastamentos || [],
                processosTrabalho: processosTrabalho || [],
                readaptacoes: readaptacoes || [],
                ocorrenciasViolencia: ocorrenciasViolencia || [],
            }
        };
    }
    async obterPorCpf(cpf) {
        const trabalhador = await Trabalhador.findOne({ cpf }).lean();
        if (!trabalhador) {
            throw new AppError('Trabalhador não encontrado', 404);
        }
        return trabalhador;
    }
    async criar(trabalhadorData) {
        const existeCpf = await Trabalhador.findOne({ cpf: trabalhadorData.cpf });
        if (existeCpf) {
            throw new AppError('Já existe um trabalhador cadastrado com este CPF', 400);
        }
        const trabalhador = new Trabalhador(trabalhadorData);
        await trabalhador.save();
        return trabalhador.toObject();
    }
    async atualizar(id, trabalhadorData) {
        // Impedir alteração de CPF via atualização simples se CPF já existe em outro registro
        if (trabalhadorData.cpf) {
            const existeCpf = await Trabalhador.findOne({
                cpf: trabalhadorData.cpf,
                _id: { $ne: id }
            });
            if (existeCpf) {
                throw new AppError('CPF já está em uso por outro trabalhador', 400);
            }
        }
        const trabalhador = await Trabalhador.findByIdAndUpdate(id, { $set: trabalhadorData }, { new: true, runValidators: true }).lean();
        if (!trabalhador) {
            throw new AppError('Trabalhador não encontrado', 404);
        }
        return trabalhador;
    }
    async deletar(id) {
        const result = await Trabalhador.findByIdAndDelete(id);
        if (!result) {
            throw new AppError('Trabalhador não encontrado', 404);
        }
    }
}
export default new TrabalhadorService();
