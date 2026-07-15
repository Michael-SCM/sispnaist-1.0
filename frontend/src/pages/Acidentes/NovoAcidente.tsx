import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useAcidenteStore } from '../../store/acidenteStore.js';
import { acidenteService } from '../../services/acidenteService.js';
import { IAcidente } from '../../types/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { useCatalogo } from '../../hooks/useCatalogo.js';
import {
  AlertTriangle,
  ArrowLeft,
  Save,
  User,
  Calendar,
  MapPin,
  FileText,
  Info,
  Clock,
  CheckCircle2,
  X,
  Stethoscope,
  ShieldAlert,
  Heart,
  Building,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { maskCPF, unmaskCPF } from '../../utils/cpfMask';
import { esocialService, EsocialS2210 } from '../../services/esocialService.js';
import { DocumentTitle } from '../../hooks/useDocumentTitle.js';
import { ModalSelecaoESocial } from '../../components/ModalSelecaoESocial.js';
import { filtrarUltimos30Dias } from '../../utils/filtrarUltimos30Dias.js';


interface FormData {
  trabalhadorId: string;
  dataAcidente: string;
  horario: string;
  horarioAposInicioJornada: string;
  tipoAcidente: string;
  tipoTrauma: string;
  agenteCausador: string;
  parteCorpo: string;
  descricao: string;
  descricaoTrauma: string;
  local: string;
  lesoes: string[];
  feriado: boolean;
  comunicado: boolean;
  dataComunicacao: string;
  dataNotificacao: string;
  // Atendimento médico
  atendimentoMedico: boolean;
  dataAtendimento: string;
  horaAtendimento: string;
  unidadeAtendimento: string;

  // Internamento
  internamento: boolean;
  duracaoInternamento: number;

  // CAT/NAS
  catNas: boolean;

  // e-Social S-2210 (CAT)
  catNumero: string;
  catDataEmissao: string;
  catTipo: string;
  emitenteCat: string;
  cidLesao: string;
  dataObito: string;

  // Registro Policial
  registroPolicial: boolean;

  // Encaminhamento junta médica
  encaminhamentoJuntaMedica: boolean;

  // Afastamento
  afastamento: boolean;

  // Outros trabalhadores
  outrosTrabalhadoresAtingidos: boolean;
  quantidadeTrabalhadoresAtingidos: number;

  status: 'Aberto' | 'Em Análise' | 'Fechado';
}

const INITIAL_FORM: FormData = {
  trabalhadorId: '',
  dataAcidente: '',
  horario: '',
  horarioAposInicioJornada: '',
  tipoAcidente: '',
  tipoTrauma: '',
  agenteCausador: '',
  parteCorpo: '',
  descricao: '',
  descricaoTrauma: '',
  local: '',
  lesoes: [],
  feriado: false,
  comunicado: false,
  dataComunicacao: '',
  dataNotificacao: '',
  atendimentoMedico: false,
  dataAtendimento: '',
  horaAtendimento: '',
  unidadeAtendimento: '',
  internamento: false,
  duracaoInternamento: 0,
  catNas: false,
  catNumero: '',
  catDataEmissao: '',
  catTipo: '',
  emitenteCat: '',
  cidLesao: '',
  dataObito: '',
  registroPolicial: false,
  encaminhamentoJuntaMedica: false,
  afastamento: false,
  outrosTrabalhadoresAtingidos: false,
  quantidadeTrabalhadoresAtingidos: 0,
  status: 'Aberto',
};

const TIPOS_ACIDENTE = [
  { value: 'Típico', label: 'Acidente Típico' },
  { value: 'Trajeto', label: 'Acidente de Trajeto' },
  { value: 'Doença Ocupacional', label: 'Doença Ocupacional' },
  { value: 'Acidente com Material Biológico', label: 'Material Biológico' },
  { value: 'Violência', label: 'Violência' },
];

export const NovoAcidente: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { adicionarAcidente } = useAcidenteStore();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [trabalhadorNome, setTrabalhadorNome] = useState<string | null>(null);
  const [novaLesao, setNovaLesao] = useState('');
  const [modalItens, setModalItens] = useState<EsocialS2210[]>([]);
  const [modalAberto, setModalAberto] = useState(false);

  // Catálogos
  const { itens: tiposTrauma } = useCatalogo('tipoTrauma');
  const { itens: agentesCausador } = useCatalogo('causadorTrauma');
  const { itens: partesCorpo } = useCatalogo('parteCorpo');

  // Buscar trabalhador por CPF
  useEffect(() => {
    const buscarTrabalhador = async () => {
      if (formData.trabalhadorId.length >= 14) {
        try {
          const t = await trabalhadorService.buscarPorCpf(formData.trabalhadorId);
          if (t) {
            setTrabalhadorNome(t.nome);
          } else {
            setTrabalhadorNome(null);
          }
        } catch (error) {
          console.error('Erro ao buscar trabalhador:', error);
          setTrabalhadorNome(null);
        }
      } else {
        setTrabalhadorNome(null);
      }
    };

    const timer = setTimeout(buscarTrabalhador, 500);
    return () => clearTimeout(timer);
  }, [formData.trabalhadorId]);

  const validar = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.trabalhadorId) newErrors.trabalhadorId = 'Trabalhador é obrigatório';
    if (!formData.dataAcidente) newErrors.dataAcidente = 'Data é obrigatória';
    if (!formData.tipoAcidente) newErrors.tipoAcidente = 'Tipo é obrigatório';
    if (!formData.tipoTrauma) newErrors.tipoTrauma = 'Tipo de trauma é obrigatório';
    if (!formData.agenteCausador) newErrors.agenteCausador = 'Agente causador é obrigatório';
    if (!formData.parteCorpo) newErrors.parteCorpo = 'Parte do corpo é obrigatória';
    if (!formData.local) newErrors.local = 'Local é obrigatório';
    if (!formData.lesoes || formData.lesoes.length === 0) newErrors.lesoes = 'Adicione pelo menos uma lesão';
    if (!formData.descricao || formData.descricao.length < 10) {
      newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? 0 : parseInt(value, 10) || 0,
    }));
  };

  const handleAddLesao = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && novaLesao.trim()) {
      e.preventDefault();
      if (!formData.lesoes.includes(novaLesao.trim())) {
        setFormData(prev => ({
          ...prev,
          lesoes: [...prev.lesoes, novaLesao.trim()]
        }));
      }
      setNovaLesao('');
    }
  };

  const removerLesao = (lesao: string) => {
    setFormData(prev => ({
      ...prev,
      lesoes: prev.lesoes.filter(l => l !== lesao)
    }));
  };

  const aplicarCat = (cat: EsocialS2210) => {
    setFormData((prev) => ({
      ...prev,
      catNas: true,
      catNumero: cat.catNumero || '',
      catDataEmissao: cat.catDataEmissao ? cat.catDataEmissao.split('T')[0] : '',
      catTipo: cat.catTipo || '',
      emitenteCat: cat.emitenteCat || '',
      cidLesao: cat.cid || '',
    }));
    toast.success(`Dados da CAT ${cat.catNumero} carregados do e-Social`);
  };

  const handleConsultarEsocial = async () => {
    const cpf = formData.trabalhadorId.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) {
      toast.error('Informe um CPF válido do trabalhador para consultar o e-Social');
      return;
    }
    try {
      const dados = await esocialService.buscarPorCpf(cpf);
      const catList = dados.eventos?.s2210;
      if (!catList || catList.length === 0) {
        toast('Nenhuma CAT encontrada no e-Social para este trabalhador', { icon: 'ℹ️' });
        return;
      }
      const recentes = filtrarUltimos30Dias(catList, 'dataAcidente');
      if (recentes.length === 0) {
        toast('Nenhuma CAT nos últimos 30 dias encontrada no e-Social', { icon: 'ℹ️' });
        return;
      }
      if (recentes.length === 1) {
        aplicarCat(recentes[0]);
        return;
      }
      setModalItens(recentes);
      setModalAberto(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Trabalhador não encontrado no e-Social');
      } else {
        toast.error(error.message || 'Erro ao consultar e-Social');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsLoading(true);

      const converterDataLocal = (dataString: string): string => {
        if (!dataString) return '';
        const [year, month, day] = dataString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        return date.toISOString();
      };

      // Remove campos vazios para evitar erros de validação no backend
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );
      const acidenteData: Partial<IAcidente> = {
        ...payload,
        // Backend valida CPF no formato XXX.XXX.XXX-XX
        trabalhadorId: maskCPF(formData.trabalhadorId || user?._id || ''),
        dataAcidente: formData.dataAcidente ? converterDataLocal(formData.dataAcidente) : undefined,
        dataComunicacao: formData.comunicado && formData.dataComunicacao
          ? converterDataLocal(formData.dataComunicacao)
          : undefined,
        dataNotificacao: formData.dataNotificacao
          ? converterDataLocal(formData.dataNotificacao)
          : undefined,
        dataAtendimento: formData.dataAtendimento
          ? converterDataLocal(formData.dataAtendimento)
          : undefined,
        catDataEmissao: formData.catDataEmissao
          ? converterDataLocal(formData.catDataEmissao)
          : undefined,
        dataObito: formData.dataObito
          ? converterDataLocal(formData.dataObito)
          : undefined,
      };

      const novoAcidente = await acidenteService.criar(acidenteData);
      adicionarAcidente(novoAcidente);

      toast.success('Acidente registrado com sucesso!');
      navigate('/acidentes');
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao registrar acidente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <DocumentTitle title="Novo Acidente" />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/acidentes')}
            className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Novo Acidente</h1>
            <p className="text-slate-500 font-medium">Registre uma nova ocorrência de trabalho</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Identificação do Trabalhador */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <User size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Identificação do Trabalhador</h2>
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">CPF do Trabalhador <span className="text-red-500">*</span></label>
                    <input
                      required
                      name="trabalhadorId"
                      value={maskCPF(formData.trabalhadorId)}
                      onChange={(e) => {
                        const unmasked = unmaskCPF(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          trabalhadorId: unmasked,
                        }));
                        if (errors.trabalhadorId) {
                          setErrors((prev) => ({ ...prev, trabalhadorId: '' }));
                        }
                      }}
                      className={`w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono ${
                        errors.trabalhadorId ? 'ring-2 ring-red-500' : ''
                      }`}
                      placeholder="000.000.000-00"
                    />

                    {trabalhadorNome && (
                      <div className="mt-2 flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg w-fit">
                        <CheckCircle2 size={14} />
                        {trabalhadorNome}
                      </div>
                    )}
                    {errors.trabalhadorId && <p className="mt-1 text-xs text-red-500 font-bold">{errors.trabalhadorId}</p>}
                  </div>
                </div>
              </div>

              {/* Dados da Ocorrência */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados da Ocorrência</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data do Acidente <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      name="dataAcidente"
                      value={formData.dataAcidente}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data da Notificação</label>
                    <input
                      type="date"
                      name="dataNotificacao"
                      value={formData.dataNotificacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Horário</label>
                    <input
                      type="time"
                      name="horario"
                      value={formData.horario}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Horário após início da jornada</label>
                    <input
                      type="time"
                      name="horarioAposInicioJornada"
                      value={formData.horarioAposInicioJornada}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Acidente <span className="text-red-500">*</span></label>
                    <select
                      required
                      name="tipoAcidente"
                      value={formData.tipoAcidente}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-amber-600"
                    >
                      <option value="">Selecione o tipo...</option>
                      {TIPOS_ACIDENTE.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Trauma <span className="text-red-500">*</span></label>
                    <select
                      required
                      name="tipoTrauma"
                      value={formData.tipoTrauma}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {tiposTrauma.map(t => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                    {errors.tipoTrauma && <p className="mt-1 text-xs text-red-500 font-bold">{errors.tipoTrauma}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Agente Causador <span className="text-red-500">*</span></label>
                    <select
                      required
                      name="agenteCausador"
                      value={formData.agenteCausador}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {agentesCausador.map(a => (
                        <option key={a.nome} value={a.nome}>{a.nome}</option>
                      ))}
                    </select>
                    {errors.agenteCausador && <p className="mt-1 text-xs text-red-500 font-bold">{errors.agenteCausador}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Parte do Corpo <span className="text-red-500">*</span></label>
                    <select
                      required
                      name="parteCorpo"
                      value={formData.parteCorpo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {partesCorpo.map(p => (
                        <option key={p.nome} value={p.nome}>{p.nome}</option>
                      ))}
                    </select>
                    {errors.parteCorpo && <p className="mt-1 text-xs text-red-500 font-bold">{errors.parteCorpo}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2 text-amber-600">Descrição do Acidente <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                      placeholder="Descreva minuciosamente o ocorrido..."
                    />
                    {errors.descricao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.descricao}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Descrição do Trauma</label>
                    <textarea
                      name="descricaoTrauma"
                      value={formData.descricaoTrauma}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                      placeholder="Descreva o trauma..."
                    />
                  </div>
                </div>
              </div>

              {/* Local e Lesões */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <MapPin size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Local & Consequências</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Local do Acidente <span className="text-red-500">*</span></label>
                      <input
                        required
                        name="local"
                        value={formData.local}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                        placeholder="Ex: Almoxarifado Central"
                      />
                      {errors.local && <p className="mt-1 text-xs text-red-500 font-bold">{errors.local}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Lesões Identificadas <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.lesoes.map(lesao => (
                          <span key={lesao} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-amber-100">
                            {lesao}
                            <button type="button" onClick={() => removerLesao(lesao)} className="hover:text-red-500">
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        value={novaLesao}
                        onChange={(e) => setNovaLesao(e.target.value)}
                        onKeyDown={handleAddLesao}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                        placeholder="Digite a lesão e pressione Enter..."
                      />
                      {errors.lesoes && <p className="mt-1 text-xs text-red-500 font-bold">{errors.lesoes}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Atendimento Médico */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Stethoscope size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Atendimento Médico</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="atendimentoMedico"
                      id="atendimentoMedico"
                      checked={formData.atendimentoMedico}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="atendimentoMedico" className="text-sm font-bold text-slate-600">
                      Houve atendimento médico?
                    </label>
                  </div>
                  {formData.atendimentoMedico && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-blue-50 rounded-2xl">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Data</label>
                        <input
                          type="date"
                          name="dataAtendimento"
                          value={formData.dataAtendimento}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Hora</label>
                        <input
                          type="time"
                          name="horaAtendimento"
                          value={formData.horaAtendimento}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Unidade</label>
                        <input
                          name="unidadeAtendimento"
                          value={formData.unidadeAtendimento}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Nome da unidade"
                        />
                      </div>
                    </div>
                  )}

                  {/* Internamento */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="internamento"
                      id="internamento"
                      checked={formData.internamento}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="internamento" className="text-sm font-bold text-slate-600">
                      Houve internamento?
                    </label>
                  </div>
                  {formData.internamento && (
                    <div className="p-4 bg-orange-50 rounded-2xl">
                      <label className="block text-sm font-bold text-slate-600 mb-2">Duração (horas)</label>
                      <input
                        type="number"
                        name="duracaoInternamento"
                        value={formData.duracaoInternamento}
                        onChange={handleNumberChange}
                        min="0"
                        className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Quantidade de horas"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Dados da CAT / e-Social (S-2210) */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados da CAT / e-Social (S-2210)</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="catNas"
                      id="catNas"
                      checked={formData.catNas}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="catNas" className="text-sm font-bold text-slate-600">
                      CAT Emitida?
                    </label>
                    <button
                      type="button"
                      onClick={handleConsultarEsocial}
                      className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Search size={14} />
                      Consultar e-Social
                    </button>
                  </div>

                  {formData.catNas && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-red-50 rounded-2xl">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Número da CAT</label>
                        <input
                          type="text"
                          name="catNumero"
                          value={formData.catNumero}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none"
                          placeholder="Ex: CAT-2025-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Data de Emissão</label>
                        <input
                          type="date"
                          name="catDataEmissao"
                          value={formData.catDataEmissao}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Tipo</label>
                        <select
                          name="catTipo"
                          value={formData.catTipo}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none"
                        >
                          <option value="">Selecione</option>
                          <option value="inicial">Inicial</option>
                          <option value="reabertura">Reabertura</option>
                          <option value="comunicacao">Comunicação</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Emitente</label>
                        <select
                          name="emitenteCat"
                          value={formData.emitenteCat}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none"
                        >
                          <option value="">Selecione</option>
                          <option value="empregador">Empregador</option>
                          <option value="trabalhador">Trabalhador</option>
                          <option value="sindico">Sindicato</option>
                          <option value="medico">Médico</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">CID da Lesão</label>
                        <input
                          type="text"
                          name="cidLesao"
                          value={formData.cidLesao}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-mono"
                          placeholder="Ex: S61.0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Outros Campos */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações Adicionais</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-blue-50 rounded-xl">
                      <input
                        type="checkbox"
                        name="registroPolicial"
                        checked={formData.registroPolicial}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Registro Policial?</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-purple-50 rounded-xl">
                      <input
                        type="checkbox"
                        name="encaminhamentoJuntaMedica"
                        checked={formData.encaminhamentoJuntaMedica}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Junta Médica?</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-green-50 rounded-xl">
                      <input
                        type="checkbox"
                        name="afastamento"
                        checked={formData.afastamento}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Afastamento?</span>
                    </label>
                  </div>

                  {/* Outros trabalhadores atingidos */}
                  <div className="p-4 bg-yellow-50 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="outrosTrabalhadoresAtingidos"
                        id="outrosTrabalhadoresAtingidos"
                        checked={formData.outrosTrabalhadoresAtingidos}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-yellow-600 focus:ring-yellow-500"
                      />
                      <label htmlFor="outrosTrabalhadoresAtingidos" className="text-sm font-bold text-slate-600">
                        Outros trabalhadores foram atingidos?
                      </label>
                    </div>
                    {formData.outrosTrabalhadoresAtingidos && (
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Quantidade</label>
                        <input
                          type="number"
                          name="quantidadeTrabalhadoresAtingidos"
                          value={formData.quantidadeTrabalhadoresAtingidos}
                          onChange={handleNumberChange}
                          min="0"
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none"
                          placeholder="Quantidade de trabalhadores"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Status & Comunicação</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Status Inicial</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-amber-600"
                    >
                      <option value="Aberto">Aberto</option>
                      <option value="Em Análise">Em Análise</option>
                      <option value="Fechado">Fechado</option>
                    </select>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="feriado"
                        checked={formData.feriado}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500 transition-all"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Ocorreu em Feriado?</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="comunicado"
                        checked={formData.comunicado}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500 transition-all"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Acidente Comunicado?</span>
                    </label>
                  </div>

                  {formData.comunicado && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-bold text-slate-600 mb-2">Data da Comunicação</label>
                      <input
                        type="date"
                        name="dataComunicacao"
                        value={formData.dataComunicacao}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-amber-100 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Registrar Acidente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ModalSelecaoESocial
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        titulo="Selecionar CAT (S-2210)"
        itens={modalItens}
        onSelecionar={(cat) => { aplicarCat(cat); setModalAberto(false); }}
        renderItem={(cat) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">{cat.catNumero || cat.id}</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">{cat.tipoAcidente}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{new Date(cat.dataAcidente).toLocaleDateString('pt-BR')}</span>
              <span className="font-mono">{cat.cid}</span>
              <span>{cat.diasAfastamento ? `${cat.diasAfastamento} dias afast.` : 'Sem afastamento'}</span>
            </div>
          </div>
        )}
      />
    </MainLayout>
  );
};

export default NovoAcidente;
