import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { uploadService } from '../../../services/uploadService.js';
import { ITrabalhadorHistoricoPPP, ITrabalhador } from '../../../types/index.js';
import {
  FileText,
  ArrowLeft,
  Save,
  Calendar,
  AlertTriangle,
  Wind,
  Droplets,
  Activity,
  Info,
  CheckCircle2,
  Loader2,
  UserCheck,
  Stethoscope,
  FileSpreadsheet,
  FileUp,
  Download,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  dataInicio: string;
  dataFim: string;
  empresa: string;
  cargo: string;
  funcao: string;
  setor: string;
  descricaoAtividades: string;
  agentesQuimicos: string;
  agentesFisicos: string;
  agentesBiologicos: string;
  agentesErgonomicos: string;
  tecnicaMedicao: string;
  resultadoMedicao: string;
  limiteTolerancia: string;
  epcEficaz: boolean;
  epiEficaz: boolean;
  ltcatNumero: string;
  dataLtcat: string;
  responsavelNome: string;
  responsavelRegistro: string;
  dataExameMedico: string;
  resultadoExame: string;
  anexos: { id: string; nome: string }[];
  observacoes: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  dataInicio: '',
  dataFim: '',
  empresa: '',
  cargo: '',
  funcao: '',
  setor: '',
  descricaoAtividades: '',
  agentesQuimicos: '',
  agentesFisicos: '',
  agentesBiologicos: '',
  agentesErgonomicos: '',
  tecnicaMedicao: '',
  resultadoMedicao: '',
  limiteTolerancia: '',
  epcEficaz: false,
  epiEficaz: false,
  ltcatNumero: '',
  dataLtcat: '',
  responsavelNome: '',
  responsavelRegistro: '',
  dataExameMedico: '',
  resultadoExame: '',
  anexos: [],
  observacoes: '',
  ativo: true,
};

export const FormHistoricoPPP: React.FC = () => {
  const { id, pppId } = useParams<{ id: string; pppId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(pppId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && pppId) {
        carregarRegistro();
      }
    }
  }, [id, pppId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarRegistro = async () => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarHistoricoPPP(id!);
      const registro = lista.find((r: ITrabalhadorHistoricoPPP) => r._id === pppId);
      if (registro) {
        setFormData({
          dataInicio: registro.dataInicio ? registro.dataInicio.split('T')[0] : '',
          dataFim: registro.dataFim ? registro.dataFim.split('T')[0] : '',
          empresa: registro.empresa || '',
          cargo: registro.cargo || '',
          funcao: registro.funcao || '',
          setor: registro.setor || '',
          descricaoAtividades: registro.descricaoAtividades || '',
          agentesQuimicos: registro.agentesQuimicos || '',
          agentesFisicos: registro.agentesFisicos || '',
          agentesBiologicos: registro.agentesBiologicos || '',
          agentesErgonomicos: registro.agentesErgonomicos || '',
          tecnicaMedicao: registro.tecnicaMedicao || '',
          resultadoMedicao: registro.resultadoMedicao || '',
          limiteTolerancia: registro.limiteTolerancia || '',
          epcEficaz: registro.epcEficaz || false,
          epiEficaz: registro.epiEficaz || false,
          ltcatNumero: registro.ltcatNumero || '',
          dataLtcat: registro.dataLtcat ? registro.dataLtcat.split('T')[0] : '',
          responsavelNome: registro.responsavelNome || '',
          responsavelRegistro: registro.responsavelRegistro || '',
          dataExameMedico: registro.dataExameMedico ? registro.dataExameMedico.split('T')[0] : '',
          resultadoExame: registro.resultadoExame || '',
          anexos: registro.anexos || [],
          observacoes: registro.observacoes || '',
          ativo: registro.ativo !== false,
        });
      } else {
        toast.error('Registro não encontrado');
        navigate(`/trabalhadores/${id}/historico-ppp`);
      }
    } catch (error) {
      toast.error('Erro ao carregar registro');
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData.dataInicio) novoErros.dataInicio = 'Obrigatória';
    if (!formData.empresa.trim()) novoErros.empresa = 'Obrigatório';
    if (!formData.cargo.trim()) novoErros.cargo = 'Obrigatório';
    if (!formData.setor.trim()) novoErros.setor = 'Obrigatório';

    setErrors(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData({
      ...formData,
      [name]: finalValue,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
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
      const upload = await uploadService.criar(file, 'trabalhador', id!, file.name);
      setFormData({
        ...formData,
        anexos: [...formData.anexos, { id: upload._id!, nome: file.name }],
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
      anexos: formData.anexos.filter((a) => a.id !== uploadId),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      setIsLoading(true);

      const dados: Partial<ITrabalhadorHistoricoPPP> = {
        ...formData,
        anexos: formData.anexos,
        dataFim: formData.dataFim || undefined,
        descricaoAtividades: formData.descricaoAtividades || undefined,
        agentesQuimicos: formData.agentesQuimicos || undefined,
        agentesFisicos: formData.agentesFisicos || undefined,
        agentesBiologicos: formData.agentesBiologicos || undefined,
        agentesErgonomicos: formData.agentesErgonomicos || undefined,
        tecnicaMedicao: formData.tecnicaMedicao || undefined,
        resultadoMedicao: formData.resultadoMedicao || undefined,
        limiteTolerancia: formData.limiteTolerancia || undefined,
        ltcatNumero: formData.ltcatNumero || undefined,
        dataLtcat: formData.dataLtcat || undefined,
        responsavelNome: formData.responsavelNome || undefined,
        responsavelRegistro: formData.responsavelRegistro || undefined,
        dataExameMedico: formData.dataExameMedico || undefined,
        resultadoExame: formData.resultadoExame || undefined,
        observacoes: formData.observacoes || undefined,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarHistoricoPPP(id!, pppId!, dados);
        toast.success('Registro PPP atualizado!');
      } else {
        await submoduloTrabalhadorService.criarHistoricoPPP(id!, dados);
        toast.success('Registro PPP cadastrado!');
      }

      navigate(`/trabalhadores/${id}/historico-ppp`);
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCarregando) {
    return (
      <MainLayout>
        <DocumentTitle title="Formulário PPP" />
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando dados...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <DocumentTitle title="Formulário PPP" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/trabalhadores/${id}/historico-ppp`)}
            className="p-3 hover:bg-blue-50 rounded-2xl transition-all text-blue-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Registro PPP' : 'Novo Registro PPP'}
            </h1>
            {trabalhador && (
              <p className="text-slate-500 font-medium">
                Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Período e Vínculo */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Período e Vínculo</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data de Início <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    />
                    {errors.dataInicio && <p className="mt-1 text-xs text-red-500 font-bold">{errors.dataInicio}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data de Término</label>
                    <input
                      type="date"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Empresa <span className="text-red-500">*</span></label>
                    <input
                      required
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                      placeholder="Nome da empresa"
                    />
                    {errors.empresa && <p className="mt-1 text-xs text-red-500 font-bold">{errors.empresa}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Cargo <span className="text-red-500">*</span></label>
                    <input
                      required
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                      placeholder="Cargo ocupado"
                    />
                    {errors.cargo && <p className="mt-1 text-xs text-red-500 font-bold">{errors.cargo}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Função</label>
                    <input
                      name="funcao"
                      value={formData.funcao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Função exercida"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Setor <span className="text-red-500">*</span></label>
                    <input
                      required
                      name="setor"
                      value={formData.setor}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Setor de trabalho"
                    />
                    {errors.setor && <p className="mt-1 text-xs text-red-500 font-bold">{errors.setor}</p>}
                  </div>
                </div>
              </div>

              {/* Descrição das Atividades */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Atividades Exercidas</h2>
                </div>
                <div className="p-8">
                  <textarea
                    name="descricaoAtividades"
                    value={formData.descricaoAtividades}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="Descreva as atividades exercidas pelo trabalhador neste período..."
                  />
                </div>
              </div>

              {/* Exposição a Agentes Nocivos */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Exposição a Agentes Nocivos</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                      <Wind size={16} className="text-red-500" />
                      Agentes Químicos
                    </label>
                    <input
                      name="agentesQuimicos"
                      value={formData.agentesQuimicos}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Ex: sílica, solventes, poeira"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                      <Activity size={16} className="text-amber-500" />
                      Agentes Físicos
                    </label>
                    <input
                      name="agentesFisicos"
                      value={formData.agentesFisicos}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Ex: ruído, vibração, calor"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                      <Droplets size={16} className="text-emerald-500" />
                      Agentes Biológicos
                    </label>
                    <input
                      name="agentesBiologicos"
                      value={formData.agentesBiologicos}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Ex: vírus, bactérias, fungos"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                      <Activity size={16} className="text-purple-500" />
                      Agentes Ergonômicos
                    </label>
                    <input
                      name="agentesErgonomicos"
                      value={formData.agentesErgonomicos}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Ex: repetitividade, postura"
                    />
                  </div>
                </div>
              </div>

              {/* Monitoramento Ambiental */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Wind size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Monitoramento Ambiental</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Técnica de Medição</label>
                    <input
                      name="tecnicaMedicao"
                      value={formData.tecnicaMedicao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Ex: dosimetria, amostragem"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Resultado da Medição</label>
                    <input
                      name="resultadoMedicao"
                      value={formData.resultadoMedicao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Valor medido"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Limite de Tolerância (LT)</label>
                    <input
                      name="limiteTolerancia"
                      value={formData.limiteTolerancia}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Ex: 85 dB(A)"
                    />
                  </div>
                </div>
              </div>

              {/* EPC / EPI */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">EPC e EPI</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      name="epcEficaz"
                      checked={formData.epcEficaz}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 transition-all"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">EPC Eficaz</span>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Equipamento de Proteção Coletiva</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      name="epiEficaz"
                      checked={formData.epiEficaz}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 transition-all"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">EPI Eficaz</span>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Equipamento de Proteção Individual</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* LTCAT */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">LTCAT</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Nº do Laudo</label>
                    <input
                      name="ltcatNumero"
                      value={formData.ltcatNumero}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Número do LTCAT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data do Laudo</label>
                    <input
                      type="date"
                      name="dataLtcat"
                      value={formData.dataLtcat}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Responsável Técnico */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <UserCheck size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Responsável Técnico</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Nome do Responsável</label>
                    <input
                      name="responsavelNome"
                      value={formData.responsavelNome}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Registro Profissional</label>
                    <input
                      name="responsavelRegistro"
                      value={formData.responsavelRegistro}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Ex: CREA, CRM"
                    />
                  </div>
                </div>
              </div>

              {/* Exames Médicos Ocupacionais */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Stethoscope size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Exame Médico Ocupacional</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Data do Exame</label>
                      <input
                        type="date"
                        name="dataExameMedico"
                        value={formData.dataExameMedico}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Resultado</label>
                      <input
                        name="resultadoExame"
                        value={formData.resultadoExame}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Ex: Apto, Inapto, Apto com restrições"
                      />
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Anexos (PDFs dos Exames)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-2 border-dashed border-blue-300 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all text-blue-700 font-bold text-sm">
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
                      {isUploadingFile && <Loader2 size={20} className="animate-spin text-blue-600" />}
                    </div>
                    {formData.anexos.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {formData.anexos.map((anexo) => (
                          <li key={anexo.id} className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                            <span className="text-sm font-medium text-slate-600 truncate max-w-[250px]">
                              {anexo.nome}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => uploadService.visualizar(anexo.id)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
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

              {/* Observações */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Observações</h2>
                </div>
                <div className="p-8">
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="Informações adicionais sobre este período..."
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Controle</h2>
                </div>
                <div className="p-8 space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 transition-all"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Registro Ativo?</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Desmarque se encerrado</span>
                    </div>
                  </label>

                  <div className="pt-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold">Informações do PPP</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      O Perfil Profissiográfico Previdenciário (PPP) é o documento que registra o histórico laboral e a exposição a agentes nocivos.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEdicao ? 'Salvar Alterações' : 'Registrar PPP'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/trabalhadores/${id}/historico-ppp`)}
                className="w-full px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-3xl font-bold transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default FormHistoricoPPP;
