/**
 * Hook customizado para download de PDFs
 * Uso: const { baixarPDF, carregando, erro } = usePDFDownload();
 */

import { useState, useCallback } from 'react';

export interface OpcoesBaixada {
  nomeArquivo?: string;
  mostrarErro?: boolean;
}

interface ResultadoBaixada {
  sucesso: boolean;
  mensagem: string;
}

/**
 * Hook para gerenciar download de PDFs do backend
 * @returns Objeto com função para baixar PDF e estados
 */
export function usePDFDownload() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Realiza o download de um PDF através de uma URL
   * @param url - URL da rota de download no backend
   * @param nomeArquivo - Nome do arquivo para salvar (opcional)
   * @returns Promise com resultado da operação
   */
  const baixarPDF = useCallback(
    async (url: string, nomeArquivo?: string): Promise<ResultadoBaixada> => {
      setCarregando(true);
      setErro(null);

      try {
        // Faz requisição GET para obter o blob do PDF
        const resposta = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Ajuste conforme seu tipo de autenticação
          }
        });

        // Verifica status da resposta
        if (!resposta.ok) {
          throw new Error(
            `Erro ao baixar PDF: ${resposta.status} ${resposta.statusText}`
          );
        }

        // Obtém o content-type para validar se é PDF
        const contentType = resposta.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
          throw new Error('A resposta não é um PDF válido');
        }

        // Converte a resposta em blob
        const blob = await resposta.blob();

        // Valida tamanho mínimo (segurança)
        if (blob.size === 0) {
          throw new Error('Arquivo PDF vazio recebido');
        }

        // Extrai nome do arquivo dos headers se disponível
        const disposicao = resposta.headers.get('content-disposition');
        let nomeArquivoFinal = nomeArquivo || 'relatorio.pdf';
        
        if (disposicao && disposicao.includes('filename=')) {
          const nomeExtraido = disposicao.split('filename=')[1].replace(/['"]/g, '');
          nomeArquivoFinal = nomeExtraido || nomeArquivoFinal;
        }

        // Cria URL temporária para o blob
        const urlBlob = window.URL.createObjectURL(blob);

        try {
          // Cria elemento de âncora (link) para download
          const link = document.createElement('a');
          link.href = urlBlob;
          link.download = nomeArquivoFinal;
          
          // Adiciona à DOM, clica e remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          return {
            sucesso: true,
            mensagem: `PDF "${nomeArquivoFinal}" baixado com sucesso`
          };
        } finally {
          // Libera a memória da URL temporária
          window.URL.revokeObjectURL(urlBlob);
        }
      } catch (erro) {
        const mensagemErro = 
          erro instanceof Error ? erro.message : 'Erro desconhecido ao baixar PDF';
        
        setErro(mensagemErro);
        console.error('Erro ao baixar PDF:', erro);

        return {
          sucesso: false,
          mensagem: mensagemErro
        };
      } finally {
        setCarregando(false);
      }
    },
    []
  );

  return {
    baixarPDF,
    carregando,
    erro,
    limparErro: () => setErro(null)
  };
}

/**
 * Funções de utilidade para download de PDFs específicos
 * Podem ser usadas diretamente ou com o hook
 */

/**
 * Baixa relatório de trabalhadores em PDF
 */
export async function baixarRelatorioTrabalhadoresPDF(): Promise<ResultadoBaixada> {
  const { baixarPDF } = usePDFDownload();
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  return baixarPDF(
    `${baseURL}/export/trabalhadores/pdf`,
    'trabalhadores_sispnaist.pdf'
  );
}

/**
 * Baixa relatório de acidentes em PDF
 */
export async function baixarRelatorioAcidentesPDF(): Promise<ResultadoBaixada> {
  const { baixarPDF } = usePDFDownload();
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  return baixarPDF(
    `${baseURL}/export/acidentes/pdf`,
    'acidentes_sispnaist.pdf'
  );
}

/**
 * Baixa relatório de material biológico em PDF
 */
export async function baixarRelatorioMaterialBiologicoPDF(): Promise<ResultadoBaixada> {
  const { baixarPDF } = usePDFDownload();
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  return baixarPDF(
    `${baseURL}/export/material-biologico/pdf`,
    'material_biologico_sispnaist.pdf'
  );
}
