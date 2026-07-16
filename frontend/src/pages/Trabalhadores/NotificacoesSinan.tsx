import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { DocumentTitle } from '../../hooks/useDocumentTitle.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { acidenteService } from '../../services/acidenteService.js';
import { doencaService } from '../../services/doencaService.js';
import { sinanService, DadosSinan, NotificacaoSinan } from '../../services/sinanService.js';
import { ITrabalhador } from '../../types/index.js';
import {
  ArrowLeft,
  Search,
  Loader2,
  Activity,
  Calendar,
  AlertTriangle,
  FileText,
  X,
  Hash,
  Building2,
  MapPin,
  User,
  Tag,
  Stethoscope,
  CheckCircle2,
  Download,
  HeartPulse,
  PlusCircle,
  Shield,
  Syringe,
} from 'lucide-react';
import toast from 'react-hot-toast';

const tipoNotificacaoIcon: Record<string, React.ReactNode> = {
  'Acidente de Trabalho': <Shield size={16} className="text-red-500" />,
  'Doença Relacionada ao Trabalho': <HeartPulse size={16} className="text-amber-500" />,
  'Acidente com Material Biológico': <Syringe size={16} className="text-purple-500" />,
  'Violência Interpessoal': <Shield size={16} className="text-orange-500" />,
};

const tipoNotificacaoBadge: Record<string, string> = {
  'Acidente de Trabalho': 'bg-red-50 text-red-700 border-red-100',
  'Doença Relacionada ao Trabalho': 'bg-amber-50 text-amber-700 border-amber-100',
  'Acidente com Material Biológico': 'bg-purple-50 text-purple-700 border-purple-100',
  'Violência Interpessoal': 'bg-orange-50 text-orange-700 border-orange-100',
};

const evolucaoBadge: Record<string, string> = {
  'Cura': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Incapacidade temporária': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Incapacidade permanente': 'bg-red-50 text-red-700 border-red-100',
  'Óbito': 'bg-slate-800 text-white border-slate-800',
  'Encaminhamento para acompanhamento psicológico': 'bg-blue-50 text-blue-700 border-blue-100',
};

export const NotificacoesSinan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [dadosSinan, setDadosSinan] = useState<DadosSinan | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [jaConsultou, setJaConsultou] = useState(false);
  const [notificacaoModal, setNotificacaoModal] = useState<NotificacaoSinan | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('');

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      try {
        const t = await trabalhadorService.obterPorId(id);
        setTrabalhador(t);
      } catch {
        toast.error('Erro ao carregar trabalhador');
      }
    };
    carregar();
  }, [id]);

  useEffect(() => {
    if (trabalhador?.cartaoSus && !jaConsultou && !consultando) {
      handleConsultar();
    }
  }, [trabalhador]);

  const getIdentificador = (): string => {
    if (trabalhador?.cpf) {
      return trabalhador.cpf.replace(/\D/g, '');
    }
    if (trabalhador?.cartaoSus) {
      return trabalhador.cartaoSus.replace(/\D/g, '');
    }
    return '';
  };

  const handleConsultar = async () => {
    const ident = getIdentificador();
    if (!ident || ident.length < 11) {
      toast.error('Trabalhador não possui CPF ou Cartão SUS válido para consulta');
      return;
    }

    setConsultando(true);
    setJaConsultou(true);
    try {
      const dados = await sinanService.buscarPorCpfOuCns(ident);
      setDadosSinan(dados);
      if (dados.notificacoes.length === 0) {
        toast('Nenhuma notificação registrada para este trabalhador no SINAN');
      } else {
        toast.success(`${dados.notificacoes.length} notificação(ões) encontrada(s) no SINAN`);
      }
    } catch (error: any) {
      setDadosSinan(null);
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('não encontrado') || msg.includes('nenhuma notificação') || msg.includes('404')) {
        toast.error('Nenhuma notificação encontrada para este CPF/CNS no SINAN');
      } else {
        toast.error(error.message || 'Sistema SINAN indisponível no momento');
      }
    } finally {
      setConsultando(false);
    }
  };

  const formatarData = (dataStr: string) => {
    const d = new Date(dataStr + 'T12:00:00Z');
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const tiposDisponiveis = dadosSinan
    ? [...new Set(dadosSinan.notificacoes.map((n) => n.tipoNotificacao))]
    : [];

  const notificacoesFiltradas = dadosSinan
    ? filtroTipo
      ? dadosSinan.notificacoes.filter((n) => n.tipoNotificacao === filtroTipo)
      : dadosSinan.notificacoes
    : [];

  const handleImportar = async (notificacao: NotificacaoSinan) => {
    const cpf = dadosSinan?.cpf || trabalhador?.cpf || '';
    if (!cpf) {
      toast.error('CPF do trabalhador não disponível para importação');
      return;
    }

    try {
      if (notificacao.tipoNotificacao === 'Acidente de Trabalho') {
        const result = await acidenteService.obterPorTrabalhador(id!, 1, 100);
        const existe = result.acidentes.some(
          (a) => a.dataAcidente === notificacao.dataOcorrencia
        );
        if (existe) {
          toast.error('Este acidente já está registrado no SISPNAIST');
          return;
        }
        navigate('/acidentes/novo', { state: { trabalhadorCpf: cpf, notificacao } });
      } else if (notificacao.tipoNotificacao === 'Doença Relacionada ao Trabalho') {
        const result = await doencaService.obterPorTrabalhador(id!, 1, 100);
        const existe = result.dados.some(
          (d) => d.dataInicio === notificacao.dataOcorrencia && d.codigoDoenca === notificacao.codigoAgravo
        );
        if (existe) {
          toast.error('Esta doença já está registrada no SISPNAIST');
          return;
        }
        navigate('/doencas/novo', { state: { trabalhadorCpf: cpf, notificacao } });
      } else {
        toast.error('Importação não disponível para este tipo de notificação');
      }
    } catch {
      toast.error('Erro ao verificar duplicidade no SISPNAIST');
    }
  };

  return (
    <MainLayout>
      <DocumentTitle title="Notificações (SINAN)" />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to={`/trabalhadores/${id}`}
            className="p-3 hover:bg-blue-50 rounded-2xl transition-all text-blue-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notificações (SINAN)</h1>
            <p className="text-slate-500 font-medium">
              Consulta de notificações de agravos no SINAN — Ministério da Saúde
            </p>
          </div>
        </div>

        {trabalhador && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
              <Activity size={20} className="text-blue-600" />
              <div>
                <p className="font-bold text-slate-700">{trabalhador.nome}</p>
                <p className="text-sm text-slate-400">
                  CPF: {trabalhador.cpf || 'Não informado'} | CNS: {trabalhador.cartaoSus || 'Não informado'}
                </p>
              </div>
            </div>

            <div className="p-8">
              <button
                type="button"
                onClick={handleConsultar}
                disabled={consultando || !getIdentificador()}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-100 active:scale-95"
              >
                {consultando ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Consultando a base do SINAN...</span>
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    <span>Consultar Notificações no SINAN</span>
                  </>
                )}
              </button>

              {consultando && (
                <p className="text-sm text-red-600 mt-3 animate-pulse">
                  O sistema do SINAN pode levar alguns segundos para responder na primeira consulta...
                </p>
              )}
            </div>
          </div>
        )}

        {dadosSinan && dadosSinan.notificacoes.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 flex-wrap">
              <Activity size={20} className="text-blue-600" />
              <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">
                Notificações Encontradas
              </h2>
              <span className="text-xs font-bold text-slate-400">
                ({notificacoesFiltradas.length} de {dadosSinan.notificacoes.length})
              </span>
              <div className="ml-auto flex gap-2">
                {tiposDisponiveis.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFiltroTipo(filtroTipo === tipo ? '' : tipo)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filtroTipo === tipo
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
                {filtroTipo && (
                  <button
                    type="button"
                    onClick={() => setFiltroTipo('')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Notificação</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Tipo</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Agravo</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Data Ocorrência</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Data Notificação</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">UF</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Evolução</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notificacoesFiltradas.map((notif, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-red-50/50 transition-colors cursor-pointer"
                      onClick={() => setNotificacaoModal(notif)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setNotificacaoModal(notif); } }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-slate-700">{notif.numeroNotificacao}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${tipoNotificacaoBadge[notif.tipoNotificacao] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                          {tipoNotificacaoIcon[notif.tipoNotificacao]}
                          {notif.tipoNotificacao}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700">{notif.codigoAgravo}</p>
                        <p className="text-xs text-slate-400 max-w-[200px] truncate" title={notif.nomeAgravo}>
                          {notif.nomeAgravo}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-600">{formatarData(notif.dataOcorrencia)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-600">{formatarData(notif.dataNotificacao)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-600">{notif.ufNotificacao}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${evolucaoBadge[notif.evolucao] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                          {notif.evolucao}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleImportar(notif); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all border border-emerald-200"
                        >
                          <PlusCircle size={14} />
                          Importar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {jaConsultou && !consultando && dadosSinan?.notificacoes.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Activity size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-2">Nenhuma notificação encontrada</h3>
              <p className="text-slate-400 max-w-md">
                Não foram encontradas notificações no SINAN para este trabalhador.
              </p>
            </div>
          </div>
        )}

        {!jaConsultou && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Activity size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-2">Consultar SINAN</h3>
              <p className="text-slate-400 max-w-md">
                Clique no botão acima para consultar as notificações de agravos deste trabalhador
                na base do SINAN (Sistema de Informação de Agravos de Notificação) do Ministério da Saúde.
              </p>
            </div>
          </div>
        )}
      </div>

      {notificacaoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setNotificacaoModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                  <Activity size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Detalhes da Notificação</h2>
                  <p className="text-sm text-slate-400 font-mono">{notificacaoModal.numeroNotificacao}</p>
                </div>
              </div>
              <button
                onClick={() => setNotificacaoModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-7">
              <div className="bg-slate-50/50 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Tipo e Agravo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Tag size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Tipo de Notificação</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border mt-1 ${tipoNotificacaoBadge[notificacaoModal.tipoNotificacao] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                        {notificacaoModal.tipoNotificacao}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hash size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Código do Agravo</p>
                      <p className="font-bold text-slate-700 text-lg">{notificacaoModal.codigoAgravo}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <FileText size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Nome do Agravo</p>
                    <p className="font-bold text-slate-700">{notificacaoModal.nomeAgravo}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Datas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Data da Ocorrência</p>
                      <p className="font-bold text-slate-700">{formatarData(notificacaoModal.dataOcorrencia)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Data da Notificação</p>
                      <p className="font-bold text-slate-700">{formatarData(notificacaoModal.dataNotificacao)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Dados do Trabalhador</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Sexo</p>
                      <p className="font-bold text-slate-700">{notificacaoModal.sexo === 'M' ? 'Masculino' : notificacaoModal.sexo === 'F' ? 'Feminino' : notificacaoModal.sexo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Raça/Cor</p>
                      <p className="font-bold text-slate-700">{notificacaoModal.racaCor}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Data de Nascimento</p>
                      <p className="font-bold text-slate-700">{formatarData(notificacaoModal.dataNascimento)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Escolaridade</p>
                      <p className="font-bold text-slate-700">{notificacaoModal.escolaridade}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Dados do Trabalho</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">CBO / Ocupação</p>
                      <p className="font-bold text-slate-700">{notificacaoModal.cboOcupacao}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">CNAE / Empresa</p>
                      <p className="font-bold text-slate-700">{notificacaoModal.cnaeEmpresa}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Tag size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Situação no Mercado de Trabalho</p>
                      <p className="font-bold text-slate-700">{notificacaoModal.situacaoMercadoTrabalho}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Unidade Notificadora</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Unidade de Saúde</p>
                      <p className="font-bold text-slate-700">{notificacaoModal.unidadeSaude}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Município / UF</p>
                      <p className="font-bold text-slate-700">{notificacaoModal.municipioNotificacao} / {notificacaoModal.ufNotificacao}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Evolução</h3>
                <div className="flex items-start gap-3">
                  <Stethoscope size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Evolução do Caso</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border mt-1 ${evolucaoBadge[notificacaoModal.evolucao] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                      {notificacaoModal.evolucao}
                    </span>
                  </div>
                </div>
                {notificacaoModal.catRelacionada && (
                  <div className="flex items-start gap-3 mt-4">
                    <FileText size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">CAT Relacionada</p>
                      <p className="font-bold text-slate-700">{notificacaoModal.catRelacionada}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex justify-end">
              <button
                onClick={() => setNotificacaoModal(null)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
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

export default NotificacoesSinan;
