import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { informacaoService, ITrabalhadorInformacao } from '../../../services/informacaoService.js';
import { uploadService } from '../../../services/uploadService.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import { ITrabalhador } from '../../../types/index.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Heart,
  Activity,
  Wine,
  Cigarette,
  Zap,
  Stethoscope,
  Pill,
  ClipboardList,
  FileUp,
  Download,
  Trash2,
  Loader2,
  Baby,
  Calendar,
  Accessibility
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  doencaBase: string;
  estadoVacinal: string;
  tipoDroga: string;
  tipoSanguineo: string;
  medicamentos: string;
  doadorSangue: boolean;
  doadorOrgaos: boolean;
  doencaPreexistente: boolean;
  descricaoDoencaPreexistente: string;
  historicoFamiliar: boolean;
  descricaoHistoricoFamiliar: string;
  teveCovid: boolean;
  ultimoContagio: string;
  teveSequela: boolean;
  descricaoSequela: string;
  foiInternado: boolean;
  diasInternacao: number;
  foiIntubado: boolean;
  allergy: boolean;
  descricaoAlergia: string;
  acompanhamentoMedico: boolean;
  acompanhamentoMedicoMotivo: string;
  acompanhamentoReabilitacao: boolean;
  usoAlcool: boolean;
  dosesAlcool: number;
  usoCigarro: boolean;
  macosCigarro: number;
  usoOutraDroga: boolean;
  outraDrogaDescricao: string;
  frequenciaUso: string;
  gestante: boolean;
  dataUltimaMenstruacao: string;
  semanasGestacao: number;
  dataPartoPrevista: string;
  preNatal: boolean;
  lactante: boolean;
  complicacoesGestacao: string;
  limitacao: boolean;
  tipoLimitacao: string;
  descricaoLimitacao: string;
  causaLimitacao: string;
  parteCorpoAtingida: string;
  necessitaAdaptacao: boolean;
  descricaoAdaptacao: string;
  readaptacaoProfissional: boolean;
  descricaoReadaptacao: string;
  exames: {
    realizados: string;
    resultados: string;
    periodicidade: string;
    anexos: { id: string; nome: string }[];
  };
  observacoes: string;
}

const INITIAL_FORM: FormData = {
  doencaBase: '',
  estadoVacinal: '',
  tipoDroga: '',
  tipoSanguineo: '',
  medicamentos: '',
  doadorSangue: false,
  doadorOrgaos: false,
  doencaPreexistente: false,
  descricaoDoencaPreexistente: '',
  historicoFamiliar: false,
  descricaoHistoricoFamiliar: '',
  teveCovid: false,
  ultimoContagio: '',
  teveSequela: false,
  descricaoSequela: '',
  foiInternado: false,
  diasInternacao: 0,
  foiIntubado: false,
  allergy: false,
  descricaoAlergia: '',
  acompanhamentoMedico: false,
  acompanhamentoMedicoMotivo: '',
  acompanhamentoReabilitacao: false,
  usoAlcool: false,
  dosesAlcool: 0,
  usoCigarro: false,
  macosCigarro: 0,
  usoOutraDroga: false,
  outraDrogaDescricao: '',
  frequenciaUso: '',
  gestante: false,
  dataUltimaMenstruacao: '',
  semanasGestacao: 0,
  dataPartoPrevista: '',
  preNatal: false,
  lactante: false,
  complicacoesGestacao: '',
  limitacao: false,
  tipoLimitacao: '',
  descricaoLimitacao: '',
  causaLimitacao: '',
  parteCorpoAtingida: '',
  necessitaAdaptacao: false,
  descricaoAdaptacao: '',
  readaptacaoProfissional: false,
  descricaoReadaptacao: '',
  exames: {
    realizados: '',
    resultados: '',
    periodicidade: '',
    anexos: [],
  },
  observacoes: '',
};

export const FormInformacoes: React.FC = () => {
  const { id, infoId } = useParams<{ id: string; infoId?: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(infoId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Catálogos
  const { itens: doencasBase } = useCatalogo('doencaBase');
  const { itens: estadosVacinas } = useCatalogo('estadoVacinal');
  const { itens: tiposDroga } = useCatalogo('tipoDroga');
  const { itens: tiposSanguineos } = useCatalogo('tipoSanguineo');

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && infoId) {
        carregarInformacao();
      }
    }
  }, [id, infoId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarInformacao = async () => {
    try {
      setIsCarregando(true);
      const info = await informacaoService.obterPorId(id!, infoId!);
      if (info) {
        setFormData({
          doencaBase: info.doencaBase || '',
          estadoVacinal: info.estadoVacinal || '',
          tipoDroga: info.tipoDroga || '',
          tipoSanguineo: info.tipoSanguineo || '',
          medicamentos: info.medicamentos || '',
          doadorSangue: info.doadorSangue || false,
          doadorOrgaos: info.doadorOrgaos || false,
          doencaPreexistente: info.doencaPreexistente || false,
          descricaoDoencaPreexistente: info.descricaoDoencaPreexistente || '',
          historicoFamiliar: info.historicoFamiliar || false,
          descricaoHistoricoFamiliar: info.descricaoHistoricoFamiliar || '',
          teveCovid: info.teveCovid || false,
          ultimoContagio: info.ultimoContagio || '',
          teveSequela: info.teveSequela || false,
          descricaoSequela: info.descricaoSequela || '',
          foiInternado: info.foiInternado || false,
          diasInternacao: info.diasInternacao || 0,
          foiIntubado: info.foiIntubado || false,
          allergy: info.allergy || false,
          descricaoAlergia: info.descricaoAlergia || '',
          acompanhamentoMedico: info.acompanhamentoMedico || false,
          acompanhamentoMedicoMotivo: info.acompanhamentoMedicoMotivo || '',
          acompanhamentoReabilitacao: info.acompanhamentoReabilitacao || false,
          usoAlcool: info.usoAlcool || false,
          dosesAlcool: info.dosesAlcool || 0,
          usoCigarro: info.usoCigarro || false,
          macosCigarro: info.macosCigarro || 0,
          usoOutraDroga: info.usoOutraDroga || false,
          outraDrogaDescricao: info.outraDrogaDescricao || '',
          frequenciaUso: info.frequenciaUso || '',
          gestante: info.gestante || false,
          dataUltimaMenstruacao: info.dataUltimaMenstruacao || '',
          semanasGestacao: info.semanasGestacao || 0,
          dataPartoPrevista: info.dataPartoPrevista || '',
          preNatal: info.preNatal || false,
          lactante: info.lactante || false,
          complicacoesGestacao: info.complicacoesGestacao || '',
          limitacao: info.limitacao || false,
          tipoLimitacao: info.tipoLimitacao || '',
          descricaoLimitacao: info.descricaoLimitacao || '',
          causaLimitacao: info.causaLimitacao || '',
          parteCorpoAtingida: info.parteCorpoAtingida || '',
          necessitaAdaptacao: info.necessitaAdaptacao || false,
          descricaoAdaptacao: info.descricaoAdaptacao || '',
          readaptacaoProfissional: info.readaptacaoProfissional || false,
          descricaoReadaptacao: info.descricaoReadaptacao || '',
          exames: {
            realizados: info.exames?.[0]?.realizados || '',
            resultados: info.exames?.[0]?.resultados || '',
            periodicidade: info.exames?.[0]?.periodicidade || '',
            anexos: info.exames?.[0]?.anexos?.map(a => ({ id: a.id || a, nome: a.nome || a })) || [],
          },
          observacoes: info.observacoes || '',
        });
      } else {
        toast.error('Informações não encontradas');
        navigate(`/trabalhadores/${id}/informacoes`);
      }
    } catch (error) {
      toast.error('Erro ao carregar informações');
    } finally {
      setIsCarregando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (name.startsWith('exames.')) {
      const field = name.replace('exames.', '');
      setFormData({
        ...formData,
        exames: { ...formData.exames, [field]: finalValue },
      });
    } else {
      setFormData({
        ...formData,
        [name]: finalValue,
      });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === '' ? 0 : parseInt(value, 10) || 0,
    });
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos');
      return;
    }

    setIsUploadingFile(true);
    try {
      const upload = await uploadService.criar(file, 'informacao', infoId || id!, file.name);
      setFormData({
        ...formData,
        exames: {
          ...formData.exames,
          anexos: [...formData.exames.anexos, { id: upload._id!, nome: file.name }],
        },
      });
      toast.success('PDF enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar PDF');
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (uploadId: string) => {
    setFormData({
      ...formData,
      exames: {
        ...formData.exames,
        anexos: formData.exames.anexos.filter((a) => a.id !== uploadId),
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { ...formData, exames: [formData.exames] };
      if (isEdicao && infoId) {
        await informacaoService.atualizar(id!, infoId, payload as any);
        toast.success('Informações atualizadas com sucesso!');
      } else {
        await informacaoService.criar(id!, payload as any);
        toast.success('Informações salvas com sucesso!');
      }
      navigate(`/trabalhadores/${id}/informacoes`);
    } catch (error) {
      toast.error(isEdicao ? 'Erro ao atualizar informações' : 'Erro ao salvar informações');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-purple-600';
  const labelCls = 'block text-sm font-bold text-slate-600 mb-2';
  const selectCls = 'w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm';

  if (isCarregando) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/trabalhadores/${id}/informacoes`)}
            className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Informações' : 'Novas Informações'}
            </h1>
            {trabalhador && (
              <p className="text-slate-500 font-medium">
                Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Seção: Dados de Saúde */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Stethoscope size={20} />
                Dados de Saúde
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Doença de Base</label>
                  <select
                    name="doencaBase"
                    value={formData.doencaBase}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Selecione...</option>
                    {doencasBase.map((d) => (
                      <option key={d.nome} value={d.nome}>{d.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Estado Vacinal</label>
                  <select
                    name="estadoVacinal"
                    value={formData.estadoVacinal}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Selecione...</option>
                    {estadosVacinas.map((e) => (
                      <option key={e.nome} value={e.nome}>{e.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo Sanguíneo</label>
                  <select
                    name="tipoSanguineo"
                    value={formData.tipoSanguineo}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Selecione...</option>
                    {tiposSanguineos.map((t) => (
                      <option key={t.nome} value={t.nome}>{t.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Medicamentos</label>
                  <input
                    type="text"
                    name="medicamentos"
                    value={formData.medicamentos}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Medicamentos em uso"
                  />
                </div>
              </div>

              {/* Doador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-emerald-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="doadorSangue"
                    id="doadorSangue"
                    checked={formData.doadorSangue}
                    onChange={handleChange}
                    className="w-5 h-5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="doadorSangue" className="text-sm font-bold text-slate-600">
                    Doador de Sangue
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="doadorOrgaos"
                    id="doadorOrgaos"
                    checked={formData.doadorOrgaos}
                    onChange={handleChange}
                    className="w-5 h-5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="doadorOrgaos" className="text-sm font-bold text-slate-600">
                    Doador de Órgãos
                  </label>
                </div>
              </div>

              {/* Doenças Preexistentes */}
              <div className="p-6 bg-rose-50 rounded-2xl space-y-4 mt-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="doencaPreexistente"
                    id="doencaPreexistente"
                    checked={formData.doencaPreexistente}
                    onChange={handleChange}
                    className="w-5 h-5 text-rose-600 rounded border-rose-300 focus:ring-rose-500"
                  />
                  <label htmlFor="doencaPreexistente" className="text-sm font-bold text-slate-600">
                    Possui doença preexistente?
                  </label>
                </div>
                {formData.doencaPreexistente && (
                  <div>
                    <label className={labelCls}>Descreva a(s) doença(s) preexistente(s)</label>
                    <textarea
                      name="descricaoDoencaPreexistente"
                      value={formData.descricaoDoencaPreexistente}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-rose-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                      placeholder="Ex: Hipertensão (CID I10), Diabetes tipo 2 (CID E11) — informar diagnóstico, tratamento e médico responsável..."
                    />
                  </div>
                )}
              </div>

              {/* Histórico Familiar */}
              <div className="p-6 bg-violet-50 rounded-2xl space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="historicoFamiliar"
                    id="historicoFamiliar"
                    checked={formData.historicoFamiliar}
                    onChange={handleChange}
                    className="w-5 h-5 text-violet-600 rounded border-violet-300 focus:ring-violet-500"
                  />
                  <label htmlFor="historicoFamiliar" className="text-sm font-bold text-slate-600">
                    Possui histórico familiar relevante?
                  </label>
                </div>
                {formData.historicoFamiliar && (
                  <div>
                    <label className={labelCls}>Descreva o histórico familiar</label>
                    <textarea
                      name="descricaoHistoricoFamiliar"
                      value={formData.descricaoHistoricoFamiliar}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-violet-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                      placeholder="Ex: Pai com hipertensão, mãe com diabetes, irmão com cardiopatia — informar o grau de parentesco e a condição..."
                    />
                  </div>
                )}
              </div>

              {/* COVID-19 */}
              <div className="p-6 bg-amber-50 rounded-2xl space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="teveCovid"
                    id="teveCovid"
                    checked={formData.teveCovid}
                    onChange={handleChange}
                    className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                  />
                  <label htmlFor="teveCovid" className="text-sm font-bold text-slate-600">
                    Já teve COVID-19?
                  </label>
                </div>
                {formData.teveCovid && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Último Contágio</label>
                      <input
                        type="date"
                        name="ultimoContagio"
                        value={formData.ultimoContagio}
                        onChange={handleChange}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-7">
                      <input
                        type="checkbox"
                        name="teveSequela"
                        id="teveSequela"
                        checked={formData.teveSequela}
                        onChange={handleChange}
                        className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                      />
                      <label htmlFor="teveSequela" className="text-sm font-bold text-slate-600">
                        Teve sequela?
                      </label>
                    </div>
                    {formData.teveSequela && (
                      <div className="md:col-span-2">
                        <label className={labelCls}>Descreva a(s) sequela(s)</label>
                        <textarea
                          name="descricaoSequela"
                          value={formData.descricaoSequela}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-4 py-3 bg-white border border-amber-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                          placeholder="Ex: Fadiga persistente, perda de olfato, problemas respiratórios..."
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-7">
                      <input
                        type="checkbox"
                        name="foiInternado"
                        id="foiInternado"
                        checked={formData.foiInternado}
                        onChange={handleChange}
                        className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                      />
                      <label htmlFor="foiInternado" className="text-sm font-bold text-slate-600">
                        Foi internado?
                      </label>
                    </div>
                    {formData.foiInternado && (
                      <>
                        <div>
                          <label className={labelCls}>Dias de Internação</label>
                          <input
                            type="number"
                            name="diasInternacao"
                            value={formData.diasInternacao}
                            onChange={handleNumberChange}
                            min="0"
                            className={inputCls}
                            placeholder="Quantidade de dias"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-7">
                          <input
                            type="checkbox"
                            name="foiIntubado"
                            id="foiIntubado"
                            checked={formData.foiIntubado}
                            onChange={handleChange}
                            className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                          />
                          <label htmlFor="foiIntubado" className="text-sm font-bold text-slate-600">
                            Foi intubado?
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Seção: Alergias */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <AlertCircle size={20} />
                Alergias
              </h3>
              <div className="p-6 bg-red-50 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="allergy"
                    id="allergy"
                    checked={formData.allergy}
                    onChange={handleChange}
                    className="w-5 h-5 text-red-600 rounded border-red-300 focus:ring-red-500"
                  />
                  <label htmlFor="allergy" className="text-sm font-bold text-slate-600">
                    Tem algum tipo de alergia?
                  </label>
                </div>
                {formData.allergy && (
                  <div>
                    <label className={labelCls}>Descrição da(s) alergia(s)</label>
                    <textarea
                      name="descricaoAlergia"
                      value={formData.descricaoAlergia}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-red-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      placeholder="Descreva as alergias..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Seção: Acompanhamentos */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Heart size={20} />
                Acompanhamentos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="acompanhamentoMedico"
                      id="acompanhamentoMedico"
                      checked={formData.acompanhamentoMedico}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                    />
                    <label htmlFor="acompanhamentoMedico" className="text-sm font-bold text-slate-600">
                      Acompanhamento médico?
                    </label>
                  </div>
                  {formData.acompanhamentoMedico && (
                    <div>
                      <label className={labelCls}>Motivo do Acompanhamento</label>
                      <textarea
                        name="acompanhamentoMedicoMotivo"
                        value={formData.acompanhamentoMedicoMotivo}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Descreva o motivo do acompanhamento médico..."
                      />
                    </div>
                  )}
                </div>
                <div className="p-4 bg-green-50 rounded-2xl space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="acompanhamentoReabilitacao"
                      id="acompanhamentoReabilitacao"
                      checked={formData.acompanhamentoReabilitacao}
                      onChange={handleChange}
                      className="w-5 h-5 text-green-600 rounded border-green-300 focus:ring-green-500"
                    />
                    <label htmlFor="acompanhamentoReabilitacao" className="text-sm font-bold text-slate-600">
                      Acompanhamento reabilitação?
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {trabalhador?.sexo?.[0] === 'F' && (
            <>
            {/* Seção: Gestação/Lactação */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Baby size={20} />
                Gestação / Lactação
              </h3>
              <div className="p-6 bg-pink-50 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="gestante"
                    id="gestante"
                    checked={formData.gestante}
                    onChange={handleChange}
                    className="w-5 h-5 text-pink-600 rounded border-pink-300 focus:ring-pink-500"
                  />
                  <label htmlFor="gestante" className="text-sm font-bold text-slate-600">
                    Está gestante?
                  </label>
                </div>
                {formData.gestante && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Data da Última Menstruação (DUM)</label>
                      <input
                        type="date"
                        name="dataUltimaMenstruacao"
                        value={formData.dataUltimaMenstruacao}
                        onChange={handleChange}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Semanas de Gestação</label>
                      <input
                        type="number"
                        name="semanasGestacao"
                        value={formData.semanasGestacao}
                        onChange={handleNumberChange}
                        min="0"
                        max="45"
                        className={inputCls}
                        placeholder="Ex: 20"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Data Prevista para o Parto</label>
                      <input
                        type="date"
                        name="dataPartoPrevista"
                        value={formData.dataPartoPrevista}
                        onChange={handleChange}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-7">
                      <input
                        type="checkbox"
                        name="preNatal"
                        id="preNatal"
                        checked={formData.preNatal}
                        onChange={handleChange}
                        className="w-5 h-5 text-pink-600 rounded border-pink-300 focus:ring-pink-500"
                      />
                      <label htmlFor="preNatal" className="text-sm font-bold text-slate-600">
                        Realiza acompanhamento pré-natal?
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Complicações / Observações</label>
                      <textarea
                        name="complicacoesGestacao"
                        value={formData.complicacoesGestacao}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 bg-white border border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                        placeholder="Descreva intercorrências, complicações ou observações relevantes..."
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-2 border-t border-pink-200">
                  <input
                    type="checkbox"
                    name="lactante"
                    id="lactante"
                    checked={formData.lactante}
                    onChange={handleChange}
                    className="w-5 h-5 text-pink-600 rounded border-pink-300 focus:ring-pink-500"
                  />
                  <label htmlFor="lactante" className="text-sm font-bold text-slate-600">
                    Está em período de lactação?
                  </label>
                </div>
              </div>
            </div>
            </>
            )}

            {/* Seção: Limitações */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Accessibility size={20} />
                Limitações
              </h3>
              <div className="p-6 bg-orange-50 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="limitacao"
                    id="limitacao"
                    checked={formData.limitacao}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                  />
                  <label htmlFor="limitacao" className="text-sm font-bold text-slate-600">
                    Possui alguma limitação?
                  </label>
                </div>
                {formData.limitacao && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Tipo de Limitação</label>
                      <select
                        name="tipoLimitacao"
                        value={formData.tipoLimitacao}
                        onChange={handleChange}
                        className={selectCls}
                      >
                        <option value="">Selecione...</option>
                        <option value="Física">Física</option>
                        <option value="Cognitiva">Cognitiva</option>
                        <option value="Sensorial">Sensorial</option>
                        <option value="Psicológica/Emocional">Psicológica / Emocional</option>
                        <option value="Outra">Outra</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Origem / Causa</label>
                      <select
                        name="causaLimitacao"
                        value={formData.causaLimitacao}
                        onChange={handleChange}
                        className={selectCls}
                      >
                        <option value="">Selecione...</option>
                        <option value="Congênita">Congênita</option>
                        <option value="Acidente de trabalho">Acidente de trabalho</option>
                        <option value="Doença ocupacional">Doença ocupacional</option>
                        <option value="Doença não ocupacional">Doença não ocupacional</option>
                        <option value="Outra">Outra</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Descreva a limitação</label>
                      <textarea
                        name="descricaoLimitacao"
                        value={formData.descricaoLimitacao}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder="Descreva a limitação e seu impacto no dia a dia..."
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Parte do Corpo / Função Afetada</label>
                      <input
                        type="text"
                        name="parteCorpoAtingida"
                        value={formData.parteCorpoAtingida}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="Ex: Membros inferiores, visão, cognição..."
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-7">
                      <input
                        type="checkbox"
                        name="necessitaAdaptacao"
                        id="necessitaAdaptacao"
                        checked={formData.necessitaAdaptacao}
                        onChange={handleChange}
                        className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                      />
                      <label htmlFor="necessitaAdaptacao" className="text-sm font-bold text-slate-600">
                        Necessita de adaptação no trabalho?
                      </label>
                    </div>
                    {formData.necessitaAdaptacao && (
                      <div className="md:col-span-2">
                        <label className={labelCls}>Descreva as adaptações necessárias</label>
                        <textarea
                          name="descricaoAdaptacao"
                          value={formData.descricaoAdaptacao}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                          placeholder="Ex: Pausas frequentes, mobiliário adaptado, redução de carga horária..."
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-7">
                      <input
                        type="checkbox"
                        name="readaptacaoProfissional"
                        id="readaptacaoProfissional"
                        checked={formData.readaptacaoProfissional}
                        onChange={handleChange}
                        className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                      />
                      <label htmlFor="readaptacaoProfissional" className="text-sm font-bold text-slate-600">
                        Está em processo de readaptação profissional?
                      </label>
                    </div>
                    {formData.readaptacaoProfissional && (
                      <div className="md:col-span-2">
                        <label className={labelCls}>Descreva o processo de readaptação</label>
                        <textarea
                          name="descricaoReadaptacao"
                          value={formData.descricaoReadaptacao}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                          placeholder="Ex: Realocação de função, treinamento, acompanhamento médico..."
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Seção: Uso de Substâncias */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Wine size={20} />
                Uso de Substâncias
              </h3>

              {/* Álcool */}
              <div className="p-4 bg-yellow-50 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="usoAlcool"
                    id="usoAlcool"
                    checked={formData.usoAlcool}
                    onChange={handleChange}
                    className="w-5 h-5 text-yellow-600 rounded border-yellow-300 focus:ring-yellow-500"
                  />
                  <label htmlFor="usoAlcool" className="text-sm font-bold text-slate-600">
                    Usa álcool?
                  </label>
                </div>
                {formData.usoAlcool && (
                  <div>
                    <label className={labelCls}>Quantidade de doses diárias</label>
                    <input
                      type="number"
                      name="dosesAlcool"
                      value={formData.dosesAlcool}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none"
                      placeholder="Quantidade de doses"
                    />
                  </div>
                )}
              </div>

              {/* Cigarro */}
              <div className="p-4 bg-orange-50 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="usoCigarro"
                    id="usoCigarro"
                    checked={formData.usoCigarro}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                  />
                  <label htmlFor="usoCigarro" className="text-sm font-bold text-slate-600">
                    Usa cigarro?
                  </label>
                </div>
                {formData.usoCigarro && (
                  <div>
                    <label className={labelCls}>Quantidade de maços diários</label>
                    <input
                      type="number"
                      name="macosCigarro"
                      value={formData.macosCigarro}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Quantidade de maços"
                    />
                  </div>
                )}
              </div>

              {/* Outras Drogas */}
              <div className="p-4 bg-purple-50 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="usoOutraDroga"
                    id="usoOutraDroga"
                    checked={formData.usoOutraDroga}
                    onChange={handleChange}
                    className="w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
                  />
                  <label htmlFor="usoOutraDroga" className="text-sm font-bold text-slate-600">
                    Usa outras drogas?
                  </label>
                </div>
                {formData.usoOutraDroga && (
                  <div>
                    <div className="mb-2">
                      <label className={labelCls}>Tipo de droga</label>
                      <select
                        name="tipoDroga"
                        value={formData.tipoDroga}
                        onChange={handleChange}
                        className={selectCls}
                      >
                        <option value="">Selecione...</option>
                        {tiposDroga.map((t) => (
                          <option key={t.nome} value={t.nome}>{t.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Descrição das Substâncias</label>
                      <textarea
                        name="outraDrogaDescricao"
                        value={formData.outraDrogaDescricao}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 bg-white border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="Descreva as substâncias utilizadas..."
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Frequência de uso</label>
                      <input
                        type="text"
                        name="frequenciaUso"
                        value={formData.frequenciaUso}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Frequência de uso"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seção: Exames */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <ClipboardList size={20} />
                Exames
              </h3>
              <div className="p-6 bg-teal-50 rounded-2xl space-y-4">
                <div>
                  <label className={labelCls}>Exames Realizados</label>
                  <textarea
                    name="exames.realizados"
                    value={formData.exames.realizados}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-teal-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    placeholder="Descreva os exames realizados..."
                  />
                </div>
                <div>
                  <label className={labelCls}>Resultados</label>
                  <textarea
                    name="exames.resultados"
                    value={formData.exames.resultados}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-teal-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    placeholder="Resultados dos exames..."
                  />
                </div>
                <div>
                  <label className={labelCls}>Periodicidade</label>
                  <input
                    type="text"
                    name="exames.periodicidade"
                    value={formData.exames.periodicidade}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-teal-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    placeholder="Ex: Semestral, Anual, A cada 6 meses..."
                  />
                </div>
                <div className="border-t border-teal-200 pt-4">
                  <label className={labelCls}>Anexos (PDFs de Exames)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-teal-300 rounded-2xl cursor-pointer hover:bg-teal-50 transition-all text-teal-700 font-bold text-sm">
                      <FileUp size={18} />
                      {isUploadingFile ? 'Enviando...' : 'Selecionar PDF'}
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleUploadFile}
                        disabled={isUploadingFile}
                        className="hidden"
                      />
                    </label>
                    {isUploadingFile && <Loader2 size={20} className="animate-spin text-teal-600" />}
                  </div>
                  {formData.exames.anexos.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {formData.exames.anexos.map((anexo) => (
                        <li key={anexo.id} className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-teal-200">
                          <span className="text-sm font-medium text-slate-600 truncate max-w-[250px]">
                            {anexo.nome}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => uploadService.visualizar(anexo.id)}
                              className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-all"
                              title="Visualizar"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(anexo.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Remover"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Seção: Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <ClipboardList size={20} />
                Observações
              </h3>
              <div className="p-6 bg-slate-50 rounded-2xl">
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder="Observações gerais..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/trabalhadores/${id}/informacoes`)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-100 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={20} />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default FormInformacoes;
