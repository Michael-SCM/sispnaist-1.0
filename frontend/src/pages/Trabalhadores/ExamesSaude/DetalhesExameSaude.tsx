import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { ITrabalhadorExameSaude } from '../../../types/index.js';
import {
  ArrowLeft, Edit, Stethoscope, Loader2, Calendar, User, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const tipoAsoLabel: Record<string, string> = {
  admissional: 'Admissional',
  periodico: 'Periódico',
  retorno: 'Retorno ao Trabalho',
  mudanca: 'Mudança de Função',
  demissional: 'Demissional',
};

const resultadoLabel: Record<string, { label: string; color: string }> = {
  apto: { label: 'Apto', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  inapto: { label: 'Inapto', color: 'text-red-600 bg-red-50 border-red-100' },
  apto_com_restricoes: { label: 'Apto com Restrições', color: 'text-amber-600 bg-amber-50 border-amber-100' },
};

export const DetalhesExameSaude: React.FC = () => {
  const { id, exameId } = useParams<{ id: string; exameId: string }>();
  const navigate = useNavigate();
  const [exame, setExame] = useState<ITrabalhadorExameSaude | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && exameId) carregarExame();
  }, [id, exameId]);

  const carregarExame = async () => {
    try {
      setIsLoading(true);
      const exameData = await submoduloTrabalhadorService.listarExamesSaude(id!);
      const encontrado = exameData.find((e: ITrabalhadorExameSaude) => e._id === exameId);
      if (encontrado) {
        setExame(encontrado);
      } else {
        toast.error('Exame não encontrado');
        navigate(`/trabalhadores/${id}/exames-saude`);
      }
    } catch {
      toast.error('Erro ao carregar exame');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={48} className="text-emerald-600 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!exame) return null;

  const resultadoInfo = resultadoLabel[exame.resultado] || { label: exame.resultado, color: 'text-slate-600 bg-slate-50 border-slate-100' };

  return (
    <MainLayout>
      <DocumentTitle title="Detalhes do Exame de Saúde" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/trabalhadores/${id}/exames-saude`)} className="p-3 hover:bg-emerald-50 rounded-2xl transition-all text-emerald-600 active:scale-90">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{tipoAsoLabel[exame.tipoAso] || exame.tipoAso}</h1>
              <p className="text-slate-500 font-medium">
                ASO {exame.numeroAso ? `#${exame.numeroAso}` : ''}
                {exame.dataAso && ` — ${new Date(exame.dataAso).toLocaleDateString('pt-BR')}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/trabalhadores/${id}/exames-saude/${exameId}/editar`)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            <Edit size={20} />
            Editar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resultado */}
          <div className="md:col-span-2 space-y-6">
            {/* Resultado do ASO */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Stethoscope size={20} className="text-emerald-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Resultado do ASO</h2>
              </div>
              <div className="p-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border mb-6 {resultadoInfo.color}">
                  <span className={`px-3 py-1 rounded-lg text-sm font-black uppercase ${resultadoInfo.color}`}>
                    {resultadoInfo.label}
                  </span>
                </div>
                {exame.observacaoMedica && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Observação Médica</p>
                    <p className="text-slate-700">{exame.observacaoMedica}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Exames Realizados */}
            {exame.examesRealizados && exame.examesRealizados.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Exames Realizados</h2>
                </div>
                <div className="p-8">
                  <div className="flex flex-wrap gap-2">
                    {exame.examesRealizados.map((ex, i) => (
                      <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Riscos Ocupacionais */}
            {exame.riscosOcupacionais && exame.riscosOcupacionais.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Riscos Ocupacionais Relacionados</h2>
                </div>
                <div className="p-8">
                  <div className="flex flex-wrap gap-2">
                    {exame.riscosOcupacionais.map((r, i) => (
                      <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-100">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Datas */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Calendar size={20} className="text-slate-500" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Datas</h2>
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data do Exame</p>
                  <p className="font-bold text-slate-700">{new Date(exame.dataAso).toLocaleDateString('pt-BR')}</p>
                </div>
                {exame.dataValidadeAso && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Validade</p>
                    <p className="font-bold text-slate-700">{new Date(exame.dataValidadeAso).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {exame.numeroAso && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Número ASO</p>
                    <p className="font-bold text-slate-700 font-mono">{exame.numeroAso}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Médico */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <User size={20} className="text-slate-500" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Médico Responsável</h2>
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</p>
                  <p className="font-bold text-slate-700">{exame.medicoNome}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">CRM</p>
                  <p className="font-bold text-slate-700">{exame.medicoCRM}{exame.medicoUFCrm ? ` - ${exame.medicoUFCrm}` : ''}</p>
                </div>
              </div>
            </div>

            {/* Médico PCMSO */}
            {(exame.medicoPcmsmoNome || exame.medicoPcmsmoCrm) && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <User size={20} className="text-slate-500" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Coordenador PCMSO</h2>
                </div>
                <div className="p-8 space-y-4">
                  {exame.medicoPcmsmoNome && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</p>
                      <p className="font-bold text-slate-700">{exame.medicoPcmsmoNome}</p>
                    </div>
                  )}
                  {exame.medicoPcmsmoCrm && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">CRM</p>
                      <p className="font-bold text-slate-700">{exame.medicoPcmsmoCrm}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Stethoscope size={20} className="text-slate-500" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Status</h2>
              </div>
              <div className="p-8">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                  exame.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {exame.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesExameSaude;
