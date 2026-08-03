import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.js';
import { DocumentTitle } from '../hooks/useDocumentTitle.js';
import {
  alertaService,
  IAlerta,
  IAlertaRegra,
  IAlertaResumo,
  TipoAlerta,
  NivelAlerta,
  StatusAlerta,
  obterDestinoAlerta,
} from '../services/alertaService.js';
import { Bell, BellOff, Check, Archive, RotateCcw, RefreshCw, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

const LIMIT = 20;

const TIPO_ROTULOS: Record<TipoAlerta, string> = {
  PICO_ACIDENTES: 'Pico de Acidentes',
  VACINA_VENCENDO: 'Vacinas Vencendo',
  NAO_CONFORMIDADE: 'Não Conformidade',
  MONITORAMENTO_CRITICO: 'Monitoramento Crítico',
};

const TIPO_CORES: Record<TipoAlerta, string> = {
  PICO_ACIDENTES: 'bg-red-50 text-red-700',
  VACINA_VENCENDO: 'bg-amber-50 text-amber-700',
  NAO_CONFORMIDADE: 'bg-orange-50 text-orange-700',
  MONITORAMENTO_CRITICO: 'bg-purple-50 text-purple-700',
};

const NIVEL_CORES: Record<NivelAlerta, string> = {
  alto: 'bg-red-100 text-red-700',
  medio: 'bg-amber-100 text-amber-700',
  baixo: 'bg-slate-100 text-slate-600',
};

const STATUS_ROTULOS: Record<StatusAlerta, string> = {
  ativa: 'Ativa',
  reagindo: 'Reagindo',
  lida: 'Lida',
  arquivada: 'Arquivada',
};

const REGRA_TIPO_OPCOES: TipoAlerta[] = ['PICO_ACIDENTES', 'VACINA_VENCENDO', 'NAO_CONFORMIDADE', 'MONITORAMENTO_CRITICO'];
const REGRA_PARAMETROS = ['quantidadeAcidentes', 'diasAntesVencimento', 'variacaoPercentual', 'periodoAcidentes'];
const REGRA_OPERADORES = ['>=', '>', '<', '<=', '=='];

const Alertas: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.perfil === 'admin';
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState<IAlerta[]>([]);
  const [resumo, setResumo] = useState<IAlertaResumo>({ totalAtivos: 0, novos: 0, alto: 0 });
  const [regras, setRegras] = useState<IAlertaRegra[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [executando, setExecutando] = useState(false);
  const [regrasModal, setRegrasModal] = useState(false);
  const [regraEdicao, setRegraEdicao] = useState<IAlertaRegra | null>(null);
  const [salvandoRegra, setSalvandoRegra] = useState(false);

  const carregarAlertas = useCallback(async (pageNumber: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page: pageNumber, limit: LIMIT };
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroStatus) params.status = filtroStatus;
      if (filtroNivel) params.nivel = filtroNivel;
      const data = await alertaService.listar(params);
      setAlertas(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(pageNumber);
    } catch {
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  }, [filtroTipo, filtroStatus, filtroNivel]);

  const carregarResumo = useCallback(async () => {
    try {
      const data = await alertaService.obterResumo();
      setResumo(data);
    } catch {
      // ignora erro no resumo
    }
  }, []);

  const carregarRegras = useCallback(async () => {
    try {
      const data = await alertaService.listarRegras();
      setRegras(data);
    } catch {
      // ignora erro de regras
    }
  }, []);

  useEffect(() => {
    carregarAlertas(1);
    carregarResumo();
  }, [carregarAlertas, carregarResumo]);

  const handleStatus = async (id: string, acao: 'lido' | 'arquivar') => {
    try {
      if (acao === 'lido') {
        await alertaService.marcarLido(id);
      } else {
        await alertaService.arquivar(id);
      }
      toast.success('Alerta atualizado');
      carregarAlertas(page);
      carregarResumo();
    } catch {
      toast.error('Erro ao atualizar alerta');
    }
  };

  const handleExecutar = async () => {
    setExecutando(true);
    try {
      await alertaService.executarAgora();
      toast.success('Avaliação de alertas executada');
      carregarAlertas(1);
      carregarResumo();
    } catch {
      toast.error('Erro ao executar avaliação');
    } finally {
      setExecutando(false);
    }
  };

  const [formRegra, setFormRegra] = useState({
    nome: '',
    tipo: 'PICO_ACIDENTES' as TipoAlerta,
    nivel: 'medio' as NivelAlerta,
    parametro: 'quantidadeAcidentes',
    operador: '>=',
    valor: '3',
    janelaDias: '7',
    periodoAnteriorDias: '7',
    notificarEmail: true,
    descricao: '',
    ativo: true,
  });

  const abrirNovaRegra = () => {
    setRegraEdicao(null);
    setFormRegra({
      nome: '',
      tipo: 'PICO_ACIDENTES',
      nivel: 'medio',
      parametro: 'quantidadeAcidentes',
      operador: '>=',
      valor: '3',
      janelaDias: '7',
      periodoAnteriorDias: '7',
      notificarEmail: true,
      descricao: '',
      ativo: true,
    });
    setRegrasModal(true);
  };

  const abrirEdicaoRegra = (regra: IAlertaRegra) => {
    setRegraEdicao(regra);
    setFormRegra({
      nome: regra.nome,
      tipo: regra.tipo,
      nivel: regra.nivel,
      parametro: regra.condicao.parametro,
      operador: regra.condicao.operador,
      valor: String(regra.condicao.valor),
      janelaDias: String(regra.janelaDias),
      periodoAnteriorDias: String(regra.periodoAnteriorDias),
      notificarEmail: regra.notificarEmail,
      descricao: regra.descricao || '',
      ativo: regra.ativo,
    });
    setRegrasModal(true);
  };

  const salvarRegra = async () => {
    if (!formRegra.nome.trim()) {
      toast.error('Informe o nome da regra');
      return;
    }
    setSalvandoRegra(true);
    try {
      const payload: any = {
        nome: formRegra.nome.trim(),
        tipo: formRegra.tipo,
        nivel: formRegra.nivel,
        condicao: {
          parametro: formRegra.parametro,
          operador: formRegra.operador,
          valor: Number(formRegra.valor),
        },
        janelaDias: Number(formRegra.janelaDias) || 7,
        periodoAnteriorDias: Number(formRegra.periodoAnteriorDias) || 7,
        notificarEmail: formRegra.notificarEmail,
        descricao: formRegra.descricao.trim() || undefined,
        ativo: formRegra.ativo,
      };
      if (regraEdicao) {
        await alertaService.atualizarRegra(regraEdicao._id, payload);
        toast.success('Regra atualizada');
      } else {
        await alertaService.criarRegra(payload);
        toast.success('Regra criada');
      }
      setRegrasModal(false);
      carregarRegras();
    } catch {
      toast.error('Erro ao salvar regra');
    } finally {
      setSalvandoRegra(false);
    }
  };

  const desativarRegra = async (regra: IAlertaRegra) => {
    try {
      await alertaService.atualizarRegra(regra._id, { ativo: !regra.ativo });
      toast.success(regra.ativo ? 'Regra desativada' : 'Regra ativada');
      carregarRegras();
    } catch {
      toast.error('Erro ao alterar regra');
    }
  };

  const excluirRegra = async (regra: IAlertaRegra) => {
    if (window.confirm(`Desativar definitivamente a regra "${regra.nome}"?`)) {
      try {
        await alertaService.deletarRegra(regra._id);
        toast.success('Regra desativada');
        carregarRegras();
      } catch {
        toast.error('Erro ao desativar regra');
      }
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          Página {page} de {totalPages} • {total} alerta(s)
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => carregarAlertas(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 hover:bg-slate-50"
          >
            Anterior
          </button>
          <button
            onClick={() => carregarAlertas(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 hover:bg-slate-50"
          >
            Próxima
          </button>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <DocumentTitle title="Alertas e Notificações" />
      <div className="p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Bell className="text-indigo-600" size={32} />
              Alertas e Notificações
            </h1>
            <p className="text-slate-500 mt-1">
              Picos de acidentes, vacinas vencendo, não conformidades e monitoramento crítico.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExecutar}
              disabled={executando}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={executando ? 'animate-spin' : ''} size={18} />
              Executar Avaliação
            </button>
            {isAdmin && (
              <button
                onClick={() => { carregarRegras(); abrirNovaRegra(); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus size={18} />
                Nova Regra
              </button>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 font-medium">Alertas Ativos</p>
                <h3 className="text-4xl font-black mt-1">{resumo.totalAtivos}</h3>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl"><Bell size={24} /></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium">Novos (24h)</p>
                <h3 className="text-4xl font-black text-slate-900 mt-1">{resumo.novos}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><BellOff size={24} /></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium">Prioridade Alta</p>
                <h3 className="text-4xl font-black text-slate-900 mt-1">{resumo.alto}</h3>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Bell size={24} /></div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-semibold text-slate-500 uppercase">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Todos</option>
              {REGRA_TIPO_OPCOES.map((t) => (
                <option key={t} value={t}>{TIPO_ROTULOS[t]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Todos</option>
              {(['ativa', 'reagindo', 'lida', 'arquivada'] as StatusAlerta[]).map((s) => (
                <option key={s} value={s}>{STATUS_ROTULOS[s]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-semibold text-slate-500 uppercase">Nível</label>
            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Todos</option>
              {(['alto', 'medio', 'baixo'] as NivelAlerta[]).map((n) => (
                <option key={n} value={n}>{n.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Alertas</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase">{total} registro(s)</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {alertas.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-lg font-semibold">Nenhum alerta encontrado</p>
                    <p className="text-sm mt-1">Ajuste os filtros ou execute a avaliação.</p>
                  </div>
                )}
                {alertas.map((alerta) => (
                  <div key={alerta._id} className="px-8 py-5 flex flex-col md:flex-row md:items-center gap-4">
                    <button
                      onClick={() => navigate(obterDestinoAlerta(alerta, user?.perfil))}
                      className="flex-1 min-w-0 text-left group"
                      title="Ir para os dados do alerta"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${TIPO_CORES[alerta.tipo]}`}>
                          {TIPO_ROTULOS[alerta.tipo]}
                        </span>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${NIVEL_CORES[alerta.nivel]}`}>
                          {alerta.nivel.toUpperCase()}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
                          {STATUS_ROTULOS[alerta.status]}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 mt-2 group-hover:text-indigo-600 transition">{alerta.titulo}</h4>
                      <p className="text-sm text-slate-500 mt-1">{alerta.descricao}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(alerta.dataAlerta).toLocaleString('pt-BR')}
                        {alerta.referencia?.entidade && ` • ${alerta.referencia.entidade}`}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                        Ver dados <ExternalLink size={12} />
                      </span>
                    </button>
                    {alerta.status !== 'arquivada' && (
                      <div className="flex gap-2">
                        {alerta.status !== 'lida' && (
                          <button
                            onClick={() => handleStatus(alerta._id, 'lido')}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                            title="Marcar como lido"
                          >
                            <Check size={16} />
                            Lido
                          </button>
                        )}
                        <button
                          onClick={() => handleStatus(alerta._id, 'arquivar')}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                          title="Arquivar"
                        >
                          <Archive size={16} />
                          Arquivar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {renderPagination()}
            </>
          )}
        </div>

        {/* Regras */}
        {isAdmin && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Regras de Alerta</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase">{regras.length} regra(s)</span>
          </div>
          <div className="divide-y divide-slate-100">
            {regras.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <p>Nenhuma regra cadastrada.</p>
              </div>
            )}
            {regras.map((regra) => (
              <div key={regra._id} className="px-8 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800">{regra.nome}</h4>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${TIPO_CORES[regra.tipo]}`}>
                      {TIPO_ROTULOS[regra.tipo]}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${regra.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {regra.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {regra.condicao.parametro} {regra.condicao.operador} {regra.condicao.valor} • janela {regra.janelaDias} dias
                    {regra.notificarEmail && ' • e-mail ativo'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => desativarRegra(regra)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                    title={regra.ativo ? 'Desativar' : 'Ativar'}
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() => abrirEdicaoRegra(regra)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => excluirRegra(regra)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Desativar definitivamente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Modal de Regra */}
      {regrasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setRegrasModal(false)} aria-hidden="true" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {regraEdicao ? 'Editar Regra' : 'Nova Regra'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Nome</label>
                <input
                  value={formRegra.nome}
                  onChange={(e) => setFormRegra({ ...formRegra, nome: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex.: Pico de acidentes"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Tipo</label>
                  <select
                    value={formRegra.tipo}
                    onChange={(e) => setFormRegra({ ...formRegra, tipo: e.target.value as TipoAlerta })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {REGRA_TIPO_OPCOES.map((t) => (
                      <option key={t} value={t}>{TIPO_ROTULOS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Nível</label>
                  <select
                    value={formRegra.nivel}
                    onChange={(e) => setFormRegra({ ...formRegra, nivel: e.target.value as NivelAlerta })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {(['alto', 'medio', 'baixo'] as NivelAlerta[]).map((n) => (
                      <option key={n} value={n}>{n.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Parâmetro</label>
                  <select
                    value={formRegra.parametro}
                    onChange={(e) => setFormRegra({ ...formRegra, parametro: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {REGRA_PARAMETROS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Operador</label>
                  <select
                    value={formRegra.operador}
                    onChange={(e) => setFormRegra({ ...formRegra, operador: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {REGRA_OPERADORES.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Valor</label>
                  <input
                    type="number"
                    value={formRegra.valor}
                    onChange={(e) => setFormRegra({ ...formRegra, valor: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Janela (dias)</label>
                  <input
                    type="number"
                    value={formRegra.janelaDias}
                    onChange={(e) => setFormRegra({ ...formRegra, janelaDias: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Período anterior (dias)</label>
                  <input
                    type="number"
                    value={formRegra.periodoAnteriorDias}
                    onChange={(e) => setFormRegra({ ...formRegra, periodoAnteriorDias: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Descrição</label>
                <textarea
                  value={formRegra.descricao}
                  onChange={(e) => setFormRegra({ ...formRegra, descricao: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formRegra.notificarEmail}
                    onChange={(e) => setFormRegra({ ...formRegra, notificarEmail: e.target.checked })}
                    className="rounded"
                  />
                  Notificar por e-mail
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formRegra.ativo}
                    onChange={(e) => setFormRegra({ ...formRegra, ativo: e.target.checked })}
                    className="rounded"
                  />
                  Ativa
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setRegrasModal(false)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarRegra}
                disabled={salvandoRegra}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {salvandoRegra ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Alertas;
