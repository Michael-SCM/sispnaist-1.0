import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { ITrabalhadorReadaptacao } from '../../../types/index.js';
import {
  RefreshCcw, ArrowLeft, Edit, Trash2, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DetalhesReadaptacao: React.FC = () => {
  const { id, readaptacaoId } = useParams<{ id: string; readaptacaoId: string }>();
  const navigate = useNavigate();
  const [readaptacao, setReadaptacao] = useState<ITrabalhadorReadaptacao | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && readaptacaoId) carregar();
  }, [id, readaptacaoId]);

  const carregar = async () => {
    try {
      setIsLoading(true);
      const lista = await submoduloTrabalhadorService.listarReadaptacoes(id!);
      const item = lista.find((r: ITrabalhadorReadaptacao) => r._id === readaptacaoId);
      if (item) setReadaptacao(item);
      else { toast.error('Readaptação não encontrada'); navigate(`/trabalhadores/${id}/readaptacoes`); }
    } catch {
      toast.error('Erro ao carregar readaptação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (confirm('Tem certeza que deseja remover esta readaptação?')) {
      try {
        await submoduloTrabalhadorService.deletarReadaptacao(id!, readaptacaoId!);
        toast.success('Readaptação removida!');
        navigate(`/trabalhadores/${id}/readaptacoes`);
      } catch {
        toast.error('Erro ao remover readaptação');
      }
    }
  };

  if (isLoading || !readaptacao) {
    return (
      <MainLayout>
        <DocumentTitle title="Detalhes da Readaptação" />
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-purple-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  const r = readaptacao as any;

  return (
    <MainLayout>
      <DocumentTitle title="Detalhes da Readaptação" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/trabalhadores/${id}/readaptacoes`)} className="p-3 hover:bg-purple-50 rounded-2xl transition-all text-purple-600 active:scale-90">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detalhes da Readaptação</h1>
              <p className="text-slate-500 font-medium">{r.motivo}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/trabalhadores/${id}/readaptacoes/${readaptacaoId}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl transition-all active:scale-95">
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
            <RefreshCcw size={20} className="text-purple-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações da Readaptação</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data da Readaptação</span>
              <span className="font-semibold text-slate-700 block">{r.dataReadaptacao ? new Date(r.dataReadaptacao).toLocaleDateString('pt-BR') : '-'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Código CID</span>
              <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-black uppercase">{r.cid || 'Não informado'}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Motivo</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{r.motivo || 'Não informado'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Atividade Anterior</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{r.atividadeAnterior || 'Não informada'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Atividade Atual Recomendada</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{r.atividadeAtual || 'Não informada'}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Previsão de Retorno</span>
              <span className="font-semibold text-slate-700 block">{r.dataRetorno ? new Date(r.dataRetorno).toLocaleDateString('pt-BR') : 'Não definida'}</span>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${r.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {r.ativo ? 'Ativo' : 'Encerrada'}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Observações</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{r.observacoes || 'Nenhuma observação cadastrada'}</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesReadaptacao;
