import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { uploadService } from '../../../services/uploadService.js';
import { ITrabalhadorHistoricoPPP, ITrabalhador } from '../../../types/index.js';
import {
  ArrowLeft, Edit, Trash2, Building, Briefcase, Calendar, FileText,
  Loader2, CheckCircle, XCircle, AlertTriangle, Wind, Droplets, Activity,
  UserCheck, Shield, FileSpreadsheet, Stethoscope, Info, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const InfoCard = ({ label, value, icon: Icon, color }: { label: string; value?: string | number | null; icon: any; color: string }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
    <div className={`p-2 ${color} bg-white rounded-xl shadow-sm`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value ?? '-'}</p>
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
    <Icon size={20} className="text-blue-600" />
    <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">{title}</h2>
  </div>
);

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : null;

export const DetalhesHistoricoPPP: React.FC = () => {
  const { id, pppId } = useParams<{ id: string; pppId: string }>();
  const navigate = useNavigate();
  const [registro, setRegistro] = useState<ITrabalhadorHistoricoPPP | null>(null);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && pppId) {
      carregarDados();
    }
  }, [id, pppId]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [r, t] = await Promise.all([
        submoduloTrabalhadorService.obterHistoricoPPP(id!, pppId!),
        trabalhadorService.obterPorId(id!),
      ]);
      if (r) {
        setRegistro(r);
        setTrabalhador(t);
      } else {
        toast.error('Registro PPP não encontrado');
        navigate(`/trabalhadores/${id}/historico-ppp`);
      }
    } catch {
      toast.error('Erro ao carregar registro PPP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (!registro?._id) return;
    if (confirm('Tem certeza que deseja remover este registro?')) {
      try {
        await submoduloTrabalhadorService.deletarHistoricoPPP(id!, registro._id);
        toast.success('Registro removido com sucesso!');
        navigate(`/trabalhadores/${id}/historico-ppp`);
      } catch {
        toast.error('Erro ao remover registro');
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <DocumentTitle title="Detalhes do PPP" />
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando PPP...</p>
        </div>
      </MainLayout>
    );
  }

  if (!registro) return null;

  const r = registro;

  return (
    <MainLayout>
      <DocumentTitle title="Detalhes do PPP" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/trabalhadores/${id}/historico-ppp`)}
            className="p-3 hover:bg-blue-50 rounded-2xl transition-all text-blue-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detalhes do PPP</h1>
            {trabalhador && (
              <p className="text-slate-500 font-medium">
                Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
              </p>
            )}
          </div>
        </div>

        {/* Período e Vínculo */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <SectionHeader icon={Calendar} title="Período e Vínculo" />
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Data de Início" value={formatDate(r.dataInicio)} icon={Calendar} color="text-emerald-500" />
            <InfoCard label="Data de Término" value={formatDate(r.dataFim) || 'Em andamento'} icon={Calendar} color="text-red-500" />
            <InfoCard label="Empresa" value={r.empresa} icon={Building} color="text-slate-600" />
            <InfoCard label="Cargo" value={r.cargo} icon={Briefcase} color="text-blue-500" />
            <InfoCard label="Função" value={r.funcao} icon={UserCheck} color="text-indigo-500" />
            <InfoCard label="Setor" value={r.setor} icon={Building} color="text-slate-600" />
          </div>
        </div>

        {/* Atividades */}
        {r.descricaoAtividades && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={Activity} title="Atividades Exercidas" />
            <div className="p-8">
              <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-600">
                  <FileText size={24} />
                </div>
                <p className="text-sm font-medium text-slate-700 whitespace-pre-line">
                  {r.descricaoAtividades}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Exposição a Agentes Nocivos */}
        {(r.agentesQuimicos || r.agentesFisicos || r.agentesBiologicos || r.agentesErgonomicos) && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={AlertTriangle} title="Exposição a Agentes Nocivos" />
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {r.agentesQuimicos && (
                <InfoCard label="Agentes Químicos" value={r.agentesQuimicos} icon={Wind} color="text-red-500" />
              )}
              {r.agentesFisicos && (
                <InfoCard label="Agentes Físicos" value={r.agentesFisicos} icon={Activity} color="text-amber-500" />
              )}
              {r.agentesBiologicos && (
                <InfoCard label="Agentes Biológicos" value={r.agentesBiologicos} icon={Droplets} color="text-emerald-500" />
              )}
              {r.agentesErgonomicos && (
                <InfoCard label="Agentes Ergonômicos" value={r.agentesErgonomicos} icon={Activity} color="text-purple-500" />
              )}
            </div>
          </div>
        )}

        {/* Monitoramento Ambiental */}
        {(r.tecnicaMedicao || r.resultadoMedicao || r.limiteTolerancia) && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={Wind} title="Monitoramento Ambiental" />
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard label="Técnica de Medição" value={r.tecnicaMedicao} icon={Shield} color="text-slate-600" />
              <InfoCard label="Resultado da Medição" value={r.resultadoMedicao} icon={Activity} color="text-blue-500" />
              <InfoCard label="Limite de Tolerância" value={r.limiteTolerancia} icon={AlertTriangle} color="text-orange-500" />
            </div>
          </div>
        )}

        {/* EPC / EPI */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <SectionHeader icon={Shield} title="EPC e EPI" />
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="EPC Eficaz" value={r.epcEficaz ? 'Sim' : 'Não'} icon={CheckCircle} color={r.epcEficaz ? 'text-emerald-500' : 'text-slate-500'} />
            <InfoCard label="EPI Eficaz" value={r.epiEficaz ? 'Sim' : 'Não'} icon={CheckCircle} color={r.epiEficaz ? 'text-emerald-500' : 'text-slate-500'} />
          </div>
        </div>

        {/* LTCAT */}
        {(r.ltcatNumero || r.dataLtcat) && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={FileSpreadsheet} title="LTCAT" />
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="Nº do Laudo" value={r.ltcatNumero} icon={FileText} color="text-slate-600" />
              <InfoCard label="Data do Laudo" value={formatDate(r.dataLtcat)} icon={Calendar} color="text-slate-600" />
            </div>
          </div>
        )}

        {/* Responsável Técnico */}
        {(r.responsavelNome || r.responsavelRegistro) && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={UserCheck} title="Responsável Técnico" />
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="Nome" value={r.responsavelNome} icon={UserCheck} color="text-indigo-500" />
              <InfoCard label="Registro Profissional" value={r.responsavelRegistro} icon={FileText} color="text-slate-600" />
            </div>
          </div>
        )}

        {/* Exames Médicos */}
        {(r.dataExameMedico || r.resultadoExame || (r.anexos && r.anexos.length > 0)) && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={Stethoscope} title="Exame Médico Ocupacional" />
            <div className="p-8 space-y-6">
              {(r.dataExameMedico || r.resultadoExame) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard label="Data do Exame" value={formatDate(r.dataExameMedico)} icon={Calendar} color="text-slate-600" />
                  <InfoCard label="Resultado" value={r.resultadoExame} icon={Stethoscope} color="text-blue-500" />
                </div>
              )}
              {r.anexos && r.anexos.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Anexos</p>
                  <ul className="space-y-2">
                    {r.anexos.map((anexo) => (
                      <li key={anexo.id} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                        <span className="text-sm font-medium text-slate-600 truncate max-w-[300px]">
                          {anexo.nome}
                        </span>
                        <button
                          type="button"
                          onClick={() => uploadService.visualizar(anexo.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all text-sm font-bold"
                        >
                          <Download size={16} />
                          Visualizar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <SectionHeader icon={Info} title="Observações" />
          <div className="p-8">
            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-600">
                <FileText size={24} />
              </div>
              <p className="text-sm font-medium text-slate-700 whitespace-pre-line">
                {r.observacoes || 'Nenhuma observação cadastrada'}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <SectionHeader icon={CheckCircle} title="Status" />
          <div className="p-8">
            <div className="flex items-center gap-3">
              {r.ativo ? (
                <CheckCircle size={24} className="text-emerald-500" />
              ) : (
                <XCircle size={24} className="text-slate-400" />
              )}
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                r.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {r.ativo ? 'Ativo' : 'Encerrado'}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(`/trabalhadores/${id}/historico-ppp/${r._id}/editar`)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Edit size={20} />
            Editar PPP
          </button>
          <button
            onClick={handleDeletar}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all active:scale-95"
          >
            <Trash2 size={20} />
            Excluir
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesHistoricoPPP;
