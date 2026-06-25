import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { ITrabalhadorAfastamento } from '../../../types/index.js';
import {
  Stethoscope, ArrowLeft, Edit, Trash2, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DetalhesAfastamento: React.FC = () => {
  const { id, afastamentoId } = useParams<{ id: string; afastamentoId: string }>();
  const navigate = useNavigate();
  const [afastamento, setAfastamento] = useState<ITrabalhadorAfastamento | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && afastamentoId) carregar();
  }, [id, afastamentoId]);

  const carregar = async () => {
    try {
      setIsLoading(true);
      const lista = await submoduloTrabalhadorService.listarAfastamentos(id!);
      const item = lista.find((a: ITrabalhadorAfastamento) => a._id === afastamentoId);
      if (item) setAfastamento(item);
      else { toast.error('Afastamento não encontrado'); navigate(`/trabalhadores/${id}/afastamentos`); }
    } catch {
      toast.error('Erro ao carregar afastamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (confirm('Tem certeza que deseja remover este afastamento?')) {
      try {
        await submoduloTrabalhadorService.deletarAfastamento(id!, afastamentoId!);
        toast.success('Afastamento removido!');
        navigate(`/trabalhadores/${id}/afastamentos`);
      } catch {
        toast.error('Erro ao remover afastamento');
      }
    }
  };

  if (isLoading || !afastamento) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-amber-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  const a = afastamento;

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/trabalhadores/${id}/afastamentos`)} className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detalhes do Afastamento</h1>
              <p className="text-slate-500 font-medium">{a.tipoAfastamento}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/trabalhadores/${id}/afastamentos/${afastamentoId}/editar`)}
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
            <Stethoscope size={20} className="text-amber-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações do Afastamento</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Início</span>
              <span className="font-semibold text-slate-700 block">{a.dataInicio ? new Date(a.dataInicio).toLocaleDateString('pt-BR') : '-'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Fim</span>
              <span className="font-semibold text-slate-700 block">{a.dataFim ? new Date(a.dataFim).toLocaleDateString('pt-BR') : 'Em aberto'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo de Afastamento</span>
              <span className="font-semibold text-slate-700 block">{a.tipoAfastamento}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Código CID</span>
              <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-black uppercase">{a.cid || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Perícia</span>
              <span className="font-semibold text-slate-700 block">{(a as any).dataPericia ? new Date((a as any).dataPericia).toLocaleDateString('pt-BR') : 'Não agendada'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Retorno</span>
              <span className="font-semibold text-slate-700 block">{a.dataRetorno ? new Date(a.dataRetorno).toLocaleDateString('pt-BR') : 'Não definida'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Desfecho</span>
              <span className="font-semibold text-slate-700 block">{(a as any).desfecho || 'Sem desfecho registrado'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tempo de Afastamento</span>
              <span className="font-semibold text-slate-700 block">{(a as any).tempoAfastamento || 'Não quantificado'}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Motivo do Afastamento</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{a.motivoAfastamento || 'Nenhum motivo informado'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Laudo Médico</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{a.laudoMedico || 'Nenhum laudo anexado'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Observações</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">{a.observacoes || 'Nenhuma observação cadastrada'}</p>
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${a.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {a.ativo ? 'Ativo' : 'Encerrado'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesAfastamento;
