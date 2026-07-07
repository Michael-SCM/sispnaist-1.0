import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { indicadorService } from '../../../services/indicadorService.js';
import type { IIndicador } from '../../../types/indicadores.js';
import { CATEGORIAS, UFS } from '../../../types/indicadores.js';
import { Plus, Edit, Trash2, BarChart3, Search, RefreshCw } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import toast from 'react-hot-toast';

const ListaIndicadores: React.FC = () => {
  const navigate = useNavigate();
  const [indicadores, setIndicadores] = useState<IIndicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroUf, setFiltroUf] = useState('');

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroNome) params.nome = filtroNome;
      if (filtroCategoria) params.categoria = filtroCategoria;
      if (filtroUf) params.uf = filtroUf;
      const data = await indicadorService.listar(params);
      setIndicadores(data.data);
    } catch (error) {
      toast.error('Erro ao carregar indicadores');
    } finally {
      setLoading(false);
    }
  }, [filtroNome, filtroCategoria, filtroUf]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') carregar();
  };

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o indicador "${nome}"?`)) {
      try {
        await indicadorService.deletar(id);
        toast.success('Indicador excluído com sucesso');
        carregar();
      } catch {
        toast.error('Erro ao excluir indicador');
      }
    }
  };

  const handleCalcularTodos = async () => {
    try {
      setCalculando(true);
      const resultado = await indicadorService.calcularTodos(filtroUf || undefined);
      const mapValores = new Map(resultado.data.map(r => [r._id, r]));
      setIndicadores(prev => prev.map(ind => {
        const calc = mapValores.get(ind._id);
        if (calc) {
          return { ...ind, valorCalculado: calc.valorCalculado, alcancouMeta: calc.alcancouMeta };
        }
        return ind;
      }));
      toast.success('Indicadores calculados com sucesso');
    } catch {
      toast.error('Erro ao calcular indicadores');
    } finally {
      setCalculando(false);
    }
  };

  const corMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  const categoriaLabel = (cat: string) => {
    const found = CATEGORIAS.find(c => c.value === cat);
    return found ? found.label : cat;
  };

  return (
    <MainLayout>
      <DocumentTitle title="Indicadores Customizáveis" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-2xl">
              <BarChart3 size={28} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Indicadores Customizáveis</h1>
              <p className="text-slate-500 font-medium">Gerencie indicadores personalizados para monitoramento</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleCalcularTodos} disabled={calculando}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold disabled:opacity-50">
              <RefreshCw size={18} className={calculando ? 'animate-spin' : ''} />
              {calculando ? 'Calculando...' : 'Calcular Todos'}
            </button>
            <button onClick={() => navigate('/admin/indicadores/novo')}
              className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 font-bold">
              <Plus size={20} />
              Novo Indicador
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Buscar por nome..." value={filtroNome}
                  onChange={e => setFiltroNome(e.target.value)} onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
              </div>
              <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                <option value="">Todas as categorias</option>
                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={filtroUf} onChange={e => setFiltroUf(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                <option value="">Todas as UFs</option>
                {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-10"></th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Periodicidade</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">UF</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Meta</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Atual</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ativo</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : indicadores.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <BarChart3 size={40} className="text-slate-300" />
                        <p className="text-slate-500 font-medium">Nenhum indicador encontrado</p>
                        <button onClick={() => navigate('/admin/indicadores/novo')}
                          className="text-purple-600 font-bold hover:underline">
                          Criar primeiro indicador
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  indicadores.map(ind => (
                    <tr key={ind._id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4 text-center text-xl">{ind.icone || '📊'}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">{ind.nome}</span>
                        {ind.descricao && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{ind.descricao}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold ${corMap[ind.cor] || 'bg-slate-50 text-slate-600'}`}>
                          {categoriaLabel(ind.categoria)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                          {ind.tipo === 'percentual' ? '%' : '#'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm capitalize">{ind.periodicidade}</td>
                      <td className="px-6 py-4">
                        {ind.uf ? (
                          <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">{ind.uf}</span>
                        ) : (
                          <span className="text-slate-400 text-sm">Nacional</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        {ind.meta != null ? ind.meta : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {ind.valorCalculado != null ? (
                          <span className={`font-bold text-lg ${
                            ind.alcancouMeta === true ? 'text-green-600' :
                            ind.alcancouMeta === false ? 'text-red-500' :
                            'text-slate-700'
                          }`}>
                            {ind.tipo === 'percentual' ? `${ind.valorCalculado}%` : ind.valorCalculado}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex w-3 h-3 rounded-full ${ind.ativo ? 'bg-green-500' : 'bg-red-400'}`} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/admin/indicadores/editar/${ind._id}`)}
                            className="p-2 hover:bg-purple-50 rounded-xl text-purple-600 transition-all" title="Editar">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(ind._id, ind.nome)}
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
        </div>
      </div>
    </MainLayout>
  );
};

export default ListaIndicadores;
