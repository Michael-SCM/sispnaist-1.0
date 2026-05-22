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
  Gavel,
  X
} from 'lucide-react';
import atosService, { AtoMunicipalInovacao } from '../../services/atosService';
import { MainLayout } from '../../layouts/MainLayout.js';
import toast from 'react-hot-toast';

const ListaAtos: React.FC = () => {
  const [atos, setAtos] = useState<AtoMunicipalInovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchCidade, setSearchCidade] = useState('');
  const [searchAno, setSearchAno] = useState<number | ''>('');

  const [atoSelecionado, setAtoSelecionado] = useState<AtoMunicipalInovacao | null>(null);

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
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <Gavel size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Atos Municipais</h1>
              <p className="text-slate-500 font-medium">Legislação e marcos regulatórios de inovação</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/atos-municipais/novo')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus size={20} />
            Novo Ato
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl">
          <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4 p-2">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Cidade</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchCidade}
                  onChange={(e) => setSearchCidade(e.target.value)}
                  placeholder="Pesquisar por cidade..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>
            </div>
            <div className="w-32">
              <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Ano</label>
              <input
                type="number"
                value={searchAno}
                onChange={(e) => setSearchAno(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 2024"
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-100 active:scale-95"
            >
              <Filter size={18} />
              Filtrar
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Número/Ano</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Localidade</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Ementa</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6 h-20 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : atos.length > 0 ? (
                  atos.map((ato) => (
                    <tr key={ato._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <FileText size={20} />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setAtoSelecionado(ato)}
                              className="font-bold text-slate-700 block text-lg hover:text-indigo-700 transition-colors text-left"
                              title="Ver detalhes do ato"
                            >
                              {ato.nr_ato}
                            </button>
                            <span className="text-xs font-black text-indigo-400 uppercase tracking-tighter">{ato.ano_ato}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-slate-700 font-bold block">{ato.nm_cidade}</span>
                        <span className="text-xs text-slate-400 font-medium uppercase">{ato.nm_estado}</span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-slate-500 max-w-sm line-clamp-2" title={ato.texto_ementa}>
                          {ato.texto_ementa || 'Sem ementa cadastrada.'}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ato.link_ato_legal && (
                            <a
                              href={ato.link_ato_legal}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}
                          <button
                            onClick={() => navigate(`/atos-municipais/editar/${ato._id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeletar(ato._id!)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">
                      Nenhum ato encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1 || loading}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    Anterior
                  </button>

                  {/* Numeração com rolagem horizontal (mobile portrait) */}
                  <div className="flex-1 overflow-x-auto">
                    <div className="inline-flex items-center gap-1 w-max whitespace-nowrap">
                      {/* Primeira página */}
                      {totalPages > 5 && (
                        <button
                          onClick={() => setPage(1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all flex-none"
                        >
                          1
                        </button>
                      )}

                      {/* Ellipse início */}
                      {totalPages > 7 && page > 3 && (
                        <span className="w-10 h-10 flex items-center justify-center text-slate-400 flex-none">
                          ...
                        </span>
                      )}

                      {/* Páginas centrais */}
                      {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                        let pageNum: number;
                        if (totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (page <= 4) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = page - 3 + i;
                        }
                        if (pageNum < 1 || pageNum > totalPages) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all flex-none ${
                              page === pageNum
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Ellipse fim */}
                      {totalPages > 7 && page < totalPages - 2 && (
                        <span className="w-10 h-10 flex items-center justify-center text-slate-400 flex-none">
                          ...
                        </span>
                      )}

                      {/* Última página */}
                      {totalPages > 5 && (
                        <button
                          onClick={() => setPage(totalPages)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all flex-none"
                        >
                          {totalPages}
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={page === totalPages || loading}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    Próximo
                  </button>
                </div>

                {/* Texto abaixo da numeração no mobile */}
                <p className="text-sm text-slate-500 font-medium md:order-none">
                  Página{" "}
                  <span className="text-slate-900 font-bold">{page}</span> de{" "}
                  <span className="text-slate-900 font-bold">{totalPages}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Ato */}
      {atoSelecionado && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Detalhes do Ato Municipal</h3>
                <p className="text-sm text-slate-500 font-medium">
                  Número: <span className="font-mono">{atoSelecionado.nr_ato}</span> • Ano: <span className="font-black">{atoSelecionado.ano_ato}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAtoSelecionado(null)}
                className="p-2 hover:bg-white rounded-xl transition-all active:scale-95 shadow-sm border border-transparent hover:border-slate-200"
                aria-label="Fechar detalhes"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Localidade</div>
                  <div className="mt-2 font-bold text-slate-900">{atoSelecionado.nm_cidade}</div>
                  <div className="text-sm text-slate-600 uppercase">{atoSelecionado.nm_estado}</div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Classificação</div>
                  <div className="mt-2 font-bold text-slate-900">{atoSelecionado.nm_tipo || '—'}</div>
                  <div className="text-sm text-slate-600">{atoSelecionado.nm_categoria || '—'}</div>
                  <div className="text-sm text-slate-600">{atoSelecionado.nm_classe_categoria || '—'}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Ementa</div>
                <div className="text-slate-700 whitespace-pre-wrap">
                  {atoSelecionado.texto_ementa || 'Sem ementa cadastrada.'}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Texto Legal</div>
                <div className="text-slate-700 whitespace-pre-wrap">
                  {atoSelecionado.texto_legal || 'Sem texto legal cadastrado.'}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                {atoSelecionado.link_ato_legal ? (
                  <a
                    href={atoSelecionado.link_ato_legal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
                  >
                    <ExternalLink size={18} />
                    Abrir link do ato
                  </a>
                ) : (
                  <div className="text-sm text-slate-500 font-medium">Sem link do ato cadastrado.</div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setAtoSelecionado(null);
                    navigate(`/atos-municipais/editar/${atoSelecionado._id}`);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-lg shadow-slate-100 active:scale-95"
                >
                  <Edit2 size={18} />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ListaAtos;
