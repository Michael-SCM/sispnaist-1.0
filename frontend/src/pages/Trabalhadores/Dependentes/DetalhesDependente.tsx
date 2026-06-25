import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { ITrabalhadorDependente } from '../../../types/index.js';
import {
  Users2, ArrowLeft, Edit, Trash2, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DetalhesDependente: React.FC = () => {
  const { id, dependenteId } = useParams<{ id: string; dependenteId: string }>();
  const navigate = useNavigate();
  const [dependente, setDependente] = useState<ITrabalhadorDependente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && dependenteId) carregar();
  }, [id, dependenteId]);

  const carregar = async () => {
    try {
      setIsLoading(true);
      const lista = await submoduloTrabalhadorService.listarDependentes(id!);
      const item = lista.find((d: ITrabalhadorDependente) => d._id === dependenteId);
      if (item) setDependente(item);
      else { toast.error('Dependente não encontrado'); navigate(`/trabalhadores/${id}/dependentes`); }
    } catch {
      toast.error('Erro ao carregar dependente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (confirm('Tem certeza que deseja remover este dependente?')) {
      try {
        await submoduloTrabalhadorService.deletarDependente(id!, dependenteId!);
        toast.success('Dependente removido!');
        navigate(`/trabalhadores/${id}/dependentes`);
      } catch {
        toast.error('Erro ao remover dependente');
      }
    }
  };

  if (isLoading || !dependente) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-rose-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  const d = dependente;

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/trabalhadores/${id}/dependentes`)} className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-rose-600 active:scale-90">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detalhes do Dependente</h1>
              <p className="text-slate-500 font-medium">{d.nome}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/trabalhadores/${id}/dependentes/${dependenteId}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-all active:scale-95">
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
            <Users2 size={20} className="text-rose-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações do Dependente</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Nome Completo</span>
              <span className="font-semibold text-slate-700 text-lg block">{d.nome}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">CPF</span>
              <span className="font-semibold text-slate-700 font-mono block">{d.cpf || 'Não cadastrado'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Grau de Parentesco</span>
              <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black uppercase mt-0.5">{d.parentesco}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Data de Nascimento</span>
              <span className="font-semibold text-slate-700 block">{d.dataNascimento ? new Date(d.dataNascimento).toLocaleDateString('pt-BR') : '-'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Dependente de IR</span>
              <span className="font-semibold text-slate-700 block">{d.dependentIR ? 'Sim' : 'Não'}</span>
            </div>
            {d.temDeficiencia && (
              <>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo de Deficiência</span>
                  <span className="font-semibold text-slate-700 block text-sm">
                    {d.tipoDeficiencia === 'fisica' && 'Física'}
                    {d.tipoDeficiencia === 'cognitiva' && 'Cognitiva'}
                    {d.tipoDeficiencia === 'sensorial' && 'Sensorial'}
                    {d.tipoDeficiencia === 'multipla' && 'Múltipla'}
                    {d.tipoDeficiencia === 'outro' && 'Outro'}
                    {!d.tipoDeficiencia && 'Não especificado'}
                  </span>
                </div>
                {d.descricaoDeficiencia && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Descrição da Deficiência</span>
                    <span className="font-semibold text-slate-700 block text-sm">{d.descricaoDeficiencia}</span>
                  </div>
                )}
              </>
            )}
            <div className="md:col-span-2 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${d.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {d.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesDependente;
