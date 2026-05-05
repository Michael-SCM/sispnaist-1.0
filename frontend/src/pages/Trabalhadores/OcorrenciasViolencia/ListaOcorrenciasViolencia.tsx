import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorOcorrenciaViolencia, ITrabalhador } from '../../../types/index.js';
import {
  ShieldAlert,
  Plus,
  Edit,
  Trash2,
  Calendar,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaOcorrenciasViolencia: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ocorrencias, setOcorrencias] = useState<ITrabalhadorOcorrenciaViolencia[]>([]);
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
      const [t, o] = await Promise.all([
        trabalhadorService.obterPorId(id!),
        submoduloTrabalhadorService.listarOcorrenciasViolencia(id!),
      ]);
      setTrabalhador(t);
      setOcorrencias(o);
    } catch (error) {
      toast.error('Erro ao carregar ocorrências de violência');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (e: React.MouseEvent, ocorrenciaId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover esta ocorrência?')) {
      try {
        await submoduloTrabalhadorService.deletarOcorrenciaViolencia(id!, ocorrenciaId);
        setOcorrencias(prev => prev.filter(o => o._id !== ocorrenciaId));
        toast.success('Ocorrência removida com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover ocorrência');
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
              className="p-3 hover:bg-red-50 rounded-2xl transition-all text-red-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ocorrências de Violência</h1>
              {trabalhador && (
                <p className="text-slate-500 font-medium">
                  Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/trabalhadores/${id}/ocorrencias-violencia/novo`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-100 active:scale-95"
          >
            <Plus size={20} />
            Nova Ocorrência
          </button>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Data</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Tipo de Violência</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Motivo</th>
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
                ) : ocorrencias.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                      <ShieldAlert className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhuma ocorrência registrada</p>
                    </td>
                  </tr>
                ) : (
                  ocorrencias.map((ocorrencia) => (
                    <tr
                      key={ocorrencia._id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block">
                              {ocorrencia.dataOcorrencia ? new Date(ocorrencia.dataOcorrencia).toLocaleDateString('pt-BR') : '-'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-600">{ocorrencia.tipoViolencia}</span>
                          {ocorrencia.tipoViolenciaSexual && (
                            <span className="text-xs text-red-400 max-w-[200px] truncate">Sexual: {ocorrencia.tipoViolenciaSexual}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm text-slate-600 max-w-[200px] truncate block">{ocorrencia.motivoViolencia}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                          ocorrencia.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {ocorrencia.ativo ? 'Ativo' : 'Encerrado'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trabalhadores/${id}/ocorrencias-violencia/${ocorrencia._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, ocorrencia._id!)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

export default ListaOcorrenciasViolencia;
