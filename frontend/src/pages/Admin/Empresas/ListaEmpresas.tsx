import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEmpresaStore } from '../../../store/empresaStore.js';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

const ListaEmpresas: React.FC = () => {
  const { empresas, loading, error, fetchEmpresas, deleteEmpresa } = useEmpresaStore();

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a empresa "${nome}"?`)) {
      await deleteEmpresa(id);
    }
  };

  if (loading && empresas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600">Gerencie as empresas cadastradas no sistema</p>
        </div>
        <Link
          to="/admin/empresas/nova"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {empresas.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Nenhuma empresa cadastrada.</p>
            </li>
          ) : (
            empresas.map((empresa) => (
              <li key={empresa._id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-blue-600 truncate">
                        {empresa.razaoSocial}
                      </div>
                      <div className="text-sm text-gray-500">
                        {empresa.cnpj} | {empresa.email || 'Sem e-mail'}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/empresas/editar/${empresa._id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(empresa._id, empresa.razaoSocial)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ListaEmpresas;
