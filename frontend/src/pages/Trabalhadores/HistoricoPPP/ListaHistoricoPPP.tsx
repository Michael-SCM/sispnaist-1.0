import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorHistoricoPPP, ITrabalhador } from '../../../types/index.js';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Calendar,
  ArrowLeft,
  Eye,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaHistoricoPPP: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registros, setRegistros] = useState<ITrabalhadorHistoricoPPP[]>([]);
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
      const [t, r] = await Promise.all([
        trabalhadorService.obterPorId(id!),
        submoduloTrabalhadorService.listarHistoricoPPP(id!),
      ]);
      setTrabalhador(t);
      setRegistros(r);
    } catch (error) {
      toast.error('Erro ao carregar histórico laboral');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (e: React.MouseEvent, registroId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este registro?')) {
      try {
        await submoduloTrabalhadorService.deletarHistoricoPPP(id!, registroId);
        setRegistros(prev => prev.filter(r => r._id !== registroId));
        toast.success('Registro removido com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover registro');
      }
    }
  };

  return (
    <MainLayout>
      <DocumentTitle title="Histórico PPP" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/trabalhadores/${id}`)}
              className="p-3 hover:bg-blue-50 rounded-2xl transition-all text-blue-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Histórico Laboral / PPP</h1>
              {trabalhador && (
                <p className="text-slate-500 font-medium">
                  Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/trabalhadores/${id}/historico-ppp/novo`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={20} />
            Novo Período PPP
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Período</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Empresa / Cargo</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Agentes / Exposição</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6 h-24 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : registros.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      <FileText className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhum registro PPP encontrado</p>
                      <p className="text-sm text-slate-300">Cadastre o histórico laboral do trabalhador</p>
                    </td>
                  </tr>
                ) : (
                  registros.map((registro) => (
                    <tr
                      key={registro._id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/trabalhadores/${id}/historico-ppp/${registro._id}`)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/trabalhadores/${id}/historico-ppp/${registro._id}`); } }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block">
                              {registro.dataInicio ? new Date(registro.dataInicio).toLocaleDateString('pt-BR') : '-'}
                            </span>
                            <span className="text-slate-400 text-xs">
                              até {registro.dataFim ? new Date(registro.dataFim).toLocaleDateString('pt-BR') : 'Em andamento'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-600">{registro.empresa}</span>
                          <span className="text-xs text-slate-400">{registro.cargo}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1">
                          {registro.agentesQuimicos && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold">Químico</span>
                          )}
                          {registro.agentesFisicos && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold">Físico</span>
                          )}
                          {registro.agentesBiologicos && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">Biológico</span>
                          )}
                          {registro.agentesErgonomicos && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-bold">Ergonômico</span>
                          )}
                          {!registro.agentesQuimicos && !registro.agentesFisicos && !registro.agentesBiologicos && !registro.agentesErgonomicos && (
                            <span className="text-xs text-slate-400">Nenhum agente registrado</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trabalhadores/${id}/historico-ppp/${registro._id}`);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Visualizar Detalhes"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trabalhadores/${id}/historico-ppp/${registro._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, registro._id!)}
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
    </MainLayout>
  );
};

export default ListaHistoricoPPP;
