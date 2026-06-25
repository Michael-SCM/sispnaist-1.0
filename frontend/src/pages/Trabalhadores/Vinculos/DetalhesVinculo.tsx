import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import empresaService from '../../../services/empresaService.js';
import unidadeService from '../../../services/unidadeService.js';
import { ITrabalhadorVinculo, ITrabalhador, IEmpresa, IUnidade, IAvaliacaoAmbienteTrabalho } from '../../../types/index.js';
import {
  ArrowLeft, Edit, Trash2, Building, MapPin, Briefcase, CreditCard,
  UserCheck, Clock, Calendar, Flag, Home,
  Shield, DollarSign, FileText, Loader2, CheckCircle, XCircle,
  AlertTriangle, HeartHandshake, Users, Star, Activity, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { InfoCard } from '../../../components/InfoCard.js';

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
    <Icon size={20} className="text-blue-600" />
    <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">{title}</h2>
  </div>
);

const LABELS: Record<string, string> = {
  agentesFisicos: 'Agentes Físicos', agentesQuimicos: 'Agentes Químicos',
  agentesBiologicos: 'Agentes Biológicos', riscosErgonomicos: 'Riscos Ergonômicos',
  riscosAcidentes: 'Riscos de Acidentes',
  infraestrutura: 'Infraestrutura', equipamentos: 'Equipamentos (EPIs/EPCs)',
  organizacaoTrabalho: 'Organização do Trabalho',
  violencia: 'Violência', assedio: 'Assédio Moral/Sexual',
  climaOrganizacional: 'Clima Organizacional', satisfacaoTrabalho: 'Satisfação no Trabalho',
  pcmo: 'PCMSO', ppraPgr: 'PPRA / PGR',
  programasVacinacao: 'Programas de Vacinação', treinamentos: 'Treinamentos',
  inspecoes: 'Inspeções',
};

const ICONS: Record<string, any> = {
  infraestrutura: Building, equipamentos: Shield,
  organizacaoTrabalho: FileText,
  climaOrganizacional: Users, satisfacaoTrabalho: Star,
  pcmo: Activity, ppraPgr: Shield,
  programasVacinacao: HeartHandshake, treinamentos: FileText,
  inspecoes: Search,
};

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : null;

const renderDetalhes = (val: any, subdimensao: string, campo: string) => {
  const detalhes: string[] = [];
  if (subdimensao === 'riscosOcupacionais') {
    if (val?.intensidade) detalhes.push(`Intensidade: ${val.intensidade}`);
    if (val?.fonteGeradora) detalhes.push(`Fonte: ${val.fonteGeradora}`);
  }
  if (subdimensao === 'condicoesTrabalho' && val?.situacao) {
    const map: Record<string, string> = { adequado: 'Adequado', parcial: 'Parcial', inadequado: 'Inadequado' };
    detalhes.push(`Situação: ${map[val.situacao] || val.situacao}`);
  }
  if (subdimensao === 'relacoesTrabalho') {
    if (val?.frequencia) detalhes.push(`Frequência: ${val.frequencia}`);
    if (val?.ultimoEvento) detalhes.push(`Último evento: ${formatDate(val.ultimoEvento)}`);
  }
  if (subdimensao === 'acoesPrevencao') {
    if (val?.dataUltimaAcao) detalhes.push(`Última ação: ${formatDate(val.dataUltimaAcao)}`);
    if (val?.proximaAcao) detalhes.push(`Próxima ação: ${formatDate(val.proximaAcao)}`);
    if (val?.responsavel) detalhes.push(`Responsável: ${val.responsavel}`);
  }
  return detalhes.length > 0 ? detalhes : null;
};

const renderItens = (grupo: any, neutroFields?: string[], subdimensao?: string) => {
  if (!grupo) return null;
  return Object.entries(grupo).map(([key, val]: [string, any]) => {
    const isNeutro = neutroFields?.includes(key);
    const Icon = isNeutro ? ICONS[key] : null;
    const extras = renderDetalhes(val, subdimensao || '', key);
    if (isNeutro && Icon) {
      return (
        <div key={key} className="flex items-start gap-3 p-3 rounded-xl border bg-slate-50 border-slate-200">
          <div className={`p-1.5 bg-white rounded-lg shadow-sm ${val?.presente ? 'text-amber-500' : 'text-slate-400'}`}>
            <Icon size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">{LABELS[key] || key}</p>
            {val?.observacao && <p className="text-xs text-slate-500 mt-0.5">{val.observacao}</p>}
            {extras && <p className="text-xs text-slate-400 mt-0.5">{extras.join(' | ')}</p>}
          </div>
        </div>
      );
    }
    return (
      <div key={key} className={`flex items-start gap-3 p-3 rounded-xl border ${
        val?.presente ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
      }`}>
        <span className={`mt-0.5 text-sm ${val?.presente ? 'text-red-500' : 'text-green-500'}`}>
          {val?.presente ? '⚠️' : '✅'}
        </span>
        <div>
          <p className={`text-sm font-bold ${val?.presente ? 'text-red-700' : 'text-green-700'}`}>
            {LABELS[key] || key}
          </p>
          {val?.observacao && <p className="text-xs text-slate-500 mt-0.5">{val.observacao}</p>}
          {extras && <p className="text-xs text-slate-400 mt-0.5">{extras.join(' | ')}</p>}
        </div>
      </div>
    );
  });
};

export const DetalhesVinculo: React.FC = () => {
  const { id, vinculoId } = useParams<{ id: string; vinculoId: string }>();
  const navigate = useNavigate();
  const [vinculo, setVinculo] = useState<ITrabalhadorVinculo | null>(null);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
  const [unidades, setUnidades] = useState<IUnidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && vinculoId) {
      carregarDados();
    }
  }, [id, vinculoId]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [v, t, r1, r2] = await Promise.all([
        submoduloTrabalhadorService.obterVinculo(id!, vinculoId!),
        trabalhadorService.obterPorId(id!),
        empresaService.listarAtivas(),
        unidadeService.listarAtivas(),
      ]);
      if (v) {
        setTrabalhador(t);
        setEmpresas(r1.data?.empresas || r1.empresas || []);
        setUnidades(r2.data?.unidades || r2.unidades || []);
        setVinculo(v);
      } else {
        toast.error('Vínculo não encontrado');
        navigate(`/trabalhadores/${id}/vinculos`);
      }
    } catch {
      toast.error('Erro ao carregar vínculo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (!vinculo?._id) return;
    if (confirm('Tem certeza que deseja remover este vínculo?')) {
      try {
        await submoduloTrabalhadorService.deletarVinculo(id!, vinculo._id);
        toast.success('Vínculo removido com sucesso!');
        navigate(`/trabalhadores/${id}/vinculos`);
      } catch {
        toast.error('Erro ao remover vínculo');
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando vínculo...</p>
        </div>
      </MainLayout>
    );
  }

  if (!vinculo) return null;

  const v = vinculo;
  const empresaNome = v.empresa ? (empresas.find(e => e._id === v.empresa)?.razaoSocial || v.empresa) : undefined;
  const unidadeNome = v.unidade ? (unidades.find(u => u._id === v.unidade)?.nome || v.unidade) : undefined;

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/trabalhadores/${id}/vinculos`)}
            className="p-3 hover:bg-blue-50 rounded-2xl transition-all text-blue-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detalhes do Vínculo</h1>
            {trabalhador && (
              <p className="text-slate-500 font-medium">
                Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <SectionHeader icon={Briefcase} title="Dados do Vínculo" />
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Empresa" value={empresaNome} icon={Building} color="text-slate-600" />
            <InfoCard label="Unidade" value={unidadeNome} icon={MapPin} color="text-slate-600" />
            <InfoCard label="Tipo de Vínculo" value={v.tipoVinculo} icon={Briefcase} color="text-blue-500" />
            <InfoCard label="Matrícula" value={v.matricula} icon={CreditCard} color="text-slate-600" />
            <InfoCard label="Cargo" value={v.cargo} icon={Shield} color="text-purple-500" />
            <InfoCard label="Função" value={v.funcao} icon={UserCheck} color="text-indigo-500" />
            <InfoCard label="Ocupação" value={v.ocupacao} icon={Briefcase} color="text-slate-600" />
            <InfoCard label="Setor" value={v.setor} icon={Building} color="text-slate-600" />
            <InfoCard label="Jornada de Trabalho" value={v.jornadaTrabalho} icon={Clock} color="text-amber-500" />
            <InfoCard label="Turno de Trabalho" value={v.turnoTrabalho} icon={Clock} color="text-amber-500" />
            <InfoCard label="Carga Horária" value={v.cargaHoraria ? `${v.cargaHoraria}h semanais` : undefined} icon={Clock} color="text-amber-500" />
            <InfoCard label="Salário" value={v.salario ? `R$ ${Number(v.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : undefined} icon={DollarSign} color="text-emerald-500" />
            <InfoCard label="Insalubridade / Periculosidade" value={v.insalubridadePericulosidade} icon={Shield} color="text-orange-500" />
            <InfoCard label="Empresa Terceirizada" value={(v as any).empresaTerceirizada} icon={Building} color="text-slate-600" />
            <InfoCard label="Residente?" value={v.residente ? 'Sim' : 'Não'} icon={Home} color="text-cyan-500" />
            {v.residente && <InfoCard label="Anos de Residência" value={v.anosResidencia} icon={Clock} color="text-cyan-500" />}
            <InfoCard label="Data de Posse" value={v.dataPosse ? new Date(v.dataPosse).toLocaleDateString('pt-BR') : undefined} icon={Calendar} color="text-slate-600" />
            <InfoCard label="Data de Início" value={v.dataInicio ? new Date(v.dataInicio).toLocaleDateString('pt-BR') : '-'} icon={Calendar} color="text-emerald-500" />
            <InfoCard label="Data de Fim" value={v.dataFim ? new Date(v.dataFim).toLocaleDateString('pt-BR') : 'Em vigor'} icon={Calendar} color="text-red-500" />
            <InfoCard label="Situação" value={v.situacao} icon={Flag} color="text-slate-600" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <SectionHeader icon={CheckCircle} title="Status" />
          <div className="p-8">
            <div className="flex items-center gap-3">
              {v.ativo ? (
                <CheckCircle size={24} className="text-emerald-500" />
              ) : (
                <XCircle size={24} className="text-slate-400" />
              )}
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                v.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {v.ativo ? 'Ativo' : 'Encerrado'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <SectionHeader icon={FileText} title="Observações" />
          <div className="p-8">
            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-600">
                <FileText size={24} />
              </div>
              <p className="text-sm font-medium text-slate-700 whitespace-pre-line">
                {v.observacoes || 'Nenhuma observação cadastrada'}
              </p>
            </div>
          </div>
        </div>

        {v.avaliacaoAmbienteTrabalho && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={AlertTriangle} title="Avaliação do Ambiente de Trabalho" />
            <div className="p-8 space-y-6">
              {/* Riscos Ocupacionais */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={18} className="text-red-500" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600">Riscos Ocupacionais</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {renderItens(v.avaliacaoAmbienteTrabalho.riscosOcupacionais, undefined, 'riscosOcupacionais')}
                </div>
              </div>
              <hr className="border-slate-200" />
              {/* Condições de Trabalho */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={18} className="text-amber-500" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600">Condições de Trabalho</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {renderItens(v.avaliacaoAmbienteTrabalho.condicoesTrabalho, ['infraestrutura', 'equipamentos', 'organizacaoTrabalho'], 'condicoesTrabalho')}
                </div>
              </div>
              <hr className="border-slate-200" />
              {/* Relações de Trabalho */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <HeartHandshake size={18} className="text-purple-500" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600">Relações de Trabalho</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {renderItens(v.avaliacaoAmbienteTrabalho.relacoesTrabalho, ['climaOrganizacional', 'satisfacaoTrabalho'], 'relacoesTrabalho')}
                </div>
              </div>
              <hr className="border-slate-200" />
              {/* Ações de Prevenção */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={18} className="text-emerald-500" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600">Ações de Prevenção</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {renderItens(v.avaliacaoAmbienteTrabalho.acoesPrevencao, ['pcmo', 'ppraPgr', 'programasVacinacao', 'treinamentos', 'inspecoes'], 'acoesPrevencao')}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(`/trabalhadores/${id}/vinculos/${v._id}/editar`)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Edit size={20} />
            Editar Vínculo
          </button>
          <button
            onClick={handleDeletar}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all active:scale-95"
          >
            <Trash2 size={20} />
            Excluir
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesVinculo;
