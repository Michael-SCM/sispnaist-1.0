import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { parametroUfService, IParametroPorUF } from '../../../services/parametroUfService.js';
import { Plus, Edit, Trash2, Settings2, Search } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import toast from 'react-hot-toast';

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const LIMIT = 20;

const ListaParametrosUF: React.FC = () => {
  const navigate = useNavigate();
  const [parametros, setParametros] = useState<IParametroPorUF[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filtroUf, setFiltroUf] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroChave, setFiltroChave] = useState('');

  const carregar = useCallback(async (pageNumber: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page: pageNumber, limit: LIMIT };
      if (filtroUf) params.uf = filtroUf;
      if (filtroCategoria) params.categoria = filtroCategoria;
      if (filtroChave) params.chave = filtroChave;
      const data = await parametroUfService.listar(params);
      setParametros(data.data);
      setTotal(data.total);
      setPages(data.totalPages);
      setPage(pageNumber);
    } catch (error) {
      toast.error('Erro ao carregar parâmetros por UF');
    } finally {
      setLoading(false);
    }
  }, [filtroUf, filtroCategoria, filtroChave]);

  useEffect(() => {
    carregar(1);
  }, [carregar]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') carregar(1);
  };

  const handleDelete = async (id: string, chave: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o parâmetro "${chave}"?`)) {
      try {
        await parametroUfService.deletar(id);
        toast.success('Parâmetro excluído com sucesso');
        carregar(page);
      } catch {
        toast.error('Erro ao excluir parâmetro');
      }
    }
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
                        page === pn ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'
                      }`}>{pn}</button>
                  );
                })}
              </div>
            </div>
            <button disabled={page === pages || loading} onClick={() => carregar(page + 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all">
              Próximo
            </button>
          </div>
          <span className="text-sm text-slate-500 font-medium">{total} registro(s)</span>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <DocumentTitle title="Parâmetros por UF" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Settings2 size={28} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Parâmetros por UF</h1>
              <p className="text-slate-500 font-medium">Gerencie parâmetros configuráveis por estado</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/parametros-uf/novo')}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold">
            <Plus size={20} />
            Novo Parâmetro
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Buscar por chave..." value={filtroChave}
                  onChange={e => setFiltroChave(e.target.value)} onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <select value={filtroUf} onChange={e => setFiltroUf(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">Todas as UFs</option>
                {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              <input type="text" placeholder="Filtrar por categoria..." value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chave</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Valor</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">UF</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Ativo</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : parametros.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Settings2 size={40} className="text-slate-300" />
                        <p className="text-slate-500 font-medium">Nenhum parâmetro encontrado</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  parametros.map(p => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4"><span className="font-bold text-slate-800">{p.chave}</span></td>
                      <td className="px-6 py-4 hidden md:table-cell"><span className="text-slate-600 font-medium max-w-[200px] truncate block">{p.valor}</span></td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">{p.uf}</span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-slate-600">{p.categoria || '-'}</td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{p.tipo}</span>
                      </td>
                      <td className="px-6 py-4 text-center hidden md:table-cell">
                        <span className={`inline-flex w-3 h-3 rounded-full ${p.ativo ? 'bg-green-500' : 'bg-red-400'}`} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/admin/parametros-uf/editar/${p._id}`)}
                            className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-all" title="Editar">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(p._id, p.chave)}
                            className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-all" title="Excluir">
                            <Trash2 size={18} />
                          </button>
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

export default ListaParametrosUF;
