import { Request, Response, NextFunction } from 'express';
import Acidente from '../models/Acidente.js';
import Trabalhador from '../models/Trabalhador.js';
import MaterialBiologico from '../models/MaterialBiologico.js';
import { Parser } from 'json2csv';
import { PDFGenerator, TabelaColuna } from '../utils/pdfGenerator.js';

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
   * Exporta trabalhadores em PDF corporativo
   * GET /export/trabalhadores/pdf
   */
  async exportarTrabalhadoresPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const trabalhadores = await Trabalhador.find()
        .select('nome cpf email dataNascimento sexo empresa unidade')
        .lean()
        .limit(1000); // Limita para não sobrecarregar

      if (!trabalhadores || trabalhadores.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Nenhum trabalhador encontrado'
        });
      }

      // Cria gerador PDF
      const pdfGen = new PDFGenerator();
      const doc = pdfGen.getDocument();

      // Define total de páginas (cálculo aproximado)
      const registrosPorPagina = 15;
      const totalPaginas = Math.ceil(trabalhadores.length / registrosPorPagina);
      pdfGen.setTotalPaginas(totalPaginas);

      // Adiciona cabeçalho
      pdfGen.adicionarCabecalho({
        titulo: 'Relatório de Trabalhadores',
        subtitulo: 'Listagem Completa',
        introducao: 'Este relatório contém a listagem completa de todos os trabalhadores cadastrados no sistema SISPNAIST, incluindo dados de identificação, contato e vínculo organizacional.'
      });

      // Adiciona introdução
      pdfGen.adicionarIntroducao(
        'Este documento apresenta um resumo consolidado de todos os trabalhadores registrados. ' +
        'Os dados são apresentados em formato tabelado para fácil consulta e análise. ' +
        'Este é um documento confidencial e deve ser mantido de acordo com as políticas de segurança da organização.'
      );

      // Indicadores rápidos
      pdfGen.adicionarIndicadores({
        'Total de Trabalhadores': trabalhadores.length,
        'Data do Relatório': new Date().toLocaleDateString('pt-BR'),
        'Status': 'Completo'
      });

      // Definição das colunas
      const colunas: TabelaColuna[] = [
        {
          chave: 'nome',
          titulo: 'Nome',
          largura: 150,
          formatador: (val) => PDFGenerator.truncarTexto(val, 25)
        },
        {
          chave: 'cpf',
          titulo: 'CPF',
          largura: 100,
          formatador: PDFGenerator.formatarCPF
        },
        {
          chave: 'email',
          titulo: 'Email',
          largura: 130,
          formatador: (val) => PDFGenerator.truncarTexto(val, 20)
        },
        {
          chave: 'empresa',
          titulo: 'Empresa',
          largura: 100,
          formatador: (val) => PDFGenerator.truncarTexto(val || '-', 15)
        }
      ];

      // Agrupa dados por página
      let pagina = 0;
      for (let i = 0; i < trabalhadores.length; i += registrosPorPagina) {
        if (i > 0) {
          pdfGen.adicionarQuebra();
          pdfGen.adicionarCabecalho({
            titulo: 'Relatório de Trabalhadores (continuação)'
          });
        }

        const registrosPagina = trabalhadores.slice(i, i + registrosPorPagina);
        pdfGen.adicionarTabela(colunas, registrosPagina, { mostrarTotal: i + registrosPorPagina >= trabalhadores.length });
        pagina++;
      }

      // Finaliza documento
      pdfGen.finalizarDocumento();

      // Configura headers para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="trabalhadores_sispnaist.pdf"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Faz pipe do PDF para a resposta
      doc.pipe(res);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta acidentes em PDF corporativo
   * GET /export/acidentes/pdf
   */
  async exportarAcidentesPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const acidentes = await Acidente.find()
        .populate('trabalhadorId', 'nome cpf email')
        .select('trabalhadorId dataAcidente tipoAcidente status descricao')
        .lean()
        .limit(1000);

      if (!acidentes || acidentes.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Nenhum acidente encontrado'
        });
      }

      // Cria gerador PDF
      const pdfGen = new PDFGenerator();
      const doc = pdfGen.getDocument();

      // Define total de páginas
      const registrosPorPagina = 12;
      const totalPaginas = Math.ceil(acidentes.length / registrosPorPagina);
      pdfGen.setTotalPaginas(totalPaginas);

      // Adiciona cabeçalho
      pdfGen.adicionarCabecalho({
        titulo: 'Relatório de Acidentes do Trabalho',
        subtitulo: 'Análise Consolidada'
      });

      // Introdução
      pdfGen.adicionarIntroducao(
        'Este relatório apresenta todos os acidentes de trabalho registrados no sistema SISPNAIST. ' +
        'Cada registro inclui informações do trabalhador afetado, data do evento, tipo de acidente e status atual. ' +
        'Estes dados são essenciais para a vigilância epidemiológica e implementação de medidas preventivas.'
      );

      // Indicadores
      const acidentesAbertos = acidentes.filter(a => a.status === 'aberto' || a.status === 'pendente').length;
      const acidentesFechados = acidentes.filter(a => a.status === 'fechado').length;

      pdfGen.adicionarIndicadores({
        'Total de Acidentes': acidentes.length,
        'Abertos/Pendentes': acidentesAbertos,
        'Fechados': acidentesFechados
      });

      // Colunas
      const colunas: TabelaColuna[] = [
        {
          chave: 'trabalhadorId.nome',
          titulo: 'Trabalhador',
          largura: 140,
          formatador: (val) => PDFGenerator.truncarTexto(val || '-', 20)
        },
        {
          chave: 'trabalhadorId.cpf',
          titulo: 'CPF',
          largura: 95,
          formatador: (val) => PDFGenerator.formatarCPF(val || '')
        },
        {
          chave: 'dataAcidente',
          titulo: 'Data',
          largura: 85,
          formatador: PDFGenerator.formatarDataExibicao
        },
        {
          chave: 'tipoAcidente',
          titulo: 'Tipo',
          largura: 100,
          formatador: (val) => PDFGenerator.truncarTexto(val || '-', 15)
        },
        {
          chave: 'status',
          titulo: 'Status',
          largura: 65,
          alinhamento: 'center',
          formatador: (val) => (val || 'pendente').toUpperCase()
        }
      ];

      // Organiza dados em páginas
      for (let i = 0; i < acidentes.length; i += registrosPorPagina) {
        if (i > 0) {
          pdfGen.adicionarQuebra();
          pdfGen.adicionarCabecalho({
            titulo: 'Relatório de Acidentes (continuação)'
          });
        }

        const registrosPagina = acidentes.slice(i, i + registrosPorPagina);
        pdfGen.adicionarTabela(colunas, registrosPagina, { mostrarTotal: i + registrosPorPagina >= acidentes.length });
      }

      pdfGen.finalizarDocumento();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="acidentes_sispnaist.pdf"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      doc.pipe(res);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta material biológico em PDF corporativo
   * GET /export/material-biologico/pdf
   */
  async exportarMaterialBiologicoPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const fichas = await MaterialBiologico.find()
        .populate({
          path: 'acidenteId',
          select: 'dataAcidente tipoExposicao',
          populate: { 
            path: 'trabalhadorId', 
            select: 'nome cpf email',
            model: 'Trabalhador'
          }
        })
        .select('acidenteId tipoExposicao materialOrganico agente sorologiaPaciente sorologiaAcidentado dataReavaliacao')
        .lean()
        .limit(1000);

      if (!fichas || fichas.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Nenhum registro de material biológico encontrado'
        });
      }

      const pdfGen = new PDFGenerator();
      const doc = pdfGen.getDocument();

      const registrosPorPagina = 10;
      const totalPaginas = Math.ceil(fichas.length / registrosPorPagina);
      pdfGen.setTotalPaginas(totalPaginas);

      pdfGen.adicionarCabecalho({
        titulo: 'Relatório de Exposição a Material Biológico',
        subtitulo: 'Fichas de Avaliação'
      });

      pdfGen.adicionarIntroducao(
        'Este relatório consolidado apresenta todos os registros de exposição ocupacional a material biológico potencialmente contaminado. ' +
        'Inclui informações sobre o tipo de exposição, agente envolvido e sorologia do paciente-índice e acidentado, ' +
        'fundamental para o acompanhamento e vigilância de saúde do trabalhador.'
      );

      const tiposExposicao = new Set(fichas.map(f => f.tipoExposicao));
      const agentes = new Set(fichas.map(f => f.agente));

      pdfGen.adicionarIndicadores({
        'Total de Exposições': fichas.length,
        'Tipos de Exposição': tiposExposicao.size,
        'Agentes Identificados': agentes.size
      });

      const colunas: TabelaColuna[] = [
        {
          chave: 'acidenteId.trabalhadorId.nome',
          titulo: 'Trabalhador',
          largura: 130,
          formatador: (val) => PDFGenerator.truncarTexto(val || '-', 18)
        },
        {
          chave: 'tipoExposicao',
          titulo: 'Tipo Exposição',
          largura: 100,
          formatador: (val) => PDFGenerator.truncarTexto(val || '-', 14)
        },
        {
          chave: 'agente',
          titulo: 'Agente',
          largura: 90,
          formatador: (val) => PDFGenerator.truncarTexto(val || '-', 12)
        },
        {
          chave: 'sorologiaPaciente',
          titulo: 'Sorologia Paciente',
          largura: 95,
          alinhamento: 'center',
          formatador: (val) => val || '-'
        },
        {
          chave: 'sorologiaAcidentado',
          titulo: 'Sorologia Acidentado',
          largura: 100,
          alinhamento: 'center',
          formatador: (val) => val || '-'
        }
      ];

      for (let i = 0; i < fichas.length; i += registrosPorPagina) {
        if (i > 0) {
          pdfGen.adicionarQuebra();
          pdfGen.adicionarCabecalho({
            titulo: 'Relatório de Material Biológico (continuação)'
          });
        }

        const registrosPagina = fichas.slice(i, i + registrosPorPagina);
        pdfGen.adicionarTabela(colunas, registrosPagina, { mostrarTotal: i + registrosPorPagina >= fichas.length });
      }

      pdfGen.finalizarDocumento();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="material_biologico_sispnaist.pdf"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      doc.pipe(res);

    } catch (error) {
      next(error);
    }
  }
}

export default new ExportController();
