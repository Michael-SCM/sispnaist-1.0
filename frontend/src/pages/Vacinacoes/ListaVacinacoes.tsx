import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useVacinacaoStore } from '../../store/vacinacaoStore.js';
import { vacinacaoService } from '../../services/vacinacaoService.js';
import { 
  Syringe, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  UserCircle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { maskCPF, unmaskCPF } from '../../utils/cpfMask.js';


export const ListaVacinacoes: React.FC = () => {
  const navigate = useNavigate();
  const {
    vacinacoes,
    page,
    pages,
    total,
    filtros,
    isLoading,
    setVacinacoes,
    setPage,
    setFiltros,
    clearFiltros,
    setPaginacao,
    removerVacinacao,
    setIsLoading,
  } = useVacinacaoStore();

  const [localFiltros, setLocalFiltros] = useState(filtros);
  const [showFilters, setShowFilters] = useState(false);

  const carregarVacinacoes = async () => {
    setIsLoading(true);
    try {
      const resultado = await vacinacaoService.listar({
        page,
        limit: 10,
        vacina: filtros.vacina,
        trabalhadorId: filtros.trabalhadorId,
      });

      setVacinacoes(resultado.vacinacoes);
      setPaginacao(page, 10, resultado.total, resultado.pages);
    } catch (error) {
      toast.error('Erro ao carregar vacinações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarVacinacoes();
  }, [page, filtros]);

  const handleExcluir = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta vacinação?')) {
      try {
        await vacinacaoService.deletar(id);
        removerVacinacao(id);
        toast.success('Vacinação excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir vacinação');
      }
    }
  };

  const aplicarFiltros = () => {
    setPage(1);
    setFiltros(localFiltros);
    setShowFilters(false);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
              <Syringe size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vacinações</h1>
              <p className="text-slate-500 font-medium">Controle de imunização e doses preventivas</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/vacinacoes/novo')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Plus size={20} />
            Nova Vacinação
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome da vacina..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={localFiltros.vacina || ''}
              onChange={(e) => setLocalFiltros({ ...localFiltros, vacina: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${
              showFilters 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={18} />
            Filtros
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Trabalhador (CPF)</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                  placeholder="000.000.000-00"
                  value={maskCPF(localFiltros.trabalhadorId || '')}
                  onChange={(e) => setLocalFiltros({ ...localFiltros, trabalhadorId: unmaskCPF(e.target.value) })}
                />

              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-50">
              <button 
                onClick={() => { setLocalFiltros({}); clearFiltros(); }}
                className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
              >
                Limpar
              </button>
              <button 
                onClick={aplicarFiltros}
                className="px-8 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}

        {/* List Content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Vacina / Dose</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Trabalhador</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Data / Próxima</th>
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
                ) : vacinacoes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      <ShieldCheck className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhuma vacinação registrada</p>
                    </td>
                  </tr>
                ) : (
                  vacinacoes.map((v) => (
                    <tr 
                      key={v._id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/vacinacoes/${v._id}/editar`)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Syringe size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block">{v.vacina}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Lote: {v.lote || 'N/I'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-600">{(v.trabalhadorId as any)?.nome || 'Não informado'}</span>
                          <span className="text-[10px] font-mono text-slate-400">{(v.trabalhadorId as any)?.cpf || '-'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(v.dataVacinacao).toLocaleDateString('pt-BR')}
                          </div>
                          {v.proximoDose && (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                              <Calendar size={12} />
                              Reforço: {new Date(v.proximoDose).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/vacinacoes/${v._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleExcluir(e, v._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                          <div className="p-2 text-slate-300 group-hover:text-slate-900 transition-colors">
                            <ChevronRight size={20} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pages > 1 && (
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500 font-medium">
                Página <span className="text-slate-900 font-bold">{page}</span> de <span className="text-slate-900 font-bold">{pages}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Anterior
                </button>
                <button
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ListaVacinacoes;
