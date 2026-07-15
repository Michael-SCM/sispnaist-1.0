import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { DocumentTitle } from '../../hooks/useDocumentTitle.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { sihService, DadosSih, Internacao } from '../../services/sihService.js';
import { cnesService, DadosCnes } from '../../services/cnesService.js';
import { submoduloTrabalhadorService } from '../../services/submoduloTrabalhadorService.js';
import { ITrabalhador, ITrabalhadorInternacao } from '../../types/index.js';
import { ModalSelecaoESocial } from '../../components/ModalSelecaoESocial.js';
import { filtrarUltimos30Dias } from '../../utils/filtrarUltimos30Dias.js';
import {
  ArrowLeft,
  Search,
  Loader2,
  Hospital,
  Calendar,
  AlertTriangle,
  DollarSign,
  FileText,
  Activity,
  X,
  Hash,
  Building2,
  Clock,
  User,
  Stethoscope,
  Tag,
  CreditCard,
  CheckCircle2,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const InternacoesSih: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [dadosSih, setDadosSih] = useState<DadosSih | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [jaConsultou, setJaConsultou] = useState(false);
  const [internacaoModal, setInternacaoModal] = useState<Internacao | null>(null);
  const [dadosCnesPorInternacao, setDadosCnesPorInternacao] = useState<Record<string, DadosCnes>>({});
  const [cnesLoading, setCnesLoading] = useState<string | null>(null);
  const [filtro30Dias, setFiltro30Dias] = useState(true);
  const [importando, setImportando] = useState<string | null>(null);
  const [internacoesImportadas, setInternacoesImportadas] = useState<Set<string>>(new Set());
  const [modalImportarItens, setModalImportarItens] = useState<Internacao[]>([]);
  const [modalImportarAberto, setModalImportarAberto] = useState(false);
  const [carregandoImportadas, setCarregandoImportadas] = useState(true);

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
    if (id) {
      carregarImportadas();
    }
  }, [id]);

  const carregarImportadas = async () => {
    if (!id) return;
    try {
      setCarregandoImportadas(true);
      const lista = await submoduloTrabalhadorService.listarInternacoes(id, undefined);
      setInternacoesImportadas(new Set(lista.map((i: ITrabalhadorInternacao) => i.numeroAih)));
    } catch {
    } finally {
      setCarregandoImportadas(false);
    }
  };

  useEffect(() => {
    if (trabalhador?.cartaoSus && !jaConsultou && !consultando) {
      handleConsultar();
    }
  }, [trabalhador]);

  const handleConsultar = async () => {
    const cns = (trabalhador?.cartaoSus || '').replace(/\D/g, '');
    if (!cns || cns.length < 15) {
      toast.error('Trabalhador não possui Cartão SUS válido para consulta');
      return;
    }

    setConsultando(true);
    setJaConsultou(true);
    try {
      const dados = await sihService.buscarPorCns(cns);
      setDadosSih(dados);
      if (dados.internacoes.length === 0) {
        toast('Nenhuma internação registrada para este CNS no SIH');
      } else {
        const recentes = filtrarUltimos30Dias(dados.internacoes, 'dataInternacao');
        if (recentes.length === 0) {
          toast(`${dados.internacoes.length} internação(ões) encontrada(s), nenhuma nos últimos 30 dias`);
        } else {
          toast.success(`${recentes.length} internação(ões) nos últimos 30 dias`);
        }
      }
    } catch (error: any) {
      setDadosSih(null);
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('não encontrado') || msg.includes('nenhuma internação') || msg.includes('404')) {
        toast.error('Nenhuma internação encontrada para este CNS no SIH');
      } else {
        toast.error(error.message || 'Sistema do Ministério da Saúde indisponível no momento');
      }
    } finally {
      setConsultando(false);
    }
  };

  const aplicarImportacao = async (int: Internacao) => {
    if (!id) return;
    setImportando(int.numeroAih);
    try {
      await submoduloTrabalhadorService.criarInternacao(id, {
        numeroAih: int.numeroAih,
        cnesHospital: int.cnesHospital,
        nomeHospital: int.nomeHospital,
        dataInternacao: int.dataInternacao,
        dataAlta: int.dataAlta,
        cidPrincipal: int.cidPrincipal,
        descricaoCid: int.descricaoCid,
        caraterAtendimento: int.caraterAtendimento,
        valorTotalAih: int.valorTotalAih,
      });
      setInternacoesImportadas(prev => new Set(prev).add(int.numeroAih));
      toast.success(`Internação ${int.numeroAih} importada com sucesso!`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao importar internação');
    } finally {
      setImportando(null);
    }
  };

  const handleImportarClick = async (int: Internacao) => {
    if (internacoesImportadas.has(int.numeroAih)) return;
    aplicarImportacao(int);
  };

  useEffect(() => {
    if (internacaoModal?.cnesHospital) {
      const cnes = internacaoModal.cnesHospital;
      if (!dadosCnesPorInternacao[cnes]) {
        consultarCnesAuto(cnes);
      }
    }
  }, [internacaoModal]);

  const consultarCnesAuto = async (cnes: string) => {
    setCnesLoading(cnes);
    try {
      const dados = await cnesService.buscarPorCodigo(cnes);
      setDadosCnesPorInternacao((prev) => ({ ...prev, [cnes]: dados }));
    } catch {
    } finally {
      setCnesLoading(null);
    }
  };

  const internacoesFiltradas = dadosSih && filtro30Dias
    ? filtrarUltimos30Dias(dadosSih.internacoes, 'dataInternacao')
    : dadosSih?.internacoes || [];

  const formatarData = (dataStr: string) => {
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatarValor = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const caraterBadge = (carater: string) => {
    const colors: Record<string, string> = {
      'Urgência': 'bg-red-50 text-red-700 border-red-100',
      'Eletivo': 'bg-blue-50 text-blue-700 border-blue-100',
    };
    return colors[carater] || 'bg-slate-50 text-slate-700 border-slate-100';
  };

  return (
    <MainLayout>
      <DocumentTitle title="Internações (SIH)" />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to={`/trabalhadores/${id}`}
            className="p-3 hover:bg-blue-50 rounded-2xl transition-all text-blue-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Internações (SIH)</h1>
            <p className="text-slate-500 font-medium">
              Consulta de internações hospitalares no SIH — Ministério da Saúde
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
                  CNS: {trabalhador.cartaoSus || 'Não informado'}
                </p>
              </div>
            </div>

            <div className="p-8">
              <button
                type="button"
                onClick={handleConsultar}
                disabled={consultando || !trabalhador.cartaoSus}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-100 active:scale-95"
              >
                {consultando ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Consultando a base do Ministério da Saúde...</span>
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    <span>Consultar Internações no SIH</span>
                  </>
                )}
              </button>

              {consultando && (
                <p className="text-sm text-green-600 mt-3 animate-pulse">
                  O sistema do Ministério da Saúde pode levar alguns segundos para responder na primeira consulta...
                </p>
              )}
            </div>
          </div>
        )}

        {dadosSih && dadosSih.internacoes.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 flex-wrap">
              <Hospital size={20} className="text-blue-600" />
              <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">
                Internações Encontradas
              </h2>
              <span className="text-xs font-bold text-slate-400">
                ({internacoesFiltradas.length} de {dadosSih.internacoes.length})
              </span>
              <button
                type="button"
                onClick={() => setFiltro30Dias(!filtro30Dias)}
                className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filtro30Dias
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {filtro30Dias ? 'Últimos 30 dias' : 'Todas'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Nº AIH</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Hospital</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Internação</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Alta</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">CID</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Caráter</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider text-right">Valor</th>
                    <th className="px-4 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider text-center w-14">Imp.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {internacoesFiltradas.map((int, idx) => {
                    const jaImportada = internacoesImportadas.has(int.numeroAih);
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => setInternacaoModal(int)}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setInternacaoModal(int); } }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {jaImportada && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                            <span className="font-mono text-sm font-bold text-slate-700">{int.numeroAih}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700">{int.nomeHospital}</p>
                          <p className="text-xs text-slate-400">CNES: {int.cnesHospital}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-600">{formatarData(int.dataInternacao)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-600">{formatarData(int.dataAlta)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <FileText size={14} className="text-slate-400" />
                            <div>
                              <p className="font-bold text-slate-700">{int.cidPrincipal}</p>
                              <p className="text-xs text-slate-400 max-w-[200px] truncate" title={int.descricaoCid}>
                                {int.descricaoCid}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${caraterBadge(int.caraterAtendimento)}`}>
                            {int.caraterAtendimento}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <DollarSign size={14} className="text-green-500" />
                            <span className="font-bold text-green-600">{formatarValor(int.valorTotalAih)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleImportarClick(int); }}
                            disabled={jaImportada || importando === int.numeroAih}
                            className={`p-2 rounded-xl transition-all ${
                              jaImportada
                                ? 'bg-emerald-50 text-emerald-500 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-90'
                            }`}
                            title={jaImportada ? 'Já importada' : 'Importar internação'}
                          >
                            {importando === int.numeroAih ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Download size={16} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {jaConsultou && !consultando && !dadosSih && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <AlertTriangle size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-2">Nenhuma internação encontrada</h3>
              <p className="text-slate-400 max-w-md">
                Não foram encontradas internações hospitalares para este trabalhador na base do SIH.
              </p>
            </div>
          </div>
        )}

        {!jaConsultou && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Hospital size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-2">Consultar SIH</h3>
              <p className="text-slate-400 max-w-md">
                Clique no botão acima para consultar as internações hospitalares deste trabalhador
                na base do SIH (Sistema de Informações Hospitalares) do Ministério da Saúde.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {internacaoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setInternacaoModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Hospital size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Detalhes da Internação</h2>
                  <p className="text-sm text-slate-400 font-mono">AIH: {internacaoModal.numeroAih}</p>
                </div>
              </div>
              <button
                onClick={() => setInternacaoModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-7">
              {/* Hospital */}
              <div className="bg-slate-50/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Hospital</h3>
                  {cnesLoading === internacaoModal.cnesHospital && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Loader2 size={12} className="animate-spin" />
                      Consultando CNES...
                    </span>
                  )}
                </div>

                {dadosCnesPorInternacao[internacaoModal.cnesHospital] ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Nome Fantasia</p>
                          <p className="font-bold text-slate-700">{dadosCnesPorInternacao[internacaoModal.cnesHospital].nomeFantasia}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Hash size={18} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium">CNES</p>
                          <p className="font-bold text-slate-700 font-mono">{dadosCnesPorInternacao[internacaoModal.cnesHospital].codigoCnes}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Razão Social</p>
                          <p className="font-bold text-slate-700">{dadosCnesPorInternacao[internacaoModal.cnesHospital].razaoSocial}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Tag size={18} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Tipo de Unidade</p>
                          <p className="font-bold text-slate-700">{dadosCnesPorInternacao[internacaoModal.cnesHospital].tipoUnidade}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Natureza Jurídica</p>
                          <p className="font-bold text-slate-700">{dadosCnesPorInternacao[internacaoModal.cnesHospital].naturezaJuridica}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Gestão</p>
                          <p className="font-bold text-slate-700">{dadosCnesPorInternacao[internacaoModal.cnesHospital].gestao} / {dadosCnesPorInternacao[internacaoModal.cnesHospital].esferaAdministrativa}</p>
                        </div>
                      </div>
                    </div>
                    {dadosCnesPorInternacao[internacaoModal.cnesHospital].endereco.cidade && (
                      <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Endereço</p>
                          <p className="font-bold text-slate-700">
                            {dadosCnesPorInternacao[internacaoModal.cnesHospital].endereco.logradouro}, {dadosCnesPorInternacao[internacaoModal.cnesHospital].endereco.numero}
                            {dadosCnesPorInternacao[internacaoModal.cnesHospital].endereco.bairro && ` - ${dadosCnesPorInternacao[internacaoModal.cnesHospital].endereco.bairro}`}
                            <br />
                            <span className="text-slate-500">{dadosCnesPorInternacao[internacaoModal.cnesHospital].endereco.cidade}/{dadosCnesPorInternacao[internacaoModal.cnesHospital].endereco.estado} - {dadosCnesPorInternacao[internacaoModal.cnesHospital].endereco.cep}</span>
                          </p>
                        </div>
                      </div>
                    )}
                    {dadosCnesPorInternacao[internacaoModal.cnesHospital].telefone && (
                      <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Contato</p>
                          <p className="font-bold text-slate-700">{dadosCnesPorInternacao[internacaoModal.cnesHospital].telefone}{dadosCnesPorInternacao[internacaoModal.cnesHospital].email ? ` | ${dadosCnesPorInternacao[internacaoModal.cnesHospital].email}` : ''}</p>
                        </div>
                      </div>
                    )}
                    {dadosCnesPorInternacao[internacaoModal.cnesHospital].leitos.total > 0 && (
                      <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Leitos</p>
                          <p className="font-bold text-slate-700">
                            {dadosCnesPorInternacao[internacaoModal.cnesHospital].leitos.total} total
                            <span className="text-green-600 ml-2">({dadosCnesPorInternacao[internacaoModal.cnesHospital].leitos.sus} SUS)</span>
                            {dadosCnesPorInternacao[internacaoModal.cnesHospital].leitos.privado > 0 && (
                              <span className="text-blue-600 ml-1">(+{dadosCnesPorInternacao[internacaoModal.cnesHospital].leitos.privado} privado)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    {dadosCnesPorInternacao[internacaoModal.cnesHospital].servicos.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Building2 size={18} className="text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Serviços</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {dadosCnesPorInternacao[internacaoModal.cnesHospital].servicos.map((s) => (
                              <span key={s} className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Building2 size={18} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Nome</p>
                        <p className="font-bold text-slate-700">{internacaoModal.nomeHospital}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Hash size={18} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">CNES</p>
                        <p className="font-bold text-slate-700 font-mono">{internacaoModal.cnesHospital}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Período */}
              <div className="bg-slate-50/50 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Período da Internação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Data de Internação</p>
                      <p className="font-bold text-slate-700">{formatarData(internacaoModal.dataInternacao)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Data de Alta</p>
                      <p className="font-bold text-slate-700">{formatarData(internacaoModal.dataAlta)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnóstico */}
              <div className="bg-slate-50/50 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Diagnóstico</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Stethoscope size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">CID Principal</p>
                      <p className="font-bold text-slate-700 text-lg">{internacaoModal.cidPrincipal}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Descrição</p>
                      <p className="text-slate-600">{internacaoModal.descricaoCid}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caráter e Valor */}
              <div className="bg-slate-50/50 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Caráter e Valor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Tag size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Caráter do Atendimento</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border mt-1 ${caraterBadge(internacaoModal.caraterAtendimento)}`}>
                        {internacaoModal.caraterAtendimento}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Valor Total da AIH</p>
                      <p className="font-bold text-green-600 text-lg">{formatarValor(internacaoModal.valorTotalAih)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex justify-end">
              <button
                onClick={() => setInternacaoModal(null)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalSelecaoESocial
        isOpen={modalImportarAberto}
        onClose={() => setModalImportarAberto(false)}
        titulo="Selecionar Internação para Importar"
        itens={modalImportarItens}
        onSelecionar={(int) => { setModalImportarAberto(false); aplicarImportacao(int); }}
        renderItem={(int) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">{int.numeroAih}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                int.caraterAtendimento === 'Urgência' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {int.caraterAtendimento}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{int.nomeHospital}</span>
              <span>{new Date(int.dataInternacao).toLocaleDateString('pt-BR')}</span>
              <span className="font-mono">{int.cidPrincipal}</span>
            </div>
          </div>
        )}
      />
    </MainLayout>
  );
};

export default InternacoesSih;
