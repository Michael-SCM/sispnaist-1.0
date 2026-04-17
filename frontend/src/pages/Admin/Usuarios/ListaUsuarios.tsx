import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../../store/userStore.js';
import { Users, Shield, UserX, UserCheck, Edit, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const ListaUsuarios: React.FC = () => {
  const { usuarios, loading, error, fetchUsers, updateUser, deleteUser } = useUserStore();
  const [filtros, setFiltros] = useState({ nome: '', email: '', perfil: '' });

  useEffect(() => {
    fetchUsers(1, 20, filtros);
  }, [fetchUsers, filtros]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (window.confirm(`Tem certeza que deseja ${currentStatus ? 'desativar' : 'ativar'} este usuário?`)) {
      await updateUser(id, { ativo: !currentStatus });
      fetchUsers(1, 20, filtros);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`ATENÇÃO: Deseja realmente EXCLUIR permanentemente o usuário ${nome}?`)) {
      await deleteUser(id);
    }
  };

  const getPerfilBadge = (perfil: string) => {
    const styles: any = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      saude: 'bg-blue-100 text-blue-700 border-blue-200',
      gestor: 'bg-green-100 text-green-700 border-green-200',
      trabalhador: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[perfil] || styles.trabalhador;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600">Administre as contas e permissões do sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={filtros.nome}
            onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={filtros.perfil}
          onChange={(e) => setFiltros({ ...filtros, perfil: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Todos os Perfis</option>
          <option value="admin">Administrador</option>
          <option value="saude">Saúde</option>
          <option value="gestor">Gestor</option>
          <option value="trabalhador">Trabalhador</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastro</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((user) => (
              <li key={user._id} className="table-row hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-bold">{user.nome.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPerfilBadge(user.perfil || '')}`}>
                    {user.perfil?.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.ativo ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.dataCriacao ? new Date(user.dataCriacao).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link to={`/admin/usuarios/editar/${user._id}`} className="text-blue-600 hover:text-blue-900 p-1">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => handleToggleStatus(user._id!, user.ativo || false)}
                      className={`${user.ativo ? 'text-orange-600' : 'text-green-600'} hover:opacity-75 p-1`}
                      title={user.ativo ? 'Desativar' : 'Ativar'}
                    >
                      {user.ativo ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id!, user.nome)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </li>
            ))}
          </tbody>
        </table>
        {usuarios.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Nenhum usuário encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaUsuarios;
