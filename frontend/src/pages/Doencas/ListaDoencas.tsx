import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { DataTable } from '../../components/DataTable.js';
import { TextInput, Select } from '../../components/FormFields.js';
import { useDoencaStore } from '../../store/doencaStore.js';
import { doencaService } from '../../services/doencaService.js';
import { IDoenca } from '../../types/index.js';
import toast from 'react-hot-toast';

export const ListaDoencas: React.FC = () => {
  const navigate = useNavigate();
  const {
    doencas,
    page,
    pages,
    total,
    filtros,
    isLoading,
    setDoencas,
    setPage,
    setFiltros,
    clearFiltros,
    setPaginacao,
    removerDoenca,
    setIsLoading,
  } = useDoencaStore();

  const [localFiltros, setLocalFiltros] = useState(filtros);

  useEffect(() => {
    carregarDoencas();
  }, [page, filtros]);

  const carregarDoencas = async () => {
    try {
      setIsLoading(true);
      const resultado = await doencaService.listar(page, 10, filtros);
      setDoencas(resultado.dados);
      setPaginacao(resultado.paginacao.page, resultado.paginacao.limit, resultado.paginacao.total, resultado.paginacao.pages);
    } catch (error) {
      toast.error('Erro ao carregar doenças');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setPage(1);
    setFiltros(localFiltros);
  };

  const limparFiltrosLocais = () => {
    setLocalFiltros({});
    clearFiltros();
  };

  const handleDeletar = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta doença?')) {
      try {
        await doencaService.deletar(id);
        removerDoenca(id);
        toast.success('Doença deletada com sucesso!');
      } catch (error) {
        toast.error('Erro ao deletar doença');
        console.error(error);
      }
    }
  };

  const columns = [
  { key: 'dataInicio', header: 'Data Início', render: (value: string) => new Date(value).toLocaleDateString('pt-BR') },
  { key: 'nomeDoenca', header: 'Doença' },
  { key: 'codigoDoenca', header: 'Código' },
  {
    key: 'ativo',
    header: 'Status',
    render: (value: boolean) => (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
        {value ? 'Ativa' : 'Inativa'}
      </span>
    ),
  },

  ];

  const actions = [
    {
      label: 'Editar',
      onClick: (item: IDoenca) => navigate(`/doencas/${item._id}/editar`),
      variant: 'primary' as const,
    },
    {
      label: 'Deletar',
      onClick: (item: IDoenca) => handleDeletar(item._id),
      variant: 'danger' as const,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Doenças Ocupacionais</h1>
            <p className="text-gray-600 mt-2">Gerencie as doenças ocupacionais dos trabalhadores</p>
          </div>
          <button
            onClick={() => navigate('/doencas/novo')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            + Nova Doença
          </button>
        </div>

        {/* Filtros */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <TextInput
              label="Nome da Doença"
              name="nomeDoenca"
              value={localFiltros.nomeDoenca || ''}
              onChange={(e) => setLocalFiltros({ ...localFiltros, nomeDoenca: e.target.value })}
              placeholder="Buscar por nome..."
            />


            <Select
              label="Status"
              value={localFiltros.ativo !== undefined ? localFiltros.ativo.toString() : ''}
              onChange={(e) =>
                setLocalFiltros({
                  ...localFiltros,
                  ativo: e.target.value === '' ? undefined : e.target.value === 'true',
                })
              }
              options={[
                { value: '', label: 'Todos' },
                { value: 'true', label: 'Ativas' },
                { value: 'false', label: 'Inativas' },
              ]}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={aplicarFiltros}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={limparFiltrosLocais}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="card">
          <DataTable
            columns={columns}
            data={doencas}
            loading={isLoading}
            actions={actions}
            onRowClick={(item) => navigate(`/doencas/${item._id}/editar`)}
          />

          {/* Paginação */}
          {pages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <span className="text-gray-600">Mostrando página {page} de {pages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const pageNum = Math.max(1, page - 2) + i;
                  if (pageNum > pages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded ${
                        pageNum === page ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          <p className="text-gray-600 mt-4 text-sm">Total de {total} doença(s)</p>
        </div>
      </div>
    </MainLayout>
  );
};
