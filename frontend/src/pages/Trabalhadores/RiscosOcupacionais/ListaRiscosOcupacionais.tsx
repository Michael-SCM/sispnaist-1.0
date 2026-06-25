import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorRiscoOcupacional, ITrabalhador } from '../../../types/index.js';
import {
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  X,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaRiscosOcupacionais: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [riscos, setRiscos] = useState<ITrabalhadorRiscoOcupacional[]>([]);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [riscoSelecionado, setRiscoSelecionado] = useState<ITrabalhadorRiscoOcupacional | null>(null);

  useEffect(() => {
    if (id) carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [t, r] = await Promise.all([
        trabalhadorService.obterPorId(id!),
        submoduloTrabalhadorService.listarRiscosOcupacionais(id!),
      ]);
      setTrabalhador(t);
      setRiscos(r);
    } catch {
      toast.error('Erro ao carregar riscos ocupacionais');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (e: React.MouseEvent, riscoId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este risco?')) {
      try {
        await submoduloTrabalhadorService.deletarRiscoOcupacional(id!, riscoId);
        setRiscos(prev => prev.filter(r => r._id !== riscoId));
        toast.success('Risco removido!');
      } catch {
        toast.error('Erro ao remover risco');
      }
    }
  };

  const intensidadeColor = (int?: string) => {
    if (int === 'alto') return 'text-red-600 bg-red-50';
    if (int === 'medio') return 'text-amber-600 bg-amber-50';
    if (int === 'baixo') return 'text-emerald-600 bg-emerald-50';
    return 'text-slate-400 bg-slate-50';
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/trabalhadores/${id}`)}
              className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Riscos Ocupacionais</h1>
              {trabalhador && (
                <p className="text-slate-500 font-medium">
                  Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/trabalhadores/${id}/riscos-ocupacionais/novo`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-100 active:scale-95"
          >
            <Plus size={20} />
            Novo Risco
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Intensidade</th>
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
                ) : riscos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                      <Shield className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhum risco ocupacional registrado</p>
                    </td>
                  </tr>
                ) : (
                  riscos.map((risco) => (
                    <tr
                      key={risco._id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setRiscoSelecionado(risco)}
                    >
                      <td className="px-8 py-6">
                        <span className="font-bold text-slate-700">{risco.categoria}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm text-slate-600">{risco.tipoRisco}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${intensidadeColor(risco.intensidade)}`}>
                          {risco.intensidade || 'N/I'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                          risco.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {risco.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setRiscoSelecionado(risco); }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Visualizar"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/trabalhadores/${id}/riscos-ocupacionais/${risco._id}/editar`); }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, risco._id!)}
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
      {riscoSelecionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setRiscoSelecionado(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Shield size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Detalhes do Risco</h3>
                </div>
                <button onClick={() => setRiscoSelecionado(null)} className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-95">
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Categoria</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black uppercase w-fit block mt-0.5">{riscoSelecionado.categoria}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo de Risco</span>
                    <span className="font-semibold text-slate-700 block">{riscoSelecionado.tipoRisco}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Intensidade</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-widest mt-1 ${intensidadeColor(riscoSelecionado.intensidade)}`}>
                      {riscoSelecionado.intensidade || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Presente</span>
                    <span className="font-semibold text-slate-700 block">{riscoSelecionado.presente ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
                {riscoSelecionado.fonteGeradora && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Fonte Geradora</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 text-sm">{riscoSelecionado.fonteGeradora}</p>
                  </div>
                )}
                {riscoSelecionado.observacao && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Observação</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 text-sm">{riscoSelecionado.observacao}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Frequência</span>
                    <span className="font-semibold text-slate-700 block">{riscoSelecionado.frequenciaExposicao || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Duração</span>
                    <span className="font-semibold text-slate-700 block">{riscoSelecionado.duracaoExposicao || 'Não informado'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">EPC Utilizado</span>
                    <span className="font-semibold text-slate-700 block">{riscoSelecionado.epcUtilizado ? 'Sim' : 'Não'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">EPI Utilizado</span>
                    <span className="font-semibold text-slate-700 block">{riscoSelecionado.epiUtilizado ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
                {riscoSelecionado.medidasControle && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Medidas de Controle</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 text-sm">{riscoSelecionado.medidasControle}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${riscoSelecionado.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {riscoSelecionado.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => { setRiscoSelecionado(null); navigate(`/trabalhadores/${id}/riscos-ocupacionais/${riscoSelecionado._id}/editar`); }}
                  className="px-4 py-2 text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl transition-all active:scale-95"
                >
                  Editar
                </button>
                <button onClick={() => setRiscoSelecionado(null)} className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all active:scale-95">
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

export default ListaRiscosOcupacionais;
