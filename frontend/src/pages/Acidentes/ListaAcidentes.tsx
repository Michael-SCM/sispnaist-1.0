import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { DataTable, Pagination, TableColumn } from '../../components/DataTable.js';
import { Select, DatePicker } from '../../components/FormFields.js';
import { useAcidenteStore } from '../../store/acidenteStore.js';
import { acidenteService } from '../../services/acidenteService.js';
import { IAcidente } from '../../types/index.js';
import toast from 'react-hot-toast';

export const ListaAcidentes: React.FC = () => {
  const navigate = useNavigate();
  const {
    acidentes,
    total,
    page,
    pages,
    isLoading,
    filtros,
    setAcidentes,
    setPage,
    setPaginacao,
    setIsLoading,
    setFiltros,
    clearFiltros,
    removerAcidente,
  } = useAcidenteStore();

  const [localFiltros, setLocalFiltros] = useState(filtros);

  // Carregar acidentes
  const carregarAcidentes = async (pageNumber: number = 1) => {
    try {
      setIsLoading(true);
      const data = await acidenteService.listar(pageNumber, 10, filtros);
      setAcidentes(data.acidentes);
      setPaginacao({
        total: data.paginacao.total,
        pages: data.paginacao.pages,
        page: pageNumber,
        limit: data.paginacao.limit,
      });
    } catch (error) {
      toast.error('Erro ao carregar acidentes');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar ao montar ou quando filtros mudam
  useEffect(() => {
    carregarAcidentes(1);
  }, [filtros]);

  // Aplicar filtros
  const handleAplicarFiltros = () => {
    setFiltros(localFiltros);
  };

  // Limpar filtros
  const handleLimparFiltros = () => {
    setLocalFiltros({});
    clearFiltros();
  };

  // Deletar acidente
  const handleDeletar = async (acidente: IAcidente) => {
    if (!window.confirm(`Tem certeza que deseja deletar o acidente de ${acidente.dataAcidente}?`)) {
      return;
    }

    try {
      await acidenteService.deletar(acidente._id!);
      removerAcidente(acidente._id!);
      toast.success('Acidente deletado com sucesso');
    } catch (error) {
      toast.error('Erro ao deletar acidente');
      console.error(error);
    }
  };

  // Colunas da tabela
  const columns: TableColumn<IAcidente>[] = [
    {
      key: 'dataAcidente',
      header: 'Data do Acidente',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return date.toLocaleDateString('pt-BR');
      },
    },
    {
      key: 'tipoAcidente',
      header: 'Tipo',
      sortable: true,
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (value) => (value.length > 50 ? `${value.substring(0, 50)}...` : value),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            value === 'Aberto'
              ? 'bg-yellow-100 text-yellow-800'
              : value === 'Em Análise'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'dataCriacao',
      header: 'Criado em',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('pt-BR');
      },
    },
  ];

  const handleVerMais = (acidente: IAcidente) => {
    navigate(`/acidentes/${acidente._id}`);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Acidentes de Trabalho</h1>
        <p className="text-gray-600">Total: {total} registros</p>
      </div>

      {/* Botões de Ação */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => navigate('/acidentes/novo')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + Novo Acidente
        </button>
        <a
          href={`${import.meta.env.VITE_API_URL}/api/export/acidentes`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center gap-2"
        >
          📥 Exportar CSV
        </a>
      </div>

      {/* Filtros */}
      <div className="card mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Tipo de Acidente"
            name="tipoAcidente"
            value={localFiltros.tipoAcidente || ''}
            onChange={(e) =>
              setLocalFiltros({ ...localFiltros, tipoAcidente: e.target.value || undefined })
            }
            options={[
              { value: 'Típico', label: 'Típico' },
              { value: 'Trajeto', label: 'Trajeto' },
              { value: 'Doença Ocupacional', label: 'Doença Ocupacional' },
              { value: 'Acidente com Material Biológico', label: 'Mat. Biológico' },
              { value: 'Violência', label: 'Violência' },
            ]}
            placeholder="Selecione o tipo..."
          />

          <Select
            label="Status"
            name="status"
            value={localFiltros.status || ''}
            onChange={(e) => setLocalFiltros({ ...localFiltros, status: e.target.value || undefined })}
            options={[
              { value: 'Aberto', label: 'Aberto' },
              { value: 'Em Análise', label: 'Em Análise' },
              { value: 'Fechado', label: 'Fechado' },
            ]}
            placeholder="Selecione o status..."
          />

          <DatePicker
            label="Data Inicial"
            name="dataInicio"
            value={localFiltros.dataInicio || ''}
            onChange={(e) =>
              setLocalFiltros({ ...localFiltros, dataInicio: e.target.value || undefined })
            }
          />

          <DatePicker
            label="Data Final"
            name="dataFim"
            value={localFiltros.dataFim || ''}
            onChange={(e) =>
              setLocalFiltros({ ...localFiltros, dataFim: e.target.value || undefined })
            }
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAplicarFiltros}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={handleLimparFiltros}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="card mb-6 borderoverflow-hidden">
        <DataTable
          columns={columns}
          data={acidentes}
          isLoading={isLoading}
          emptyMessage="Nenhum acidente encontrado"
          onRowClick={handleVerMais}
          actions={[
            {
              label: 'Editar',
              onClick: (row) => navigate(`/acidentes/${row._id}/editar`),
              variant: 'primary',
            },
            {
              label: 'Deletar',
              onClick: handleDeletar,
              variant: 'danger',
            },
          ]}
        />
      </div>

      {/* Paginação */}
      {pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pages}
          onPageChange={carregarAcidentes}
          isLoading={isLoading}
        />
      )}
    </MainLayout>
  );
};
