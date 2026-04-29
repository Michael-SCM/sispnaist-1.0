import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useAcidenteStore } from '../../store/acidenteStore.js';
import { acidenteService } from '../../services/acidenteService.js';
import { IAcidente } from '../../types/index.js';
import toast from 'react-hot-toast';

export const DetalhesAcidente: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setCurrentAcidente } = useAcidenteStore();

  const [acidente, setAcidente] = useState<IAcidente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarAcidente = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await acidenteService.obter(id);
        setAcidente(data);
        setCurrentAcidente(data);
      } catch (error) {
        toast.error('Erro ao carregar detalhes do acidente');
        console.error(error);
        navigate('/acidentes');
      } finally {
        setIsLoading(false);
      }
    };

    carregarAcidente();
  }, [id, navigate, setCurrentAcidente]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!acidente) return null;

  const formatarData = (data: any) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const statusColors = {
    'Aberto': 'bg-yellow-100 text-yellow-800',
    'Em Análise': 'bg-blue-100 text-blue-800',
    'Fechado': 'bg-green-100 text-green-800'
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Detalhes do Acidente</h1>
            <p className="text-gray-600 mt-1">ID: {acidente._id}</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/acidentes/${acidente._id}/editar`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Editar Acidente
            </Link>
            <button
              onClick={() => navigate('/acidentes')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Voltar para Lista
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[acidente.status || 'Aberto']}`}>
              {acidente.status || 'Aberto'}
            </span>
          </div>
          <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Data do Acidente</h3>
            <p className="text-lg font-bold text-gray-800">{formatarData(acidente.dataAcidente)}</p>
            {acidente.horario && <p className="text-sm text-gray-600">Horário: {acidente.horario}</p>}
          </div>
          <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Tipo de Acidente</h3>
            <p className="text-lg font-bold text-gray-800">{acidente.tipoAcidente}</p>
          </div>
        </div>

        <div className="card bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-8">
          {/* Informações do Trabalhador */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Informações do Trabalhador</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{(acidente.trabalhadorId as any)?.nome || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CPF</p>
                <p className="font-medium">{(acidente.trabalhadorId as any)?.cpf || 'Não informado'}</p>
              </div>
            </div>
          </section>

          {/* Ocorrência */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Detalhes da Ocorrência</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Descrição</p>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{acidente.descricao}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Local</p>
                  <p className="font-medium">{acidente.local || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ocorreu em Feriado?</p>
                  <p className="font-medium">{acidente.feriado ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Lesões */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Lesões Identificadas</h2>
            {acidente.lesoes && acidente.lesoes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {acidente.lesoes.map((lesao, index) => (
                  <span key={index} className="bg-red-50 text-red-700 px-3 py-1 rounded border border-red-100 text-sm">
                    {lesao}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Nenhuma lesão informada</p>
            )}
          </section>

          {/* Comunicação */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Comunicação do Acidente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Comunicado?</p>
                <p className="font-medium">{acidente.comunicado ? 'Sim' : 'Não'}</p>
              </div>
              {acidente.comunicado && (
                <div>
                  <p className="text-sm text-gray-500">Data da Comunicação</p>
                  <p className="font-medium">{formatarData(acidente.dataComunicacao)}</p>
                </div>
              )}
            </div>
          </section>

          {/* Material Biológico */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Material Biológico</h3>
              <Link
                to={`/acidentes/${acidente._id}/material-biologico`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Adicionar/Editar
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <p className="text-gray-500 italic">Clique em "Adicionar/Editar" para gerenciar informações de material biológico deste acidente.</p>
            </div>
          </section>

          {/* Audit */}
          <section className="bg-gray-50 p-4 rounded-md text-xs text-gray-500 grid grid-cols-2 gap-4">
            <div>
              <p>Criado em: {new Date(acidente.dataCriacao!).toLocaleString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p>Última atualização: {new Date(acidente.dataAtualizacao!).toLocaleString('pt-BR')}</p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};
