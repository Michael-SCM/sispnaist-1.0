/**
 * Componente de Botão para Download de PDF
 * Uso simples e direto com feedback visual
 */

import React, { useState } from 'react';
import { usePDFDownload } from '../hooks/usePDFDownload';

export interface BotaoBaixarPDFProps {
  /**
   * URL da rota de download
   * Ex: '/api/export/trabalhadores/pdf'
   */
  url: string;

  /**
   * Rótulo do botão
   * Ex: 'Baixar Relatório em PDF'
   */
  label?: string;

  /**
   * Nome do arquivo (opcional, será extraído do header se disponível)
   */
  nomeArquivo?: string;

  /**
   * Callback executado quando download é bem-sucedido
   */
  onSucesso?: (mensagem: string) => void;

  /**
   * Callback executado quando há erro
   */
  onErro?: (mensagem: string) => void;

  /**
   * Classe CSS customizada
   */
  className?: string;

  /**
   * Desabilita o botão
   */
  desabilitado?: boolean;

  /**
   * Variante visual do botão
   */
  variante?: 'primary' | 'secondary' | 'danger';
}

/**
 * Componente botão para download de PDF
 */
export const BotaoBaixarPDF: React.FC<BotaoBaixarPDFProps> = ({
  url,
  label = 'Baixar PDF',
  nomeArquivo,
  onSucesso,
  onErro,
  className = '',
  desabilitado = false,
  variante = 'primary'
}) => {
  const { baixarPDF, carregando, erro, limparErro } = usePDFDownload();
  const [mostrarMensagem, setMostrarMensagem] = useState(false);

  const handleClique = async () => {
    limparErro();
    const resultado = await baixarPDF(url, nomeArquivo);

    if (resultado.sucesso) {
      onSucesso?.(resultado.mensagem);
      setMostrarMensagem(true);
      setTimeout(() => setMostrarMensagem(false), 3000);
    } else {
      onErro?.(resultado.mensagem);
      setMostrarMensagem(true);
      setTimeout(() => setMostrarMensagem(false), 5000);
    }
  };

  const varianteClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <div className="relative">
      <button
        onClick={handleClique}
        disabled={carregando || desabilitado}
        className={`
          px-4 py-2 rounded-md font-medium
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
          ${varianteClasses[variante]}
          ${className}
        `}
      >
        {carregando ? (
          <>
            <span className="inline-block animate-spin">⟳</span>
            Gerando PDF...
          </>
        ) : (
          <>
            <span>📄</span>
            {label}
          </>
        )}
      </button>

      {mostrarMensagem && (
        <div className={`
          absolute top-full mt-2 left-0 right-0
          p-3 rounded-md text-sm
          ${erro 
            ? 'bg-red-100 text-red-800 border border-red-300' 
            : 'bg-green-100 text-green-800 border border-green-300'
          }
          animation-fade-out
        `}>
          {erro || 'PDF baixado com sucesso!'}
        </div>
      )}
    </div>
  );
};

export default BotaoBaixarPDF;
