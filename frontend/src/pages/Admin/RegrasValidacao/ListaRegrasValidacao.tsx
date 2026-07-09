import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { regraValidacaoService, IRegraValidacao } from '../../../services/regraValidacaoService.js';
import { Plus, Edit, Trash2, Gavel, Search } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import toast from 'react-hot-toast';

const LIMIT = 20;

const ENTIDADE_ROTULOS: Record<string, string> = {
  trabalhador: 'Trabalhador',
  acidente: 'Acidente',
  doenca: 'Doença',
  vacinacao: 'Vacinação',
  empresa: 'Empresa',
  unidade: 'Unidade'
};

const TIPO_VALIDACAO_CORES: Record<string, string> = {
  obrigatorio: 'bg-red-50 text-red-700',
  regex: 'bg-purple-50 text-purple-700',
  min: 'bg-blue-50 text-blue-700',
  max: 'bg-blue-50 text-blue-700',
  enum: 'bg-green-50 text-green-700',
  lengthMin: 'bg-amber-50 text-amber-700',
  lengthMax: 'bg-amber-50 text-amber-700',
  personalizado: 'bg-slate-100 text-slate-700'
};

const ListaRegrasValidacao: React.FC = () => {
  const navigate = useNavigate();
  const [regras, setRegras] = useState<IRegraValidacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filtroEntidade, setFiltroEntidade] = useState('');
  const [filtroUf, setFiltroUf] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');

  const carregar = useCallback(async (pageNumber: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page: pageNumber, limit: LIMIT };
      if (filtroEntidade) params.entidade = filtroEntidade;
      if (filtroUf) params.uf = filtroUf;
      if (filtroAtivo) params.ativo = filtroAtivo;
      const data = await regraValidacaoService.listar(params);
      setRegras(data.data);
      setTotal(data.total);
      setPages(data.totalPages);
      setPage(pageNumber);
    } catch (error) {
      toast.error('Erro ao carregar regras de validação');
    } finally {
      setLoading(false);
    }
  }, [filtroEntidade, filtroUf, filtroAtivo]);

  useEffect(() => {
    carregar(1);
  }, [carregar]);

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a regra "${nome}"?`)) {
      try {
        await regraValidacaoService.deletar(id);
        toast.success('Regra excluída com sucesso');
        carregar(page);
      } catch {
        toast.error('Erro ao excluir regra');
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
      <DocumentTitle title="Regras de Validação" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Gavel size={28} className="text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Regras de Validação</h1>
              <p className="text-slate-500 font-medium">Gerencie regras de validação configuráveis por localidade</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/regras-validacao/nova')}
            className="flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-100 font-bold">
            <Plus size={20} />
            Nova Regra
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select value={filtroEntidade} onChange={e => setFiltroEntidade(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                <option value="">Todas as entidades</option>
                {Object.entries(ENTIDADE_ROTULOS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <input type="text" placeholder="Filtrar por UF (ex: SP)..." value={filtroUf}
                onChange={e => setFiltroUf(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              <select value={filtroAtivo} onChange={e => setFiltroAtivo(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                <option value="">Ativo/Inativo</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entidade</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Campo</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Localidade</th>
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
                ) : regras.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Gavel size={40} className="text-slate-300" />
                        <p className="text-slate-500 font-medium">Nenhuma regra encontrada</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  regras.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4"><span className="font-bold text-slate-800">{r.nome}</span></td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                          {ENTIDADE_ROTULOS[r.entidade] || r.entidade}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell"><span className="font-mono text-sm text-slate-600">{r.campo}</span></td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold ${TIPO_VALIDACAO_CORES[r.tipoValidacao] || 'bg-slate-100 text-slate-600'}`}>
                          {r.tipoValidacao}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {r.tipoLocalidade === 'nacional' ? (
                          <span className="text-slate-600">Nacional</span>
                        ) : r.tipoLocalidade === 'uf' ? (
                          <div className="flex flex-wrap gap-1">
                            {r.ufs.map((uf: string) => (
                              <span key={uf} className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold">
                                {uf}
                              </span>
                            ))}
                            {r.ufs.length === 0 && <span className="text-slate-400 text-xs">Nenhuma UF</span>}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-sm truncate max-w-[120px] block">
                            {r.municipios?.join(', ') || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center hidden md:table-cell">
                        <span className={`inline-flex w-3 h-3 rounded-full ${r.ativo ? 'bg-green-500' : 'bg-red-400'}`} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/admin/regras-validacao/editar/${r._id}`)}
                            className="p-2 hover:bg-amber-50 rounded-xl text-amber-600 transition-all" title="Editar">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(r._id, r.nome)}
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

export default ListaRegrasValidacao;
