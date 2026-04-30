import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEmpresaStore } from '../../../store/empresaStore.js';
import { Plus, Edit, Trash2, Building2, Search, Mail, Fingerprint } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import toast from 'react-hot-toast';

const ListaEmpresas: React.FC = () => {
  const { empresas, loading, error, fetchEmpresas, deleteEmpresa } = useEmpresaStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a empresa "${nome}"?`)) {
      try {
        await deleteEmpresa(id);
        toast.success('Empresa excluída com sucesso');
      } catch (err) {
        toast.error('Erro ao excluir empresa');
      }
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Empresas</h1>
              <p className="text-slate-500 font-medium">Gestão centralizada de organizações parceiras</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/empresas/nova')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={20} />
            Nova Empresa
          </button>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Identificação</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Contato</th>
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
                ) : empresas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400">
                      <Building2 className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhuma empresa encontrada</p>
                    </td>
                  </tr>
                ) : (
                  empresas.map((empresa) => (
                    <tr key={empresa._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block text-lg">{empresa.razaoSocial}</span>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-0.5">
                              <Fingerprint size={14} />
                              <span className="font-mono">{empresa.cnpj}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Mail size={14} className="text-slate-400" />
                            {empresa.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/empresas/editar/${empresa._id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(empresa._id, empresa.razaoSocial)}
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

export default ListaEmpresas;
