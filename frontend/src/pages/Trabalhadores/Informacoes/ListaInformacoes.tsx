import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { informacaoService, ITrabalhadorInformacao } from '../../../services/informacaoService.js';
import { uploadService } from '../../../services/uploadService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhador } from '../../../types/index.js';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Calendar,
  ArrowLeft,
  Activity,
  Heart,
  Droplet,
  Eye,
  X,
  Pill,
  AlertCircle,
  Wine,
  Cigarette,
  Zap,
  ClipboardList,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaInformacoes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [informacoes, setInformacoes] = useState<ITrabalhadorInformacao[]>([]);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [informacaoSelecionada, setInformacaoSelecionada] = useState<ITrabalhadorInformacao | null>(null);

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [t, info] = await Promise.all([
        trabalhadorService.obterPorId(id!),
        informacaoService.listarPorTrabalhador(id!),
      ]);
      setTrabalhador(t);
      setInformacoes(info);
    } catch (error) {
      toast.error('Erro ao carregar informações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (e: React.MouseEvent, infoId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir estas informações?')) {
      try {
        await informacaoService.deletar(id!, infoId);
        setInformacoes(prev => prev.filter(i => i._id !== infoId));
        toast.success('Informações removidas com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover informações');
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
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Informações Históricas</h1>
              {trabalhador && (
                <p className="text-slate-500 font-medium">
                  Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/trabalhadores/${id}/informacoes/novo`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-100 active:scale-95"
          >
            <Plus size={20} />
            Novas Informações
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Medicamentos</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Saúde</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Exames</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Vícios</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6 h-24 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : informacoes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                      <Pill className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhuma informação registrada</p>
                    </td>
                  </tr>
                ) : (
                  informacoes.map((info) => (
                    <tr
                      key={info._id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setInformacaoSelecionada(info)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                            <Pill size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block max-w-[200px] truncate">
                              {info.medicamentos || 'Não informado'}
                            </span>
                            <span className="text-slate-400 text-xs">
                              Tipo Sanguíneo: {info.tipoSanguineo || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          {info.allergy && (
                            <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700">
                              <AlertCircle size={10} className="mr-1 mt-0.5" />
                              Alergia
                            </span>
                          )}
                          {info.acompanhamentoMedico && (
                            <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">
                              <Heart size={10} className="mr-1 mt-0.5" />
                              Acomp. Médico
                            </span>
                          )}
                          {info.acompanhamentoReabilitacao && (
                            <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                              <Activity size={10} className="mr-1 mt-0.5" />
                              Reabilitação
                            </span>
                          )}
                          {!info.allergy && !info.acompanhamentoMedico && !info.acompanhamentoReabilitacao && (
                            <span className="text-slate-400 text-xs">Sem registros</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          {info.exames && (info.exames.realizados || info.exames.resultados) ? (
                            <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-teal-100 text-teal-700">
                              <ClipboardList size={10} className="mr-1 mt-0.5" />
                              {(info.exames.anexos?.length ?? 0) > 0 ? `${info.exames.anexos.length} anexo(s)` : 'Registrado'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Sem exames</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          {info.usoAlcool && (
                            <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-700">
                              <Wine size={10} className="mr-1 mt-0.5" />
                              Álcool ({info.dosesAlcool} doses)
                            </span>
                          )}
                          {info.usoCigarro && (
                            <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-700">
                              <Cigarette size={10} className="mr-1 mt-0.5" />
                              Cigarro ({info.macosCigarro} maços)
                            </span>
                          )}
                          {info.usoOutraDroga && (
                            <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-700">
                              <Zap size={10} className="mr-1 mt-0.5" />
                              Outra droga
                            </span>
                          )}
                          {!info.usoAlcool && !info.usoCigarro && !info.usoOutraDroga && (
                            <span className="text-slate-400 text-xs">Nenhum vício registrado</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInformacaoSelecionada(info);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Visualizar Detalhes"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trabalhadores/${id}/informacoes/${info._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, info._id!)}
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
      {informacaoSelecionada && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setInformacaoSelecionada(null)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Heart size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Histórico e Informações de Saúde</h3>
                </div>
                <button 
                  onClick={() => setInformacaoSelecionada(null)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo Sanguíneo</span>
                    <span className="font-semibold text-slate-700 block">
                      {informacaoSelecionada.tipoSanguineo || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Medicamentos de Uso Contínuo</span>
                    <span className="font-semibold text-slate-700 block">
                      {informacaoSelecionada.medicamentos || 'Nenhum informado'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Alergias e Acompanhamento Médico</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Possui Alergias?</span>
                      <span className="font-semibold text-slate-700 block">
                        {informacaoSelecionada.allergy ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    {informacaoSelecionada.allergy && (
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Descrição das Alergias</span>
                        <span className="font-semibold text-slate-700 block">
                          {informacaoSelecionada.alergiasDescricao || 'Não descritas'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Acompanhamento Médico?</span>
                      <span className="font-semibold text-slate-700 block">
                        {informacaoSelecionada.acompanhamentoMedico ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    {informacaoSelecionada.acompanhamentoMedico && (
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Motivo do Acompanhamento</span>
                        <span className="font-semibold text-slate-700 block">
                          {informacaoSelecionada.acompanhamentoMedicoMotivo || 'Não informado'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Programa de Reabilitação?</span>
                      <span className="font-semibold text-slate-700 block">
                        {informacaoSelecionada.acompanhamentoReabilitacao ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Hábitos e Estilo de Vida</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Consumo de Álcool</span>
                      <span className="font-semibold text-slate-700 block">
                        {informacaoSelecionada.usoAlcool ? `Sim (${informacaoSelecionada.dosesAlcool} doses/semana)` : 'Não'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Uso de Cigarro / Tabaco</span>
                      <span className="font-semibold text-slate-700 block">
                        {informacaoSelecionada.usoCigarro ? `Sim (${informacaoSelecionada.macosCigarro} maços/dia)` : 'Não'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Uso de Outras Substâncias</span>
                      <span className="font-semibold text-slate-700 block">
                        {informacaoSelecionada.usoOutraDroga ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    {informacaoSelecionada.usoOutraDroga && (
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Descrição das Substâncias</span>
                        <span className="font-semibold text-slate-700 block">
                          {informacaoSelecionada.outraDrogaDescricao || 'Não informada'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Exames</h4>
                  {informacaoSelecionada.exames ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Exames Realizados</span>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                          {informacaoSelecionada.exames.realizados || 'Não informado'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Resultados</span>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                          {informacaoSelecionada.exames.resultados || 'Não informado'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Periodicidade</span>
                        <span className="font-semibold text-slate-700 block mt-1">
                          {informacaoSelecionada.exames.periodicidade || 'Não informada'}
                        </span>
                      </div>
                      {(informacaoSelecionada.exames.anexos?.length ?? 0) > 0 && (
                        <div>
                          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Anexos</span>
                          <ul className="mt-1 space-y-1">
                            {informacaoSelecionada.exames.anexos.map((uploadId) => (
                              <li key={uploadId}>
                                <button
                                  onClick={() => uploadService.download(uploadId)}
                                  className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-medium"
                                >
                                  <Download size={14} />
                                  {uploadId}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">Nenhum exame registrado</span>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Observações Gerais</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                    {informacaoSelecionada.observacoes || 'Nenhuma observação complementar registrada'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setInformacaoSelecionada(null);
                    navigate(`/trabalhadores/${id}/informacoes/${informacaoSelecionada._id}/editar`);
                  }}
                  className="px-4 py-2 text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl transition-all active:scale-95"
                >
                  Editar Registro
                </button>
                <button 
                  onClick={() => setInformacaoSelecionada(null)}
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

export default ListaInformacoes;
