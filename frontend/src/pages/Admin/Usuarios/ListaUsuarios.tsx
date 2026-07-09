import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../../services/userService.js';
import { User, Mail, Edit, Trash2, Search, Building2, Fingerprint } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import toast from 'react-hot-toast';
import { maskCPF, unmaskCPF } from '../../../utils/cpfMask.js';

interface Usuario {
  _id: string;
  nome: string;
  email: string;
  perfil: string;
  empresa?: any;
  unidade?: any;
  ativo: boolean;
}

const LIMIT = 10;

const ListaUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [cpfSearch, setCpfSearch] = useState('');

  const carregarUsuarios = useCallback(async (pageNumber: number = 1) => {
    try {
      setLoading(true);
      const filtros: any = {};
      if (search.trim()) filtros.nome = search.trim();
      if (cpfSearch.trim()) filtros.cpf = unmaskCPF(cpfSearch.trim());
      const data = await userService.listar(pageNumber, LIMIT, filtros);
      setUsuarios(data.usuarios);
      setTotal(data.total);
      setPages(data.pages);
      setPage(pageNumber);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    carregarUsuarios(1);
  }, [carregarUsuarios]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      carregarUsuarios(1);
    }
  };

  const handleDeletar = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) {
      try {
        await userService.deletar(id);
        toast.success('Usuário excluído com sucesso');
        carregarUsuarios(page);
      } catch (error) {
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const renderPagination = () => {
    if (pages <= 1) return null;

    return (
      <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => carregarUsuarios(page - 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Anterior
            </button>

            <div className="flex-1 overflow-x-auto">
              <div className="inline-flex items-center gap-1 w-max whitespace-nowrap">
                {pages > 5 && (
                  <button
                    onClick={() => carregarUsuarios(1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all flex-none"
                  >
                    1
                  </button>
                )}

                {pages > 7 && page > 3 && (
                  <span className="w-10 h-10 flex items-center justify-center text-slate-400 flex-none">...</span>
                )}

                {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
                  let pageNum: number;
                  if (pages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= pages - 3) {
                    pageNum = pages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  if (pageNum < 1 || pageNum > pages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => carregarUsuarios(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold flex-none transition-all ${
                        page === pageNum
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {pages > 7 && page < pages - 2 && (
                  <span className="w-10 h-10 flex items-center justify-center text-slate-400 flex-none">...</span>
                )}

                {pages > 5 && (
                  <button
                    onClick={() => carregarUsuarios(pages)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all flex-none"
                  >
                    {pages}
                  </button>
                )}
              </div>
            </div>

            <button
              disabled={page === pages || loading}
              onClick={() => carregarUsuarios(page + 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Próximo
            </button>
          </div>

          <p className="text-sm text-slate-500 font-medium md:order-none">
            Mostrando{" "}
            <span className="text-slate-900 font-bold">{usuarios.length}</span> de{" "}
            <span className="text-slate-900 font-bold">{total}</span> registros
          </p>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <DocumentTitle title="Usuários" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Usuários</h1>
              <p className="text-slate-500 font-medium">Controle de acesso e permissões do sistema</p>
            </div>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <div className="relative">
            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Filtrar por CPF..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all font-mono"
              value={maskCPF(cpfSearch)}
              onChange={(e) => setCpfSearch(unmaskCPF(e.target.value))}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 font-bold uppercase text-xs">Total</span>
            <span className="text-2xl font-black text-slate-900">{total}</span>
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Perfil</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Empresa / Unidade</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6 h-20 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      <User className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                      <p className="text-lg font-medium">Nenhum usuário cadastrado</p>
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                            {usuario.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block text-lg">{usuario.nome}</span>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-0.5">
                              <Mail size={14} />
                              <span>{usuario.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            usuario.perfil === 'admin' ? 'bg-red-100 text-red-700' :
                            usuario.perfil === 'gestor' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {usuario.perfil}
                          </span>
                          {!usuario.ativo && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded uppercase">Inativo</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                            <Building2 size={14} className="text-slate-400" />
                            {typeof usuario.empresa === 'object' && usuario.empresa !== null
                              ? usuario.empresa.razaoSocial
                              : (usuario.empresa || 'Sem Empresa')}
                          </div>
                          {usuario.unidade && (
                            <span className="text-xs text-slate-400 pl-5">
                              {typeof usuario.unidade === 'object' && usuario.unidade !== null
                                ? usuario.unidade.nome
                                : usuario.unidade}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/usuarios/editar/${usuario._id}`)}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDeletar(usuario._id, usuario.nome)}
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
          {renderPagination()}
        </div>
      </div>
    </MainLayout>
  );
};

export default ListaUsuarios;
