import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { ITrabalhadorOcorrenciaViolencia } from '../../../types/index.js';
import {
  ShieldAlert, ArrowLeft, Edit, Trash2, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DetalhesOcorrenciaViolencia: React.FC = () => {
  const { id, ocorrenciaId } = useParams<{ id: string; ocorrenciaId: string }>();
  const navigate = useNavigate();
  const [ocorrencia, setOcorrencia] = useState<ITrabalhadorOcorrenciaViolencia | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && ocorrenciaId) carregar();
  }, [id, ocorrenciaId]);

  const carregar = async () => {
    try {
      setIsLoading(true);
      const lista = await submoduloTrabalhadorService.listarOcorrenciasViolencia(id!);
      const item = lista.find((o: ITrabalhadorOcorrenciaViolencia) => o._id === ocorrenciaId);
      if (item) setOcorrencia(item);
      else { toast.error('Ocorrência não encontrada'); navigate(`/trabalhadores/${id}/ocorrencias-violencia`); }
    } catch {
      toast.error('Erro ao carregar ocorrência');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (confirm('Tem certeza que deseja remover esta ocorrência?')) {
      try {
        await submoduloTrabalhadorService.deletarOcorrenciaViolencia(id!, ocorrenciaId!);
        toast.success('Ocorrência removida!');
        navigate(`/trabalhadores/${id}/ocorrencias-violencia`);
      } catch {
        toast.error('Erro ao remover ocorrência');
      }
    }
  };

  if (isLoading || !ocorrencia) {
    return (
      <MainLayout>
        <DocumentTitle title="Detalhes da Ocorrência" />
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-red-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  const o = ocorrencia;

  return (
    <MainLayout>
      <DocumentTitle title="Detalhes da Ocorrência" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/trabalhadores/${id}/ocorrencias-violencia`)} className="p-3 hover:bg-red-50 rounded-2xl transition-all text-red-600 active:scale-90">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detalhes da Ocorrência</h1>
              <p className="text-slate-500 font-medium">{(o as any).isAssedio ? 'Assédio Moral/Sexual' : o.tipoViolencia}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/trabalhadores/${id}/ocorrencias-violencia/${ocorrenciaId}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-all active:scale-95">
              <Edit size={18} /> Editar
            </button>
            <button onClick={handleDeletar}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-all active:scale-95">
              <Trash2 size={18} /> Excluir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações da Ocorrência</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data da Ocorrência</span>
              <span className="font-semibold text-slate-700 block">{o.dataOcorrencia ? new Date(o.dataOcorrencia).toLocaleDateString('pt-BR') : '-'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Local do Fato</span>
              <span className="font-semibold text-slate-700 block">{o.localOcorrencia || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo</span>
              <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black uppercase mt-0.5">
                {(o as any).isAssedio ? 'Assédio Moral/Sexual' : o.tipoViolencia}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo de Violência</span>
              <span className="font-semibold text-slate-700 block">{o.tipoViolencia}</span>
            </div>

            {(o as any).isAssedio ? (
              <>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Frequência do Assédio</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{(o as any).frequenciaAssedio || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Autor do Assédio</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{o.tipoAutorViolencia || 'Não informado'}</p>
                </div>
                {(o as any).testemunhas && (
                  <div className="md:col-span-2">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Testemunhas</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{(o as any).testemunhas}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Violência Sexual</span>
                  <span className="font-semibold text-slate-700 block">{o.tipoViolenciaSexual || 'Não se aplica'}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Motivo da Violência</span>
                  <span className="font-semibold text-slate-700 block">{o.motivoViolencia || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Meio de Agressão</span>
                  <span className="font-semibold text-slate-700 block">{o.meioAgressao || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Pessoas Envolvidas</span>
                  <span className="font-semibold text-slate-700 block">{o.pessoasEnvolvidas || 'Não informado'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Conduta de Violência</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{o.condutaViolencia || 'Não informado'}</p>
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Descrição dos Fatos</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{o.descricaoOcorrencia || o.descricao || 'Nenhuma descrição fornecida'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Atendimento Realizado</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{(o as any).atendimentoRealizado || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Reincidência</span>
              <span className="font-semibold text-slate-700 block">{(o as any).reincidencia ? 'Sim' : 'Não'}</span>
            </div>
            {(o as any).boletimOcorrencia && (
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Boletim de Ocorrência</span>
                <span className="font-semibold text-slate-700 block">{(o as any).boletimOcorrencia}</span>
              </div>
            )}
            {(o as any).medidasTomadas && (
              <div className="md:col-span-2">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Medidas Tomadas</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{(o as any).medidasTomadas}</p>
              </div>
            )}
            <div className="md:col-span-2 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${o.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {o.ativo ? 'Ativo' : 'Encerrada'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesOcorrenciaViolencia;
