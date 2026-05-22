/**
 * Componente: Painel de Exportação de Relatórios
 * Agrupa todos os botões de download de PDFs
 * 
 * Uso:
 * import PainelExportacaoRelatorios from '@/components/PainelExportacaoRelatorios';
 * 
 * <PainelExportacaoRelatorios />
 */

import React, { useState } from 'react';
import BotaoBaixarPDF from './BotaoBaixarPDF';

interface MensagemNotificacao {
  tipo: 'sucesso' | 'erro';
  mensagem: string;
}

/**
 * Componente do painel de exportação
 */
export const PainelExportacaoRelatorios: React.FC = () => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const [notificacao, setNotificacao] = useState<MensagemNotificacao | null>(null);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', mensagem: string) => {
    setNotificacao({ tipo, mensagem });
    setTimeout(() => setNotificacao(null), 4000);
  };

  const rotasExportacao = [
    {
      id: 'trabalhadores',
      titulo: 'Trabalhadores',
      descricao: 'Relatório completo de todos os trabalhadores cadastrados',
      icone: '👥',
      url: `${baseURL}/export/trabalhadores/pdf`,
      nomeArquivo: 'trabalhadores_sispnaist.pdf'
    },
    {
      id: 'acidentes',
      titulo: 'Acidentes do Trabalho',
      descricao: 'Análise consolidada de todos os acidentes registrados',
      icone: '⚠️',
      url: `${baseURL}/export/acidentes/pdf`,
      nomeArquivo: 'acidentes_sispnaist.pdf'
    },
    {
      id: 'material-biologico',
      titulo: 'Material Biológico',
      descricao: 'Fichas de avaliação de exposição a material biológico',
      icone: '🧬',
      url: `${baseURL}/export/material-biologico/pdf`,
      nomeArquivo: 'material_biologico_sispnaist.pdf'
    }
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 md:p-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📊 Exportar Relatórios
        </h2>
        <p className="text-gray-600">
          Gere relatórios em PDF corporativos com dados consolidados do sistema SISPNAIST.
          Todos os documentos possuem paginação automática, cabeçalho identificador e rodapé com informações de confidencialidade.
        </p>
      </div>

      {/* Notificação */}
      {notificacao && (
        <div className={`
          mb-6 p-4 rounded-md border
          ${notificacao.tipo === 'sucesso'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `}>
          <div className="flex items-start gap-3">
            <span className="text-xl">
              {notificacao.tipo === 'sucesso' ? '✅' : '❌'}
            </span>
            <div>
              <p className="font-medium">
                {notificacao.tipo === 'sucesso' ? 'Sucesso!' : 'Erro'}
              </p>
              <p className="text-sm mt-1">{notificacao.mensagem}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Cards de Exportação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rotasExportacao.map((rota) => (
          <div
            key={rota.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {/* Ícone e título */}
            <div className="mb-4">
              <div className="text-4xl mb-3">{rota.icone}</div>
              <h3 className="text-xl font-bold text-gray-900">{rota.titulo}</h3>
            </div>

            {/* Descrição */}
            <p className="text-gray-600 text-sm mb-6 line-clamp-3">
              {rota.descricao}
            </p>

            {/* Informações técnicas */}
            <div className="bg-gray-50 rounded p-3 mb-6 text-xs text-gray-500">
              <p className="font-mono truncate">{rota.url}</p>
            </div>

            {/* Botão de download */}
            <BotaoBaixarPDF
              url={rota.url}
              label="Baixar PDF"
              nomeArquivo={rota.nomeArquivo}
              onSucesso={(msg) => exibirNotificacao('sucesso', msg)}
              onErro={(msg) => exibirNotificacao('erro', msg)}
              variante="primary"
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Informações adicionais */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3">📋 Características dos Relatórios</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Cabeçalho Corporativo:</strong> Logo do sistema, data de emissão e título do relatório</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Introdução Contextual:</strong> Explicação do objetivo e importância do relatório</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Indicadores Rápidos:</strong> Resumo de métricas principais do relatório</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Tabela Zebrada:</strong> Linhas com cores alternadas para fácil leitura</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Paginação Automática:</strong> "Página X de Y" no rodapé de cada página</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span><strong>Nota de Confidencialidade:</strong> Indicação de documento protegido</span>
          </li>
        </ul>
      </div>

      {/* Aviso de segurança */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
        <p className="font-medium mb-1">🔒 Segurança</p>
        <p>
          Estes relatórios contêm dados confidenciais. Certifique-se de que você possui autorização
          adequada antes de acessar ou compartilhar estes documentos. O download é registrado nos logs do sistema.
        </p>
      </div>
    </div>
  );
};

export default PainelExportacaoRelatorios;
