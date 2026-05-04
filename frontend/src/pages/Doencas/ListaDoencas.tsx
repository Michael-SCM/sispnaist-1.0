import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useDoencaStore } from '../../store/doencaStore.js';
import { doencaService } from '../../services/doencaService.js';
import { IDoenca } from '../../types/index.js';
import { 
  HeartPulse, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Stethoscope, 
  Activity,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaDoencas: React.FC = () => {
  const navigate = useNavigate();
  const {
    doencas,
    page,
    pages,
    total,
    filtros,
    isLoading,
    setDoencas,
    setPage,
    setFiltros,
    clearFiltros,
    setPaginacao,
    removerDoenca,
    setIsLoading,
  } = useDoencaStore();

  const [localFiltros, setLocalFiltros] = useState(filtros);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    carregarDoencas();
  }, [page, filtros]);

  const carregarDoencas = async () => {
    try {
      setIsLoading(true);
      const resultado = await doencaService.listar(page, 10, filtros);
      setDoencas(resultado.dados);
      setPaginacao(resultado.paginacao.page, resultado.paginacao.limit, resultado.paginacao.total, resultado.paginacao.pages);
    } catch (error) {
      toast.error('Erro ao carregar doenças');
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setPage(1);
    setFiltros(localFiltros);
    setShowFilters(false);
  };

  const limparFiltrosLocais = () => {
    setLocalFiltros({});
    clearFiltros();
  };

  const handleDeletar = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja deletar esta doença?')) {
      try {
        await doencaService.deletar(id);
        removerDoenca(id);
        toast.success('Doença deletada com sucesso!');
      } catch (error) {
        toast.error('Erro ao deletar doença');
      }
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200">
              <HeartPulse size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doenças Ocupacionais</h1>
              <p className="text-slate-500 font-medium">Gestão de diagnósticos e monitoramento de saúde</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/doencas/novo')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-100 active:scale-95"
          >
            <Plus size={20} />
            Nova Doença
          </button>
        </div>

        {/* Search & Filters Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome da doença ou código..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              value={localFiltros.nomeDoenca || ''}
              onChange={(e) => setLocalFiltros({ ...localFiltros, nomeDoenca: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${
              showFilters 
                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={18} />
            Filtros
            {Object.keys(filtros).length > 0 && (
              <span className="ml-1 w-5 h-5 bg-rose-600 text-white text-[10px] rounded-full flex items-center justify-center">
                {Object.keys(filtros).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-rose-600"
                  value={localFiltros.ativo !== undefined ? localFiltros.ativo.toString() : ''}
                  onChange={(e) => setLocalFiltros({
                    ...localFiltros,
                    ativo: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                >
                  <option value="">Todos os Status</option>
                  <option value="true">Ativas</option>
                  <option value="false">Inativas</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-50">
              <button 
                onClick={limparFiltrosLocais}
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
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Doença / CID</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Trabalhador</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Data Início</th>
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
                ) : doencas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      <Activity className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhuma doença registrada</p>
                    </td>
                  </tr>
                ) : (
                  doencas.map((d) => (
                    <tr 
                      key={d._id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/doencas/${d._id}/editar`)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                            <Stethoscope size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block">{d.nomeDoenca}</span>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                              CID: {d.codigoDoenca || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-600">{(d.trabalhadorId as any)?.nome || 'Não informado'}</span>
                          <span className="text-[10px] font-mono text-slate-400">{(d.trabalhadorId as any)?.cpf || '-'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-600">
                            {new Date(d.dataInicio).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/doencas/${d._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, d._id)}
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
                Mostrando <span className="text-slate-900 font-bold">{doencas.length}</span> de <span className="text-slate-900 font-bold">{total}</span> registros
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1 || isLoading}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
                    const pageNum = Math.max(1, page - 2) + i;
                    if (pageNum > pages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          page === pageNum 
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' 
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={page === pages || isLoading}
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

export default ListaDoencas;
