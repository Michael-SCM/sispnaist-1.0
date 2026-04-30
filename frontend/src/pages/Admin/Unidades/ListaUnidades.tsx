import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnidadeStore } from '../../../store/unidadeStore.js';
import { useEmpresaStore } from '../../../store/empresaStore.js';
import { Plus, Edit, Trash2, Home, MapPin, Building2, Search } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import toast from 'react-hot-toast';

const ListaUnidades: React.FC = () => {
  const navigate = useNavigate();
  const { unidades, loading, fetchUnidades, deleteUnidade } = useUnidadeStore();
  const { empresas, fetchEmpresas } = useEmpresaStore();

  useEffect(() => {
    fetchUnidades();
    fetchEmpresas();
  }, [fetchUnidades, fetchEmpresas]);

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a unidade "${nome}"?`)) {
      try {
        await deleteUnidade(id);
        toast.success('Unidade excluída com sucesso');
      } catch (err) {
        toast.error('Erro ao excluir unidade');
      }
    }
  };

  const getEmpresaNome = (empresaId: any) => {
    const id = typeof empresaId === 'object' ? empresaId._id : empresaId;
    const empresa = empresas.find(e => e._id === id);
    return empresa ? empresa.razaoSocial : 'Empresa não encontrada';
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
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
          <button
            onClick={() => navigate('/admin/unidades/nova')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus size={20} />
            Nova Unidade
          </button>
        </div>

        {/* List Content */}
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
                    <tr key={i} className="animate-pulse">
                      <td colSpan={3} className="px-8 py-6 h-20 bg-slate-50/20"></td>
                    </tr>
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
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Home size={20} />
                          </div>
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
                          <button
                            onClick={() => navigate(`/admin/unidades/editar/${unidade._id}`)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(unidade._id, unidade.nome)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

export default ListaUnidades;
