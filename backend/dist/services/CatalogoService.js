"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Catalogo_1 = __importDefault(require("../models/Catalogo"));
const errorHandler_1 = require("../middleware/errorHandler");
class CatalogoService {
    /**
     * Service genérico para gerenciar TODAS as tabelas auxiliares/catalogos.
     * Equivalente ao ComboBox.selectDadosPublicosAPI() do PHP original,
     * mas com operações CRUD completas e paginação.
     */
    // Lista todos os itens de uma entidade com paginação
    async listar(entidade, page = 1, limit = 100, ativo) {
        this.validarEntidade(entidade);
        const filtro = { entidade };
        if (ativo !== undefined)
            filtro.ativo = ativo;
        const [data, total] = await Promise.all([
            Catalogo_1.default.find(filtro)
                .sort({ ordem: 1, nome: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Catalogo_1.default.countDocuments(filtro)
        ]);
        return {
            data: data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    // Lista apenas itens ativos (equivalente ao getdados.php original)
    async listarAtivos(entidade) {
        this.validarEntidade(entidade);
        const resultado = await Catalogo_1.default.find({ entidade, ativo: true })
            .sort({ ordem: 1, nome: 1 })
            .select('_id nome sigla descricao ordem')
            .lean();
        // Retorna no formato { id, valor } compatível com o getdados.php
        return resultado.map(item => ({
            ...item,
            valor: item.nome,
            id: item._id.toString()
        }));
    }
    // Obtém um item específico
    async obter(entidade, id) {
        this.validarEntidade(entidade);
        const item = await Catalogo_1.default.findOne({ _id: id, entidade });
        if (!item) {
            throw new errorHandler_1.AppError(`Item não encontrado na entidade ${entidade}`, 404);
        }
        return item;
    }
    // Cria um novo item no catálogo
    async criar(entidade, dados) {
        this.validarEntidade(entidade);
        // Verifica se já existe item com mesmo nome
        const existente = await Catalogo_1.default.findOne({
            entidade,
            nome: { $regex: new RegExp(`^${dados.nome}$`, 'i') }
        });
        if (existente) {
            throw new errorHandler_1.AppError(`Já existe um registro com o nome "${dados.nome}" nesta entidade`, 400);
        }
        const item = await Catalogo_1.default.create({
            entidade,
            nome: dados.nome,
            sigla: dados.sigla,
            descricao: dados.descricao,
            ativo: dados.ativo !== undefined ? dados.ativo : true,
            ordem: dados.ordem || 0
        });
        return item;
    }
    // Atualiza um item existente
    async atualizar(entidade, id, dados) {
        this.validarEntidade(entidade);
        const item = await Catalogo_1.default.findOne({ _id: id, entidade });
        if (!item) {
            throw new errorHandler_1.AppError(`Item não encontrado na entidade ${entidade}`, 404);
        }
        // Verifica duplicidade se o nome foi alterado
        if (dados.nome && dados.nome !== item.nome) {
            const existente = await Catalogo_1.default.findOne({
                entidade,
                nome: { $regex: new RegExp(`^${dados.nome}$`, 'i') },
                _id: { $ne: id }
            });
            if (existente) {
                throw new errorHandler_1.AppError(`Já existe um registro com o nome "${dados.nome}" nesta entidade`, 400);
            }
        }
        Object.assign(item, dados);
        await item.save();
        return item;
    }
    // Deleta um item (soft delete - marca como inativo)
    async deletar(entidade, id) {
        this.validarEntidade(entidade);
        const resultado = await Catalogo_1.default.updateOne({ _id: id, entidade }, { ativo: false });
        if (resultado.matchedCount === 0) {
            throw new errorHandler_1.AppError(`Item não encontrado na entidade ${entidade}`, 404);
        }
    }
    // Lista todas as entidades disponíveis com contagem
    async listarEntidades() {
        const entidades = Catalogo_1.default.schema.path('entidade');
        const listaEntidades = entidades.enumValues;
        const resultados = await Promise.all(listaEntidades.map(async (entidade) => {
            const [total, ativos] = await Promise.all([
                Catalogo_1.default.countDocuments({ entidade }),
                Catalogo_1.default.countDocuments({ entidade, ativo: true })
            ]);
            return { entidade, total, ativos };
        }));
        return resultados.filter(e => e.total > 0);
    }
    // Valida se a entidade é válida
    validarEntidade(entidade) {
        const entidadesValidas = [
            'sexo', 'genero', 'racaCor', 'escolaridade', 'estadoCivil',
            'tipoSanguineo', 'estadoVacinal', 'tipoDeficiencia', 'grauDeficiencia',
            'tempoDeficiencia', 'tipoAcidente', 'tipoTrauma', 'causadorTrauma',
            'parteCorpo', 'circunstanciaAcidente', 'tipoExposicao', 'agente',
            'conduta', 'desfecho', 'evolucaoAcidentado', 'evolucaoCaso',
            'materialOrganico', 'sorologiaAcidentado', 'sorologiaPaciente',
            'doencaBase', 'tipoViolencia', 'tipoViolenciaSexual', 'motivoViolencia',
            'meioAgressao', 'tipoAutorViolencia', 'jornadaTrabalho', 'turnoTrabalho',
            'situacaoTrabalho', 'tipoAfastamento', 'motivoAfastamento',
            'motivoReadaptacao', 'tempoReadaptacao',
            'acompanhamentoReadaptacao',
            'grauSatisfacao',
            'regimeAcompanhamento', 'equipamentoProtecao', 'tipoVinculo',
            'outroVinculo', 'funcao', 'bairro', 'tipoDroga',
            'padraoEmail', 'parametro', 'parentesco', 'sorologia'
        ];
        if (!entidadesValidas.includes(entidade)) {
            throw new errorHandler_1.AppError(`Entidade "${entidade}" não é válida`, 400);
        }
    }
}
exports.default = new CatalogoService();
