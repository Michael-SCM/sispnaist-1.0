import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useTrabalhadorStore } from '../../store/trabalhadorStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { ITrabalhador } from '../../types/index.js';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Fingerprint, 
  Download,
  ChevronRight,
  Briefcase,
  Building,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { exportTrabalhadores } from '../../services/exportService.js';

export const ListaTrabalhadores: React.FC = () => {
  const navigate = useNavigate();
  const {
    trabalhadores,
    total,
    page,
    pages,
    isLoading,
    filtros,
    setTrabalhadores,
    setPaginacao,
    setIsLoading,
    setFiltros,
    clearFiltros,
    removerTrabalhador,
  } = useTrabalhadorStore();

  const [localFiltros, setLocalFiltros] = useState(filtros);
  const [showFilters, setShowFilters] = useState(false);

  const carregarTrabalhadores = async (pageNumber: number = 1) => {
    try {
      setIsLoading(true);
      const data = await trabalhadorService.listar(pageNumber, 10, filtros);
      setTrabalhadores(data.trabalhadores);
      setPaginacao({
        total: data.total,
        pages: data.pages,
        page: pageNumber,
        limit: 10,
      });
    } catch (error) {
      toast.error('Erro ao carregar trabalhadores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarTrabalhadores(1);
  }, [filtros]);

  const handleAplicarFiltros = () => {
    setFiltros(localFiltros);
    setShowFilters(false);
  };

  const handleLimparFiltros = () => {
    setLocalFiltros({});
    clearFiltros();
  };

  const handleDeletar = async (e: React.MouseEvent, trabalhador: ITrabalhador) => {
    e.stopPropagation();
    if (!window.confirm(`Tem certeza que deseja deletar o trabalhador ${trabalhador.nome}?`)) {
      return;
    }

    try {
      await trabalhadorService.deletar(trabalhador._id!);
      removerTrabalhador(trabalhador._id!);
      toast.success('Trabalhador deletado com sucesso');
    } catch (error) {
      toast.error('Erro ao deletar trabalhador');
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trabalhadores</h1>
              <p className="text-slate-500 font-medium">Gestão de funcionários e registros laborais</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  await exportTrabalhadores();
                } catch (e) {
                  toast.error('Erro ao exportar trabalhadores');
                  console.error(e);
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={18} />
              Exportar
            </button>
            <button
              onClick={() => navigate('/trabalhadores/novo')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <Plus size={20} />
              Novo Trabalhador
            </button>
          </div>
        </div>

        {/* Search & Filters Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou matrícula..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={localFiltros.nome || ''}
              onChange={(e) => setLocalFiltros({ ...localFiltros, nome: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAplicarFiltros()}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={18} />
            Filtros
            {Object.keys(filtros).length > 0 && (
              <span className="ml-1 w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center">
                {Object.keys(filtros).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">CPF</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                  value={localFiltros.cpf || ''}
                  onChange={(e) => setLocalFiltros({ ...localFiltros, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Matrícula</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  value={localFiltros.matricula || ''}
                  onChange={(e) => setLocalFiltros({ ...localFiltros, matricula: e.target.value })}
                  placeholder="Nº Matrícula"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Setor</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  value={localFiltros.setor || ''}
                  onChange={(e) => setLocalFiltros({ ...localFiltros, setor: e.target.value })}
                  placeholder="Ex: Almoxarifado"
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
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Trabalhador</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Vínculo & Setor</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Matrícula</th>
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
                ) : trabalhadores.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      <Users className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhum trabalhador encontrado</p>
                    </td>
                  </tr>
                ) : (
                  trabalhadores.map((t) => (
                    <tr 
                      key={t._id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/trabalhadores/${t._id}`)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            {t.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block text-lg">{t.nome}</span>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-0.5">
                              <Fingerprint size={14} />
                              <span className="font-mono">{t.cpf}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
                            <Briefcase size={14} className="text-slate-400" />
                            {t.trabalho?.cargo || 'Cargo não informado'}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Building size={14} />
                            {t.trabalho?.setor || 'Setor não informado'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-100">
                          {t.matricula || '-'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trabalhadores/${t._id}/editar`);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, t)}
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
                Mostrando <span className="text-slate-900 font-bold">{trabalhadores.length}</span> de <span className="text-slate-900 font-bold">{total}</span> registros
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1 || isLoading}
                  onClick={() => carregarTrabalhadores(page - 1)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => carregarTrabalhadores(i + 1)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        page === i + 1 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={page === pages || isLoading}
                  onClick={() => carregarTrabalhadores(page + 1)}
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

export default ListaTrabalhadores;
