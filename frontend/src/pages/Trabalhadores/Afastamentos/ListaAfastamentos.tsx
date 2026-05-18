import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorAfastamento, ITrabalhador } from '../../../types/index.js';
import { 
  Stethoscope, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  ArrowLeft, 
  ChevronRight,
  ClipboardList,
  Activity,
  Eye,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaAfastamentos: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [afastamentos, setAfastamentos] = useState<ITrabalhadorAfastamento[]>([]);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [afastamentoSelecionado, setAfastamentoSelecionado] = useState<ITrabalhadorAfastamento | null>(null);

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [t, a] = await Promise.all([
        trabalhadorService.obterPorId(id!),
        submoduloTrabalhadorService.listarAfastamentos(id!),
      ]);
      setTrabalhador(t);
      setAfastamentos(a);
    } catch (error) {
      toast.error('Erro ao carregar afastamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (e: React.MouseEvent, afastamentoId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este afastamento?')) {
      try {
        await submoduloTrabalhadorService.deletarAfastamento(id!, afastamentoId);
        setAfastamentos(prev => prev.filter(a => a._id !== afastamentoId));
        toast.success('Afastamento removido com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover afastamento');
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
              className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Afastamentos</h1>
              {trabalhador && (
                <p className="text-slate-500 font-medium">
                  Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/trabalhadores/${id}/afastamentos/novo`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-100 active:scale-95"
          >
            <Plus size={20} />
            Novo Afastamento
          </button>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Período</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Tipo & Motivo</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">CID / Status</th>
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
                ) : afastamentos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      <Stethoscope className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhum afastamento registrado</p>
                    </td>
                  </tr>
                ) : (
                  afastamentos.map((afastamento) => (
                    <tr 
                      key={afastamento._id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setAfastamentoSelecionado(afastamento)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block">
                              {afastamento.dataInicio ? new Date(afastamento.dataInicio).toLocaleDateString('pt-BR') : '-'}
                            </span>
                            <span className="text-slate-400 text-xs">
                              até {afastamento.dataFim ? new Date(afastamento.dataFim).toLocaleDateString('pt-BR') : 'Em aberto'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-600">{afastamento.tipoAfastamento}</span>
                          <span className="text-xs text-slate-400 max-w-[200px] truncate">{afastamento.motivoAfastamento || 'Sem motivo'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase w-fit">
                            CID: {afastamento.cid || 'N/A'}
                          </span>
                          <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            afastamento.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {afastamento.ativo ? 'Ativo' : 'Encerrado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAfastamentoSelecionado(afastamento);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Visualizar Detalhes"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trabalhadores/${id}/afastamentos/${afastamento._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, afastamento._id!)}
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
      {afastamentoSelecionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setAfastamentoSelecionado(null)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Stethoscope size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Detalhes do Afastamento</h3>
                </div>
                <button 
                  onClick={() => setAfastamentoSelecionado(null)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Início</span>
                    <span className="font-semibold text-slate-700">
                      {afastamentoSelecionado.dataInicio ? new Date(afastamentoSelecionado.dataInicio).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Fim</span>
                    <span className="font-semibold text-slate-700">
                      {afastamentoSelecionado.dataFim ? new Date(afastamentoSelecionado.dataFim).toLocaleDateString('pt-BR') : 'Em aberto'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo de Afastamento</span>
                    <span className="font-semibold text-slate-700 block">
                      {afastamentoSelecionado.tipoAfastamento}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Código CID</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-black uppercase w-fit block">
                      {afastamentoSelecionado.cid || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Motivo do Afastamento</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                    {afastamentoSelecionado.motivoAfastamento || 'Nenhum motivo informado'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Perícia</span>
                    <span className="font-semibold text-slate-700">
                      {afastamentoSelecionado.dataPericia ? new Date(afastamentoSelecionado.dataPericia).toLocaleDateString('pt-BR') : 'Não agendada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Retorno</span>
                    <span className="font-semibold text-slate-700">
                      {afastamentoSelecionado.dataRetorno ? new Date(afastamentoSelecionado.dataRetorno).toLocaleDateString('pt-BR') : 'Não definida'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Desfecho</span>
                    <span className="font-semibold text-slate-700">
                      {afastamentoSelecionado.desfecho || 'Sem desfecho registrado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tempo de Afastamento</span>
                    <span className="font-semibold text-slate-700">
                      {afastamentoSelecionado.tempoAfastamento || 'Não quantificado'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Laudo Médico</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                    {afastamentoSelecionado.laudoMedico || 'Nenhum laudo anexado'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Observações</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                    {afastamentoSelecionado.observacoes || 'Nenhuma observação cadastrada'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status do Afastamento:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    afastamentoSelecionado.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {afastamentoSelecionado.ativo ? 'Ativo' : 'Encerrado'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setAfastamentoSelecionado(null);
                    navigate(`/trabalhadores/${id}/afastamentos/${afastamentoSelecionado._id}/editar`);
                  }}
                  className="px-4 py-2 text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl transition-all active:scale-95"
                >
                  Editar Registro
                </button>
                <button 
                  onClick={() => setAfastamentoSelecionado(null)}
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

export default ListaAfastamentos;
