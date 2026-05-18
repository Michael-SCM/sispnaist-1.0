import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorProcessoTrabalho, ITrabalhador } from '../../../types/index.js';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Calendar,
  ArrowLeft,
  Clock,
  Building,
  Eye,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaProcessosTrabalho: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [processos, setProcessos] = useState<ITrabalhadorProcessoTrabalho[]>([]);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processoSelecionado, setProcessoSelecionado] = useState<ITrabalhadorProcessoTrabalho | null>(null);

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [t, p] = await Promise.all([
        trabalhadorService.obterPorId(id!),
        submoduloTrabalhadorService.listarProcessosTrabalho(id!),
      ]);
      setTrabalhador(t);
      setProcessos(p);
    } catch (error) {
      toast.error('Erro ao carregar processos de trabalho');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (e: React.MouseEvent, processoId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este processo de trabalho?')) {
      try {
        await submoduloTrabalhadorService.deletarProcessoTrabalho(id!, processoId);
        setProcessos(prev => prev.filter(p => p._id !== processoId));
        toast.success('Processo de trabalho removido com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover processo');
      }
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/trabalhadores/${id}`)}
              className="p-3 hover:bg-cyan-50 rounded-2xl transition-all text-cyan-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Processos de Trabalho</h1>
              {trabalhador && (
                <p className="text-slate-500 font-medium">
                  Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/trabalhadores/${id}/processos-trabalho/novo`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-100 active:scale-95"
          >
            <Plus size={20} />
            Novo Processo
          </button>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Período</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Cargo / Função</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Jornada / Turno</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6 h-24 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : processos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                      <Briefcase className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhum processo de trabalho registrado</p>
                    </td>
                  </tr>
                ) : (
                  processos.map((processo) => (
                    <tr
                      key={processo._id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setProcessoSelecionado(processo)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block">
                              {processo.dataInicio ? new Date(processo.dataInicio).toLocaleDateString('pt-BR') : '-'}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {processo.dataFim ? `até ${new Date(processo.dataFim).toLocaleDateString('pt-BR')}` : 'Atual'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-600">{processo.cargo}</span>
                          <span className="text-xs text-slate-400 max-w-[200px] truncate">{processo.funcao || 'Sem função'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          {processo.jornadaTrabalho && (
                            <span className="text-xs text-slate-500">{processo.jornadaTrabalho}</span>
                          )}
                          {processo.turnoTrabalho && (
                            <span className="text-xs text-slate-400">{processo.turnoTrabalho}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                          processo.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {processo.ativo ? 'Ativo' : 'Encerrado'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProcessoSelecionado(processo);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Visualizar Detalhes"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trabalhadores/${id}/processos-trabalho/${processo._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, processo._id!)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {processoSelecionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setProcessoSelecionado(null)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                    <Briefcase size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Detalhes do Processo de Trabalho</h3>
                </div>
                <button 
                  onClick={() => setProcessoSelecionado(null)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Cargo</span>
                    <span className="font-semibold text-slate-700 block">
                      {processoSelecionado.cargo || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Função</span>
                    <span className="font-semibold text-slate-700 block">
                      {processoSelecionado.funcao || 'Não informada'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Jornada de Trabalho</span>
                    <span className="font-semibold text-slate-700 block">
                      {processoSelecionado.jornadaTrabalho || 'Não informada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Turno</span>
                    <span className="font-semibold text-slate-700 block">
                      {processoSelecionado.turnoTrabalho || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Início</span>
                    <span className="font-semibold text-slate-700 block">
                      {processoSelecionado.dataInicio ? new Date(processoSelecionado.dataInicio).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Fim</span>
                    <span className="font-semibold text-slate-700 block">
                      {processoSelecionado.dataFim ? new Date(processoSelecionado.dataFim).toLocaleDateString('pt-BR') : 'Atual'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    processoSelecionado.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {processoSelecionado.ativo ? 'Ativo' : 'Encerrado'}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Observações / Descrição</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                    {processoSelecionado.observacoes || 'Nenhuma observação cadastrada'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setProcessoSelecionado(null);
                    navigate(`/trabalhadores/${id}/processos-trabalho/${processoSelecionado._id}/editar`);
                  }}
                  className="px-4 py-2 text-sm bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold rounded-xl transition-all active:scale-95"
                >
                  Editar Registro
                </button>
                <button 
                  onClick={() => setProcessoSelecionado(null)}
                  className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all active:scale-95"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ListaProcessosTrabalho;
