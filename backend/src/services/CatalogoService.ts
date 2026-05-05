import Catalogo, { ICatalogoItem } from '../models/Catalogo';
import { AppError } from '../middleware/errorHandler';
import { IPaginatedResponse, IPaginationOptions } from '../types';

interface ICatalogoDados {
  nome: string;
  sigla?: string;
  descricao?: string;
  ativo?: boolean;
  ordem?: number;
}

class CatalogoService {
  /**
   * Service genérico para gerenciar TODAS as tabelas auxiliares/catalogos.
   * Equivalente ao ComboBox.selectDadosPublicosAPI() do PHP original,
   * mas com operações CRUD completas e paginação.
   */

  // Lista todos os itens de uma entidade com paginação
  async listar(
    entidade: string,
    page: number = 1,
    limit: number = 100,
    ativo?: boolean
  ): Promise<IPaginatedResponse<ICatalogoItem>> {
    this.validarEntidade(entidade);

    const filtro: any = { entidade };
    if (ativo !== undefined) filtro.ativo = ativo;

    const [data, total] = await Promise.all([
      Catalogo.find(filtro)
        .sort({ ordem: 1, nome: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Catalogo.countDocuments(filtro)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Lista apenas itens ativos (equivalente ao getdados.php original)
  async listarAtivos(entidade: string): Promise<ICatalogoItem[]> {
    this.validarEntidade(entidade);

    const resultado = await Catalogo.find({ entidade, ativo: true })
      .sort({ ordem: 1, nome: 1 })
      .select('_id nome sigla descricao ordem')
      .lean();

    // Retorna no formato { id, valor } compatível com o getdados.php
    return resultado.map(item => ({
      ...item,
      valor: item.nome,
      id: (item as any)._id.toString()
    })) as unknown as ICatalogoItem[];
  }

  // Obtém um item específico
  async obter(entidade: string, id: string): Promise<ICatalogoItem> {
    this.validarEntidade(entidade);

    const item = await Catalogo.findOne({ _id: id, entidade });

    if (!item) {
      throw new AppError(`Item não encontrado na entidade ${entidade}`, 404);
    }

    return item;
  }

  // Cria um novo item no catálogo
  async criar(entidade: string, dados: ICatalogoDados): Promise<ICatalogoItem> {
    this.validarEntidade(entidade);

    // Verifica se já existe item com mesmo nome
    const existente = await Catalogo.findOne({
      entidade,
      nome: { $regex: new RegExp(`^${dados.nome}$`, 'i') }
    });

    if (existente) {
      throw new AppError(`Já existe um registro com o nome "${dados.nome}" nesta entidade`, 400);
    }

    const item = await Catalogo.create({
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
  async atualizar(entidade: string, id: string, dados: Partial<ICatalogoDados>): Promise<ICatalogoItem> {
    this.validarEntidade(entidade);

    const item = await Catalogo.findOne({ _id: id, entidade });

    if (!item) {
      throw new AppError(`Item não encontrado na entidade ${entidade}`, 404);
    }

    // Verifica duplicidade se o nome foi alterado
    if (dados.nome && dados.nome !== item.nome) {
      const existente = await Catalogo.findOne({
        entidade,
        nome: { $regex: new RegExp(`^${dados.nome}$`, 'i') },
        _id: { $ne: id }
      });

      if (existente) {
        throw new AppError(`Já existe um registro com o nome "${dados.nome}" nesta entidade`, 400);
      }
    }

    Object.assign(item, dados);
    await item.save();

    return item;
  }

  // Deleta um item (soft delete - marca como inativo)
  async deletar(entidade: string, id: string): Promise<void> {
    this.validarEntidade(entidade);

    const resultado = await Catalogo.updateOne(
      { _id: id, entidade },
      { ativo: false }
    );

    if (resultado.matchedCount === 0) {
      throw new AppError(`Item não encontrado na entidade ${entidade}`, 404);
    }
  }

  // Lista todas as entidades disponíveis com contagem
  async listarEntidades(): Promise<{ entidade: string; total: number; ativos: number }[]> {
    const entidades = Catalogo.schema.path('entidade') as any;
    const listaEntidades: string[] = entidades.enumValues;

    const resultados = await Promise.all(
      listaEntidades.map(async (entidade) => {
        const [total, ativos] = await Promise.all([
          Catalogo.countDocuments({ entidade }),
          Catalogo.countDocuments({ entidade, ativo: true })
        ]);

        return { entidade, total, ativos };
      })
    );

    return resultados.filter(e => e.total > 0);
  }

  // Valida se a entidade é válida
  private validarEntidade(entidade: string): void {
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
      'regimeAcompanhamento', 'equipamentoProtecao', 'tipoVinculo',
      'outroVinculo', 'funcao', 'grauSatisfacao', 'bairro', 'tipoDroga',
      'padraoEmail', 'parametro', 'parentesco', 'sorologia'
    ];

    if (!entidadesValidas.includes(entidade)) {
      throw new AppError(`Entidade "${entidade}" não é válida`, 400);
    }
  }
}

export default new CatalogoService();
