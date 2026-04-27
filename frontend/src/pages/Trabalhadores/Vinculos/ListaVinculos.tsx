import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DataTable } from '../../../components/DataTable.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorVinculo, ITrabalhador } from '../../../types/index.js';
import toast from 'react-hot-toast';

export const ListaVinculos: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vinculos, setVinculos] = useState<ITrabalhadorVinculo[]>([]);
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
      const [t, v] = await Promise.all([
        trabalhadorService.obterPorId(id!),
        submoduloTrabalhadorService.listarVinculos(id!),
      ]);
      setTrabalhador(t);
      setVinculos(v);
    } catch (error) {
      toast.error('Erro ao carregar vínculos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (vinculoId: string) => {
    if (confirm('Tem certeza que deseja remover este vínculo?')) {
      try {
        await submoduloTrabalhadorService.deletarVinculo(id!, vinculoId);
        setVinculos((prev: ITrabalhadorVinculo[]) => prev.filter((v: ITrabalhadorVinculo) => v._id !== vinculoId));
        toast.success('Vínculo removido com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover vínculo');
        console.error(error);
      }
    }
  };

  const columns = [
    { key: 'tipoVinculo', header: 'Tipo de Vínculo' },
    { key: 'cargo', header: 'Cargo' },
    { key: 'funcao', header: 'Função' },
    { key: 'setor', header: 'Setor' },
    {
      key: 'dataInicio',
      header: 'Data Início',
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'dataFim',
      header: 'Data Fim',
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString('pt-BR') : 'Em vigor',
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
      onClick: (item: ITrabalhadorVinculo) =>
        navigate(`/trabalhadores/${id}/vinculos/${item._id}/editar`),
      variant: 'primary' as const,
    },
    {
      label: 'Remover',
      onClick: (item: ITrabalhadorVinculo) => handleDeletar(item._id!),
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
              Vínculos Empregatícios
            </h1>
            {trabalhador && (
              <p className="text-gray-600 mt-1">
                {trabalhador.nome} — CPF: {trabalhador.cpf}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(`/trabalhadores/${id}/vinculos/novo`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md shadow-blue-100 transition"
          >
            + Novo Vínculo
          </button>
        </div>

        {/* Tabela */}
        <div className="card">
          <DataTable
            columns={columns}
            data={vinculos}
            isLoading={isLoading}
            actions={actions}
            emptyMessage="Nenhum vínculo registrado para este trabalhador."
          />
        </div>
      </div>
    </MainLayout>
  );
};

