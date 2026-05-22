import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

/**
 * Interface para configurações do PDF
 */
export interface PDFConfig {
  titulo: string;
  subtitulo?: string;
  introducao?: string;
}

/**
 * Interface para configuração de coluna da tabela
 */
export interface TabelaColuna {
  chave: string;
  titulo: string;
  largura: number;
  alinhamento?: 'left' | 'center' | 'right';
  formatador?: (valor: any) => string;
}

/**
 * Classe utilitária para gerar PDFs corporativos
 */
export class PDFGenerator {
  private doc: PDFDocument;
  private paginaAtual: number = 1;
  private totalPaginas: number = 1;
  private margemEsquerda: number = 40;
  private margemDireita: number = 40;
  private margemTopo: number = 40;
  private margemRodape: number = 50;
  private larguraUtil: number;
  private alturaLinhaTabela: number = 25;
  private corZebrada: string = '#f5f5f5';
  private corPrincipal: string = '#1e40af';
  private corTexto: string = '#333333';
  private corCinza: string = '#666666';

  constructor() {
    this.doc = new PDFDocument({
      margin: 40,
      size: 'A4',
    });

    this.larguraUtil =
      this.doc.page.width - this.margemEsquerda - this.margemDireita;
  }

  /**
   * Retorna o documento PDF
   */
  getDocument(): PDFDocument {
    return this.doc;
  }

  /**
   * Define o total de páginas (para rodapé)
   */
  setTotalPaginas(total: number): void {
    this.totalPaginas = total;
  }

  /**
   * Adiciona cabeçalho corporativo do sistema
   */
  adicionarCabecalho(config: PDFConfig): void {
    const larguraLogo = 80;
    const xCentro = this.doc.page.width / 2;

    // Retângulo de fundo
    this.doc
      .rect(0, 0, this.doc.page.width, 110)
      .fill(this.corPrincipal);

    // Área para logotipo (placeholder)
    this.doc
      .rect(this.margemEsquerda, 20, larguraLogo, larguraLogo)
      .stroke('#ffffff');

    this.doc
      .font('Helvetica', 8)
      .fillColor('#ffffff')
      .text('[LOGO]', this.margemEsquerda + 5, 55, {
        width: larguraLogo - 10,
        align: 'center',
      });

    // Título e informações
    const xTitulo = this.margemEsquerda + larguraLogo + 20;
    const larguraTitulo = this.doc.page.width - xTitulo - this.margemDireita;

    this.doc
      .font('Helvetica-Bold', 16)
      .fillColor('#ffffff')
      .text('SISPNAIST', xTitulo, 25, { width: larguraTitulo })
      .font('Helvetica', 10)
      .fillColor('#e0e7ff')
      .text(config.titulo || 'Relatório Geral', xTitulo, 50, {
        width: larguraTitulo,
      });

    // Data e informações de emissão
    const dataEmissao = this.formatarData(new Date());
    const horaEmissao = new Date().toLocaleTimeString('pt-BR');

    this.doc
      .font('Helvetica', 8)
      .fillColor('#d0d5ff')
      .text(`Emitido em: ${dataEmissao} às ${horaEmissao}`, xTitulo, 75, {
        width: larguraTitulo,
      })
      .text('Relatório Confidencial - Protegido por Lei', xTitulo, 90, {
        width: larguraTitulo,
      });

    // Retorno ao ponto correto
    this.doc.moveDown(5);
  }

  /**
   * Adiciona seção de introdução
   */
  adicionarIntroducao(texto: string): void {
    this.doc
      .font('Helvetica-Bold', 12)
      .fillColor(this.corPrincipal)
      .text('Objetivo do Relatório', { underline: true });

    this.doc
      .font('Helvetica', 10)
      .fillColor(this.corTexto)
      .text(texto, {
        align: 'justify',
      });

    this.doc.moveDown();
  }

  /**
   * Adiciona bloco de indicadores rápidos
   */
  adicionarIndicadores(indicadores: { [key: string]: string | number }): void {
    this.doc
      .font('Helvetica-Bold', 12)
      .fillColor(this.corPrincipal)
      .text('Indicadores Rápidos', { underline: true });

    this.doc.moveDown(0.5);

    const larguraBloco =
      (this.larguraUtil - 30) / Math.min(3, Object.keys(indicadores).length);
    let xAtual = this.margemEsquerda;
    let indice = 0;

    for (const [chave, valor] of Object.entries(indicadores)) {
      // Fundo do bloco
      this.doc
        .rect(xAtual, this.doc.y, larguraBloco, 60)
        .fill('#f0f4f8');

      // Borda
      this.doc
        .rect(xAtual, this.doc.y - 60, larguraBloco, 60)
        .stroke(this.corPrincipal);

      // Conteúdo do bloco
      const yBloco = this.doc.y - 55;
      this.doc
        .font('Helvetica', 9)
        .fillColor(this.corCinza)
        .text(chave, xAtual + 8, yBloco, { width: larguraBloco - 16 });

      this.doc
        .font('Helvetica-Bold', 18)
        .fillColor(this.corPrincipal)
        .text(String(valor), xAtual + 8, yBloco + 15, {
          width: larguraBloco - 16,
        });

      xAtual += larguraBloco + 15;
      indice++;

      if (indice % 3 === 0) {
        xAtual = this.margemEsquerda;
        this.doc.moveDown(4);
      }
    }

    this.doc.moveDown(2);
  }

  /**
   * Adiciona tabela com dados
   */
  adicionarTabela(
    colunas: TabelaColuna[],
    dados: any[],
    opcoes?: { mostrarTotal?: boolean }
  ): void {
    const yInicio = this.doc.y;
    const alturaLinha = this.alturaLinhaTabela;

    // Cabeçalho da tabela
    this.doc
      .rect(
        this.margemEsquerda,
        yInicio,
        this.larguraUtil,
        alturaLinha
      )
      .fill(this.corPrincipal);

    this.doc
      .font('Helvetica-Bold', 10)
      .fillColor('#ffffff');

    let xColuna = this.margemEsquerda + 8;
    for (const coluna of colunas) {
      this.doc.text(
        coluna.titulo,
        xColuna,
        yInicio + 7,
        {
          width: coluna.largura - 16,
          truncate: true,
        }
      );
      xColuna += coluna.largura;
    }

    this.doc.moveDown(this.alturaLinhaTabela / this.doc.currentLineHeight());

    // Dados da tabela
    dados.forEach((linha, indice) => {
      const yLinha = this.doc.y;
      const ehPar = indice % 2 === 0;

      // Fundo zebrado
      if (ehPar) {
        this.doc
          .rect(
            this.margemEsquerda,
            yLinha,
            this.larguraUtil,
            alturaLinha
          )
          .fill(this.corZebrada);
      } else {
        this.doc
          .rect(
            this.margemEsquerda,
            yLinha,
            this.larguraUtil,
            alturaLinha
          )
          .fill('#ffffff');
      }

      // Borda das linhas
      this.doc
        .rect(
          this.margemEsquerda,
          yLinha,
          this.larguraUtil,
          alturaLinha
        )
        .stroke('#ddd');

      // Texto das células
      this.doc
        .font('Helvetica', 9)
        .fillColor(this.corTexto);

      xColuna = this.margemEsquerda + 8;
      for (const coluna of colunas) {
        const valor = linha[coluna.chave];
        const textoFormatado = coluna.formatador
          ? coluna.formatador(valor)
          : String(valor || '-');

        this.doc.text(
          textoFormatado,
          xColuna,
          yLinha + 7,
          {
            width: coluna.largura - 16,
            align: coluna.alinhamento || 'left',
            truncate: true,
          }
        );
        xColuna += coluna.largura;
      }

      this.doc.moveDown(this.alturaLinhaTabela / this.doc.currentLineHeight());
    });

    // Linha de total (opcional)
    if (opcoes?.mostrarTotal && dados.length > 0) {
      const yTotal = this.doc.y;
      this.doc
        .rect(
          this.margemEsquerda,
          yTotal,
          this.larguraUtil,
          alturaLinha
        )
        .fill('#e8eef7');

      this.doc
        .rect(
          this.margemEsquerda,
          yTotal,
          this.larguraUtil,
          alturaLinha
        )
        .stroke(this.corPrincipal);

      this.doc
        .font('Helvetica-Bold', 10)
        .fillColor(this.corPrincipal)
        .text(`Total de Registros: ${dados.length}`, this.margemEsquerda + 8, yTotal + 7);

      this.doc.moveDown(this.alturaLinhaTabela / this.doc.currentLineHeight());
    }

    this.doc.moveDown();
  }

  /**
   * Adiciona quebra de página com rodapé
   */
  adicionarQuebra(): void {
    this.adicionarRodape();
    this.doc.addPage();
    this.paginaAtual++;
    this.doc.moveDown(2);
  }

  /**
   * Adiciona rodapé com paginação
   */
  private adicionarRodape(): void {
    const yRodape = this.doc.page.height - this.margemRodape;

    // Linha separadora
    this.doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(this.margemEsquerda, yRodape - 30)
      .lineTo(this.doc.page.width - this.margemDireita, yRodape - 30)
      .stroke();

    // Texto rodapé à esquerda
    this.doc
      .font('Helvetica', 8)
      .fillColor(this.corCinza)
      .text('SISPNAIST - Confidencial', this.margemEsquerda, yRodape - 20);

    // Paginação à direita
    const textoPaginacao = `Página ${this.paginaAtual} de ${this.totalPaginas}`;
    this.doc.text(textoPaginacao, this.doc.page.width - this.margemDireita - 100, yRodape - 20, {
      width: 100,
      align: 'right',
    });
  }

  /**
   * Finaliza o documento e adiciona rodapé na última página
   */
  finalizarDocumento(): void {
    this.adicionarRodape();
    this.doc.end();
  }

  /**
   * Formata data para padrão brasileiro
   */
  private formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Formata CPF para exibição
   */
  static formatarCPF(cpf: string): string {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata data para exibição
   */
  static formatarDataExibicao(data: any): string {
    if (!data) return '-';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  }

  /**
   * Formata valor monetário
   */
  static formatarMoeda(valor: any): string {
    if (!valor) return '-';
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  /**
   * Trunca texto longo
   */
  static truncarTexto(texto: string, tamanho: number): string {
    if (!texto) return '-';
    return texto.length > tamanho ? texto.substring(0, tamanho) + '...' : texto;
  }
}

/**
 * Factory function para criar um novo gerador de PDF
 */
export function criarPDF(): PDFGenerator {
  return new PDFGenerator();
}
