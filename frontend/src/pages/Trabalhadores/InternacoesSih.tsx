import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { DocumentTitle } from '../../hooks/useDocumentTitle.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { sihService, DadosSih } from '../../services/sihService.js';
import { ITrabalhador } from '../../types/index.js';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

export const InternacoesSih: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [dadosSih, setDadosSih] = useState<DadosSih | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [jaConsultou, setJaConsultou] = useState(false);

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
        toast.success(`${dados.internacoes.length} internação(ões) encontrada(s)!`);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDadosSih(null);
        toast.error('Nenhuma internação encontrada para este CNS no SIH');
      } else {
        setDadosSih(null);
        toast.error(error.message || 'Sistema do Ministério da Saúde indisponível no momento');
      }
    } finally {
      setConsultando(false);
    }
  };

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
            <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
              <Hospital size={20} className="text-blue-600" />
              <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">
                Internações Encontradas ({dadosSih.internacoes.length})
              </h2>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dadosSih.internacoes.map((int, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">{int.numeroAih}</td>
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
                    </tr>
                  ))}
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
    </MainLayout>
  );
};

export default InternacoesSih;
