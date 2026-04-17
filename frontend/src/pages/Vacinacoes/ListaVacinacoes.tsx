import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVacinacaoStore } from '../../store/vacinacaoStore.js';
import { vacinacaoService } from '../../services/vacinacaoService.js';
import { DataTable } from '../../components/DataTable.js';
import { Header } from '../../components/Header.js';
import { Footer } from '../../components/Footer.js';
import toast from 'react-hot-toast';

export const ListaVacinacoes: React.FC = () => {
  const navigate = useNavigate();
  const {
    vacinacoes,
    page,
    pages,
    total,
    filtros,
    isLoading,
    setVacinacoes,
    setPage,
    setFiltros,
    clearFiltros,
    setPaginacao,
    removerVacinacao,
    setIsLoading,
  } = useVacinacaoStore();

  const carregarVacinacoes = async () => {
    setIsLoading(true);
    try {
      const resultado = await vacinacaoService.listar({
        page,
        limit: 10,
        vacina: filtros.vacina,
        trabalhadorId: filtros.trabalhadorId,
      });

      setVacinacoes(resultado.vacinacoes);
      setPaginacao(page, 10, resultado.total, resultado.pages);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar vacinações';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarVacinacoes();
  }, [page, filtros]);

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta vacinação?')) {
      return;
    }

    try {
      await vacinacaoService.deletar(id);
      removerVacinacao(id);
      toast.success('Vacinação excluída com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir vacinação';
      toast.error(message);
    }
  };

  const columns = [
    { key: 'vacina', label: 'Vacina', sortable: true },
    {
      key: 'dataVacinacao',
      label: 'Data da Vacinação',
      sortable: true,
      render: (value: any) => new Date(value).toLocaleDateString('pt-BR'),
    },
    {
      key: 'proximoDose',
      label: 'Próxima Dose',
      render: (value: any) => (value ? new Date(value).toLocaleDateString('pt-BR') : '-'),
    },
    { key: 'unidadeSaude', label: 'Unidade de Saúde' },
    { key: 'profissional', label: 'Profissional' },
  ];

  const actions = [
    {
      label: 'Editar',
      onClick: (row: any) => navigate(`/vacinacoes/${row._id}/editar`),
      className: 'text-blue-600 hover:text-blue-800',
    },
    {
      label: 'Excluir',
      onClick: (row: any) => handleExcluir(row._id),
      className: 'text-red-600 hover:text-red-800',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Vacinações</h1>
            <button
              onClick={() => navigate('/vacinacoes/novo')}
              className="btn-primary"
            >
              + Nova Vacinação
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Filtrar por vacina"
                value={filtros.vacina || ''}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    vacina: e.target.value,
                  })
                }
                className="input"
              />

              <button
                onClick={clearFiltros}
                className="btn-secondary"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="mb-4 text-sm text-gray-600">
            Total: <strong>{total}</strong> vacinação(ões)
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            columns={columns}
            data={vacinacoes}
            actions={actions}
            isLoading={isLoading}
            pagination={{
              current: page,
              total: pages,
              onPageChange: setPage,
            }}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};
