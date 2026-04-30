import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { DataTable, TableColumn } from '../../components/DataTable.js';
import { TextInput } from '../../components/FormFields.js';
import { useTrabalhadorStore } from '../../store/trabalhadorStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { ITrabalhador } from '../../types/index.js';
import toast from 'react-hot-toast';

export const ListaTrabalhadores: React.FC = () => {
  const navigate = useNavigate();
  const {
    trabalhadores,
    total,
    page,
    pages,
    isLoading,
    filtros,
    setTrabalhadores,
    setPaginacao,
    setIsLoading,
    setFiltros,
    clearFiltros,
    removerTrabalhador,
  } = useTrabalhadorStore();

  const [localFiltros, setLocalFiltros] = useState(filtros);

  const carregarTrabalhadores = async (pageNumber: number = 1) => {
    try {
      setIsLoading(true);
      const data = await trabalhadorService.listar(pageNumber, 10, filtros);
      setTrabalhadores(data.trabalhadores);
      setPaginacao({
        total: data.total,
        pages: data.pages,
        page: pageNumber,
        limit: 10,
      });
    } catch (error) {
      toast.error('Erro ao carregar trabalhadores');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarTrabalhadores(1);
  }, [filtros]);

  const handleAplicarFiltros = () => {
    setFiltros(localFiltros);
  };

  const handleLimparFiltros = () => {
    setLocalFiltros({});
    clearFiltros();
  };

  const handleDeletar = async (trabalhador: ITrabalhador) => {
    if (!window.confirm(`Tem certeza que deseja deletar o trabalhador ${trabalhador.nome}?`)) {
      return;
    }

    try {
      await trabalhadorService.deletar(trabalhador._id!);
      removerTrabalhador(trabalhador._id!);
      toast.success('Trabalhador deletado com sucesso');
    } catch (error) {
      toast.error('Erro ao deletar trabalhador');
      console.error(error);
    }
  };

  const columns: TableColumn<ITrabalhador>[] = [
    {
      key: 'nome',
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'cpf',
      header: 'CPF',
    },
    {
      key: 'matricula',
      header: 'Matrícula',
    },
    {
      key: 'trabalho.setor',
      header: 'Setor',
      render: (value, row) => row.trabalho?.setor || '-',
    },
    {
      key: 'trabalho.cargo',
      header: 'Cargo',
      render: (value, row) => row.trabalho?.cargo || '-',
    },
  ];

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Trabalhadores</h1>
          <p className="text-gray-600">Gestão de funcionários e vínculos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/trabalhadores/novo')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>➕</span> Novo Trabalhador
          </button>
          <a
            href={`${import.meta.env.VITE_API_URL}/api/export/trabalhadores`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center gap-2"
          >
            📥 Exportar CSV
          </a>
        </div>
      </div>

      <div className="card mb-6 bg-gray-50 border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Filtros de Busca</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextInput
            label="Nome"
            name="nome"
            value={localFiltros.nome || ''}
            onChange={(e) => setLocalFiltros({ ...localFiltros, nome: e.target.value })}
            placeholder="Buscar por nome..."
          />
          <TextInput
            label="CPF"
            name="cpf"
            value={localFiltros.cpf || ''}
            onChange={(e) => setLocalFiltros({ ...localFiltros, cpf: e.target.value })}
            placeholder="000.000.000-00"
          />
          <TextInput
            label="Matrícula"
            name="matricula"
            value={localFiltros.matricula || ''}
            onChange={(e) => setLocalFiltros({ ...localFiltros, matricula: e.target.value })}
            placeholder="Nº Matrícula"
          />
          <TextInput
            label="Setor"
            name="setor"
            value={localFiltros.setor || ''}
            onChange={(e) => setLocalFiltros({ ...localFiltros, setor: e.target.value })}
            placeholder="Setor/Departamento"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAplicarFiltros}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Filtrar
          </button>
          <button
            onClick={handleLimparFiltros}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="card border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={trabalhadores}
          isLoading={isLoading}
          emptyMessage="Nenhum trabalhador encontrado"
          onRowClick={(t) => navigate(`/trabalhadores/${t._id}`)}
          actions={[
            {
              label: 'Editar',
              onClick: (t) => navigate(`/trabalhadores/${t._id}/editar`),
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
    </MainLayout>
  );
};
