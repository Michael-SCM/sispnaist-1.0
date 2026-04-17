import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import Acidente from '../models/Acidente.js';
import Doenca from '../models/Doenca.js';
import Vacinacao from '../models/Vacinacao.js';

/**
 * Gera relatório em formato JSON (base para PDF/XLS)
 * GET /api/reports/acidentes?format=json
 */
export const gerarRelatorioAcidentes = asyncHandler(async (req: Request, res: Response) => {
  const { dataInicio, dataFim, tipoAcidente, status } = req.query;

  const query: any = {};

  if (dataInicio || dataFim) {
    query.dataAcidente = {};
    if (dataInicio) query.dataAcidente.$gte = new Date(dataInicio as string);
    if (dataFim) query.dataAcidente.$lte = new Date(dataFim as string);
  }

  if (tipoAcidente) {
    query.tipoAcidente = tipoAcidente;
  }

  if (status) {
    query.status = status;
  }

  const acidentes = await Acidente.find(query)
    .populate('trabalhadorId', 'nome cpf email')
    .sort({ dataAcidente: -1 })
    .lean();

  // Formato para exportação
  const dadosExportacao = acidentes.map((ac: any) => ({
    Data: new Date(ac.dataAcidente).toLocaleDateString('pt-BR'),
    Trabalhador: ac.trabalhadorId?.nome || 'N/A',
    CPF: ac.trabalhadorId?.cpf || 'N/A',
    Tipo: ac.tipoAcidente,
    Descrição: ac.descricao,
    Local: ac.local || 'N/A',
    Status: ac.status || 'N/A',
    Lesões: Array.isArray(ac.lesoes) ? ac.lesoes.join(', ') : 'Nenhuma',
    'Data Registro': new Date(ac.createdAt).toLocaleDateString('pt-BR'),
  }));

  res.json({
    status: 'success',
    data: {
      total: dadosExportacao.length,
      dados: dadosExportacao,
      periodo: {
        inicio: dataInicio || 'Início',
        fim: dataFim || 'Atual',
      },
    },
  });
});

/**
 * Gera relatório de vacinações
 * GET /api/reports/vacinacoes?format=json
 */
export const gerarRelatorioVacinacoes = asyncHandler(async (req: Request, res: Response) => {
  const vacinacoes = await Vacinacao.find()
    .populate('trabalhadorId', 'nome cpf email')
    .sort({ dataVacinacao: -1 })
    .lean();

  const dadosExportacao = vacinacoes.map((vac: any) => ({
    Trabalhador: vac.trabalhadorId?.nome || 'N/A',
    CPF: vac.trabalhadorId?.cpf || 'N/A',
    Vacina: vac.vacina,
    'Data Vacinação': new Date(vac.dataVacinacao).toLocaleDateString('pt-BR'),
    'Próxima Dose': vac.proximoDose ? new Date(vac.proximoDose).toLocaleDateString('pt-BR') : 'N/A',
    'Unidade Saúde': vac.unidadeSaude || 'N/A',
    Profissional: vac.profissional || 'N/A',
  }));

  res.json({
    status: 'success',
    data: {
      total: dadosExportacao.length,
      dados: dadosExportacao,
    },
  });
});

/**
 * Gera relatório de doenças
 * GET /api/reports/doencas?format=json
 */
export const gerarRelatorioDoencas = asyncHandler(async (req: Request, res: Response) => {
  const doencas = await Doenca.find()
    .populate('trabalhadorId', 'nome cpf email')
    .sort({ dataInicio: -1 })
    .lean();

  const dadosExportacao = doencas.map((doc: any) => ({
    Trabalhador: doc.trabalhadorId?.nome || 'N/A',
    CPF: doc.trabalhadorId?.cpf || 'N/A',
    Código: doc.codigoDoenca,
    'Nome Doença': doc.nomeDoenca,
    'Data Início': new Date(doc.dataInicio).toLocaleDateString('pt-BR'),
    'Data Fim': doc.dataFim ? new Date(doc.dataFim).toLocaleDateString('pt-BR') : 'Ativa',
    'Relato Clínico': doc.relatoClinico || 'N/A',
    Status: doc.ativo ? 'Ativa' : 'Fechada',
  }));

  res.json({
    status: 'success',
    data: {
      total: dadosExportacao.length,
      dados: dadosExportacao,
    },
  });
});
