import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { catalogoService } from '../../../services/catalogoService.js';
import toast from 'react-hot-toast';

const ENTIDADES_TRABALHADOR = [
  { key: 'escolaridade', label: 'Escolaridade', icone: '📚' },
  { key: 'estadoCivil', label: 'Estado Civil', icone: '💍' },
  { key: 'racaCor', label: 'Raça/Cor', icone: '🏾' },
  { key: 'sexo', label: 'Sexo', icone: '⚤' },
  { key: 'tipoSanguineo', label: 'Tipo Sanguíneo', icone: '🩸' },
  { key: 'situacaoTrabalho', label: 'Situação de Trabalho', icone: '💼' },
  { key: 'funcao', label: 'Função', icone: '🔧' },
  { key: 'jornadaTrabalho', label: 'Jornada de Trabalho', icone: '⏰' },
  { key: 'turnoTrabalho', label: 'Turno de Trabalho', icone: '🌗' },
];

export const ListaCatalogos: React.FC = () => {
  const navigate = useNavigate();
  const [entidades, setEntidades] = useState<{ entidade: string; total: number; ativos: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    carregarEntidades();
  }, []);

  const carregarEntidades = async () => {
    try {
      setIsLoading(true);
      const response = await catalogoService.listarEntidades();
      setEntidades(response);
    } catch (error) {
      toast.error('Erro ao carregar catálogos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const executarSeed = async () => {
    if (!window.confirm('Isso irá popular os catálogos essenciais com dados iniciais. Deseja continuar?')) {
      return;
    }
    try {
      setIsSeeding(true);
      const result = await catalogoService.executarSeed();
      toast.success(result.message);
      await carregarEntidades();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao executar seed');
      console.error(error);
    } finally {
      setIsSeeding(false);
    }
  };

  const getStats = (key: string) => {
    const found = (entidades || []).find((e) => e.entidade === key);
    return found || { total: 0, ativos: 0 };
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Catálogos Essenciais</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os catálogos utilizados nos cadastros de trabalhadores e vínculos.
            </p>
          </div>
          <button
            onClick={executarSeed}
            disabled={isSeeding}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium shadow-md transition flex items-center gap-2"
          >
            {isSeeding ? 'Executando...' : '🌱 Executar Seed'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENTIDADES_TRABALHADOR.map((ent) => {
              const stats = getStats(ent.key);
              return (
                <button
                  key={ent.key}
                  onClick={() => navigate(`/admin/catalogos/${ent.key}`)}
                  className="card p-6 text-left hover:shadow-md transition group border-l-4 border-blue-500"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{ent.icone}</span>
                    <h3 className="text-lg font-bold text-gray-800">{ent.label}</h3>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">
                      <strong className="text-gray-800">{stats.total}</strong> total
                    </span>
                    <span className="text-green-600">
                      <strong>{stats.ativos}</strong> ativo{stats.ativos !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-3 text-right">
                    <span className="text-blue-500 text-sm font-medium group-hover:underline">
                      Gerenciar →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
