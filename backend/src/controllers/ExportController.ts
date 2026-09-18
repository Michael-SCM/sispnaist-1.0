import { Request, Response, NextFunction } from 'express';
import Acidente from '../models/Acidente.js';
import Trabalhador from '../models/Trabalhador.js';
import MaterialBiologico from '../models/MaterialBiologico.js';
import { Parser } from 'json2csv';
import pdfService from '../services/PdfService.js';
import analyticsService from '../services/AnalyticsService.js';
import { toCPFMaskedOrDigits } from '../utils/cpf.js';
import mongoose from 'mongoose';
import { escapeRegex, safeDate, safeString } from '../utils/sanitize.js';
import { logExport } from '../utils/auditLogger.js';
import { IAuthRequest } from '../middleware/auth.js';
import { buildUserScope, scopeFilterByTrabalhador, scopeFilterDirect } from '../utils/scope.js';

class ExportController {

  async exportarAcidentesCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = await buildUserScope((req as IAuthRequest).user!);
      const scopeFilter = await scopeFilterByTrabalhador(scope);

      const acidentes = await Acidente.find(scopeFilter)
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

      logExport(req, 'Acidente', 'csv', { totalRegistros: acidentes.length }).catch(() => {});

      res.header('Content-Type', 'text/csv');
      res.attachment('acidentes_sispnaist.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  async exportarTrabalhadoresCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = await buildUserScope((req as IAuthRequest).user!);
      const scopeFilter = scopeFilterDirect(scope, true, true);

      const trabalhadores = await Trabalhador.find(scopeFilter).lean();

      const fields = ['nome', 'cpf', 'email', 'dataNascimento', 'sexo', 'empresa', 'unidade'];
      const json2csv = new Parser({ fields });
      const csv = json2csv.parse(trabalhadores);

      logExport(req, 'Trabalhador', 'csv', { totalRegistros: trabalhadores.length }).catch(() => {});

      res.header('Content-Type', 'text/csv');
      res.attachment('trabalhadores_sispnaist.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  async exportarMaterialBiologicoCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = await buildUserScope((req as IAuthRequest).user!);
      const scopeFilter = await scopeFilterByTrabalhador(scope);

      const fichas = await MaterialBiologico.find()
        .populate({
          path: 'acidenteId',
          match: scopeFilter.trabalhadorId ? { trabalhadorId: scopeFilter.trabalhadorId } : {},
          populate: { path: 'trabalhadorId', select: 'nome cpf' }
        })
        .lean();

      // Filtrar fichas cujo acidenteId não corresponde ao scope (populate com match retorna null)
      const fichasFiltradas = scopeFilter.trabalhadorId
        ? fichas.filter((f: any) => f.acidenteId != null)
        : fichas;

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
      const csv = json2csv.parse(fichasFiltradas);

      logExport(req, 'MaterialBiologico', 'csv', { totalRegistros: fichasFiltradas.length }).catch(() => {});

      res.header('Content-Type', 'text/csv');
      res.attachment('material_biologico_sispnaist.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  async exportarTrabalhadoresPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = await buildUserScope((req as IAuthRequest).user!);
      const baseFilter = scopeFilterDirect(scope, true, true);

      const filtros: Record<string, any> = { ...baseFilter };

      if (req.query.nome && typeof req.query.nome === 'string') {
        filtros.nome = { $regex: escapeRegex(req.query.nome), $options: 'i' };
      }
      if (req.query.cpf && typeof req.query.cpf === 'string') {
        filtros.cpf = toCPFMaskedOrDigits(req.query.cpf);
      }
      if (req.query.matricula && typeof req.query.matricula === 'string') {
        filtros.matricula = safeString(req.query.matricula, 50);
      }
      if (req.query.setor && typeof req.query.setor === 'string') {
        filtros['trabalho.setor'] = { $regex: escapeRegex(req.query.setor), $options: 'i' };
      }

      await pdfService.gerarPdfTrabalhadores(res, filtros);
      logExport(req, 'Trabalhador', 'pdf', { filtros }).catch(() => {});
    } catch (error) {
      next(error);
    }
  }

  async exportarAcidentesPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = await buildUserScope((req as IAuthRequest).user!);
      const baseFilter = await scopeFilterByTrabalhador(scope);

      const filtros: Record<string, any> = { ...baseFilter };

      if (req.query.status && typeof req.query.status === 'string') filtros.status = req.query.status;
      if (req.query.tipoAcidente && typeof req.query.tipoAcidente === 'string') filtros.tipoAcidente = req.query.tipoAcidente;
      if (req.query.cpfTrabalhador && typeof req.query.cpfTrabalhador === 'string') {
        const cpfFormatado = toCPFMaskedOrDigits(req.query.cpfTrabalhador);
        const trabalhador = await Trabalhador.findOne({ cpf: cpfFormatado }).select('_id').lean();
        if (trabalhador) {
          filtros.trabalhadorId = trabalhador._id.toString();
        }
      }
      if (req.query.dataInicio || req.query.dataFim) {
        const inicio = safeDate(req.query.dataInicio);
        const fim = safeDate(req.query.dataFim);
        if (inicio || fim) {
          filtros.dataAcidente = {};
          if (inicio) filtros.dataAcidente.$gte = inicio;
          if (fim) filtros.dataAcidente.$lte = fim;
        }
      }
      if (req.query.descricao && typeof req.query.descricao === 'string') {
        filtros.descricao = { $regex: escapeRegex(req.query.descricao), $options: 'i' };
      }

      await pdfService.gerarPdfAcidentes(res, filtros);
      logExport(req, 'Acidente', 'pdf', { filtros }).catch(() => {});
    } catch (error) {
      next(error);
    }
  }

  async exportarDoencasPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = await buildUserScope((req as IAuthRequest).user!);
      const baseFilter = await scopeFilterByTrabalhador(scope);

      const filtros: Record<string, any> = { ...baseFilter };

      if (req.query.ativo !== undefined) filtros.ativo = req.query.ativo === 'true';
      if (req.query.nomeDoenca && typeof req.query.nomeDoenca === 'string') {
        filtros.nomeDoenca = { $regex: escapeRegex(req.query.nomeDoenca), $options: 'i' };
      }
      if (req.query.trabalhadorId && typeof req.query.trabalhadorId === 'string') {
        if ((mongoose.Types.ObjectId as any).isValid(req.query.trabalhadorId)) {
          filtros.trabalhadorId = req.query.trabalhadorId;
        } else {
          const cpfFormatado = toCPFMaskedOrDigits(req.query.trabalhadorId);
          const trabalhador = await Trabalhador.findOne({ cpf: cpfFormatado }).select('_id').lean();
          if (trabalhador) {
            filtros.trabalhadorId = trabalhador._id.toString();
          }
        }
      }
      if (req.query.dataInicio || req.query.dataFim) {
        const inicio = safeDate(req.query.dataInicio);
        const fim = safeDate(req.query.dataFim);
        if (inicio || fim) {
          filtros.dataInicio = {};
          if (inicio) filtros.dataInicio.$gte = inicio;
          if (fim) filtros.dataInicio.$lte = fim;
        }
      }

      await pdfService.gerarPdfDoencas(res, filtros);
      logExport(req, 'Doenca', 'pdf', { filtros }).catch(() => {});
    } catch (error) {
      next(error);
    }
  }

  async exportarVacinacoesPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = await buildUserScope((req as IAuthRequest).user!);
      const baseFilter = await scopeFilterByTrabalhador(scope);

      const filtros: Record<string, any> = { ...baseFilter };

      if (req.query.vacina && typeof req.query.vacina === 'string') {
        filtros.vacina = { $regex: escapeRegex(req.query.vacina), $options: 'i' };
      }
      if (req.query.trabalhadorId && typeof req.query.trabalhadorId === 'string') {
        if ((mongoose.Types.ObjectId as any).isValid(req.query.trabalhadorId)) {
          filtros.trabalhadorId = req.query.trabalhadorId;
        } else {
          const cpfFormatado = toCPFMaskedOrDigits(req.query.trabalhadorId);
          const trabalhador = await Trabalhador.findOne({ cpf: cpfFormatado }).select('_id').lean();
          if (trabalhador) {
            filtros.trabalhadorId = trabalhador._id.toString();
          }
        }
      }

      await pdfService.gerarPdfVacinacoes(res, filtros);
      logExport(req, 'Vacinacao', 'pdf', { filtros }).catch(() => {});
    } catch (error) {
      next(error);
    }
  }

  async exportarMonitoramentoPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const monitoramento = await analyticsService.obterMonitoramentoClinico();
      await pdfService.gerarPdfMonitoramento(res, monitoramento);
      logExport(req, 'Monitoramento', 'pdf', {}).catch(() => {});
    } catch (error) {
      next(error);
    }
  }
}

export default new ExportController();
