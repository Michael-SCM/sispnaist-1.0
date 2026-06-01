import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import unidadeService from '../../../services/unidadeService.js';
import empresaService from '../../../services/empresaService.js';
import { Plus, Edit, Trash2, Home, MapPin, Building2, Search } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import toast from 'react-hot-toast';
import { IUnidade, IEmpresa } from '../../../types/index.js';

const LIMIT = 10;

const ListaUnidades: React.FC = () => {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState<IUnidade[]>([]);
  const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [searchNome, setSearchNome] = useState('');

  const carregar = useCallback(async (pageNumber: number = 1) => {
    try {
      setLoading(true);
      const filtros: any = {};
      if (searchNome.trim()) filtros.nome = searchNome.trim();
      const [data, empData] = await Promise.all([
        unidadeService.listar(pageNumber, LIMIT, filtros),
        empresaService.listar(1, 100)
      ]);
      setUnidades(data.unidades);
      setEmpresas(empData.empresas);
      setTotal(data.total);
      setPages(data.pages);
      setPage(pageNumber);
    } catch (error) {
      toast.error('Erro ao carregar unidades');
    } finally {
      setLoading(false);
    }
  }, [searchNome]);

  useEffect(() => {
    carregar(1);
  }, [carregar]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') carregar(1);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a unidade "${nome}"?`)) {
      try {
        await unidadeService.deletar(id);
        toast.success('Unidade excluída com sucesso');
        carregar(page);
      } catch (err) {
        toast.error('Erro ao excluir unidade');
      }
    }
  };

  const getEmpresaNome = (empresaId: any) => {
    if (!empresaId) return 'Empresa não encontrada';
    const id = typeof empresaId === 'object' && empresaId !== null ? empresaId._id : empresaId;
    const empresa = empresas.find(e => e._id === id);
    return empresa ? empresa.razaoSocial : 'Empresa não encontrada';
  };

  const renderPagination = () => {
    if (pages <= 1) return null;
    return (
      <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <button disabled={page === 1 || loading} onClick={() => carregar(page - 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all">
              Anterior
            </button>
            <div className="flex-1 overflow-x-auto">
              <div className="inline-flex items-center gap-1 w-max whitespace-nowrap">
                {pages > 5 && (
                  <button onClick={() => carregar(1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all flex-none">1</button>
                )}
                {pages > 7 && page > 3 && (
                  <span className="w-10 h-10 flex items-center justify-center text-slate-400 flex-none">...</span>
                )}
                {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
                  let pn: number;
                  if (pages <= 7) pn = i + 1;
                  else if (page <= 4) pn = i + 1;
                  else if (page >= pages - 3) pn = pages - 6 + i;
                  else pn = page - 3 + i;
                  if (pn < 1 || pn > pages) return null;
                  return (
                    <button key={pn} onClick={() => carregar(pn)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold flex-none transition-all ${
                        page === pn ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100'
                      }`}>{pn}</button>
                  );
                })}
                {pages > 7 && page < pages - 2 && (
                  <span className="w-10 h-10 flex items-center justify-center text-slate-400 flex-none">...</span>
                )}
                {pages > 5 && (
                  <button onClick={() => carregar(pages)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all flex-none">{pages}</button>
                )}
              </div>
            </div>
            <button disabled={page === pages || loading} onClick={() => carregar(page + 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all">
              Próximo
            </button>
          </div>
          <p className="text-sm text-slate-500 font-medium md:order-none">
            Mostrando <span className="text-slate-900 font-bold">{unidades.length}</span> de{" "}
            <span className="text-slate-900 font-bold">{total}</span> registros
          </p>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <Home size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Unidades</h1>
              <p className="text-slate-500 font-medium">Gestão de locais físicos e departamentos</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/unidades/nova')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95">
            <Plus size={20} /> Nova Unidade
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar por nome da unidade..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchNome} onChange={(e) => setSearchNome(e.target.value)} onKeyDown={handleKeyDown} />
          </div>
          <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 font-bold uppercase text-xs">Total</span>
            <span className="text-2xl font-black text-slate-900">{total}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Unidade / Empresa</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Localização</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse"><td colSpan={3} className="px-8 py-6 h-20 bg-slate-50/20"></td></tr>
                  ))
                ) : unidades.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400">
                      <Home className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhuma unidade encontrada</p>
                    </td>
                  </tr>
                ) : (
                  unidades.map((unidade) => (
                    <tr key={unidade._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Home size={20} /></div>
                          <div>
                            <span className="font-bold text-slate-700 block text-lg">{unidade.nome}</span>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-0.5">
                              <Building2 size={14} />
                              <span>{getEmpresaNome(unidade.empresaId)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                            <MapPin size={14} className="text-slate-400" />
                            {unidade.endereco?.cidade || 'N/A'} - {unidade.endereco?.estado || ''}
                          </div>
                          <span className="text-xs text-slate-400 pl-6">
                            {unidade.endereco?.logradouro ? `${unidade.endereco.logradouro}, ${unidade.endereco.numero}` : 'Endereço não informado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/admin/unidades/editar/${unidade._id}`)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit size={20} /></button>
                          <button onClick={() => handleDelete(unidade._id, unidade.nome)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={20} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </div>
      </div>
    </MainLayout>
  );
};

export default ListaUnidades;
