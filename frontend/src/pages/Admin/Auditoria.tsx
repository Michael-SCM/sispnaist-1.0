import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Clock, 
  User, 
  Terminal,
  Filter,
  Eye,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCheck,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import api from '../../services/api.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface AuditLog {
  _id: string;
  usuarioId: {
    nome: string;
    login: string;
  } | string;
  acao: string;
  entidade: string;
  entidadeId: string;
  detalhes: any;
  ip: string;
  createdAt: string;
}

export const Auditoria: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entidade, setEntidade] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [acao, setAcao] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    carregarLogs();
  }, [page]);

  const carregarLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/audit/logs', {
        params: { 
          page, 
          limit: 15, 
          entidade: entidade || undefined,
          usuario: searchUser || undefined,
          acao: acao || undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined
        }
      });
      setLogs(response.data.data.items);
      setTotalPages(response.data.data.pages);
    } catch (error) {
      toast.error('Erro ao carregar logs de auditoria');
      console.error('Erro ao carregar logs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    carregarLogs();
  };

  const formatarUsuario = (usuario: any) => {
    if (typeof usuario === 'object' && usuario !== null) {
      return usuario.nome || usuario.login || 'Usuário';
    }
    return usuario || 'Sistema';
  };

  const getBadgeColor = (acao: string) => {
    switch (acao) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DELETE': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'LOGIN': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                  <Shield size={20} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-gradient">Auditoria do Sistema</h1>
              </div>
              <p className="text-slate-500 font-medium ml-1">Rastreamento global de atividades e segurança.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-4 py-2 bg-slate-50 rounded-xl flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" />
              <span className="text-sm font-bold text-slate-700">Logs Ativos</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl">
          <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4 p-2">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Módulo / Entidade</label>
              <div className="relative">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={entidade}
                  onChange={(e) => setEntidade(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium appearance-none"
                >
                  <option value="">Todas as entidades</option>
                  <option value="Vinculo">Vínculo</option>
                  <option value="Trabalhador">Trabalhador</option>
                  <option value="Acidente">Acidente</option>
                  <option value="Doenca">Doença</option>
                  <option value="Empresa">Empresa</option>
                  <option value="Unidade">Unidade</option>
                  <option value="User">Usuário</option>
                  <option value="Vacinacao">Vacinação</option>
                  <option value="Dependente">Dependente</option>
                  <option value="Afastamento">Afastamento</option>
                  <option value="OcorrenciaViolencia">Ocorrência Violência</option>
                  <option value="Readaptacao">Readaptação</option>
                  <option value="ProcessoTrabalho">Processo de Trabalho</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 min-w-[280px]">
              <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Usuário</label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Nome ou login do usuário..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Tipo de Ação</label>
              <select 
                value={acao}
                onChange={(e) => setAcao(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
              >
                <option value="">Todas as ações</option>
                <option value="CREATE">Criar</option>
                <option value="UPDATE">Atualizar</option>
                <option value="DELETE">Deletar</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Data Início</label>
              <input 
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Data Fim</label>
              <input 
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
              />
            </div>

            <button 
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-100 active:scale-95"
            >
              <Filter size={18} />
              Filtrar Logs
            </button>
          </form>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Data e Hora</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ação Realizada</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Módulo</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Endereço IP</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-6 h-20 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 text-slate-400 rounded-lg">
                            <Calendar size={14} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block text-sm">
                              {format(new Date(log.createdAt), 'dd/MM/yyyy')}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                              {format(new Date(log.createdAt), 'HH:mm:ss')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                            {formatarUsuario(log.usuarioId).substring(0, 2)}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{formatarUsuario(log.usuarioId)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getBadgeColor(log.acao)}`}>
                          {log.acao}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Terminal size={14} className="text-slate-300" />
                          <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">{log.entidade}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <code className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{log.ip || '0.0.0.0'}</code>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => {
                            setSelectedLog(log);
                            setShowModal(true);
                          }}
                          className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="max-w-xs mx-auto space-y-3">
                        <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto text-slate-300">
                          <Shield size={48} />
                        </div>
                        <p className="text-slate-500 font-bold">Nenhum log de auditoria encontrado.</p>
                        <p className="text-slate-400 text-sm font-medium">Tente ajustar seus filtros de busca.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1 || loading}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    Anterior
                  </button>

                  {/* Numeração com rolagem horizontal (mobile portrait) */}
                  <div className="flex-1 overflow-x-auto">
                    <div className="inline-flex items-center gap-1 w-max whitespace-nowrap">
                      {totalPages > 5 && (
                        <button
                          onClick={() => setPage(1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all flex-none"
                        >
                          1
                        </button>
                      )}

                      {totalPages > 7 && page > 3 && (
                        <span className="w-10 h-10 flex items-center justify-center text-slate-400 flex-none">
                          ...
                        </span>
                      )}

                      {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                        let pageNum: number;
                        if (totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (page <= 4) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = page - 3 + i;
                        }
                        if (pageNum < 1 || pageNum > totalPages) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all flex-none ${
                              page === pageNum
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-100'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {totalPages > 7 && page < totalPages - 2 && (
                        <span className="w-10 h-10 flex items-center justify-center text-slate-400 flex-none">
                          ...
                        </span>
                      )}

                      {totalPages > 5 && (
                        <button
                          onClick={() => setPage(totalPages)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all flex-none"
                        >
                          {totalPages}
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={page === totalPages || loading}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    Próximo
                  </button>
                </div>

                {/* Texto abaixo da numeração no mobile */}
                <p className="text-sm text-slate-500 font-medium md:order-none">
                  Página{" "}
                  <span className="text-slate-900 font-bold">{page}</span> de{" "}
                  <span className="text-slate-900 font-bold">{totalPages}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-4 flex flex-col max-h-[90vh]">
            {/* Header fixo */}
            <div className="p-4 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border flex-shrink-0 ${getBadgeColor(selectedLog.acao)}`}>
                  <Terminal size={20} className="sm:block hidden" />
                  <Terminal size={16} className="sm:hidden" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Detalhes da Ação</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">ID: {selectedLog.entidadeId}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white rounded-xl transition-all active:scale-90 shadow-sm border border-transparent hover:border-slate-200 flex-shrink-0"
              >
                <ArrowLeft className="rotate-90" size={20} />
              </button>
            </div>
            
            {/* Conteúdo com scroll */}
            <div className="overflow-y-auto flex-grow custom-scrollbar">
              <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                {/* Grid responsivo - 1 coluna mobile, 2 colunas tablet, 4 desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</span>
                    <p className="font-bold text-slate-700 break-words">{selectedLog.acao}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo</span>
                    <p className="font-bold text-slate-700 break-words">{selectedLog.entidade}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</span>
                    <p className="font-bold text-slate-700 break-words">{formatarUsuario(selectedLog.usuarioId)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IP</span>
                    <p className="font-mono text-xs sm:text-sm text-slate-500 break-all">{selectedLog.ip || 'Não registrado'}</p>
                  </div>
                </div>

                {/* Dados alterados com scroll horizontal */}
                <div className="space-y-2 sm:space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadados / Dados Alterados</span>
                  <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-6 overflow-hidden border border-slate-800">
                    <pre className="text-emerald-400 font-mono text-xs sm:text-sm overflow-auto max-h-[40vh] custom-scrollbar whitespace-pre-wrap break-words">
                      {selectedLog.detalhes ? JSON.stringify(selectedLog.detalhes, null, 2) : '// Nenhum detalhe adicional registrado.'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer fixo */}
            <div className="p-4 sm:p-6 bg-slate-50 flex justify-end border-t border-slate-100 flex-shrink-0">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-slate-900 text-white text-sm sm:text-base rounded-xl sm:rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Auditoria;
