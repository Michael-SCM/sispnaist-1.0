import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useAcidenteStore } from '../../store/acidenteStore.js';
import { acidenteService } from '../../services/acidenteService.js';
import { IAcidente } from '../../types/index.js';
import { 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Download,
  ChevronRight,
  Clock,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaAcidentes: React.FC = () => {
  const navigate = useNavigate();
  const {
    acidentes,
    total,
    page,
    pages,
    isLoading,
    filtros,
    setAcidentes,
    setPaginacao,
    setIsLoading,
    setFiltros,
    clearFiltros,
    removerAcidente,
  } = useAcidenteStore();

  const [localFiltros, setLocalFiltros] = useState(filtros);
  const [localSearch, setLocalSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);


  // Carregar acidentes
  const carregarAcidentes = async (pageNumber: number = 1) => {
    try {
      setIsLoading(true);
      const data = await acidenteService.listar(pageNumber, 10, filtros);
      setAcidentes(data.acidentes);
      setPaginacao({
        total: data.paginacao.total,
        pages: data.paginacao.pages,
        page: pageNumber,
        limit: data.paginacao.limit,
      });
    } catch (error) {
      toast.error('Erro ao carregar acidentes');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar ao montar ou quando filtros mudam
  useEffect(() => {
    carregarAcidentes(1);
  }, [filtros]);

  // Aplicar filtros
  const handleAplicarFiltros = () => {
    setFiltros(localFiltros);
    setShowFilters(false);
  };

  // Limpar filtros
  const handleLimparFiltros = () => {
    setLocalFiltros({});
    clearFiltros();
  };

  // Deletar acidente
  const handleDeletar = async (e: React.MouseEvent, acidente: IAcidente) => {
    e.stopPropagation();
    if (!window.confirm(`Tem certeza que deseja deletar o acidente de ${new Date(acidente.dataAcidente).toLocaleDateString('pt-BR')}?`)) {
      return;
    }

    try {
      await acidenteService.deletar(acidente._id!);
      removerAcidente(acidente._id!);
      toast.success('Acidente deletado com sucesso');
    } catch (error) {
      toast.error('Erro ao deletar acidente');
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-200">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Acidentes de Trabalho</h1>
              <p className="text-slate-500 font-medium">Registro e monitoramento de ocorrências laborais</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${import.meta.env.VITE_API_URL}/api/export/acidentes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={18} />
              Exportar
            </a>
            <button
              onClick={() => navigate('/acidentes/novo')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-100 active:scale-95"
            >
              <Plus size={20} />
              Novo Acidente
            </button>
          </div>
        </div>

        {/* Search & Filters Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar acidentes..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Busca textual: filtra por descrição do acidente no backend
                  const valor = localSearch.trim();
                  const nextFiltros: typeof localFiltros = { ...localFiltros };
                  if (valor) {
                    nextFiltros.descricao = valor;
                  } else {
                    delete nextFiltros.descricao;
                  }
                  setLocalFiltros(nextFiltros);
                  setFiltros(nextFiltros);
                  setShowFilters(false);
                }
              }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${
              showFilters 
                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={18} />
            Filtros
            {Object.keys(filtros).length > 0 && (
              <span className="ml-1 w-5 h-5 bg-amber-600 text-white text-[10px] rounded-full flex items-center justify-center">
                {Object.keys(filtros).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Acidente</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                  value={localFiltros.tipoAcidente || ''}
                  onChange={(e) => setLocalFiltros({ ...localFiltros, tipoAcidente: e.target.value || undefined })}
                >
                  <option value="">Todos os tipos</option>
                  <option value="Típico">Típico</option>
                  <option value="Trajeto">Trajeto</option>
                  <option value="Doença Ocupacional">Doença Ocupacional</option>
                  <option value="Acidente com Material Biológico">Mat. Biológico</option>
                  <option value="Violência">Violência</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                  value={localFiltros.status || ''}
                  onChange={(e) => setLocalFiltros({ ...localFiltros, status: e.target.value || undefined })}
                >
                  <option value="">Todos os status</option>
                  <option value="Aberto">Aberto</option>
                  <option value="Em Análise">Em Análise</option>
                  <option value="Fechado">Fechado</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Data Inicial</label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                  value={localFiltros.dataInicio || ''}
                  onChange={(e) => setLocalFiltros({ ...localFiltros, dataInicio: e.target.value || undefined })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Data Final</label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                  value={localFiltros.dataFim || ''}
                  onChange={(e) => setLocalFiltros({ ...localFiltros, dataFim: e.target.value || undefined })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-50">
              <button 
                onClick={handleLimparFiltros}
                className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
              >
                Limpar
              </button>
              <button 
                onClick={handleAplicarFiltros}
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
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Identificação</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Tipo & Status</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Registro</th>
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
                ) : acidentes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      <AlertTriangle className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhum acidente encontrado</p>
                    </td>
                  </tr>
                ) : (
                  acidentes.map((acidente) => (
                    <tr 
                      key={acidente._id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/acidentes/${acidente._id}`)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block text-lg">
                              {new Date(acidente.dataAcidente).toLocaleDateString('pt-BR')}
                            </span>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-0.5 max-w-xs truncate">
                              <FileText size={14} />
                              <span>{acidente.descricao || 'Sem descrição'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-bold text-slate-600">{acidente.tipoAcidente}</span>
                          <span className={`inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            acidente.status === 'Aberto' ? 'bg-amber-100 text-amber-700' :
                            acidente.status === 'Em Análise' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {acidente.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Clock size={14} />
                          <span>{acidente.dataCriacao ? new Date(acidente.dataCriacao).toLocaleDateString('pt-BR') : '-'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/acidentes/${acidente._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, acidente)}
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
                Mostrando <span className="text-slate-900 font-bold">{acidentes.length}</span> de <span className="text-slate-900 font-bold">{total}</span> registros
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1 || isLoading}
                  onClick={() => carregarAcidentes(page - 1)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {/* Primeira página */}
                  {pages > 5 && (
                    <button
                      onClick={() => carregarAcidentes(1)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      1
                    </button>
                  )}
                  {/* Ellipse início */}
                  {pages > 7 && page > 3 && (
                    <span className="w-10 h-10 flex items-center justify-center text-slate-400">...</span>
                  )}
                  {/* Páginas centrais */}
                  {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
                    let pageNum: number;
                    if (pages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= pages - 3) {
                      pageNum = pages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    if (pageNum < 1 || pageNum > pages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => carregarAcidentes(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          page === pageNum
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-100'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {/* Ellipse fim */}
                  {pages > 7 && page < pages - 2 && (
                    <span className="w-10 h-10 flex items-center justify-center text-slate-400">...</span>
                  )}
                  {/* Última página */}
                  {pages > 5 && (
                    <button
                      onClick={() => carregarAcidentes(pages)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      {pages}
                    </button>
                  )}
                </div>
                <button
                  disabled={page === pages || isLoading}
                  onClick={() => carregarAcidentes(page + 1)}
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

export default ListaAcidentes;
