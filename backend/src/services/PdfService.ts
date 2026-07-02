import PDFDocument from 'pdfkit';
import { Response } from 'express';
import Trabalhador from '../models/Trabalhador.js';
import Empresa from '../models/Empresa.js';
import Unidade from '../models/Unidade.js';
import Acidente from '../models/Acidente.js';
import Doenca from '../models/Doenca.js';
import Vacinacao from '../models/Vacinacao.js';
import Certificado from '../models/Certificado.js';
import mongoose from 'mongoose';

interface TrabalhadorData {
  _id: string | mongoose.Types.ObjectId;
  nome: string;
  cpf: string;
  email?: string;
  dataNascimento?: string | Date;
  sexo?: string;
  matricula?: string;
  telefone?: string;
  vinculo?: {
    tipoVinculo?: string;
    situacao?: string;
    dataAdmissao?: string;
  };
  trabalho?: {
    cargo?: string;
    setor?: string;
    funcao?: string;
  };
  empresa?: string | mongoose.Types.ObjectId;
  unidade?: string | mongoose.Types.ObjectId;
}

interface EmpresaData {
  _id: string;
  razaoSocial?: string;
  nomeFantasia?: string;
}

/**
 * Serviço de geração de relatórios PDF corporativos
 * Usa streaming direto para não estourar memória do servidor
 */
export class PdfService {
  // Margens do documento (em pontos, 1 ponto = 1/72 polegada)
  private readonly MARGEM_ESQUERDA = 50;
  private readonly MARGEM_DIREITA = 50;
  private readonly MARGEM_TOPO = 50;
  private readonly MARGEM_INFERIOR = 60;
  private readonly LARGURA_PAGINA = 595.28; // A4
  private readonly ALTURA_PAGINA = 841.89; // A4

  // Cores do tema corporativo
  private readonly COR_PRIMARIA = '#1e40af';
  private readonly COR_SECUNDARIA = '#3b82f6';
  private readonly COR_TEXTO = '#1f2937';
  private readonly COR_TEXTO_CLARO = '#6b7280';
  private readonly COR_LINHA_ALTERNADA = '#f9fafb';
  private readonly COR_BORDA = '#e5e7eb';

  // Alturas fixas
  private readonly ALTURA_LINHA = 22;
  private readonly ALTURA_CABECALHO_TABELA = 22;

  // Largura útil da página
  private get larguraUtil(): number {
    return this.LARGURA_PAGINA - this.MARGEM_ESQUERDA - this.MARGEM_DIREITA;
  }

  // Posição Y máxima antes do rodapé
  private get yMax(): number {
    return this.ALTURA_PAGINA - this.MARGEM_INFERIOR;
  }

  // Retorna a data e hora atual no fuso de Brasília (UTC-3)
  private getDataBrasilia(): Date {
    const agora = new Date();
    const brasiliaOffset = -3 * 60; // UTC-3 em minutos
    const offsetBrasilia = agora.getTimezoneOffset() + brasiliaOffset;
    return new Date(agora.getTime() + offsetBrasilia * 60 * 1000);
  }

  // Retorna a data formatada em português (Brasil)
  private formatarDataBrasil(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Gera e faz stream do PDF diretamente para a resposta
   */
  async gerarPdfTrabalhadores(
    res: Response,
    filtros: Record<string, any> = {}
  ): Promise<void> {
    // Buscar trabalhadores do MongoDB (ordenado por nome alfabético)
    const trabalhadores = await Trabalhador.find(filtros).sort({ nome: 1 }).lean();

    // Buscar empresas para resolver referências
    const empresaIds = [...new Set(trabalhadores
      .filter(t => t.empresa)
      .map(t => t.empresa?.toString() as string)
    )];

    const empresas = await Empresa.find({ _id: { $in: empresaIds } }).lean();

    const empresaMap = new Map<string, EmpresaData>(
      empresas.map(e => [e._id.toString(), { ...e.toObject ? e.toObject() : e } as EmpresaData])
    );

    // Configurar resposta como PDF
    const dataEmissao = this.formatarDataBrasil(this.getDataBrasilia());
    const filename = `relatorio_trabalhadores_${this.getDataBrasilia().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Criar PDF com streaming
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
    });

    // Stream direto para a resposta
    doc.pipe(res);

    // Rastrear posição Y atual e página
    let yPos = this.MARGEM_TOPO;
    let paginaAtual = 1;
    const totalPaginas = doc.bufferedPageRange().count || 1;

    // ========== CABEÇALHO (primeira página) ==========
    yPos = this.renderizarCabecalho(doc, dataEmissao);

    // ========== INTRODUÇÃO ==========
    yPos = this.renderizarIntroducao(doc, trabalhadores.length, yPos);

    // ========== TABELA ==========
    yPos = this.renderizarTabela(
      doc,
      trabalhadores,
      empresaMap,
      yPos,
      () => {
        // Callback: adicionar nova página
        doc.addPage();
        yPos = this.MARGEM_TOPO + 30;
        paginaAtual++;
        return yPos;
      }
    );

    // Atualizar total de páginas após renderização
    const totalAposRender = doc.bufferedPageRange().count;

    // ========== RODAPÉ (em todas as páginas) ==========
    this.renderizarRodape(doc);

    // Finalizar PDF
    doc.end();
  }

  /**
   * Renderiza o cabeçalho na primeira página
   */
  private renderizarCabecalho(
    doc: PDFKit.PDFDocument,
    dataEmissao: string
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = this.MARGEM_TOPO;

    // Barra superior azul
    doc
      .fillColor(this.COR_PRIMARIA)
      .rect(0, 0, this.LARGURA_PAGINA, 55)
      .fill();

    // Nome do sistema
    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SISPNAIST', x + 10, 15);

    // Subtítulo
    doc
      .fillColor('#bfdbfe')
      .fontSize(9)
      .font('Helvetica')
      .text('Sistema de Gerenciamento de Segurança e Saúde do Trabalhador', x + 10, 38);

    // Logo placeholder
    doc
      .fillColor('#ffffff')
      .rect(515, 10, 40, 35)
      .strokeColor('#bfdbfe')
      .lineWidth(1)
      .stroke();

    doc
      .fillColor('#bfdbfe')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('SIS', 527, 18);

    y = 70;

    // Linha separadora
    doc
      .moveTo(x, y)
      .lineTo(x + this.larguraUtil, y)
      .lineWidth(1)
      .strokeColor(this.COR_BORDA)
      .stroke();

    y += 12;

    // Título do relatório
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Relatório de Trabalhadores', x, y);

    y += 16;

    // Data de emissão
    doc
      .fillColor(this.COR_TEXTO_CLARO)
      .fontSize(9)
      .font('Helvetica')
      .text(`Emitido em: ${dataEmissao}`, x, y);

    y += 20;

    return y;
  }

  /**
   * Renderiza a introdução
   */
  private renderizarIntroducao(
    doc: PDFKit.PDFDocument,
    totalRegistros: number,
    yInicio: number
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    // Caixa de indicadores
    doc
      .fillColor(this.COR_SECUNDARIA)
      .rect(x, y, this.larguraUtil, 35)
      .fill();

    doc
      .fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('TOTAL DE REGISTROS ENCONTRADOS', x + 10, y + 8);

    doc
      .fillColor('#ffffff')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(`${totalRegistros} trabalhadores`, x + 10, y + 18);

    y += 45;

    // Texto introdutório
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(9)
      .font('Helvetica')
      .text(
        'Este relatório apresenta a relação completa de trabalhadores registrados no sistema SISPNAIST. ' +
        'Os dados foram extraídos diretamente da base de dados e podem ser utilizados para fins de gestão, ' +
        'auditoria e conformidade com as exigências regulamentadoras de segurança e saúde ocupacional.',
        x,
        y,
        {
          align: 'justify',
          width: this.larguraUtil,
          lineGap: 2,
        }
      );

    // Altura do texto + espaço
    const hTexto = doc.heightOfString(
      'Este relatório apresenta a relação completa de trabalhadores registrados no sistema SISPNAIST. ' +
      'Os dados foram extraídos diretamente da base de dados e podem ser utilizados para fins de gestão, ' +
      'auditoria e conformidade com as exigências regulamentadoras de segurança e saúde ocupacional.',
      { align: 'justify', width: this.larguraUtil, lineGap: 2 }
    );

    y += hTexto + 15;

    return y;
  }

  /**
   * Renderiza a tabela com quebra de página automática
   */
  private renderizarTabela(
    doc: PDFKit.PDFDocument,
    trabalhadores: TrabalhadorData[],
    empresaMap: Map<string, EmpresaData>,
    yInicio: number,
    onNovaPagina: () => number
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    if (trabalhadores.length === 0) {
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Nenhum trabalhador encontrado.', x, y);
      return y;
    }

    // Definição das colunas [x, largura, titulo]
    const colunas = [
      { x: 50, largura: 140, titulo: 'Trabalhador' },
      { x: 190, largura: 85, titulo: 'CPF' },
      { x: 275, largura: 120, titulo: 'Cargo / Setor' },
      { x: 395, largura: 100, titulo: 'Empresa' },
      { x: 495, largura: 55, titulo: 'Status' },
    ];

    // ===== CABEÇALHO DA TABELA =====
    const renderizarCabecalhoTabela = (yPos: number) => {
      doc
        .fillColor(this.COR_PRIMARIA)
        .rect(x, yPos, this.larguraUtil, this.ALTURA_CABECALHO_TABELA)
        .fill();

      doc
        .fillColor('#ffffff')
        .fontSize(8)
        .font('Helvetica-Bold');

      colunas.forEach(col => {
        doc.text(col.titulo, col.x, yPos + 7, { width: col.largura });
      });

      return yPos + this.ALTURA_CABECALHO_TABELA;
    };

    // ===== LINHA DE DADOS =====
    const renderizarLinha = (
      trab: TrabalhadorData,
      yPos: number,
      index: number
    ): number => {
      const corFundo = index % 2 === 0 ? '#ffffff' : this.COR_LINHA_ALTERNADA;

      // Fundo da linha
      doc
        .fillColor(corFundo)
        .rect(x, yPos, this.larguraUtil, this.ALTURA_LINHA)
        .fill();

      // Nome (negrito)
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(trab.nome || '-', 52, yPos + 6, { width: 136 });

      // CPF
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(8)
        .font('Helvetica')
        .text(this.formatarCpf(trab.cpf), 192, yPos + 6, { width: 81 });

      // Cargo / Setor
      const cargoSetor = [
        trab.trabalho?.cargo || '-',
        trab.trabalho?.setor || '-',
      ]
        .filter(Boolean)
        .join(' / ');

      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica')
        .text(cargoSetor, 277, yPos + 6, { width: 116 });

      // Empresa - converter ObjectId para string antes de buscar no Map
      const empresaIdStr = trab.empresa ? trab.empresa.toString() : null;
      const empresaNome = empresaIdStr
        ? empresaMap.get(empresaIdStr)?.razaoSocial || '-'
        : '-';

      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(8)
        .font('Helvetica')
        .text(empresaNome, 397, yPos + 6, { width: 96 });

      // Status
      const status = trab.vinculo?.situacao || 'Ativo';
      const corStatus = status === 'Ativo' ? '#059669' : '#dc2626';

      doc
        .fillColor(corStatus)
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(status, 497, yPos + 6, { width: 51 });

      // Linha divisória inferior
      doc
        .moveTo(x, yPos + this.ALTURA_LINHA)
        .lineTo(x + this.larguraUtil, yPos + this.ALTURA_LINHA)
        .lineWidth(0.5)
        .strokeColor(this.COR_BORDA)
        .stroke();

      return yPos + this.ALTURA_LINHA;
    };

    // Renderizar cabeçalho inicial
    y = renderizarCabecalhoTabela(y);

    // Renderizar linhas
    trabalhadores.forEach((trab, index) => {
      // Verificar se precisa de nova página ANTES de desenhar
      // Espaço mínimo necessário = altura de uma linha + folga
      const espacoDisponivel = this.yMax - y;
      const espacoNecessario = this.ALTURA_LINHA + 10;

      if (espacoDisponivel < espacoNecessario) {
        // Adicionar nova página
        doc.addPage();
        y = this.MARGEM_TOPO + 30;

        // Re-renderizar cabeçalho na nova página
        y = renderizarCabecalhoTabela(y);
      }

      // Desenhar linha
      y = renderizarLinha(trab, y, index);
    });

    return y;
  }

  /**
   * Renderiza o rodapé em todas as páginas
   */
  private renderizarRodape(doc: PDFKit.PDFDocument): void {
    const totalPaginas = doc.bufferedPageRange().count;

    // Usar evento para adicionar rodapé em todas as páginas
    doc.on('pageAdded', () => {
      const paginaAtual = doc.bufferedPageRange().start + 1;

      // Linha superior do rodapé
      doc
        .moveTo(this.MARGEM_ESQUERDA, this.yMax)
        .lineTo(this.MARGEM_ESQUERDA + this.larguraUtil, this.yMax)
        .lineWidth(1)
        .strokeColor(this.COR_BORDA)
        .stroke();

      // Texto de confidencialidade
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(7)
        .font('Helvetica')
        .text(
          '⚠️ Este documento é de uso restrito e contém informações confidenciais protegidas pela LGPD (Lei nº 13.709/2018). A distribuição não autorizada é proibida.',
          this.MARGEM_ESQUERDA,
          this.yMax + 8,
          {
            width: this.larguraUtil,
            align: 'center',
          }
        );

      // Numeração de páginas
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Página ${paginaAtual} de ${totalPaginas}`,
          this.MARGEM_ESQUERDA,
          this.yMax + 22,
          {
            width: this.larguraUtil,
            align: 'right',
          }
        );
    });

    // Também desenhar rodapé na primeira página (evento não dispara para page 1)
    const paginaAtual = doc.bufferedPageRange().start + 1;

    doc
      .moveTo(this.MARGEM_ESQUERDA, this.yMax)
      .lineTo(this.MARGEM_ESQUERDA + this.larguraUtil, this.yMax)
      .lineWidth(1)
      .strokeColor(this.COR_BORDA)
      .stroke();

    doc
      .fillColor(this.COR_TEXTO_CLARO)
      .fontSize(7)
      .font('Helvetica')
      .text(
        '⚠️ Este documento é de uso restrito e contém informações confidenciais protegidas pela LGPD (Lei nº 13.709/2018). A distribuição não autorizada é proibida.',
        this.MARGEM_ESQUERDA,
        this.yMax + 8,
        {
          width: this.larguraUtil,
          align: 'center',
        }
      );

    doc
      .fillColor(this.COR_TEXTO_CLARO)
      .fontSize(8)
      .font('Helvetica')
      .text(
        `Página ${paginaAtual} de ${totalPaginas}`,
        this.MARGEM_ESQUERDA,
        this.yMax + 22,
        {
          width: this.larguraUtil,
          align: 'right',
        }
      );
  }

  /**
   * Formata CPF para exibição
   */
  private formatarCpf(cpf: string): string {
    if (!cpf) return '-';
    const limpo = cpf.replace(/\D/g, '');
    if (limpo.length === 11) {
      return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9)}`;
    }
    return cpf;
  }

  /**
   * Formata data para exibição em formato brasileiro
   */
  private formatarData(data: any): string {
    if (!data) return '-';
    try {
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  }

  /**
   * Retorna a data atual no fuso horário de Brasília (America/Sao_Paulo)
   * Ajuste: UTC-3 (horário de Brasília)
   */
  private getDataAtualBrasil(): Date {
    const now = new Date();
    // Subtquir 3 horas para obter o horário de Brasília (UTC-3)
    return new Date(now.getTime() - 3 * 60 * 60 * 1000);
  }

  /**
   * Retorna a data formatada ISO (YYYY-MM-DD) no fuso de Brasília
   */
  private getDataBrasilISO(): string {
    const dataBrasil = this.getDataAtualBrasil();
    const ano = dataBrasil.getUTCFullYear();
    const mes = String(dataBrasil.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(dataBrasil.getUTCDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  /**
   * Gera PDF de acidentes
   */
  async gerarPdfAcidentes(
    res: Response,
    filtros: Record<string, any> = {}
  ): Promise<void> {
    // Buscar acidentes do MongoDB (ordenado por data decrescente)
    const acidentes = await Acidente.find(filtros)
      .sort({ dataAcidente: -1 })
      .populate('trabalhadorId', 'nome cpf empresa')
      .lean();

    // Configurar resposta como PDF
    const dataEmissao = this.formatarDataBrasil(this.getDataBrasilia());
    const filename = `relatorio_acidentes_${this.getDataBrasilia().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Criar PDF com streaming
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
    });

    // Stream direto para a resposta
    doc.pipe(res);

    let yPos = this.MARGEM_TOPO;

    // ========== CABEÇALHO ==========
    yPos = this.renderizarCabecalhoAcidentes(doc, dataEmissao);

    // ========== INTRODUÇÃO ==========
    yPos = this.renderizarIntroducaoAcidentes(doc, acidentes.length, yPos);

    // ========== TABELA ==========
    yPos = this.renderizarTabelaAcidentes(doc, acidentes, yPos);

    // ========== RODAPÉ ==========
    this.renderizarRodape(doc);

    // Finalizar PDF
    doc.end();
  }

  /**
   * Renderiza o cabeçalho específico para acidentes
   */
  private renderizarCabecalhoAcidentes(
    doc: PDFKit.PDFDocument,
    dataEmissao: string
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = this.MARGEM_TOPO;

    // Barra superior azul
    doc
      .fillColor(this.COR_PRIMARIA)
      .rect(0, 0, this.LARGURA_PAGINA, 55)
      .fill();

    // Nome do sistema
    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SISPNAIST', x + 10, 15);

    // Subtítulo
    doc
      .fillColor('#bfdbfe')
      .fontSize(9)
      .font('Helvetica')
      .text('Sistema de Gerenciamento de Segurança e Saúde do Trabalhador', x + 10, 38);

    // Logo placeholder
    doc
      .fillColor('#ffffff')
      .rect(515, 10, 40, 35)
      .strokeColor('#bfdbfe')
      .lineWidth(1)
      .stroke();

    doc
      .fillColor('#bfdbfe')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('SIS', 527, 18);

    y = 70;

    // Linha separadora
    doc
      .moveTo(x, y)
      .lineTo(x + this.larguraUtil, y)
      .lineWidth(1)
      .strokeColor(this.COR_BORDA)
      .stroke();

    y += 12;

    // Título do relatório
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Relatório de Acidentes de Trabalho', x, y);

    y += 16;

    // Data de emissão
    doc
      .fillColor(this.COR_TEXTO_CLARO)
      .fontSize(9)
      .font('Helvetica')
      .text(`Emitido em: ${dataEmissao}`, x, y);

    y += 20;

    return y;
  }

  /**
   * Renderiza a introdução para acidentes
   */
  private renderizarIntroducaoAcidentes(
    doc: PDFKit.PDFDocument,
    totalRegistros: number,
    yInicio: number
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    // Caixa de indicadores
    doc
      .fillColor(this.COR_SECUNDARIA)
      .rect(x, y, this.larguraUtil, 35)
      .fill();

    doc
      .fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('TOTAL DE REGISTROS ENCONTRADOS', x + 10, y + 8);

    doc
      .fillColor('#ffffff')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(`${totalRegistros} acidentes`, x + 10, y + 18);

    y += 45;

    // Texto introdutório
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(9)
      .font('Helvetica')
      .text(
        'Este relatório apresenta a relação completa de acidentes de trabalho registrados no sistema SISPNAIST. ' +
        'Os dados foram extraídos diretamente da base de dados e podem ser utilizados para fins de gestão, ' +
        'auditoria e conformidade com as exigências regulamentadoras de segurança e saúde ocupacional.',
        x,
        y,
        {
          align: 'justify',
          width: this.larguraUtil,
          lineGap: 2,
        }
      );

    const hTexto = doc.heightOfString(
      'Este relatório apresenta a relação completa de acidentes de trabalho registrados no sistema SISPNAIST. ' +
      'Os dados foram extraídos diretamente da base de dados e podem ser utilizados para fins de gestão, ' +
      'auditoria e conformidade com as exigências regulamentadoras de segurança e saúde ocupacional.',
      { align: 'justify', width: this.larguraUtil, lineGap: 2 }
    );

    y += hTexto + 15;

    return y;
  }

  /**
   * Renderiza a tabela de acidentes
   */
  private renderizarTabelaAcidentes(
    doc: PDFKit.PDFDocument,
    acidentes: any[],
    yInicio: number
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    if (acidentes.length === 0) {
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Nenhum acidente encontrado.', x, y);
      return y;
    }

    // Definição das colunas [x, largura, titulo]
    const colunas = [
      { x: 50, largura: 65, titulo: 'Data' },
      { x: 115, largura: 90, titulo: 'Trabalhador' },
      { x: 205, largura: 75, titulo: 'Tipo' },
      { x: 280, largura: 70, titulo: 'Agente' },
      { x: 350, largura: 90, titulo: 'Descrição' },
      { x: 440, largura: 55, titulo: 'Status' },
      { x: 495, largura: 55, titulo: 'Afast.' },
    ];

    // ===== CABEÇALHO DA TABELA =====
    const renderizarCabecalhoTabela = (yPos: number) => {
      doc
        .fillColor(this.COR_PRIMARIA)
        .rect(x, yPos, this.larguraUtil, this.ALTURA_CABECALHO_TABELA)
        .fill();

      doc
        .fillColor('#ffffff')
        .fontSize(7)
        .font('Helvetica-Bold');

      colunas.forEach(col => {
        doc.text(col.titulo, col.x, yPos + 7, { width: col.largura });
      });

      return yPos + this.ALTURA_CABECALHO_TABELA;
    };

    // ===== LINHA DE DADOS =====
    const renderizarLinha = (
      ac: any,
      yPos: number,
      index: number
    ): number => {
      const corFundo = index % 2 === 0 ? '#ffffff' : this.COR_LINHA_ALTERNADA;

      // Fundo da linha
      doc
        .fillColor(corFundo)
        .rect(x, yPos, this.larguraUtil, this.ALTURA_LINHA)
        .fill();

      // Data
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica')
        .text(this.formatarData(ac.dataAcidente), 52, yPos + 6, { width: 61 });

      // Trabalhador
      const nomeTrab = ac.trabalhadorId?.nome || '-';
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(nomeTrab, 117, yPos + 6, { width: 86 });

      // Tipo
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica')
        .text(ac.tipoAcidente || '-', 207, yPos + 6, { width: 71 });

      // Agente Causador
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(6)
        .font('Helvetica')
        .text(ac.agenteCausador || '-', 282, yPos + 6, { width: 66 });

      // Descrição (abreviada)
      const descricao = ac.descricao ? ac.descricao.substring(0, 25) + '...' : '-';
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(6)
        .font('Helvetica')
        .text(descricao, 352, yPos + 6, { width: 86 });

      // Status
      const status = ac.status || 'Aberto';
      const corStatus = status === 'Fechado' ? '#059669' : (status === 'Em Análise' ? '#d97706' : '#dc2626');

      doc
        .fillColor(corStatus)
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(status, 442, yPos + 6, { width: 51 });

      // Afastamento (Sim/Não)
      const afast = ac.afastamento ? 'Sim' : 'Não';
      doc
        .fillColor(ac.afastamento ? '#dc2626' : this.COR_TEXTO_CLARO)
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(afast, 497, yPos + 6, { width: 51 });

      // Linha divisória inferior
      doc
        .moveTo(x, yPos + this.ALTURA_LINHA)
        .lineTo(x + this.larguraUtil, yPos + this.ALTURA_LINHA)
        .lineWidth(0.5)
        .strokeColor(this.COR_BORDA)
        .stroke();

      return yPos + this.ALTURA_LINHA;
    };

    // Renderizar cabeçalho inicial
    y = renderizarCabecalhoTabela(y);

    // Renderizar linhas
    acidentes.forEach((ac, index) => {
      // Verificar se precisa de nova página
      const espacoDisponivel = this.yMax - y;
      const espacoNecessario = this.ALTURA_LINHA + 10;

      if (espacoDisponivel < espacoNecessario) {
        doc.addPage();
        y = this.MARGEM_TOPO + 30;
        y = renderizarCabecalhoTabela(y);
      }

      y = renderizarLinha(ac, y, index);
    });

    return y;
  }

  /**
   * Gera PDF de doenças
   */
  async gerarPdfDoencas(
    res: Response,
    filtros: Record<string, any> = {}
  ): Promise<void> {
    // Buscar doenças do MongoDB (ordenado por data de início decrescente)
    const doencas = await Doenca.find(filtros)
      .sort({ dataInicio: -1 })
      .populate('trabalhadorId', 'nome cpf empresa')
      .lean();

    // Configurar resposta como PDF
    const dataEmissao = this.formatarDataBrasil(this.getDataBrasilia());
    const filename = `relatorio_doencas_${this.getDataBrasilia().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Criar PDF com streaming
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
    });

    // Stream direto para a resposta
    doc.pipe(res);

    let yPos = this.MARGEM_TOPO;

    // ========== CABEÇALHO ==========
    yPos = this.renderizarCabecalhoDoencas(doc, dataEmissao);

    // ========== INTRODUÇÃO ==========
    yPos = this.renderizarIntroducaoDoencas(doc, doencas.length, yPos);

    // ========== TABELA ==========
    yPos = this.renderizarTabelaDoencas(doc, doencas, yPos);

    // ========== RODAPÉ ==========
    this.renderizarRodape(doc);

    // Finalizar PDF
    doc.end();
  }

  /**
   * Renderiza o cabeçalho específico para doenças
   */
  private renderizarCabecalhoDoencas(
    doc: PDFKit.PDFDocument,
    dataEmissao: string
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = this.MARGEM_TOPO;

    // Barra superior azul
    doc
      .fillColor(this.COR_PRIMARIA)
      .rect(0, 0, this.LARGURA_PAGINA, 55)
      .fill();

    // Nome do sistema
    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SISPNAIST', x + 10, 15);

    // Subtítulo
    doc
      .fillColor('#bfdbfe')
      .fontSize(9)
      .font('Helvetica')
      .text('Sistema de Gerenciamento de Segurança e Saúde do Trabalhador', x + 10, 38);

    // Logo placeholder
    doc
      .fillColor('#ffffff')
      .rect(515, 10, 40, 35)
      .strokeColor('#bfdbfe')
      .lineWidth(1)
      .stroke();

    doc
      .fillColor('#bfdbfe')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('SIS', 527, 18);

    y = 70;

    // Linha separadora
    doc
      .moveTo(x, y)
      .lineTo(x + this.larguraUtil, y)
      .lineWidth(1)
      .strokeColor(this.COR_BORDA)
      .stroke();

    y += 12;

    // Título do relatório
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Relatório de Doenças Laborais', x, y);

    y += 16;

    // Data de emissão
    doc
      .fillColor(this.COR_TEXTO_CLARO)
      .fontSize(9)
      .font('Helvetica')
      .text(`Emitido em: ${dataEmissao}`, x, y);

    y += 20;

    return y;
  }

  /**
   * Renderiza a introdução para doenças
   */
  private renderizarIntroducaoDoencas(
    doc: PDFKit.PDFDocument,
    totalRegistros: number,
    yInicio: number
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    // Caixa de indicadores
    doc
      .fillColor(this.COR_SECUNDARIA)
      .rect(x, y, this.larguraUtil, 35)
      .fill();

    doc
      .fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('TOTAL DE REGISTROS ENCONTRADOS', x + 10, y + 8);

    doc
      .fillColor('#ffffff')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(`${totalRegistros} doenças`, x + 10, y + 18);

    y += 45;

    // Texto introdutório
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(9)
      .font('Helvetica')
      .text(
        'Este relatório apresenta a relação completa de doenças laborais registradas no sistema SISPNAIST. ' +
        'Os dados foram extraídos diretamente da base de dados e podem ser utilizados para fins de gestão, ' +
        'auditoria e conformidade com as exigências regulamentadoras de segurança e saúde ocupacional.',
        x,
        y,
        {
          align: 'justify',
          width: this.larguraUtil,
          lineGap: 2,
        }
      );

    const hTexto = doc.heightOfString(
      'Este relatório apresenta a relação completa de doenças laborais registradas no sistema SISPNAIST. ' +
      'Os dados foram extraídos diretamente da base de dados e podem ser utilizados para fins de gestão, ' +
      'auditoria e conformidade com as exigências regulamentadoras de segurança e saúde ocupacional.',
      { align: 'justify', width: this.larguraUtil, lineGap: 2 }
    );

    y += hTexto + 15;

    return y;
  }

  /**
   * Renderiza a tabela de doenças
   */
  private renderizarTabelaDoencas(
    doc: PDFKit.PDFDocument,
    doencas: any[],
    yInicio: number
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    if (doencas.length === 0) {
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Nenhuma doença encontrada.', x, y);
      return y;
    }

    // Definição das colunas
    const colunas = [
      { x: 50, largura: 60, titulo: 'Data Início' },
      { x: 110, largura: 55, titulo: 'Data Fim' },
      { x: 165, largura: 100, titulo: 'Trabalhador' },
      { x: 265, largura: 80, titulo: 'Cód. Doença' },
      { x: 345, largura: 120, titulo: 'Nome da Doença' },
      { x: 465, largura: 80, titulo: 'Status' },
    ];

    // ===== CABEÇALHO DA TABELA =====
    const renderizarCabecalhoTabela = (yPos: number) => {
      doc
        .fillColor(this.COR_PRIMARIA)
        .rect(x, yPos, this.larguraUtil, this.ALTURA_CABECALHO_TABELA)
        .fill();

      doc
        .fillColor('#ffffff')
        .fontSize(7)
        .font('Helvetica-Bold');

      colunas.forEach(col => {
        doc.text(col.titulo, col.x, yPos + 7, { width: col.largura });
      });

      return yPos + this.ALTURA_CABECALHO_TABELA;
    };

    // ===== LINHA DE DADOS =====
    const renderizarLinha = (
      dc: any,
      yPos: number,
      index: number
    ): number => {
      const corFundo = index % 2 === 0 ? '#ffffff' : this.COR_LINHA_ALTERNADA;

      // Fundo da linha
      doc
        .fillColor(corFundo)
        .rect(x, yPos, this.larguraUtil, this.ALTURA_LINHA)
        .fill();

      // Data Início
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica')
        .text(this.formatarData(dc.dataInicio), 52, yPos + 6, { width: 56 });

      // Data Fim
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(7)
        .font('Helvetica')
        .text(dc.dataFim ? this.formatarData(dc.dataFim) : '-', 112, yPos + 6, { width: 51 });

      // Trabalhador
      const nomeTrab = dc.trabalhadorId?.nome || '-';
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(nomeTrab, 167, yPos + 6, { width: 96 });

      // Código da Doença
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica')
        .text(dc.codigoDoenca || '-', 267, yPos + 6, { width: 76 });

      // Nome da Doença
      const nomeDoenca = dc.nomeDoenca ? dc.nomeDoenca.substring(0, 20) + (dc.nomeDoenca.length > 20 ? '...' : '') : '-';
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica')
        .text(nomeDoenca, 347, yPos + 6, { width: 116 });

      // Status (Ativo/Inativo)
      const status = dc.ativo ? 'Ativo' : 'Inativo';
      const corStatus = dc.ativo ? '#059669' : '#dc2626';

      doc
        .fillColor(corStatus)
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(status, 467, yPos + 6, { width: 76 });

      // Linha divisória inferior
      doc
        .moveTo(x, yPos + this.ALTURA_LINHA)
        .lineTo(x + this.larguraUtil, yPos + this.ALTURA_LINHA)
        .lineWidth(0.5)
        .strokeColor(this.COR_BORDA)
        .stroke();

      return yPos + this.ALTURA_LINHA;
    };

    // Renderizar cabeçalho inicial
    y = renderizarCabecalhoTabela(y);

    // Renderizar linhas
    doencas.forEach((dc, index) => {
      // Verificar se precisa de nova página
      const espacoDisponivel = this.yMax - y;
      const espacoNecessario = this.ALTURA_LINHA + 10;

      if (espacoDisponivel < espacoNecessario) {
        doc.addPage();
        y = this.MARGEM_TOPO + 30;
        y = renderizarCabecalhoTabela(y);
      }

      y = renderizarLinha(dc, y, index);
    });

    return y;
  }

  /**
   * Gera PDF de vacinações
   */
  async gerarPdfVacinacoes(
    res: Response,
    filtros: Record<string, any> = {}
  ): Promise<void> {
    // Buscar vacinações do MongoDB (ordenado por data decrescente)
    const vacinacoes = await Vacinacao.find(filtros)
      .sort({ dataVacinacao: -1 })
      .populate('trabalhadorId', 'nome cpf')
      .lean();

    // Configurar resposta como PDF
    const dataEmissao = this.formatarDataBrasil(this.getDataBrasilia());
    const filename = `relatorio_vacinacoes_${this.getDataBrasilia().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Criar PDF com streaming
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
    });

    // Stream direto para a resposta
    doc.pipe(res);

    let yPos = this.MARGEM_TOPO;

    // ========== CABEÇALHO ==========
    yPos = this.renderizarCabecalhoVacinacoes(doc, dataEmissao);

    // ========== INTRODUÇÃO ==========
    yPos = this.renderizarIntroducaoVacinacoes(doc, vacinacoes.length, yPos);

    // ========== TABELA ==========
    yPos = this.renderizarTabelaVacinacoes(doc, vacinacoes, yPos);

    // ========== RODAPÉ ==========
    this.renderizarRodape(doc);

    // Finalizar PDF
    doc.end();
  }

  /**
   * Renderiza o cabeçalho específico para vacinações
   */
  private renderizarCabecalhoVacinacoes(
    doc: PDFKit.PDFDocument,
    dataEmissao: string
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = this.MARGEM_TOPO;

    // Barra superior azul
    doc
      .fillColor(this.COR_PRIMARIA)
      .rect(0, 0, this.LARGURA_PAGINA, 55)
      .fill();

    // Nome do sistema
    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SISPNAIST', x + 10, 15);

    // Subtítulo
    doc
      .fillColor('#bfdbfe')
      .fontSize(9)
      .font('Helvetica')
      .text('Sistema de Gerenciamento de Segurança e Saúde do Trabalhador', x + 10, 38);

    // Logo placeholder
    doc
      .fillColor('#ffffff')
      .rect(515, 10, 40, 35)
      .strokeColor('#bfdbfe')
      .lineWidth(1)
      .stroke();

    doc
      .fillColor('#bfdbfe')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('SIS', 527, 18);

    y = 70;

    // Linha separadora
    doc
      .moveTo(x, y)
      .lineTo(x + this.larguraUtil, y)
      .lineWidth(1)
      .strokeColor(this.COR_BORDA)
      .stroke();

    y += 12;

    // Título do relatório
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Relatório de Vacinações', x, y);

    y += 16;

    // Data de emissão
    doc
      .fillColor(this.COR_TEXTO_CLARO)
      .fontSize(9)
      .font('Helvetica')
      .text(`Emitido em: ${dataEmissao}`, x, y);

    y += 20;

    return y;
  }

  /**
   * Renderiza a introdução para vacinações
   */
  private renderizarIntroducaoVacinacoes(
    doc: PDFKit.PDFDocument,
    totalRegistros: number,
    yInicio: number
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    // Caixa de indicadores
    doc
      .fillColor(this.COR_SECUNDARIA)
      .rect(x, y, this.larguraUtil, 35)
      .fill();

    doc
      .fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('TOTAL DE REGISTROS ENCONTRADOS', x + 10, y + 8);

    doc
      .fillColor('#ffffff')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(`${totalRegistros} vacinações`, x + 10, y + 18);

    y += 45;

    // Texto introdutório
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(9)
      .font('Helvetica')
      .text(
        'Este relatório apresenta a relação completa de vacinações registradas no sistema SISPNAIST. ' +
        'Os dados foram extraídos diretamente da base de dados e podem ser utilizados para fins de gestão, ' +
        'auditoria e conformidade com as exigências regulamentadoras de segurança e saúde ocupacional.',
        x,
        y,
        {
          align: 'justify',
          width: this.larguraUtil,
          lineGap: 2,
        }
      );

    const hTexto = doc.heightOfString(
      'Este relatório apresenta a relação completa de vacinações registradas no sistema SISPNAIST. ' +
      'Os dados foram extraídos diretamente da base de dados e podem ser utilizados para fins de gestão, ' +
      'auditoria e conformidade com as exigências regulamentadoras de segurança e saúde ocupacional.',
      { align: 'justify', width: this.larguraUtil, lineGap: 2 }
    );

    y += hTexto + 15;

    return y;
  }

  /**
   * Renderiza a tabela de vacinações
   */
  private renderizarTabelaVacinacoes(
    doc: PDFKit.PDFDocument,
    vacinacoes: any[],
    yInicio: number
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    if (vacinacoes.length === 0) {
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Nenhuma vacinação encontrada.', x, y);
      return y;
    }

    // Definição das colunas
    const colunas = [
      { x: 50, largura: 70, titulo: 'Data Vacina' },
      { x: 120, largura: 100, titulo: 'Trabalhador' },
      { x: 220, largura: 100, titulo: 'Vacina' },
      { x: 320, largura: 70, titulo: 'Próx. Dose' },
      { x: 390, largura: 100, titulo: 'Unidade Saúde' },
      { x: 490, largura: 60, titulo: 'Profissional' },
    ];

    // ===== CABEÇALHO DA TABELA =====
    const renderizarCabecalhoTabela = (yPos: number) => {
      doc
        .fillColor(this.COR_PRIMARIA)
        .rect(x, yPos, this.larguraUtil, this.ALTURA_CABECALHO_TABELA)
        .fill();

      doc
        .fillColor('#ffffff')
        .fontSize(7)
        .font('Helvetica-Bold');

      colunas.forEach(col => {
        doc.text(col.titulo, col.x, yPos + 7, { width: col.largura });
      });

      return yPos + this.ALTURA_CABECALHO_TABELA;
    };

    // ===== LINHA DE DADOS =====
    const renderizarLinha = (
      vac: any,
      yPos: number,
      index: number
    ): number => {
      const corFundo = index % 2 === 0 ? '#ffffff' : this.COR_LINHA_ALTERNADA;

      // Fundo da linha
      doc
        .fillColor(corFundo)
        .rect(x, yPos, this.larguraUtil, this.ALTURA_LINHA)
        .fill();

      // Data Vacinação
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica')
        .text(this.formatarData(vac.dataVacinacao), 52, yPos + 6, { width: 66 });

      // Trabalhador
      const nomeTrab = vac.trabalhadorId?.nome || '-';
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(nomeTrab, 122, yPos + 6, { width: 96 });

      // Vacina
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica')
        .text(vac.vacina || '-', 222, yPos + 6, { width: 96 });

      // Próxima Dose
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(7)
        .font('Helvetica')
        .text(vac.proximoDose ? this.formatarData(vac.proximoDose) : '-', 322, yPos + 6, { width: 66 });

      // Unidade de Saúde
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(6)
        .font('Helvetica')
        .text(vac.unidadeSaude || '-', 392, yPos + 6, { width: 96 });

      // Profissional
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(6)
        .font('Helvetica')
        .text(vac.profissional || '-', 492, yPos + 6, { width: 56 });

      // Linha divisória inferior
      doc
        .moveTo(x, yPos + this.ALTURA_LINHA)
        .lineTo(x + this.larguraUtil, yPos + this.ALTURA_LINHA)
        .lineWidth(0.5)
        .strokeColor(this.COR_BORDA)
        .stroke();

      return yPos + this.ALTURA_LINHA;
    };

    // Renderizar cabeçalho inicial
    y = renderizarCabecalhoTabela(y);

    // Renderizar linhas
    vacinacoes.forEach((vac, index) => {
      // Verificar se precisa de nova página
      const espacoDisponivel = this.yMax - y;
      const espacoNecessario = this.ALTURA_LINHA + 10;

      if (espacoDisponivel < espacoNecessario) {
        doc.addPage();
        y = this.MARGEM_TOPO + 30;
        y = renderizarCabecalhoTabela(y);
      }

      y = renderizarLinha(vac, y, index);
    });

    return y;
  }

  /**
   * Gera PDF de monitoramento clínico
   */
  async gerarPdfMonitoramento(
    res: Response,
    dados: {
      coberturaVacinal: { total: number; porEmpresa: { nome: string; cobertura: number }[] };
      absenteismo: { totalDias: number; variacao: number; porMes: { mes: string; dias: number }[] };
      alertasCriticos: { trabalhador: string; motivo: string; nivel: string }[];
    }
  ): Promise<void> {
    const dataEmissao = this.formatarDataBrasil(this.getDataBrasilia());
    const filename = `relatorio_monitoramento_${this.getDataBrasilia().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
    });

    doc.pipe(res);

    let yPos = this.MARGEM_TOPO;

    // ========== CABEÇALHO ==========
    yPos = this.renderizarCabecalhoMonitoramento(doc, dataEmissao);

    // ========== KPIs ==========
    yPos = this.renderizarKPIsMonitoramento(doc, dados, yPos);

    // ========== TABELA COBERTURA VACINAL ==========
    yPos = this.renderizarTabelaCoberturaVacinal(doc, dados.coberturaVacinal.porEmpresa, yPos);

    // ========== TABELA ABSENTEÍSMO POR MÊS ==========
    yPos = this.renderizarTabelaAbsenteismo(doc, dados.absenteismo.porMes, yPos);

    // ========== ALERTAS CRÍTICOS ==========
    yPos = this.renderizarAlertasCriticos(doc, dados.alertasCriticos, yPos);

    // ========== RODAPÉ ==========
    this.renderizarRodape(doc);

    doc.end();
  }

  private renderizarCabecalhoMonitoramento(doc: PDFKit.PDFDocument, dataEmissao: string): number {
    const x = this.MARGEM_ESQUERDA;
    let y = this.MARGEM_TOPO;

    doc.fillColor(this.COR_PRIMARIA).rect(0, 0, this.LARGURA_PAGINA, 55).fill();
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('SISPNAIST', x + 10, 15);
    doc.fillColor('#bfdbfe').fontSize(9).font('Helvetica').text('Sistema de Gerenciamento de Segurança e Saúde do Trabalhador', x + 10, 38);
    doc.fillColor('#ffffff').rect(515, 10, 40, 35).strokeColor('#bfdbfe').lineWidth(1).stroke();
    doc.fillColor('#bfdbfe').fontSize(14).font('Helvetica-Bold').text('SIS', 527, 18);

    y = 70;
    doc.moveTo(x, y).lineTo(x + this.larguraUtil, y).lineWidth(1).strokeColor(this.COR_BORDA).stroke();

    y += 12;
    doc.fillColor(this.COR_TEXTO).fontSize(14).font('Helvetica-Bold').text('Relatório de Monitoramento Clínico Avançado', x, y);

    y += 16;
    doc.fillColor(this.COR_TEXTO_CLARO).fontSize(9).font('Helvetica').text(`Emitido em: ${dataEmissao}`, x, y);

    y += 20;
    return y;
  }

  private renderizarKPIsMonitoramento(doc: PDFKit.PDFDocument, dados: any, yInicio: number): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;
    const larguraBox = (this.larguraUtil - 20) / 3;

    // Verificar se há espaço para os 3 boxes (altura 60 + folga 10 = 70)
    if (this.yMax - y < 70) {
      doc.addPage();
      y = this.MARGEM_TOPO + 30;
    }

    // Box Cobertura Vacinal
    doc.fillColor(this.COR_PRIMARIA).rect(x, y, larguraBox, 60).fill();
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('COBERTURA VACINAL', x + 10, y + 10);
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(`${dados.coberturaVacinal.total}%`, x + 10, y + 25);

    // Box Absenteísmo
    doc.fillColor(this.COR_SECUNDARIA).rect(x + larguraBox + 10, y, larguraBox, 60).fill();
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('ABSENTEÍSMO TOTAL', x + larguraBox + 20, y + 10);
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(`${dados.absenteismo.totalDias} dias`, x + larguraBox + 20, y + 25);

    // Box Alertas
    const corAlertas = dados.alertasCriticos.length > 0 ? '#dc2626' : '#059669';
    doc.fillColor(corAlertas).rect(x + (larguraBox + 10) * 2, y, larguraBox, 60).fill();
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('ALERTAS CRÍTICOS', x + (larguraBox + 10) * 2 + 10, y + 10);
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(`${dados.alertasCriticos.length}`, x + (larguraBox + 10) * 2 + 10, y + 25);

    y += 70;
    return y;
  }

  private renderizarTabelaCoberturaVacinal(doc: PDFKit.PDFDocument, porEmpresa: { nome: string; cobertura: number }[], yInicio: number): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    // Verificar espaço para título + cabeçalho mínimo
    if (this.yMax - y < 40) {
      doc.addPage();
      y = this.MARGEM_TOPO;
    }

    doc.fillColor(this.COR_TEXTO).fontSize(12).font('Helvetica-Bold').text('Cobertura Vacinal por Empresa', x, y);
    y += 18;

    const colunas = [
      { x: 50, largura: 300, titulo: 'Empresa' },
      { x: 350, largura: 100, titulo: 'Cobertura (%)' },
      { x: 450, largura: 100, titulo: 'Status' },
    ];

    const renderizarCabecalho = (yPos: number) => {
      doc.fillColor(this.COR_PRIMARIA).rect(x, yPos, this.larguraUtil, this.ALTURA_CABECALHO_TABELA).fill();
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      colunas.forEach(col => doc.text(col.titulo, col.x, yPos + 7, { width: col.largura }));
      return yPos + this.ALTURA_CABECALHO_TABELA;
    };

    const renderizarLinha = (item: { nome: string; cobertura: number }, yPos: number, index: number) => {
      const corFundo = index % 2 === 0 ? '#ffffff' : this.COR_LINHA_ALTERNADA;
      doc.fillColor(corFundo).rect(x, yPos, this.larguraUtil, this.ALTURA_LINHA).fill();
      doc.fillColor(this.COR_TEXTO).fontSize(8).font('Helvetica').text(item.nome, 52, yPos + 6, { width: 296 });
      doc.fillColor(this.COR_TEXTO).fontSize(8).font('Helvetica').text(`${item.cobertura}%`, 352, yPos + 6, { width: 96 });
      const corStatus = item.cobertura >= 80 ? '#059669' : (item.cobertura >= 50 ? '#d97706' : '#dc2626');
      const status = item.cobertura >= 80 ? 'Ótimo' : (item.cobertura >= 50 ? 'Regular' : 'Crítico');
      doc.fillColor(corStatus).fontSize(8).font('Helvetica-Bold').text(status, 452, yPos + 6, { width: 96 });
      doc.moveTo(x, yPos + this.ALTURA_LINHA).lineTo(x + this.larguraUtil, yPos + this.ALTURA_LINHA).lineWidth(0.5).strokeColor(this.COR_BORDA).stroke();
      return yPos + this.ALTURA_LINHA;
    };

    y = renderizarCabecalho(y);

    porEmpresa.forEach((item, index) => {
      const espacoDisponivel = this.yMax - y;
      const espacoNecessario = this.ALTURA_LINHA + 10;
      if (espacoDisponivel < espacoNecessario) {
        doc.addPage();
        y = this.MARGEM_TOPO + 30;
        y = renderizarCabecalho(y);
      }
      y = renderizarLinha(item, y, index);
    });

    y += 15;
    return y;
  }

  private renderizarTabelaAbsenteismo(doc: PDFKit.PDFDocument, porMes: { mes: string; dias: number }[], yInicio: number): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    if (this.yMax - y < 40) {
      doc.addPage();
      y = this.MARGEM_TOPO;
    }

    doc.fillColor(this.COR_TEXTO).fontSize(12).font('Helvetica-Bold').text('Absenteísmo por Mês', x, y);
    y += 18;

    const colunas = [
      { x: 50, largura: 300, titulo: 'Mês' },
      { x: 350, largura: 200, titulo: 'Dias de Absentismo' },
    ];

    const renderizarCabecalho = (yPos: number) => {
      doc.fillColor(this.COR_PRIMARIA).rect(x, yPos, this.larguraUtil, this.ALTURA_CABECALHO_TABELA).fill();
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      colunas.forEach(col => doc.text(col.titulo, col.x, yPos + 7, { width: col.largura }));
      return yPos + this.ALTURA_CABECALHO_TABELA;
    };

    const renderizarLinha = (item: { mes: string; dias: number }, yPos: number, index: number) => {
      const corFundo = index % 2 === 0 ? '#ffffff' : this.COR_LINHA_ALTERNADA;
      doc.fillColor(corFundo).rect(x, yPos, this.larguraUtil, this.ALTURA_LINHA).fill();
      doc.fillColor(this.COR_TEXTO).fontSize(8).font('Helvetica').text(item.mes, 52, yPos + 6, { width: 296 });
      doc.fillColor(this.COR_TEXTO).fontSize(8).font('Helvetica-Bold').text(`${item.dias} dias`, 352, yPos + 6, { width: 196 });
      doc.moveTo(x, yPos + this.ALTURA_LINHA).lineTo(x + this.larguraUtil, yPos + this.ALTURA_LINHA).lineWidth(0.5).strokeColor(this.COR_BORDA).stroke();
      return yPos + this.ALTURA_LINHA;
    };

    y = renderizarCabecalho(y);

    porMes.forEach((item, index) => {
      const espacoDisponivel = this.yMax - y;
      const espacoNecessario = this.ALTURA_LINHA + 10;
      if (espacoDisponivel < espacoNecessario) {
        doc.addPage();
        y = this.MARGEM_TOPO + 30;
        y = renderizarCabecalho(y);
      }
      y = renderizarLinha(item, y, index);
    });

    y += 15;
    return y;
  }

  /**
   * Gera PDF com os dados pessoais do usuário (LGPD)
   */
  async gerarPdfExportData(
    res: Response,
    dados: any
  ): Promise<void> {
    const dataEmissao = this.formatarDataBrasil(this.getDataBrasilia());
    const filename = `meus-dados-lgpd_${this.getDataBrasilia().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
    });

    doc.pipe(res);

    let yPos = this.MARGEM_TOPO;

    // Cabeçalho
    yPos = this.renderizarCabecalho(doc, dataEmissao);

    // Título específico para exportação de dados
    const x = this.MARGEM_ESQUERDA;
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Exportação de Dados Pessoais (LGPD)', x, yPos);

    yPos += 18;

    doc
      .fillColor(this.COR_TEXTO_CLARO)
      .fontSize(9)
      .font('Helvetica')
      .text(`Solicitação realizada em: ${dataEmissao}`, x, yPos);

    yPos += 30;

    // Caixa de informações da solicitação
    doc
      .fillColor(this.COR_SECUNDARIA)
      .rect(x, yPos, this.larguraUtil, 35)
      .fill();

    doc
      .fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('SOLICITAÇÃO DE EXPORTAÇÃO DE DADOS', x + 10, yPos + 3);

    doc
      .fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica')
      .text(
        `Base legal: Art. 18, inciso II da Lei nº 13.709/2018 (LGPD)`,
        x + 10,
        yPos + 18
      );

    yPos += 50;

    // Dados Cadastrais
    const dadosCadastrais = dados.dadosCadastrais || {};

    yPos = this.renderizarSecaoDados(doc, 'Dados Cadastrais', [
      { label: 'Nome', value: dadosCadastrais.nome || '-' },
      { label: 'CPF', value: this.formatarCpf(dadosCadastrais.cpf) },
      { label: 'E-mail', value: dadosCadastrais.email || '-' },
      { label: 'Telefone', value: dadosCadastrais.telefone || '-' },
      { label: 'Data de Nascimento', value: this.formatarData(dadosCadastrais.dataNascimento) },
      { label: 'Sexo', value: dadosCadastrais.sexo || '-' },
      { label: 'Matrícula', value: dadosCadastrais.matricula || '-' },
    ], yPos);

    // Endereço
    if (dadosCadastrais.endereco) {
      const end = dadosCadastrais.endereco;
      yPos = this.renderizarSecaoDados(doc, 'Endereço', [
        { label: 'Logradouro', value: end.logradouro || '-' },
        { label: 'Número', value: end.numero || '-' },
        { label: 'Complemento', value: end.complemento || '-' },
        { label: 'Bairro', value: end.bairro || '-' },
        { label: 'Cidade', value: end.cidade || '-' },
        { label: 'Estado', value: end.estado || '-' },
        { label: 'CEP', value: end.cep || '-' },
      ], yPos);
    }

    // Informações da Conta
    yPos = this.renderizarSecaoDados(doc, 'Informações da Conta', [
      { label: 'Perfil', value: dadosCadastrais.perfil || '-' },
      { label: 'Conta verificada', value: dadosCadastrais.isVerified ? 'Sim' : 'Não' },
      { label: 'Conta ativa', value: dadosCadastrais.ativo !== false ? 'Sim' : 'Não' },
      { label: 'Data de criação', value: this.formatarData(dadosCadastrais.createdAt) },
      { label: 'Última atualização', value: this.formatarData(dadosCadastrais.updatedAt) },
    ], yPos);

    // Consentimento LGPD
    yPos = this.renderizarSecaoDados(doc, 'Consentimento LGPD', [
      { label: 'Consentimento', value: dadosCadastrais.consentimentoLGPD ? 'Aceito' : 'Não registrado' },
      { label: 'Data de aceite', value: dadosCadastrais.dataAceiteLGPD ? this.formatarData(new Date(dadosCadastrais.dataAceiteLGPD)) : '-' },
      { label: 'Versão do termo', value: dadosCadastrais.versaoTermo || '-' },
    ], yPos);

    // Rodapé
    this.renderizarRodape(doc);

    doc.end();
  }

  /**
   * Renderiza uma seção formatada de dados pessoais
   */
  private renderizarSecaoDados(
    doc: PDFKit.PDFDocument,
    titulo: string,
    campos: { label: string; value: string }[],
    yInicio: number
  ): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    // Verificar se precisa de nova página
    const espacoNecessario = 30 + campos.length * 20 + 20;
    if (this.yMax - y < espacoNecessario) {
      doc.addPage();
      y = this.MARGEM_TOPO + 30;
    }

    // Título da seção
    doc
      .fillColor(this.COR_PRIMARIA)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(titulo, x, y);

    y += 18;

    // Linha separadora
    doc
      .moveTo(x, y)
      .lineTo(x + this.larguraUtil, y)
      .lineWidth(1)
      .strokeColor(this.COR_BORDA)
      .stroke();

    y += 10;

    // Campos
    const larguraLabel = 120;
    const larguraValue = this.larguraUtil - larguraLabel - 10;

    campos.forEach((campo) => {
      if (this.yMax - y < 20) {
        doc.addPage();
        y = this.MARGEM_TOPO + 30;
      }

      // Label
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(campo.label, x, y + 2, { width: larguraLabel });

      // Value
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(9)
        .font('Helvetica')
        .text(campo.value, x + larguraLabel + 10, y + 2, { width: larguraValue });

      y += 18;
    });

    y += 15;

    return y;
  }

  private renderizarAlertasCriticos(doc: PDFKit.PDFDocument, alertas: { trabalhador: string; motivo: string; nivel: string }[], yInicio: number): number {
    const x = this.MARGEM_ESQUERDA;
    let y = yInicio;

    if (this.yMax - y < 40) {
      doc.addPage();
      y = this.MARGEM_TOPO;
    }

    doc.fillColor(this.COR_TEXTO).fontSize(12).font('Helvetica-Bold').text('Alertas Críticos', x, y);
    y += 18;

    const colunas = [
      { x: 50, largura: 200, titulo: 'Trabalhador' },
      { x: 250, largura: 250, titulo: 'Motivo' },
      { x: 500, largura: 100, titulo: 'Nível' },
    ];

    const renderizarCabecalho = (yPos: number) => {
      doc.fillColor(this.COR_PRIMARIA).rect(x, yPos, this.larguraUtil, this.ALTURA_CABECALHO_TABELA).fill();
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      colunas.forEach(col => doc.text(col.titulo, col.x, yPos + 7, { width: col.largura }));
      return yPos + this.ALTURA_CABECALHO_TABELA;
    };

    const renderizarLinha = (alerta: { trabalhador: string; motivo: string; nivel: string }, yPos: number, index: number) => {
      const corFundo = index % 2 === 0 ? '#ffffff' : this.COR_LINHA_ALTERNADA;
      doc.fillColor(corFundo).rect(x, yPos, this.larguraUtil, this.ALTURA_LINHA).fill();
      doc.fillColor(this.COR_TEXTO).fontSize(8).font('Helvetica-Bold').text(alerta.trabalhador, 52, yPos + 6, { width: 196 });
      doc.fillColor(this.COR_TEXTO).fontSize(8).font('Helvetica').text(alerta.motivo, 252, yPos + 6, { width: 246 });
      const corNivel = alerta.nivel === 'alto' ? '#dc2626' : '#d97706';
      doc.fillColor(corNivel).fontSize(8).font('Helvetica-Bold').text(alerta.nivel.toUpperCase(), 502, yPos + 6, { width: 96 });
      doc.moveTo(x, yPos + this.ALTURA_LINHA).lineTo(x + this.larguraUtil, yPos + this.ALTURA_LINHA).lineWidth(0.5).strokeColor(this.COR_BORDA).stroke();
      return yPos + this.ALTURA_LINHA;
    };

    y = renderizarCabecalho(y);

    if (!alertas || alertas.length === 0) {
      doc.fillColor(this.COR_TEXTO_CLARO).fontSize(9).font('Helvetica').text('Nenhum alerta crítico no momento.', x, y + 6);
      y += this.ALTURA_LINHA;
    } else {
      alertas.forEach((alerta, index) => {
        const espacoDisponivel = this.yMax - y;
        const espacoNecessario = this.ALTURA_LINHA + 10;
        if (espacoDisponivel < espacoNecessario) {
          doc.addPage();
          y = this.MARGEM_TOPO + 30;
          y = renderizarCabecalho(y);
        }
        y = renderizarLinha(alerta, y, index);
      });
    }

    return y;
  }

  /**
   * Gera PDF de um certificado individual
   */
  async gerarPdfCertificado(
    res: Response,
    certificadoId: string
  ): Promise<void> {
    const certificado = await Certificado.findById(certificadoId).lean();
    if (!certificado) {
      throw new Error('Certificado não encontrado');
    }

    const dataEmissao = certificado.dataEmissao
      ? new Date(certificado.dataEmissao).toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR');

    const filename = `certificado_${certificado.codigoCertificado}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
      bufferPages: true,
    });

    doc.pipe(res);

    const PW = doc.page.width;   // 841.89
    const PH = doc.page.height;  // 595.28
    const CX = PW / 2;           // centro X
    const TW = PW - 100;         // largura do texto (741)
    const LW = 200;              // largura linha decorativa

    // Bordas decorativas
    doc.rect(20, 20, PW - 40, PH - 40).lineWidth(2).stroke('#d97706');
    doc.rect(28, 28, PW - 56, PH - 56).lineWidth(0.5).stroke('#f59e0b');

    // Faixa superior
    doc.rect(20, 20, PW - 40, 55).fillColor('#1e40af').fill();

    doc.fontSize(20).fillColor('#ffffff').font('Helvetica-Bold')
      .text('SISPNAIST', 0, 35, { align: 'center', width: PW });

    doc.fontSize(10).fillColor('#bfdbfe').font('Helvetica')
      .text('Sistema de Gerenciamento de Saúde e Segurança do Trabalho', 0, 60, { align: 'center', width: PW });

    // === TÍTULO ===
    doc.fontSize(24).fillColor('#1e40af').font('Helvetica-Bold')
      .text('CERTIFICADO', 50, 100, { align: 'center', width: TW });

    doc.fontSize(12).fillColor('#6b7280').font('Helvetica')
      .text('de Capacitação e Treinamento', 50, 130, { align: 'center', width: TW });

    doc.moveTo(CX - 80, 155).lineTo(CX + 80, 155).lineWidth(1.5).stroke('#d97706');

    // === CORPO ===
    let y = 175;

    doc.fontSize(11).fillColor('#374151').font('Helvetica')
      .text('Conferimos a', 50, y, { align: 'center', width: TW });

    y = 195;
    doc.fontSize(22).fillColor('#1e40af').font('Helvetica-Bold')
      .text(certificado.nomeUsuario, 50, y, { align: 'center', width: TW });

    y = doc.y + 10;
    doc.fontSize(10).fillColor('#6b7280').font('Helvetica')
      .text(`CPF: ${certificado.cpfUsuario}`, 50, y, { align: 'center', width: TW });

    y = Math.max(doc.y + 12, 245);
    doc.moveTo(CX - 80, y).lineTo(CX + 80, y).lineWidth(1.5).stroke('#d97706');

    y += 22;
    doc.fontSize(11).fillColor('#374151').font('Helvetica')
      .text('por ter concluído o treinamento', 50, y, { align: 'center', width: TW });

    y = doc.y + 8;
    doc.fontSize(16).fillColor('#d97706').font('Helvetica-Bold')
      .text(certificado.tituloTreinamento, 50, y, { align: 'center', width: TW });

    y = doc.y + 8;

    if (certificado.descricaoTreinamento) {
      doc.fontSize(10).fillColor('#6b7280').font('Helvetica-Oblique')
        .text(`"${certificado.descricaoTreinamento}"`, 50, y, { align: 'center', width: TW });
      y = doc.y + 10;
    }

    // Info box
    y = Math.max(y, 330);
    const iw = 340;
    const ix = CX - iw / 2;
    doc.roundedRect(ix, y, iw, 30, 6).fillColor('#fef3c7').fill();

    let infoText = `Pontuação: ${certificado.pontuacaoQuiz}%`;
    if (certificado.cargaHoraria) infoText += `    |    Duração: ${certificado.cargaHoraria}`;
    doc.fontSize(11).fillColor('#92400e').font('Helvetica')
      .text(infoText, ix, y + 8, { align: 'center', width: iw });

    y += 48;

    // Data e código
    y = Math.max(y, 385);
    doc.fontSize(11).fillColor('#6b7280').font('Helvetica')
      .text(`Emitido em ${dataEmissao}`, 50, y, { align: 'center', width: TW });

    doc.fontSize(9).fillColor('#9ca3af').font('Helvetica')
      .text(`Código: ${certificado.codigoCertificado}`, 50, y + 18, { align: 'center', width: TW });

    // Assinatura
    y = Math.max(y + 48, 420);
    const ax = CX - 100;
    doc.moveTo(ax, y).lineTo(ax + 200, y).lineWidth(1).stroke('#374151');
    doc.fontSize(10).fillColor('#374151').font('Helvetica')
      .text(certificado.emitidoPor || 'SISPNAIST', ax, y + 8, { align: 'center', width: 200 });
    doc.fontSize(8).fillColor('#9ca3af').font('Helvetica')
      .text('Responsável pela emissão', ax, y + 24, { align: 'center', width: 200 });

    // Rodapé
    doc.fontSize(7.5).fillColor('#9ca3af').font('Helvetica')
      .text(
        'Documento emitido eletronicamente pelo SISPNAIST. Verifique a autenticidade pelo código do certificado.',
        50, PH - 58, { align: 'center', width: TW }
      );

    doc.end();
  }
}

export default new PdfService();
