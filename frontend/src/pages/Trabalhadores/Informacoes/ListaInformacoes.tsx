import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { informacaoService, ITrabalhadorInformacao } from '../../../services/informacaoService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhador } from '../../../types/index.js';
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Pill,
  AlertCircle,
  Heart,
  Activity,
  Wine,
  Cigarette,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaInformacoes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [informacoes, setInformacoes] = useState<ITrabalhadorInformacao[]>([]);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Vícios</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6 h-24 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : informacoes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      <Pill className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhuma informação registrada</p>
                    </td>
                  </tr>
                ) : (
                  informacoes.map((info) => (
                    <tr
                      key={info._id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/trabalhadores/${id}/informacoes/${info._id}/editar`)}
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
                              navigate(`/trabalhadores/${id}/informacoes/${info._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, info._id!)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
    </MainLayout>
  );
};

export default ListaInformacoes;
