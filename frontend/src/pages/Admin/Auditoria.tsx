import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Clock, 
  User, 
  Terminal,
  Filter,
  Eye
} from 'lucide-react';
import { MainLayout } from '../../layouts/MainLayout';
import api from '../../services/api';
import { format } from 'date-fns';

interface AuditLog {
  _id: string;
  usuarioId: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  detalhes: any;
  ip: string;
  createdAt: string;
}

const Auditoria: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entidade, setEntidade] = useState('');

  useEffect(() => {
    carregarLogs();
  }, [page, entidade]);

  const carregarLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/audit/logs', {
        params: { page, limit: 15, entidade }
      });
      setLogs(response.data.data.items);
      setTotalPages(response.data.data.pages);
    } catch (error) {
      console.error('Erro ao carregar logs', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-2xl">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Auditoria do Sistema</h1>
            <p className="text-slate-500">Rastreabilidade completa de todas as operações realizadas.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Filtrar por entidade (ex: Acidente, Trabalhador)..."
              value={entidade}
              onChange={(e) => setEntidade(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
            <Filter size={18} />
            Filtros
          </button>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data/Hora</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usuário</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ação</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Entidade</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">IP</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4 h-16 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={14} />
                        <span className="text-sm font-medium">{format(new Date(log.createdAt), 'dd/MM HH:mm:ss')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-700">{log.usuarioId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        log.acao === 'CREATE' ? 'bg-green-100 text-green-700' :
                        log.acao === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                        log.acao === 'DELETE' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">{log.entidade}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{log.ip}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Auditoria;
