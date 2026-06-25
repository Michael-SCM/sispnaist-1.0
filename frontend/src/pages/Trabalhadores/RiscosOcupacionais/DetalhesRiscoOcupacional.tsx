import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { ITrabalhadorRiscoOcupacional } from '../../../types/index.js';
import {
  Shield,
  ArrowLeft,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DetalhesRiscoOcupacional: React.FC = () => {
  const { id, riscoId } = useParams<{ id: string; riscoId: string }>();
  const navigate = useNavigate();
  const [risco, setRisco] = useState<ITrabalhadorRiscoOcupacional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && riscoId) carregarRisco();
  }, [id, riscoId]);

  const carregarRisco = async () => {
    try {
      setIsLoading(true);
      const lista = await submoduloTrabalhadorService.listarRiscosOcupacionais(id!);
      const item = lista.find((r: ITrabalhadorRiscoOcupacional) => r._id === riscoId);
      if (item) setRisco(item);
      else { toast.error('Risco não encontrado'); navigate(`/trabalhadores/${id}/riscos-ocupacionais`); }
    } catch {
      toast.error('Erro ao carregar risco');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (confirm('Tem certeza que deseja remover este risco?')) {
      try {
        await submoduloTrabalhadorService.deletarRiscoOcupacional(id!, riscoId!);
        toast.success('Risco removido!');
        navigate(`/trabalhadores/${id}/riscos-ocupacionais`);
      } catch {
        toast.error('Erro ao remover risco');
      }
    }
  };

  if (isLoading || !risco) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-amber-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  const intensidadeColor = (int?: string) => {
    if (int === 'alto') return 'text-red-600 bg-red-50';
    if (int === 'medio') return 'text-amber-600 bg-amber-50';
    if (int === 'baixo') return 'text-emerald-600 bg-emerald-50';
    return 'text-slate-400 bg-slate-50';
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/trabalhadores/${id}/riscos-ocupacionais`)} className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detalhes do Risco</h1>
              <p className="text-slate-500 font-medium">{risco.categoria} — {risco.tipoRisco}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/trabalhadores/${id}/riscos-ocupacionais/${riscoId}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl transition-all active:scale-95">
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
            <Shield size={20} className="text-amber-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações do Risco</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Categoria</span>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black uppercase w-fit block mt-0.5">{risco.categoria}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo de Risco</span>
              <span className="font-semibold text-slate-700 block">{risco.tipoRisco}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Intensidade</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-widest mt-1 ${intensidadeColor(risco.intensidade)}`}>
                {risco.intensidade || 'Não informado'}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Presente</span>
              <span className="font-semibold text-slate-700 block">{risco.presente ? 'Sim' : 'Não'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Frequência</span>
              <span className="font-semibold text-slate-700 block">{risco.frequenciaExposicao || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Duração</span>
              <span className="font-semibold text-slate-700 block">{risco.duracaoExposicao || 'Não informado'}</span>
            </div>
            {risco.fonteGeradora && (
              <div className="md:col-span-2">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Fonte Geradora</span>
                <p className="text-slate-600 mt-1">{risco.fonteGeradora}</p>
              </div>
            )}
            {risco.observacao && (
              <div className="md:col-span-2">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Observação</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{risco.observacao}</p>
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">EPC</span>
              <span className="font-semibold text-slate-700 block">{risco.epcUtilizado ? `${risco.epcDescricao || 'Sim'}` : 'Não utilizado'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">EPI</span>
              <span className="font-semibold text-slate-700 block">{risco.epiUtilizado ? `${risco.epiDescricao || 'Sim'}` : 'Não utilizado'}</span>
            </div>
            {risco.caEpis && risco.caEpis.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">CA dos EPIs</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {risco.caEpis.map((ca, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono">{ca}</span>
                  ))}
                </div>
              </div>
            )}
            {risco.medidasControle && (
              <div className="md:col-span-2">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Medidas de Controle</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{risco.medidasControle}</p>
              </div>
            )}
            {risco.avaliador && (
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Avaliador</span>
                <span className="font-semibold text-slate-700 block">{risco.avaliador}</span>
              </div>
            )}
            {risco.dataAvaliacao && (
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data da Avaliação</span>
                <span className="font-semibold text-slate-700 block">{new Date(risco.dataAvaliacao).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesRiscoOcupacional;
