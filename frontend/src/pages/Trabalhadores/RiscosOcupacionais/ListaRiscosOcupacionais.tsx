import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorRiscoOcupacional, ITrabalhador } from '../../../types/index.js';
import {
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaRiscosOcupacionais: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [riscos, setRiscos] = useState<ITrabalhadorRiscoOcupacional[]>([]);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (id) carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [t, r] = await Promise.all([
        trabalhadorService.obterPorId(id!),
        submoduloTrabalhadorService.listarRiscosOcupacionais(id!),
      ]);
      setTrabalhador(t);
      setRiscos(r);
    } catch {
      toast.error('Erro ao carregar riscos ocupacionais');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (e: React.MouseEvent, riscoId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este risco?')) {
      try {
        await submoduloTrabalhadorService.deletarRiscoOcupacional(id!, riscoId);
        setRiscos(prev => prev.filter(r => r._id !== riscoId));
        toast.success('Risco removido!');
      } catch {
        toast.error('Erro ao remover risco');
      }
    }
  };

  const intensidadeColor = (int?: string) => {
    if (int === 'alto') return 'text-red-600 bg-red-50';
    if (int === 'medio') return 'text-amber-600 bg-amber-50';
    if (int === 'baixo') return 'text-emerald-600 bg-emerald-50';
    return 'text-slate-400 bg-slate-50';
  };

  return (
    <MainLayout>
      <DocumentTitle title="Riscos Ocupacionais" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/trabalhadores/${id}`)}
              className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Riscos Ocupacionais</h1>
              {trabalhador && (
                <p className="text-slate-500 font-medium">
                  Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/trabalhadores/${id}/riscos-ocupacionais/novo`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-100 active:scale-95"
          >
            <Plus size={20} />
            Novo Risco
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Intensidade</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6 h-24 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : riscos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                      <Shield className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhum risco ocupacional registrado</p>
                    </td>
                  </tr>
                ) : (
                  riscos.map((risco) => (
                    <tr
                      key={risco._id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/trabalhadores/${id}/riscos-ocupacionais/${risco._id}`)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/trabalhadores/${id}/riscos-ocupacionais/${risco._id}`); } }}
                    >
                      <td className="px-8 py-6">
                        <span className="font-bold text-slate-700">{risco.categoria}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm text-slate-600">{risco.tipoRisco}</span>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${intensidadeColor(risco.intensidade)}`}>
                          {risco.intensidade || 'N/I'}
                        </span>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                          risco.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {risco.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/trabalhadores/${id}/riscos-ocupacionais/${risco._id}`); }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Visualizar"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/trabalhadores/${id}/riscos-ocupacionais/${risco._id}/editar`); }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => handleDeletar(e, risco._id!)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={20} />
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

export default ListaRiscosOcupacionais;
