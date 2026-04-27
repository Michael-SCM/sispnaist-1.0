import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DataTable } from '../../../components/DataTable.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorDependente, ITrabalhador } from '../../../types/index.js';
import toast from 'react-hot-toast';

export const ListaDependentes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dependentes, setDependentes] = useState<ITrabalhadorDependente[]>([]);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [t, d] = await Promise.all([
        trabalhadorService.obterPorId(id!),
        submoduloTrabalhadorService.listarDependentes(id!),
      ]);
      setTrabalhador(t);
      setDependentes(d);
    } catch (error) {
      toast.error('Erro ao carregar dependentes');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (dependenteId: string) => {
    if (confirm('Tem certeza que deseja remover este dependente?')) {
      try {
        await submoduloTrabalhadorService.deletarDependente(id!, dependenteId);
        setDependentes((prev: ITrabalhadorDependente[]) => prev.filter((d: ITrabalhadorDependente) => d._id !== dependenteId));
        toast.success('Dependente removido com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover dependente');
        console.error(error);
      }
    }
  };

  const columns = [
    { key: 'nome', header: 'Nome' },
    {
      key: 'cpf',
      header: 'CPF',
      render: (value: string) => value || '-',
    },
    {
      key: 'dataNascimento',
      header: 'Data de Nascimento',
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'parentesco',
      header: 'Parentesco',
      render: (value: string) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1) : '-',
    },
    {
      key: 'dependentIR',
      header: 'Dependente IR',
      render: (value: boolean) =>
        value ? (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Sim
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Não
          </span>
        ),
    },
    {
      key: 'ativo',
      header: 'Status',
      render: (value: boolean) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'Editar',
      onClick: (item: ITrabalhadorDependente) =>
        navigate(`/trabalhadores/${id}/dependentes/${item._id}/editar`),
      variant: 'primary' as const,
    },
    {
      label: 'Remover',
      onClick: (item: ITrabalhadorDependente) => handleDeletar(item._id!),
      variant: 'danger' as const,
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link
                to={`/trabalhadores/${id}`}
                className="hover:text-blue-600 transition"
              >
                ← Voltar ao trabalhador
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Dependentes
            </h1>
            {trabalhador && (
              <p className="text-gray-600 mt-1">
                {trabalhador.nome} — CPF: {trabalhador.cpf}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(`/trabalhadores/${id}/dependentes/novo`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md shadow-blue-100 transition"
          >
            + Novo Dependente
          </button>
        </div>

        {/* Tabela */}
        <div className="card">
          <DataTable
            columns={columns}
            data={dependentes}
            isLoading={isLoading}
            actions={actions}
            emptyMessage="Nenhum dependente registrado para este trabalhador."
          />
        </div>
      </div>
    </MainLayout>
  );
};

