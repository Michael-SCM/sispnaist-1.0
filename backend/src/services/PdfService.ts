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

interface UnidadeData {
  _id: string;
  nome?: string;
}

/**
 * Serviço de geração de relatórios PDF corporativos
 * Usa streaming direto para não estourar memória do servidor
 */
export class PdfService {
  // Cores do tema corporativo
  private readonly COR_PRIMARIA = '#1e40af'; // Azul escuro
  private readonly COR_SECUNDARIA = '#3b82f6'; // Azul médio
  private readonly COR_TEXTO = '#1f2937'; // Cinza escuro
  private readonly COR_TEXTO_CLARO = '#6b7280'; // Cinza médio
  private readonly COR_LINHA_ALTERNADA = '#f9fafb'; // Cinza muito claro
  private readonly COR_LINHA_CABECALHO = '#1e40af'; // Azul escuro
  private readonly COR_BORDA = '#e5e7eb'; // Cinza claro

  /**
   * Gera e faz stream do PDF diretamente para a resposta
   */
  async gerarPdfTrabalhadores(
    res: Response,
    filtros: Record<string, any> = {}
  ): Promise<void> {
    // Buscar trabalhadores do MongoDB
    const trabalhadores = await Trabalhador.find(filtros).lean();

    // Buscar empresas e unidades para resolver referências
    const empresaIds = [...new Set(trabalhadores
      .filter(t => t.empresa)
      .map(t => t.empresa as string)
    )];
    const unidadeIds = [...new Set(trabalhadores
      .filter(t => t.unidade)
      .map(t => t.unidade as string)
    )];

    const [empresas, unidades] = await Promise.all([
      Empresa.find({ _id: { $in: empresaIds } }).lean(),
      Unidade.find({ _id: { $in: unidadeIds } }).lean(),
    ]);

    const empresaMap = new Map<string, EmpresaData>(
      empresas.map(e => [e._id.toString(), e])
    );
    const unidadeMap = new Map<string, UnidadeData>(
      unidades.map(u => [u._id.toString(), u])
    );

    // Configurar resposta como PDF
    const dataEmissao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const filename = `relatorio_trabalhadores_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );

    // Criar PDF com streaming
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true, // Permite paginação automática
    });

    // Stream direto para a resposta (não guarda em memória)
    doc.pipe(res);

    // Gerar conteúdo do PDF
    this.renderizarCabecalho(doc, dataEmissao);
    this.renderizarIntroducao(doc, trabalhadores.length);
    this.renderizarTabela(doc, trabalhadores, empresaMap, unidadeMap);
    this.renderizarRodape(doc);

    // Finalizar PDF
    doc.end();
  }

  /**
   * Renderiza o cabeçalho do PDF
   */
  private renderizarCabecalho(
    doc: PDFKit.PDFDocument,
    dataEmissao: string
  ): void {
    const larguraPagina = doc.page.width - 100;

    // Barra superior azul
    doc
      .fillColor(this.COR_PRIMARIA)
      .rect(0, 0, doc.page.width, 80)
      .fill();

    // Nome do sistema
    doc
      .fillColor('#ffffff')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('SISPNAIST', 50, 25);

    // Subtítulo
    doc
      .fillColor('#bfdbfe')
      .fontSize(10)
      .font('Helvetica')
      .text('Sistema de Gerenciamento de Segurança e Saúde do Trabalhador', 50, 52);

    // Logo placeholder (quadrado com ícone)
    doc
      .fillColor('#ffffff')
      .rect(larguraPagina + 10, 15, 40, 40)
      .strokeColor('#bfdbfe')
      .lineWidth(1)
      .stroke();

    doc
      .fillColor('#bfdbfe')
      .fontSize(20)
      .text('🛡️', larguraPagina + 20, 22);

    // Linha separadora
    doc
      .moveTo(50, 95)
      .lineTo(larguraPagina + 50, 95)
      .lineWidth(1)
      .strokeColor(this.COR_BORDA)
      .stroke();

    // Título do relatório e data
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Relatório de Trabalhadores', 50, 110);

    doc
      .fillColor(this.COR_TEXTO_CLARO)
      .fontSize(10)
      .font('Helvetica')
      .text(`Emitido em: ${dataEmissao}`, 50, 130);

    doc.moveDown(2);
  }

  /**
   * Renderiza a introdução explicativa
   */
  private renderizarIntroducao(
    doc: PDFKit.PDFDocument,
    totalRegistros: number
  ): void {
    const larguraPagina = doc.page.width - 100;

    // Caixa de indicadores
    doc
      .fillColor(this.COR_SECUNDARIA)
      .rect(50, 155, larguraPagina, 45)
      .fill();

    doc
      .fillColor('#ffffff')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('TOTAL DE REGISTROS ENCONTRADOS', 60, 165);

    doc
      .fillColor('#ffffff')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(`${totalRegistros} trabalhadores`, 60, 178);

    // Texto introdutório
    doc
      .fillColor(this.COR_TEXTO)
      .fontSize(10)
      .font('Helvetica')
      .moveDown(2)
      .text(
        'Este relatório apresenta a relação completa de trabalhadores registrados no sistema SISPNAIST. ' +
        'Os dados foram extraídos diretamente da base de dados e podem ser utilizados para fins de gestão, ' +
        'auditoria e conformidade com as exigências regulamentadoras de segurança e saúde ocupacional.',
        50,
        215,
        {
          align: 'justify',
          width: larguraPagina,
          lineGap: 4,
        }
      );

    doc.moveDown(2);
  }

  /**
   * Renderiza a tabela principal com trabalhadores
   */
  private renderizarTabela(
    doc: PDFKit.PDFDocument,
    trabalhadores: TrabalhadorData[],
    empresaMap: Map<string, EmpresaData>,
    unidadeMap: Map<string, UnidadeData>,
  ): void {
    const larguraPagina = doc.page.width - 100;

    // Verificar se há dados
    if (trabalhadores.length === 0) {
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Nenhum trabalhador encontrado.', 50, 280);
      return;
    }

    // Posição Y inicial da tabela
    let yPos = 265;

    // Cabeçalho da tabela
    const colunas = [
      { titulo: 'Trabalhador', x: 50, largura: 120 },
      { titulo: 'CPF', x: 170, largura: 80 },
      { titulo: 'Cargo / Setor', x: 250, largura: 100 },
      { titulo: 'Empresa', x: 350, largura: 90 },
      { titulo: 'Status', x: 440, largura: 60 },
    ];

    // Fundo do cabeçalho
    doc
      .fillColor(this.COR_LINHA_CABECALHO)
      .rect(50, yPos, larguraPagina, 25)
      .fill();

    // Texto das colunas do cabeçalho
    doc
      .fillColor('#ffffff')
      .fontSize(8)
      .font('Helvetica-Bold');

    colunas.forEach(col => {
      doc.text(col.titulo, col.x, yPos + 8);
    });

    yPos += 25;

    // Linhas da tabela
    trabalhadores.forEach((trabalhador, index) => {
      // Verificar se precisa de nova página
      if (yPos > doc.page.height - 100) {
        this.renderizarRodape(doc);
        doc.addPage();
        yPos = 50;
      }

      // Cor de fundo alternada (zebrado)
      const corFundo = index % 2 === 0
        ? '#ffffff'
        : this.COR_LINHA_ALTERNADA;

      doc
        .fillColor(corFundo)
        .rect(50, yPos, larguraPagina, 30)
        .fill();

      // Nome
      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(trabalhador.nome || '-', 52, yPos + 6, { width: 116 });

      // CPF
      doc
        .fillColor(this.COR_TEXTO_CLARO)
        .fontSize(8)
        .font('Helvetica')
        .text(this.formatarCpf(trabalhador.cpf), 172, yPos + 6);

      // Cargo / Setor
      const cargoSetor = [
        trabalhador.trabalho?.cargo,
        trabalhador.trabalho?.setor,
      ]
        .filter(Boolean)
        .join(' / ') || '-';

      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(7)
        .font('Helvetica')
        .text(cargoSetor, 252, yPos + 6, { width: 96 });

      // Empresa
      const empresaNome = trabalhador.empresa
        ? empresaMap.get(trabalhador.empresa)?.razaoSocial || '-'
        : '-';

      doc
        .fillColor(this.COR_TEXTO)
        .fontSize(8)
        .font('Helvetica')
        .text(empresaNome, 352, yPos + 6, { width: 86 });

      // Status (Ativo/Inativo)
      const status = trabalhador.vinculo?.situacao || 'Ativo';
      const corStatus = status === 'Ativo' ? '#059669' : '#dc2626';

      doc
        .fillColor(corStatus)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(status, 442, yPos + 6);

      // Linha divisória
      doc
        .moveTo(50, yPos + 30)
        .lineTo(larguraPagina + 50, yPos + 30)
        .lineWidth(0.5)
        .strokeColor(this.COR_BORDA)
        .stroke();

      yPos += 30;
    });

    doc.moveDown();
  }

  /**
   * Renderiza o rodapé com paginação e confidencialidade
   */
  private renderizarRodape(doc: PDFKit.PDFDocument): void {
    const paginaAtual = doc.bufferedPageRange().start + 1;
    const totalPaginas = doc.bufferedPageRange().count || 1;

    // Linha superior
    doc
      .moveTo(50, doc.page.height - 70)
      .lineTo(doc.page.width - 50, doc.page.height - 70)
      .lineWidth(1)
      .strokeColor(this.COR_BORDA)
      .stroke();

    // Texto de confidencialidade
    doc
      .fillColor(this.COR_TEXTO_CLARO)
      .fontSize(8)
      .font('Helvetica')
      .text(
        '⚠️ Este documento é de uso restrito e contém informações confidenciais protegidas pela LGPD (Lei nº 13.709/2018). ' +
        'A distribuição não autorizada é proibida.',
        50,
        doc.page.height - 60,
        {
          width: doc.page.width - 100,
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
        50,
        doc.page.height - 40,
        {
          width: doc.page.width - 100,
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
