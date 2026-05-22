/**
 * EXEMPLOS PRÁTICOS DE INTEGRAÇÃO
 * 
 * Copie esses exemplos e adapte para seu projeto
 */

// ============================================================================
// EXEMPLO 1: Componente Simples com Botão
// ============================================================================

import React from 'react';
import BotaoBaixarPDF from '@/components/BotaoBaixarPDF';

export function PaginaRelatorios() {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleSucesso = (msg: string) => {
    // Aqui você pode mostrar um toast/notificação
    console.log('✅', msg);
  };

  const handleErro = (msg: string) => {
    // Aqui você pode mostrar um erro/alert
    console.error('❌', msg);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Relatórios Disponíveis</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Relatório de Trabalhadores */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Trabalhadores</h2>
          <p className="text-gray-600 mb-4">
            Listagem completa de todos os trabalhadores
          </p>
          <BotaoBaixarPDF
            url={`${baseURL}/export/trabalhadores/pdf`}
            label="Baixar Relatório"
            nomeArquivo="trabalhadores.pdf"
            onSucesso={handleSucesso}
            onErro={handleErro}
          />
        </div>

        {/* Relatório de Acidentes */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Acidentes</h2>
          <p className="text-gray-600 mb-4">
            Análise consolidada de acidentes
          </p>
          <BotaoBaixarPDF
            url={`${baseURL}/export/acidentes/pdf`}
            label="Baixar Relatório"
            nomeArquivo="acidentes.pdf"
            onSucesso={handleSucesso}
            onErro={handleErro}
            variante="secondary"
          />
        </div>

        {/* Relatório de Material Biológico */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Material Biológico</h2>
          <p className="text-gray-600 mb-4">
            Fichas de exposição a material biológico
          </p>
          <BotaoBaixarPDF
            url={`${baseURL}/export/material-biologico/pdf`}
            label="Baixar Relatório"
            nomeArquivo="material-biologico.pdf"
            onSucesso={handleSucesso}
            onErro={handleErro}
            variante="danger"
          />
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// EXEMPLO 2: Com Hook Customizado e Gerenciamento de Estado
// ============================================================================

import React, { useState } from 'react';
import { usePDFDownload } from '@/hooks/usePDFDownload';

export function RelatoriosAvancado() {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const { baixarPDF, carregando, erro, limparErro } = usePDFDownload();
  const [ultimoDownload, setUltimoDownload] = useState<string | null>(null);

  const handleBaixarTrabalhadores = async () => {
    limparErro();
    const resultado = await baixarPDF(
      `${baseURL}/export/trabalhadores/pdf`,
      'trabalhadores_relatorio.pdf'
    );

    if (resultado.sucesso) {
      setUltimoDownload('Trabalhadores');
      // Opcional: Enviar evento para analytics
      console.log('Download realizado:', resultado.mensagem);
    } else {
      console.error('Erro:', resultado.mensagem);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Centro de Relatórios</h1>

      {/* Indicador de carregamento */}
      {carregando && (
        <div className="bg-blue-100 border border-blue-400 text-blue-800 p-4 rounded mb-4">
          ⟳ Gerando PDF... Por favor aguarde.
        </div>
      )}

      {/* Mensagem de erro */}
      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-800 p-4 rounded mb-4">
          <div className="font-bold">❌ Erro</div>
          <div>{erro}</div>
          <button
            onClick={limparErro}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Descartar
          </button>
        </div>
      )}

      {/* Sucesso */}
      {ultimoDownload && (
        <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded mb-4">
          ✅ Relatório de {ultimoDownload} baixado com sucesso!
          <button
            onClick={() => setUltimoDownload(null)}
            className="ml-2 underline text-sm"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Botões */}
      <div className="space-y-3">
        <button
          onClick={handleBaixarTrabalhadores}
          disabled={carregando}
          className={`
            w-full px-4 py-3 rounded-lg font-bold
            ${carregando
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {carregando ? '⟳ Gerando...' : '📄 Baixar Relatório de Trabalhadores'}
        </button>
      </div>
    </div>
  );
}


// ============================================================================
// EXEMPLO 3: Com Filtros e Data Range
// ============================================================================

import React, { useState } from 'react';
import { usePDFDownload } from '@/hooks/usePDFDownload';

export function RelatoriosComFiltros() {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const { baixarPDF, carregando } = usePDFDownload();

  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    empresa: '',
    status: 'todos'
  });

  const handleBaixar = async (tipo: 'trabalhadores' | 'acidentes' | 'material') => {
    // Monta query string com filtros
    const params = new URLSearchParams();
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
    if (filtros.empresa) params.append('empresa', filtros.empresa);
    if (filtros.status !== 'todos') params.append('status', filtros.status);

    const urls: Record<string, string> = {
      trabalhadores: `${baseURL}/export/trabalhadores/pdf?${params}`,
      acidentes: `${baseURL}/export/acidentes/pdf?${params}`,
      material: `${baseURL}/export/material-biologico/pdf?${params}`
    };

    const nomeArquivos: Record<string, string> = {
      trabalhadores: 'trabalhadores.pdf',
      acidentes: 'acidentes.pdf',
      material: 'material_biologico.pdf'
    };

    const resultado = await baixarPDF(urls[tipo], nomeArquivos[tipo]);
    console.log(resultado);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Relatórios Filtrados</h1>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) =>
                setFiltros({ ...filtros, dataInicio: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) =>
                setFiltros({ ...filtros, dataFim: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Empresa</label>
          <input
            type="text"
            value={filtros.empresa}
            onChange={(e) =>
              setFiltros({ ...filtros, empresa: e.target.value })
            }
            placeholder="Filtrar por empresa..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={filtros.status}
            onChange={(e) =>
              setFiltros({ ...filtros, status: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="todos">Todos</option>
            <option value="aberto">Aberto</option>
            <option value="pendente">Pendente</option>
            <option value="fechado">Fechado</option>
          </select>
        </div>
      </div>

      {/* Botões de Download */}
      <div className="space-y-3">
        <button
          onClick={() => handleBaixar('trabalhadores')}
          disabled={carregando}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-bold"
        >
          {carregando ? '⟳ Gerando...' : '👥 Baixar Relatório de Trabalhadores'}
        </button>

        <button
          onClick={() => handleBaixar('acidentes')}
          disabled={carregando}
          className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-bold"
        >
          {carregando ? '⟳ Gerando...' : '⚠️ Baixar Relatório de Acidentes'}
        </button>

        <button
          onClick={() => handleBaixar('material')}
          disabled={carregando}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-bold"
        >
          {carregando ? '⟳ Gerando...' : '🧬 Baixar Relatório de Material'}
        </button>
      </div>
    </div>
  );
}


// ============================================================================
// EXEMPLO 4: Modal/Dialog para Exportação
// ============================================================================

import React, { useState } from 'react';
import { usePDFDownload } from '@/hooks/usePDFDownload';

export function ModalExportacao() {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const [aberto, setAberto] = useState(false);
  const { baixarPDF, carregando, erro } = usePDFDownload();

  const tiposRelatorio = [
    {
      id: 'trabalhadores',
      titulo: 'Trabalhadores',
      descricao: 'Listagem completa',
      url: `${baseURL}/export/trabalhadores/pdf`,
      icone: '👥'
    },
    {
      id: 'acidentes',
      titulo: 'Acidentes',
      descricao: 'Análise consolidada',
      url: `${baseURL}/export/acidentes/pdf`,
      icone: '⚠️'
    },
    {
      id: 'material',
      titulo: 'Material Biológico',
      descricao: 'Fichas de exposição',
      url: `${baseURL}/export/material-biologico/pdf`,
      icone: '🧬'
    }
  ];

  const handleExportar = async (url: string) => {
    const resultado = await baixarPDF(url);
    if (resultado.sucesso) {
      setAberto(false);
    }
  };

  return (
    <>
      {/* Botão para abrir modal */}
      <button
        onClick={() => setAberto(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        📊 Exportar Relatórios
      </button>

      {/* Modal */}
      {aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Exportar Relatórios em PDF</h2>

            {erro && (
              <div className="bg-red-100 border border-red-400 text-red-800 p-3 rounded mb-4">
                {erro}
              </div>
            )}

            <div className="space-y-3">
              {tiposRelatorio.map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => handleExportar(tipo.url)}
                  disabled={carregando}
                  className="
                    w-full p-4 border-2 border-gray-200 rounded-lg
                    hover:border-blue-500 hover:bg-blue-50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    text-left transition-all
                  "
                >
                  <div className="text-2xl mb-1">{tipo.icone}</div>
                  <div className="font-bold">{tipo.titulo}</div>
                  <div className="text-sm text-gray-600">{tipo.descricao}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setAberto(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// ============================================================================
// EXEMPLO 5: Com Loading Skeleton
// ============================================================================

import React, { useState } from 'react';
import BotaoBaixarPDF from '@/components/BotaoBaixarPDF';

export function RelatoriosComSkeleton() {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const [dados, setDados] = useState<any[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  React.useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setDados([
        { id: 1, titulo: 'Trabalhadores', tipo: 'trabalhadores' },
        { id: 2, titulo: 'Acidentes', tipo: 'acidentes' },
        { id: 3, titulo: 'Material Biológico', tipo: 'material' }
      ]);
      setCarregandoDados(false);
    }, 1000);
  }, []);

  if (carregandoDados) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dados.map((item) => (
        <div key={item.id} className="border rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">{item.titulo}</h3>
          <BotaoBaixarPDF
            url={`${baseURL}/export/${item.tipo}/pdf`}
            label={`Baixar ${item.titulo}`}
          />
        </div>
      ))}
    </div>
  );
}


// ============================================================================
// EXEMPLO 6: Integração com Redux/Zustand (se usar state management)
// ============================================================================

// Para Redux:
import { useSelector } from 'react-redux';

export function RelatoriosRedux() {
  const token = useSelector((state: any) => state.auth.token);
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  return (
    <div>
      <p>Token: {token ? '✅ Presente' : '❌ Ausente'}</p>
      <BotaoBaixarPDF
        url={`${baseURL}/export/trabalhadores/pdf`}
        label="Baixar Relatório"
      />
    </div>
  );
}

// Para Zustand:
// import { useAuthStore } from '@/store/auth';
// const token = useAuthStore((state) => state.token);
