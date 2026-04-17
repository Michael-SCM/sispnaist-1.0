import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUnidadeStore } from '../../../store/unidadeStore.js';
import { useEmpresaStore } from '../../../store/empresaStore.js';
import { Plus, Edit, Trash2, MapPin, Filter } from 'lucide-react';

const ListaUnidades: React.FC = () => {
  const { unidades, loading, error, fetchUnidades, deleteUnidade } = useUnidadeStore();
  const { empresas, fetchEmpresas } = useEmpresaStore();
  const [empresaFiltro, setEmpresaFiltro] = useState('');

  useEffect(() => {
    fetchUnidades(1, 50, empresaFiltro ? { empresaId: empresaFiltro } : {});
    fetchEmpresas(1, 100);
  }, [fetchUnidades, fetchEmpresas, empresaFiltro]);

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a unidade "${nome}"?`)) {
      await deleteUnidade(id);
    }
  };

  if (loading && unidades.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Unidades / Setores</h1>
          <p className="text-gray-600">Gerencie as unidades físicas e departamentos</p>
        </div>
        <Link
          to="/admin/unidades/nova"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Unidade
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          value={empresaFiltro}
          onChange={(e) => setEmpresaFiltro(e.target.value)}
          className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Todas as Empresas</option>
          {empresas.map((e) => (
            <option key={e._id} value={e._id}>
              {e.razaoSocial}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unidades.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg shadow-sm">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Nenhuma unidade encontrada.</p>
          </div>
        ) : (
          unidades.map((unidade) => (
            <div key={unidade._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      to={`/admin/unidades/editar/${unidade._id}`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(unidade._id, unidade.nome)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">{unidade.nome}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span className="font-medium text-blue-600">
                      {(unidade.empresaId as any)?.razaoSocial || 'Empresa desconhecida'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 italic">
                    Gestor: {unidade.gestor || 'Não informado'}
                  </div>
                  <div className="mt-3 text-xs text-gray-400 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {unidade.endereco?.cidade ? `${unidade.endereco.cidade} - ${unidade.endereco.estado}` : 'Sem endereço'}
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className={`px-2 py-0.5 rounded-full ${unidade.ativa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {unidade.ativa ? 'Ativa' : 'Inativa'}
                </span>
                <span className="text-gray-400">ID: {unidade._id?.substring(0, 8)}...</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListaUnidades;
