import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
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
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaHistoricoPPP: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registros, setRegistros] = useState<ITrabalhadorHistoricoPPP[]>([]);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registroSelecionado, setRegistroSelecionado] = useState<ITrabalhadorHistoricoPPP | null>(null);

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
                      onClick={() => setRegistroSelecionado(registro)}
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
                              setRegistroSelecionado(registro);
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

      {registroSelecionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setRegistroSelecionado(null)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <FileText size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Detalhes do PPP</h3>
                </div>
                <button
                  onClick={() => setRegistroSelecionado(null)}
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
                      {registroSelecionado.dataInicio ? new Date(registroSelecionado.dataInicio).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Término</span>
                    <span className="font-semibold text-slate-700">
                      {registroSelecionado.dataFim ? new Date(registroSelecionado.dataFim).toLocaleDateString('pt-BR') : 'Em andamento'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Empresa</span>
                  <span className="font-semibold text-slate-700">{registroSelecionado.empresa}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Cargo</span>
                    <span className="font-semibold text-slate-700">{registroSelecionado.cargo}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Função</span>
                    <span className="font-semibold text-slate-700">{registroSelecionado.funcao || '-'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Setor</span>
                  <span className="font-semibold text-slate-700">{registroSelecionado.setor}</span>
                </div>
                {registroSelecionado.descricaoAtividades && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Atividades</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                      {registroSelecionado.descricaoAtividades}
                    </p>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2">Exposição a Agentes</span>
                  <div className="grid grid-cols-2 gap-3">
                    {registroSelecionado.agentesQuimicos && (
                      <div className="bg-red-50 p-2 rounded-xl">
                        <span className="text-[10px] font-black text-red-600 uppercase">Químicos</span>
                        <p className="text-xs text-slate-600 mt-0.5">{registroSelecionado.agentesQuimicos}</p>
                      </div>
                    )}
                    {registroSelecionado.agentesFisicos && (
                      <div className="bg-amber-50 p-2 rounded-xl">
                        <span className="text-[10px] font-black text-amber-600 uppercase">Físicos</span>
                        <p className="text-xs text-slate-600 mt-0.5">{registroSelecionado.agentesFisicos}</p>
                      </div>
                    )}
                    {registroSelecionado.agentesBiologicos && (
                      <div className="bg-emerald-50 p-2 rounded-xl">
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Biológicos</span>
                        <p className="text-xs text-slate-600 mt-0.5">{registroSelecionado.agentesBiologicos}</p>
                      </div>
                    )}
                    {registroSelecionado.agentesErgonomicos && (
                      <div className="bg-purple-50 p-2 rounded-xl">
                        <span className="text-[10px] font-black text-purple-600 uppercase">Ergonômicos</span>
                        <p className="text-xs text-slate-600 mt-0.5">{registroSelecionado.agentesErgonomicos}</p>
                      </div>
                    )}
                  </div>
                </div>
                {(registroSelecionado.tecnicaMedicao || registroSelecionado.resultadoMedicao) && (
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2">Monitoramento Ambiental</span>
                    <div className="grid grid-cols-3 gap-3">
                      {registroSelecionado.tecnicaMedicao && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Técnica</span>
                          <p className="text-sm font-semibold text-slate-700">{registroSelecionado.tecnicaMedicao}</p>
                        </div>
                      )}
                      {registroSelecionado.resultadoMedicao && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Resultado</span>
                          <p className="text-sm font-semibold text-slate-700">{registroSelecionado.resultadoMedicao}</p>
                        </div>
                      )}
                      {registroSelecionado.limiteTolerancia && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Limite (LT)</span>
                          <p className="text-sm font-semibold text-slate-700">{registroSelecionado.limiteTolerancia}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">EPC Eficaz:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${registroSelecionado.epcEficaz ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {registroSelecionado.epcEficaz ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">EPI Eficaz:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${registroSelecionado.epiEficaz ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {registroSelecionado.epiEficaz ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>
                {(registroSelecionado.ltcatNumero || registroSelecionado.dataLtcat) && (
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2">LTCAT</span>
                    <div className="grid grid-cols-2 gap-3">
                      {registroSelecionado.ltcatNumero && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Nº do Laudo</span>
                          <p className="text-sm font-semibold text-slate-700">{registroSelecionado.ltcatNumero}</p>
                        </div>
                      )}
                      {registroSelecionado.dataLtcat && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Data do Laudo</span>
                          <p className="text-sm font-semibold text-slate-700">{new Date(registroSelecionado.dataLtcat).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {(registroSelecionado.responsavelNome || registroSelecionado.responsavelRegistro) && (
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2">Responsável Técnico</span>
                    <div className="grid grid-cols-2 gap-3">
                      {registroSelecionado.responsavelNome && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Nome</span>
                          <p className="text-sm font-semibold text-slate-700">{registroSelecionado.responsavelNome}</p>
                        </div>
                      )}
                      {registroSelecionado.responsavelRegistro && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Registro</span>
                          <p className="text-sm font-semibold text-slate-700">{registroSelecionado.responsavelRegistro}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {(registroSelecionado.dataExameMedico || registroSelecionado.resultadoExame) && (
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2">Exame Médico Ocupacional</span>
                    <div className="grid grid-cols-2 gap-3">
                      {registroSelecionado.dataExameMedico && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Data</span>
                          <p className="text-sm font-semibold text-slate-700">{new Date(registroSelecionado.dataExameMedico).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                      {registroSelecionado.resultadoExame && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Resultado</span>
                          <p className="text-sm font-semibold text-slate-700">{registroSelecionado.resultadoExame}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {registroSelecionado.observacoes && (
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Observações</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                      {registroSelecionado.observacoes}
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setRegistroSelecionado(null);
                    navigate(`/trabalhadores/${id}/historico-ppp/${registroSelecionado._id}/editar`);
                  }}
                  className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-all active:scale-95"
                >
                  Editar Registro
                </button>
                <button
                  onClick={() => setRegistroSelecionado(null)}
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

export default ListaHistoricoPPP;
