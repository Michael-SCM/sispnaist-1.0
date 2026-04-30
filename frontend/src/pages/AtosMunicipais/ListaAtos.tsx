import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import atosService, { AtoMunicipalInovacao } from '../../services/atosService';
import toast from 'react-hot-toast';

const ListaAtos: React.FC = () => {
  const [atos, setAtos] = useState<AtoMunicipalInovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchCidade, setSearchCidade] = useState('');
  const [searchAno, setSearchAno] = useState<number | ''>('');
  
  const navigate = useNavigate();

  const carregarAtos = async () => {
    setLoading(true);
    try {
      const response = await atosService.listar({ 
        page, 
        cidade: searchCidade, 
        ano: searchAno || undefined 
      });
      setAtos(response.items);
      setTotalPages(response.pages);
    } catch (error) {
      toast.error('Erro ao carregar atos municipais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAtos();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    carregarAtos();
  };

  const handleDeletar = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este ato?')) {
      try {
        await atosService.deletar(id);
        toast.success('Ato excluído com sucesso');
        carregarAtos();
      } catch (error) {
        toast.error('Erro ao excluir ato');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Atos Municipais de Inovação
          </h1>
          <p className="text-slate-500 mt-1">Gerencie a legislação de inovação do seu município.</p>
        </div>
        <button
          onClick={() => navigate('/atos-municipais/novo')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus size={20} />
          Novo Ato
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm font-medium text-slate-600 mb-1">Cidade</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchCidade}
                onChange={(e) => setSearchCidade(e.target.value)}
                placeholder="Pesquisar por cidade..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-slate-600 mb-1">Ano</label>
            <input
              type="number"
              value={searchAno}
              onChange={(e) => setSearchAno(e.target.value ? Number(e.target.value) : '')}
              placeholder="Ex: 2024"
              className="w-full px-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
          >
            <Filter size={18} />
            Filtrar
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Número/Ano</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Localidade</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Tipo/Categoria</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Ementa</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : atos.length > 0 ? (
                atos.map((ato) => (
                  <tr key={ato._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileText size={20} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-700 block">{ato.nr_ato}</span>
                          <span className="text-xs text-slate-400">{ato.ano_ato}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-medium">{ato.nm_cidade}</span>
                      <span className="text-xs text-slate-400 block">{ato.nm_estado}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">
                        {ato.nm_tipo || 'Geral'}
                      </span>
                      <span className="text-xs text-slate-400 block mt-1">{ato.nm_categoria}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 max-w-xs truncate" title={ato.texto_ementa}>
                        {ato.texto_ementa || 'Sem ementa cadastrada.'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {ato.link_ato_legal && (
                          <a
                            href={ato.link_ato_legal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => navigate(`/atos-municipais/editar/${ato._id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletar(ato._id!)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum ato encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaAtos;
