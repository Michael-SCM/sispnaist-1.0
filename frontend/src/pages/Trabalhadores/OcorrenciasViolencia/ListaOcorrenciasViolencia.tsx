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
  Shield,
  Eye,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaOcorrenciasViolencia: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ocorrencias, setOcorrencias] = useState<ITrabalhadorOcorrenciaViolencia[]>([]);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<ITrabalhadorOcorrenciaViolencia | null>(null);

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
                      onClick={() => setOcorrenciaSelecionada(ocorrencia)}
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
                        <span className="text-sm text-slate-600 max-w-[200px] truncate block">
                          {ocorrencia.motivoViolencia || ocorrencia.frequenciaAssedio || '-'}
                        </span>
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
                              setOcorrenciaSelecionada(ocorrencia);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Visualizar Detalhes"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trabalhadores/${id}/ocorrencias-violencia/${ocorrencia._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, ocorrencia._id!)}
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
      {ocorrenciaSelecionada && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setOcorrenciaSelecionada(null)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                    <ShieldAlert size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Detalhes da Ocorrência</h3>
                </div>
                <button 
                  onClick={() => setOcorrenciaSelecionada(null)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data da Ocorrência</span>
                    <span className="font-semibold text-slate-700 block">
                      {ocorrenciaSelecionada.dataOcorrencia ? new Date(ocorrenciaSelecionada.dataOcorrencia).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Local do Fato</span>
                    <span className="font-semibold text-slate-700 block">
                      {ocorrenciaSelecionada.localOcorrencia || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo de Violência</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black uppercase w-fit block mt-0.5">
                      {ocorrenciaSelecionada.tipoViolencia}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Violência Sexual</span>
                    <span className="font-semibold text-slate-700 block">
                      {ocorrenciaSelecionada.tipoViolenciaSexual || 'Não se aplica'}
                    </span>
                  </div>
                </div>

                {/* Assédio: mostra frequência e testemunhas */}
                {(ocorrenciaSelecionada.tipoViolencia === 'Psicológica/Moral' || ocorrenciaSelecionada.tipoViolencia === 'Sexual') ? (
                  <>
                    {ocorrenciaSelecionada.frequenciaAssedio && (
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Frequência do Assédio</span>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                          {ocorrenciaSelecionada.frequenciaAssedio}
                        </p>
                      </div>
                    )}
                    {ocorrenciaSelecionada.testemunhas && (
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Testemunhas</span>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                          {ocorrenciaSelecionada.testemunhas}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Motivo da Violência</span>
                      <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                        {ocorrenciaSelecionada.motivoViolencia || 'Não informado'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Meio de Agressão</span>
                        <span className="font-semibold text-slate-700 block">
                          {ocorrenciaSelecionada.meioAgressao || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Pessoas Envolvidas</span>
                        <span className="font-semibold text-slate-700 block">
                          {ocorrenciaSelecionada.pessoasEnvolvidas || 'Não informado'}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Descrição dos Fatos</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                    {ocorrenciaSelecionada.descricaoOcorrencia || ocorrenciaSelecionada.descricao || 'Nenhuma descrição fornecida'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Atendimento Realizado</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                    {ocorrenciaSelecionada.atendimentoRealizado || 'Não informado'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo de Autor</span>
                    <span className="font-semibold text-slate-700 block">
                      {ocorrenciaSelecionada.tipoAutorViolencia || 'Não informado'}
                    </span>
                  </div>
                  {!ocorrenciaSelecionada.condutaViolencia ? (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Reincidência</span>
                      <span className="font-semibold text-slate-700 block">
                        {ocorrenciaSelecionada.reincidencia ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Conduta de Violência</span>
                      <span className="font-semibold text-slate-700 block">
                        {ocorrenciaSelecionada.condutaViolencia || 'Não informado'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {ocorrenciaSelecionada.boletimOcorrencia && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Boletim de Ocorrência</span>
                      <span className="font-semibold text-slate-700 block">
                        {ocorrenciaSelecionada.boletimOcorrencia}
                      </span>
                    </div>
                  )}
                  {ocorrenciaSelecionada.medidasTomadas && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Medidas Tomadas</span>
                      <span className="font-semibold text-slate-700 block">
                        {ocorrenciaSelecionada.medidasTomadas}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status da Ocorrência:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    ocorrenciaSelecionada.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {ocorrenciaSelecionada.ativo ? 'Ativo' : 'Encerrada'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setOcorrenciaSelecionada(null);
                    navigate(`/trabalhadores/${id}/ocorrencias-violencia/${ocorrenciaSelecionada._id}/editar`);
                  }}
                  className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-all active:scale-95"
                >
                  Editar Registro
                </button>
                <button 
                  onClick={() => setOcorrenciaSelecionada(null)}
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

export default ListaOcorrenciasViolencia;
