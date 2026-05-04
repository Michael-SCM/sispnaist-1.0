import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { useMaterialBiologicoStore } from '../../../store/materialBiologicoStore.js';
import { materialBiologicoService } from '../../../services/materialBiologicoService.js';
import { IMaterialBiologico } from '../../../types/index.js';
import { 
  Dna, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Download,
  ChevronRight,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaMaterialBiologico: React.FC = () => {
  const navigate = useNavigate();
  const {
    fichas,
    total,
    page,
    pages,
    isLoading,
    filtros,
    setFichas,
    setPaginacao,
    setIsLoading,
    setFiltros,
    clearFiltros,
  } = useMaterialBiologicoStore();

  const [localFiltros, setLocalFiltros] = useState(filtros);
  const [showFilters, setShowFilters] = useState(false);

  const carregarFichas = async (pageNumber: number = 1) => {
    try {
      setIsLoading(true);
      const data = await materialBiologicoService.listar(pageNumber, 10, filtros);
      setFichas(data.fichas);
      setPaginacao({
        total: data.paginacao.total,
        pages: data.paginacao.pages,
        page: pageNumber,
        limit: data.paginacao.limit,
      });
    } catch (error) {
      toast.error('Erro ao carregar fichas técnicas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarFichas(1);
  }, [filtros]);

  const handleAplicarFiltros = () => {
    setFiltros(localFiltros);
    setShowFilters(false);
  };

  const handleLimparFiltros = () => {
    setLocalFiltros({});
    clearFiltros();
  };

  const handleDeletar = async (e: React.MouseEvent, ficha: IMaterialBiologico) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja deletar esta ficha técnica?')) {
      return;
    }

    try {
      await materialBiologicoService.deletar(ficha._id!);
      toast.success('Ficha técnica deletada com sucesso');
      carregarFichas(page);
    } catch (error) {
      toast.error('Erro ao deletar ficha técnica');
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100">
              <Dna size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Material Biológico</h1>
              <p className="text-slate-500 font-medium">Acompanhamento de acidentes com risco biológico</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${import.meta.env.VITE_API_URL}/api/export/material-biologico`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={18} />
              Exportar
            </a>
            <button
              onClick={() => navigate('/acidentes/material-biologico/novo')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95"
            >
              <Plus size={20} />
              Nova Ficha Técnica
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por agente, trabalhador ou tipo de exposição..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Exposição</label>
                <input 
                  type="text"
                  placeholder="Ex: Percutânea, Mucosa..."
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                  value={localFiltros.tipoExposicao || ''}
                  onChange={(e) => setLocalFiltros({ ...localFiltros, tipoExposicao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Agente</label>
                <input 
                  type="text"
                  placeholder="Ex: Sangue, Líquido Amniótico..."
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                  value={localFiltros.agente || ''}
                  onChange={(e) => setLocalFiltros({ ...localFiltros, agente: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-50">
              <button onClick={handleLimparFiltros} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Limpar</button>
              <button onClick={handleAplicarFiltros} className="px-8 py-2.5 bg-emerald-900 text-white font-bold rounded-xl hover:bg-emerald-800 transition-all shadow-lg">Aplicar Filtros</button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Trabalhador & Acidente</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Exposição & Agente</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Reavaliação</th>
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
                ) : fichas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      <AlertCircle className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhuma ficha técnica encontrada</p>
                    </td>
                  </tr>
                ) : (
                  fichas.map((ficha) => (
                    <tr 
                      key={ficha._id} 
                      className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/acidentes/material-biologico/${ficha._id}/editar`)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <User size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block">
                              {(ficha.acidenteId as any)?.trabalhadorId?.nome || 'N/A'}
                            </span>
                            <span className="text-xs text-slate-400">
                              Acidente: {new Date((ficha.acidenteId as any)?.dataAcidente).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-600">{ficha.tipoExposicao}</span>
                          <span className="text-xs text-slate-400">{ficha.agente}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                          <Calendar size={14} className="text-emerald-500" />
                          <span>{ficha.dataReavaliacao ? new Date(ficha.dataReavaliacao).toLocaleDateString('pt-BR') : 'Não agendada'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/acidentes/material-biologico/${ficha._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, ficha)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                          <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
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
