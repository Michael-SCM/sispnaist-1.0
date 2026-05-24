import PDFDocument from 'pdfkit';
import { Response } from 'express';
import Trabalhador from '../models/Trabalhador.js';
import Empresa from '../models/Empresa.js';
import Unidade from '../models/Unidade.js';

interface TrabalhadorData {
  _id: string;
  nome: string;
  cpf: string;
  email?: string;
  dataNascimento?: string;
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
  empresa?: string;
  unidade?: string;
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

  /**
   * Gera e faz stream do PDF diretamente para a resposta
   */
  async gerarPdfTrabalhadores(
    res: Response,
    filtros: Record<string, any> = {}
  ): Promise<void> {
    // Buscar trabalhadores do MongoDB
    const trabalhadores = await Trabalhador.find(filtros).lean();

    // Buscar empresas para resolver referências
    const empresaIds = [...new Set(trabalhadores
      .filter(t => t.empresa)
      .map(t => t.empresa as string)
    )];

    const empresas = await Empresa.find({ _id: { $in: empresaIds } }).lean();

    const empresaMap = new Map<string, EmpresaData>(
      empresas.map(e => [e._id.toString(), e])
    );

    // Configurar resposta como PDF
    const dataEmissao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const filename = `relatorio_trabalhadores_${new Date().toISOString().split('T')[0]}.pdf`;

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
      .fontSize(18)
      .text('🛡️', 525, 13);

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
}

export default new PdfService();