import { Request, Response, NextFunction } from 'express';
import Acidente from '../models/Acidente.js';
import Trabalhador from '../models/Trabalhador.js';
import MaterialBiologico from '../models/MaterialBiologico.js';
import { Parser } from 'json2csv';
import pdfService from '../services/PdfService.js';
import analyticsService from '../services/AnalyticsService.js';

class ExportController {

  async exportarAcidentesCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const acidentes = await Acidente.find()
        .populate('trabalhadorId', 'nome cpf')
        .lean();

      const fields = [
        { label: 'ID', value: '_id' },
        { label: 'Trabalhador', value: 'trabalhadorId.nome' },
        { label: 'CPF', value: 'trabalhadorId.cpf' },
        { label: 'Data', value: 'dataAcidente' },
        { label: 'Tipo', value: 'tipoAcidente' },
        { label: 'Status', value: 'status' }
      ];

      const json2csv = new Parser({ fields });
      const csv = json2csv.parse(acidentes);

      res.header('Content-Type', 'text/csv');
      res.attachment('acidentes_sispnaist.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  async exportarTrabalhadoresCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const trabalhadores = await Trabalhador.find().lean();

      const fields = ['nome', 'cpf', 'email', 'dataNascimento', 'sexo', 'empresa', 'unidade'];
      const json2csv = new Parser({ fields });
      const csv = json2csv.parse(trabalhadores);

      res.header('Content-Type', 'text/csv');
      res.attachment('trabalhadores_sispnaist.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  async exportarMaterialBiologicoCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const fichas = await MaterialBiologico.find()
        .populate({
          path: 'acidenteId',
          populate: { path: 'trabalhadorId', select: 'nome cpf' }
        })
        .lean();

      const fields = [
        { label: 'Trabalhador', value: 'acidenteId.trabalhadorId.nome' },
        { label: 'CPF', value: 'acidenteId.trabalhadorId.cpf' },
        { label: 'Data Acidente', value: 'acidenteId.dataAcidente' },
        { label: 'Tipo Exposição', value: 'tipoExposicao' },
        { label: 'Material Orgânico', value: 'materialOrganico' },
        { label: 'Agente', value: 'agente' },
        { label: 'Sorologia Paciente', value: 'sorologiaPaciente' },
        { label: 'Sorologia Acidentado', value: 'sorologiaAcidentado' },
        { label: 'Data Reavaliação', value: 'dataReavaliacao' }
      ];

      const json2csv = new Parser({ fields });
      const csv = json2csv.parse(fichas);

      res.header('Content-Type', 'text/csv');
      res.attachment('material_biologico_sispnaist.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta trabalhadores em formato PDF corporativo
   * Usa streaming direto para res para não estourar memória
   */
  async exportarTrabalhadoresPDF(req: Request, res: Response, next: NextFunction) {
    try {
      // Extrair filtros da query string com sanitização
      const filtros: Record<string, any> = {};

      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      if (req.query.nome && typeof req.query.nome === 'string') {
        filtros.nome = { $regex: escapeRegex(req.query.nome), $options: 'i' };
      }
      if (req.query.cpf && typeof req.query.cpf === 'string') {
        filtros.cpf = req.query.cpf;
      }
      if (req.query.matricula && typeof req.query.matricula === 'string') {
        filtros.matricula = req.query.matricula;
      }
      if (req.query.setor && typeof req.query.setor === 'string') {
        filtros['trabalho.setor'] = { $regex: escapeRegex(req.query.setor), $options: 'i' };
      }

      await pdfService.gerarPdfTrabalhadores(res, filtros);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta acidentes em formato PDF corporativo
   */
  async exportarAcidentesPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const filtros: Record<string, any> = {};

      if (req.query.status && typeof req.query.status === 'string') filtros.status = req.query.status;
      if (req.query.tipoAcidente && typeof req.query.tipoAcidente === 'string') filtros.tipoAcidente = req.query.tipoAcidente;
      if (req.query.cpfTrabalhador && typeof req.query.cpfTrabalhador === 'string') {
        const cpfDigits = req.query.cpfTrabalhador.replace(/\D/g, '');
        const trabalhador = await Trabalhador.findOne({ cpf: cpfDigits }).select('_id').lean();
        if (trabalhador) {
          filtros.trabalhadorId = trabalhador._id.toString();
        }
      }
      if ((req.query.dataInicio || req.query.dataFim) && (typeof req.query.dataInicio === 'string' || typeof req.query.dataFim === 'string')) {
        filtros.dataAcidente = {};
        if (req.query.dataInicio && typeof req.query.dataInicio === 'string') {
          filtros.dataAcidente.$gte = new Date(req.query.dataInicio);
        }
        if (req.query.dataFim && typeof req.query.dataFim === 'string') {
          filtros.dataAcidente.$lte = new Date(req.query.dataFim);
        }
      }
      if (req.query.descricao && typeof req.query.descricao === 'string') {
        filtros.descricao = { $regex: escapeRegex(req.query.descricao), $options: 'i' };
      }

      await pdfService.gerarPdfAcidentes(res, filtros);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta doenças em formato PDF corporativo
   */
  async exportarDoencasPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const filtros: Record<string, any> = {};

      if (req.query.ativo !== undefined) filtros.ativo = req.query.ativo === 'true';
      if (req.query.nomeDoenca && typeof req.query.nomeDoenca === 'string') {
        filtros.nomeDoenca = { $regex: escapeRegex(req.query.nomeDoenca), $options: 'i' };
      }
      if (req.query.trabalhadorId && typeof req.query.trabalhadorId === 'string') filtros.trabalhadorId = req.query.trabalhadorId;
      if ((req.query.dataInicio || req.query.dataFim) && (typeof req.query.dataInicio === 'string' || typeof req.query.dataFim === 'string')) {
        filtros.dataInicio = {};
        if (req.query.dataInicio && typeof req.query.dataInicio === 'string') {
          filtros.dataInicio.$gte = new Date(req.query.dataInicio);
        }
        if (req.query.dataFim && typeof req.query.dataFim === 'string') {
          filtros.dataInicio.$lte = new Date(req.query.dataFim);
        }
      }

      await pdfService.gerarPdfDoencas(res, filtros);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta vacinações em formato PDF corporativo
   */
  async exportarVacinacoesPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const filtros: Record<string, any> = {};

      if (req.query.vacina && typeof req.query.vacina === 'string') {
        filtros.vacina = { $regex: escapeRegex(req.query.vacina), $options: 'i' };
      }
      if (req.query.trabalhadorId && typeof req.query.trabalhadorId === 'string') filtros.trabalhadorId = req.query.trabalhadorId;

      await pdfService.gerarPdfVacinacoes(res, filtros);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta monitoramento clínico em formato PDF corporativo
   */
  async exportarMonitoramentoPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const monitoramento = await analyticsService.obterMonitoramentoClinico();
      await pdfService.gerarPdfMonitoramento(res, monitoramento);
    } catch (error) {
      next(error);
    }
  }
}

export default new ExportController();
