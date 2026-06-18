import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import empresaService from '../../../services/empresaService.js';
import unidadeService from '../../../services/unidadeService.js';
import { ITrabalhadorVinculo, ITrabalhador, IEmpresa, IUnidade, IAvaliacaoAmbienteTrabalho } from '../../../types/index.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import {
  ArrowLeft, Save, Briefcase, Building, Calendar, Clock, DollarSign, Info, Loader2,
  AlertTriangle, Shield, HeartHandshake
} from 'lucide-react';
import toast from 'react-hot-toast';

const inputCls = "w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all";
const labelCls = "block text-sm font-bold text-slate-600 mb-2";
const selectCls = `${inputCls} font-medium`;
const checkboxRowCls = "flex items-center gap-3 py-2";

interface FormData {
  empresa: string;
  unidade: string;
  tipoVinculo: string;
  matricula: string;
  funcao: string;
  jornadaTrabalho: string;
  turnoTrabalho: string;
  dataInicio: string;
  dataPosse: string;
  dataFim: string;
  situacao: string;
  empresaTerceirizada: string;
  setor: string;
  cargo: string;
  ocupacao: string;
  cargaHoraria: string;
  salario: string;
  insalubridadePericulosidade: string;
  observacoes: string;
  ativo: boolean;
  terceirizado: boolean;
  residente: boolean;
  anosResidencia: string;
  temPosse: boolean;
  avaliacaoAmbienteTrabalho: IAvaliacaoAmbienteTrabalho;
}

const ITEM_AUSENTE = { presente: false, observacao: '' };

const INITIAL_AVALIACAO: IAvaliacaoAmbienteTrabalho = {
  riscosOcupacionais: {
    agentesFisicos: { ...ITEM_AUSENTE },
    agentesQuimicos: { ...ITEM_AUSENTE },
    agentesBiologicos: { ...ITEM_AUSENTE },
    riscosErgonomicos: { ...ITEM_AUSENTE },
    riscosAcidentes: { ...ITEM_AUSENTE },
  },
  condicoesTrabalho: {
    infraestrutura: { ...ITEM_AUSENTE },
    equipamentos: { ...ITEM_AUSENTE },
    organizacaoTrabalho: { ...ITEM_AUSENTE },
  },
  relacoesTrabalho: {
    violencia: { ...ITEM_AUSENTE },
    assedio: { ...ITEM_AUSENTE },
    climaOrganizacional: { ...ITEM_AUSENTE },
    satisfacaoTrabalho: { ...ITEM_AUSENTE },
  },
};

const INITIAL_FORM: FormData = {
  empresa: '',
  unidade: '',
  tipoVinculo: '',
  matricula: '',
  funcao: '',
  jornadaTrabalho: '',
  turnoTrabalho: '',
  dataInicio: '',
  dataPosse: '',
  dataFim: '',
  situacao: '',
  empresaTerceirizada: '',
  setor: '',
  cargo: '',
  ocupacao: '',
  cargaHoraria: '',
  salario: '',
  insalubridadePericulosidade: '',
  observacoes: '',
  ativo: false,
  terceirizado: false,
  residente: false,
  anosResidencia: '',
  temPosse: false,
  avaliacaoAmbienteTrabalho: { ...INITIAL_AVALIACAO },
};

const AvaliacaoItemField = ({
  label, subdimensao, campo, data, onChange,
}: {
  label: string; subdimensao: string; campo: string;
  data?: { presente?: boolean; observacao?: string };
  onChange: (subdimensao: string, campo: string, subcampo: string, value: boolean | string) => void;
}) => (
  <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={data?.presente ?? false}
        onChange={(e) => onChange(subdimensao, campo, 'presente', e.target.checked)}
        className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 transition-all"
      />
      <span className="text-sm font-bold text-slate-600">{label}</span>
    </label>
    {(data?.presente ?? false) && (
      <div className="pl-8">
        <input
          type="text"
          value={data?.observacao ?? ''}
          onChange={(e) => onChange(subdimensao, campo, 'observacao', e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          placeholder="Observação..."
        />
      </div>
    )}
  </div>
);

export const FormVinculo: React.FC = () => {
  const { id, vinculoId } = useParams<{ id: string; vinculoId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(vinculoId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);
  const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
  const [unidades, setUnidades] = useState<IUnidade[]>([]);
  const [unidadesFiltradas, setUnidadesFiltradas] = useState<IUnidade[]>([]);

  const { itens: tiposVinculo } = useCatalogo('tipoVinculo');
  const { itens: jornadas } = useCatalogo('jornadaTrabalho');
  const { itens: turnos } = useCatalogo('turnoTrabalho');
  const { itens: situacoes } = useCatalogo('situacaoTrabalho');
  const { itens: insalubridadeLista } = useCatalogo('insalubridadePericulosidade');

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id, vinculoId]);

  useEffect(() => {
    if (unidades.length > 0 && formData.empresa) {
      const unidadesDaEmpresa = unidades.filter(
        (u) => String((u as any).empresaId?._id || (u as any).empresaId) === String(formData.empresa)
      );
      if (unidadesDaEmpresa.length > 0) {
        setUnidadesFiltradas(unidadesDaEmpresa);
      }
    }
  }, [unidades, formData.empresa]);

  const carregarDados = async () => {
    try {
      const [r1, r2] = await Promise.all([
        empresaService.listarAtivas(),
        unidadeService.listarAtivas(),
      ]);
      const empresasData = r1.data?.empresas || r1.empresas || [];
      const unidadesData = r2.data?.unidades || r2.unidades || [];
      setEmpresas(empresasData);
      setUnidades(unidadesData);

      if (isEdicao && vinculoId) {
        await carregarVinculo(unidadesData);
      } else {
        await carregarTrabalhador(unidadesData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const carregarTrabalhador = async (_unidadesData: IUnidade[]) => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarVinculo = async (unidadesData: IUnidade[]) => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarVinculos(id!);
      const vinculo = lista.find((v: ITrabalhadorVinculo) => v._id === vinculoId);
      if (vinculo) {
        const temPosse = !!vinculo.dataPosse;
        const terceirizado = !!vinculo.empresaTerceirizada;
        const residente = !!vinculo.residente;
        const empId = (vinculo as any).empresa || '';
        const avaliacao = vinculo.avaliacaoAmbienteTrabalho || INITIAL_AVALIACAO;
        const preencherItens = (obj: any): any => {
          if (!obj || typeof obj !== 'object') return { presente: false, observacao: '' };
          if ('presente' in obj) return { presente: obj.presente ?? false, observacao: obj.observacao ?? '' };
          const result: any = {};
          for (const k of Object.keys(obj)) {
            result[k] = preencherItens(obj[k]);
          }
          return result;
        };
        setFormData({
          empresa: empId,
          unidade: (vinculo as any).unidade || '',
          tipoVinculo: vinculo.tipoVinculo || '',
          matricula: vinculo.matricula || '',
          funcao: vinculo.funcao || '',
          jornadaTrabalho: vinculo.jornadaTrabalho || '',
          turnoTrabalho: vinculo.turnoTrabalho || '',
          dataInicio: vinculo.dataInicio ? vinculo.dataInicio.split('T')[0] : '',
          dataPosse: vinculo.dataPosse ? vinculo.dataPosse.split('T')[0] : '',
          dataFim: vinculo.dataFim ? vinculo.dataFim.split('T')[0] : '',
          situacao: vinculo.situacao || 'Ativo',
          empresaTerceirizada: vinculo.empresaTerceirizada || '',
          residente,
          anosResidencia: vinculo.anosResidencia || '',
          setor: vinculo.setor || '',
          cargo: vinculo.cargo || '',
          ocupacao: vinculo.ocupacao || '',
          cargaHoraria: vinculo.cargaHoraria ? vinculo.cargaHoraria.toString() : '',
          salario: vinculo.salario ? vinculo.salario.toString() : '',
          insalubridadePericulosidade: vinculo.insalubridadePericulosidade || '',
          observacoes: vinculo.observacoes || '',
          ativo: vinculo.ativo !== false,
          terceirizado,
          temPosse,
          avaliacaoAmbienteTrabalho: preencherItens(avaliacao),
        });
        if (empId) {
          const unidadesDaEmpresa = unidadesData.filter(
            (u) => String((u as any).empresaId?._id || (u as any).empresaId) === String(empId)
          );
          setUnidadesFiltradas(unidadesDaEmpresa);
        }
      } else {
        toast.error('Vínculo não encontrado');
        navigate(`/trabalhadores/${id}/vinculos`);
      }
    } catch {
      toast.error('Erro ao carregar vínculo');
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};
    if (!formData.empresa) novoErros.empresa = 'Obrigatória';
    if (!formData.unidade) novoErros.unidade = 'Obrigatória';
    if (!formData.tipoVinculo) novoErros.tipoVinculo = 'Obrigatório';
    if (!formData.matricula.trim()) novoErros.matricula = 'Obrigatória';
    if (!formData.jornadaTrabalho) novoErros.jornadaTrabalho = 'Obrigatória';
    if (!formData.dataInicio) novoErros.dataInicio = 'Obrigatória';
    if (!formData.setor.trim()) novoErros.setor = 'Obrigatório';
    if (!formData.cargo.trim()) novoErros.cargo = 'Obrigatório';
    if (!formData.funcao.trim()) novoErros.funcao = 'Obrigatória';
    if (!formData.ocupacao.trim()) novoErros.ocupacao = 'Obrigatória';
    if (!formData.situacao) novoErros.situacao = 'Obrigatória';
    if (!formData.turnoTrabalho) novoErros.turnoTrabalho = 'Obrigatório';
    setErrors(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (name === 'empresa') {
      if (value) {
        const unidadesDaEmpresa = unidades.filter(
          (u) => String((u as any).empresaId?._id || (u as any).empresaId) === value
        );
        setUnidadesFiltradas(unidadesDaEmpresa);
        setFormData((prev) => ({ ...prev, empresa: value, unidade: '' }));
      } else {
        setUnidadesFiltradas([]);
        setFormData((prev) => ({ ...prev, empresa: '', unidade: '' }));
      }
      return;
    }

    if (name === 'unidade') {
      if (value) {
        const unidadeSelecionada = unidades.find((u) => u._id === value);
        if (unidadeSelecionada) {
          const empresaId = String((unidadeSelecionada as any).empresaId?._id || (unidadeSelecionada as any).empresaId);
          setUnidadesFiltradas(
            unidades.filter((u) => String((u as any).empresaId?._id || (u as any).empresaId) === empresaId)
          );
          setFormData((prev) => ({ ...prev, empresa: empresaId, unidade: value }));
        }
      } else {
        setFormData((prev) => ({ ...prev, unidade: '' }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvaliacaoChange = (subdimensao: string, campo: string, subcampo: string, value: boolean | string) => {
    setFormData((prev) => ({
      ...prev,
      avaliacaoAmbienteTrabalho: {
        ...prev.avaliacaoAmbienteTrabalho,
        [subdimensao]: {
          ...(prev.avaliacaoAmbienteTrabalho as any)[subdimensao],
          [campo]: {
            ...(prev.avaliacaoAmbienteTrabalho as any)[subdimensao]?.[campo],
            [subcampo]: value,
          },
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsLoading(true);

      const dados: Partial<ITrabalhadorVinculo> = {
        empresa: formData.empresa,
        unidade: formData.unidade,
        tipoVinculo: formData.tipoVinculo,
        matricula: formData.matricula,
        funcao: formData.funcao,
        jornadaTrabalho: formData.jornadaTrabalho,
        turnoTrabalho: formData.turnoTrabalho,
        dataInicio: formData.dataInicio,
        dataPosse: formData.temPosse && formData.dataPosse ? formData.dataPosse : undefined,
        dataFim: formData.dataFim || undefined,
        situacao: formData.situacao,
        empresaTerceirizada: formData.terceirizado ? formData.empresaTerceirizada : '',
        residente: formData.residente,
        anosResidencia: formData.residente ? formData.anosResidencia : '',
        setor: formData.setor,
        cargo: formData.cargo,
        ocupacao: formData.ocupacao,
        cargaHoraria: formData.cargaHoraria ? Number(formData.cargaHoraria) : undefined,
        salario: formData.salario ? Number(formData.salario) : undefined,
        insalubridadePericulosidade: formData.insalubridadePericulosidade || undefined,
        observacoes: formData.observacoes || undefined,
        ativo: formData.ativo,
        avaliacaoAmbienteTrabalho: formData.avaliacaoAmbienteTrabalho,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarVinculo(id!, vinculoId!, dados);
        toast.success('Vínculo atualizado com sucesso!');
      } else {
        await submoduloTrabalhadorService.criarVinculo(id!, dados);
        toast.success('Vínculo registrado com sucesso!');
      }

      navigate(`/trabalhadores/${id}/vinculos`);
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCarregando) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando dados...</p>
        </div>
      </MainLayout>
    );
  }

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
      <Icon size={20} className="text-blue-600" />
      <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">{title}</h2>
    </div>
  );

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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Vínculo' : 'Novo Vínculo'}
            </h1>
            {trabalhador && (
              <p className="text-slate-500 font-medium">
                Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vínculo Empregatício */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={Briefcase} title="Vínculo Empregatício" />
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Empresa <span className="text-red-500">*</span></label>
                  <select required name="empresa" value={formData.empresa} onChange={handleChange} className={selectCls}>
                    <option value="">Selecione...</option>
                    {empresas.map(e => <option key={e._id} value={e._id}>{e.razaoSocial}</option>)}
                  </select>
                  {errors.empresa && <p className="mt-1 text-xs text-red-500 font-bold">{errors.empresa}</p>}
                </div>
                <div>
                  <label className={labelCls}>Unidade <span className="text-red-500">*</span></label>
                  <select name="unidade" value={formData.unidade || ''} onChange={handleChange} className={selectCls} disabled={!formData.empresa}>
                    <option value="">{formData.empresa ? 'Selecione...' : 'Selecione uma empresa primeiro'}</option>
                    {unidadesFiltradas.map(u => <option key={u._id} value={u._id}>{u.nome}</option>)}
                  </select>
                  {errors.unidade && <p className="mt-1 text-xs text-red-500 font-bold">{errors.unidade}</p>}
                </div>
              </div>

              {/* Tomou posse? */}
              <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                <label className={checkboxRowCls}>
                  <input
                    type="checkbox"
                    checked={formData.temPosse}
                    onChange={(e) => setFormData(prev => ({ ...prev, temPosse: e.target.checked }))}
                    className="w-5 h-5 rounded-lg text-blue-600"
                  />
                  <span className="text-sm font-bold text-slate-600">Tomou posse?</span>
                </label>
                {formData.temPosse && (
                  <div className="pl-8">
                    <label className={labelCls}>Data da Posse <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name="dataPosse"
                      value={formData.dataPosse}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              {/* Terceirizado CLT? */}
              <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                <label className={checkboxRowCls}>
                  <input
                    type="checkbox"
                    name="terceirizado"
                    checked={formData.terceirizado}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-lg text-blue-600"
                  />
                  <span className="text-sm font-bold text-slate-600">Terceirizado CLT?</span>
                </label>
                {formData.terceirizado && (
                  <div className="pl-8">
                    <label className={labelCls}>Nome da Empresa Terceirizada <span className="text-red-500">*</span></label>
                    <input
                      name="empresaTerceirizada"
                      value={formData.empresaTerceirizada}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="Nome da empresa"
                    />
                  </div>
                )}
              </div>

              {/* Residente? */}
              <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                <label className={checkboxRowCls}>
                  <input
                    type="checkbox"
                    name="residente"
                    checked={formData.residente}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-lg text-blue-600"
                  />
                  <span className="text-sm font-bold text-slate-600">Residente?</span>
                </label>
                {formData.residente && (
                  <div className="pl-8">
                    <label className={labelCls}>Quantos anos de residencia</label>
                    <input
                      name="anosResidencia"
                      value={formData.anosResidencia}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="Ex: 3 anos"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Data de Entrada em Serviço <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleChange}
                    className={inputCls}
                  />
                  {errors.dataInicio && <p className="mt-1 text-xs text-red-500 font-bold">{errors.dataInicio}</p>}
                </div>
                <div>
                  <label className={labelCls}>Tipo de Vínculo <span className="text-red-500">*</span></label>
                  <select required name="tipoVinculo" value={formData.tipoVinculo} onChange={handleChange} className={selectCls}>
                    <option value="">Selecione...</option>
                    {tiposVinculo.map((t) => (
                      <option key={t.nome} value={t.nome}>{t.nome}</option>
                    ))}
                  </select>
                  {errors.tipoVinculo && <p className="mt-1 text-xs text-red-500 font-bold">{errors.tipoVinculo}</p>}
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Matrícula <span className="text-red-500">*</span></label>
                  <input
                    required
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Número da Matrícula"
                  />
                  {errors.matricula && <p className="mt-1 text-xs text-red-500 font-bold">{errors.matricula}</p>}
                </div>
                <div>
                  <label className={labelCls}>Cargo <span className="text-red-500">*</span></label>
                  <input
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Ex: Auxiliar Administrativo"
                  />
                  {errors.cargo && <p className="mt-1 text-xs text-red-500 font-bold">{errors.cargo}</p>}
                </div>
                <div>
                  <label className={labelCls}>Função <span className="text-red-500">*</span></label>
                  <input
                    name="funcao"
                    value={formData.funcao}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Função específica"
                  />
                  {errors.funcao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.funcao}</p>}
                </div>
                <div>
                  <label className={labelCls}>Setor de Trabalho <span className="text-red-500">*</span></label>
                  <input
                    name="setor"
                    value={formData.setor}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Ex: Almoxarifado"
                  />
                  {errors.setor && <p className="mt-1 text-xs text-red-500 font-bold">{errors.setor}</p>}
                </div>
              </div>
              <div>
                <label className={labelCls}>Ocupação (CBO) <span className="text-red-500">*</span></label>
                <input
                  name="ocupacao"
                  value={formData.ocupacao}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Código CBO"
                />
                {errors.ocupacao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.ocupacao}</p>}
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelCls}>Turno de Trabalho <span className="text-red-500">*</span></label>
                  <select name="turnoTrabalho" value={formData.turnoTrabalho} onChange={handleChange} className={selectCls}>
                    <option value="">Selecione...</option>
                    {turnos.map((t) => (
                      <option key={t.nome} value={t.nome}>{t.nome}</option>
                    ))}
                  </select>
                  {errors.turnoTrabalho && <p className="mt-1 text-xs text-red-500 font-bold">{errors.turnoTrabalho}</p>}
                </div>
                <div>
                  <label className={labelCls}>Jornada de Trabalho <span className="text-red-500">*</span></label>
                  <select required name="jornadaTrabalho" value={formData.jornadaTrabalho} onChange={handleChange} className={selectCls}>
                    <option value="">Selecione...</option>
                    {jornadas.map((j) => (
                      <option key={j.nome} value={j.nome}>{j.nome}</option>
                    ))}
                  </select>
                  {errors.jornadaTrabalho && <p className="mt-1 text-xs text-red-500 font-bold">{errors.jornadaTrabalho}</p>}
                </div>
                <div>
                  <label className={labelCls}>Situação do Trabalho <span className="text-red-500">*</span></label>
                  <select name="situacao" value={formData.situacao} onChange={handleChange} className={selectCls}>
                    <option value="">Selecione...</option>
                    {situacoes.map((s) => (
                      <option key={s.nome} value={s.nome}>{s.nome}</option>
                    ))}
                  </select>
                  {errors.situacao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.situacao}</p>}
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Insalubridade / Periculosidade</label>
                  <select name="insalubridadePericulosidade" value={formData.insalubridadePericulosidade} onChange={handleChange} className={selectCls}>
                    <option value="">Selecione...</option>
                    {insalubridadeLista.map((i) => (
                      <option key={i.nome} value={i.nome}>{i.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Data de Fim (Rescisão)</label>
                  <input
                    type="date"
                    name="dataFim"
                    value={formData.dataFim}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Remuneração e Carga Horária */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={DollarSign} title="Remuneração e Carga Horária" />
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Carga Horária Semanal</label>
                <input
                  type="number"
                  name="cargaHoraria"
                  value={formData.cargaHoraria}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Ex: 40"
                />
              </div>
              <div>
                <label className={labelCls}>Salário Mensal</label>
                <input
                  type="number"
                  name="salario"
                  value={formData.salario}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Avaliação do Ambiente de Trabalho */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={AlertTriangle} title="Avaliação do Ambiente de Trabalho" />
            <div className="p-8 space-y-8">
              {/* Riscos Ocupacionais */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={18} className="text-red-500" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600">Riscos Ocupacionais</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries({
                    agentesFisicos: 'Agentes Físicos', agentesQuimicos: 'Agentes Químicos',
                    agentesBiologicos: 'Agentes Biológicos', riscosErgonomicos: 'Riscos Ergonômicos',
                    riscosAcidentes: 'Riscos de Acidentes',
                  }).map(([key, label]) => (
                    <AvaliacaoItemField
                      key={key}
                      label={label}
                      subdimensao="riscosOcupacionais"
                      campo={key}
                      data={(formData.avaliacaoAmbienteTrabalho as any)?.riscosOcupacionais?.[key]}
                      onChange={handleAvaliacaoChange}
                    />
                  ))}
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Condições de Trabalho */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={18} className="text-amber-500" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600">Condições de Trabalho</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries({
                    infraestrutura: 'Infraestrutura', equipamentos: 'Equipamentos (EPIs/EPCs)',
                    organizacaoTrabalho: 'Organização do Trabalho',
                  }).map(([key, label]) => (
                    <AvaliacaoItemField
                      key={key}
                      label={label}
                      subdimensao="condicoesTrabalho"
                      campo={key}
                      data={(formData.avaliacaoAmbienteTrabalho as any)?.condicoesTrabalho?.[key]}
                      onChange={handleAvaliacaoChange}
                    />
                  ))}
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Relações de Trabalho */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <HeartHandshake size={18} className="text-purple-500" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600">Relações de Trabalho</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries({
                    violencia: 'Violência', assedio: 'Assédio Moral/Sexual',
                    climaOrganizacional: 'Clima Organizacional', satisfacaoTrabalho: 'Satisfação no Trabalho',
                  }).map(([key, label]) => (
                    <AvaliacaoItemField
                      key={key}
                      label={label}
                      subdimensao="relacoesTrabalho"
                      campo={key}
                      data={(formData.avaliacaoAmbienteTrabalho as any)?.relacoesTrabalho?.[key]}
                      onChange={handleAvaliacaoChange}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Outras Informações */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={Info} title="Outras Informações" />
            <div className="p-8 space-y-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 transition-all"
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Vínculo Ativo?</span>
              </label>

              <div className="pt-4">
                <label className={labelCls}>Observações</label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
                  placeholder="Notas adicionais..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/trabalhadores/${id}/vinculos`)}
              className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-3xl font-bold transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={20} />
                  <span>{isEdicao ? 'Salvar Alterações' : 'Cadastrar Vínculo'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default FormVinculo;
