import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useAcidenteStore } from '../../store/acidenteStore.js';
import { acidenteService } from '../../services/acidenteService.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { IAcidente } from '../../types/index.js';
import {
  AlertTriangle,
  ArrowLeft,
  Save,
  User,
  Calendar,
  MapPin,
  Info,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  Stethoscope,
  ShieldAlert,
  Building
} from 'lucide-react';
import { useCatalogo } from '../../hooks/useCatalogo.js';
import toast from 'react-hot-toast';

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
  estado: string;
  atendimentoMedico: boolean;
  dataAtendimento: string;
  horaAtendimento: string;
  unidadeAtendimento: string;
  internamento: boolean;
  duracaoInternamento: number;
  catNas: boolean;
  registroPolicial: boolean;
  encaminhamentoJuntaMedica: boolean;
  afastamento: boolean;
  outrosTrabalhadoresAtingidos: boolean;
  quantidadeTrabalhadoresAtingidos: number;
  status: string;
}

const TIPOS_ACIDENTE = [
  { value: 'Típico', label: 'Acidente Típico' },
  { value: 'Trajeto', label: 'Acidente de Trajeto' },
  { value: 'Doença Ocupacional', label: 'Doença Ocupacional' },
  { value: 'Acidente com Material Biológico', label: 'Material Biológico' },
  { value: 'Violência', label: 'Violência' },
];

export const EditarAcidente: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setCurrentAcidente, atualizarAcidente } = useAcidenteStore();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [trabalhadorNome, setTrabalhadorNome] = useState<string | null>(null);
  const [novaLesao, setNovaLesao] = useState('');

  // Catálogos
  const { itens: tiposTrauma } = useCatalogo('tipoTrauma');
  const { itens: agentesCausador } = useCatalogo('causadorTrauma');
  const { itens: partesCorpo } = useCatalogo('parteCorpo');

  useEffect(() => {
    const carregarAcidente = async () => {
      if (!id) {
        toast.error('ID do acidente não fornecido');
        navigate('/acidentes');
        return;
      }

      try {
        setIsLoading(true);
        const acidente = await acidenteService.obter(id);
        setCurrentAcidente(acidente);

        const formatarDataInput = (data: string | Date | undefined): string => {
          if (!data) return '';
          const date = new Date(data);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const extrairCPF = (trabalhador: any): string => {
          if (!trabalhador) return '';
          if (typeof trabalhador === 'string') return trabalhador;
          if (typeof trabalhador === 'object') {
            return trabalhador.cpf || trabalhador.login || '';
          }
          return '';
        };

        const garantirArrayLesoes = (lesoes: any): string[] => {
          if (!lesoes) return [];
          if (Array.isArray(lesoes)) return lesoes.map((l: any) => (typeof l === 'string' ? l : String(l))).filter(Boolean);
          if (typeof lesoes === 'string') {
            try {
              const parsed = JSON.parse(lesoes);
              if (Array.isArray(parsed)) return parsed.filter((l: any) => typeof l === 'string');
            } catch {
              return lesoes.trim() ? [lesoes.trim()] : [];
            }
          }
          if (typeof lesoes === 'object') return Object.values(lesoes).map((l: any) => (typeof l === 'string' ? l : String(l))).filter(Boolean);
          return [];
        };

        const extrairIdentificador = (acidente: any): string => {
          // Tentar vários campos possíveis para o trabalhador
          const t = acidente.trabalhadorId || acidente.trabalhador_id || acidente.id_trabalhador;
          if (!t) return '';
          if (typeof t === 'string') return t;
          if (typeof t === 'object') return t.cpf || t.id || t._id || '';
          return '';
        };

        const identificador = extrairIdentificador(acidente);

        setFormData({
          trabalhadorId: identificador,
          dataAcidente: formatarDataInput(acidente.dataAcidente),
          horario: acidente.horario || '',
          tipoAcidente: acidente.tipoAcidente,
          descricao: acidente.descricao,
          local: acidente.local || '',
          lesoes: garantirArrayLesoes(acidente.lesoes),
          feriado: acidente.feriado || false,
          comunicado: acidente.comunicado || false,
          dataComunicacao: formatarDataInput(acidente.dataComunicacao),
          dataNotificacao: formatarDataInput(acidente.dataNotificacao),
          estado: acidente.estado || '',
          atendimentoMedico: acidente.atendimentoMedico || false,
          dataAtendimento: formatarDataInput(acidente.dataAtendimento),
          horaAtendimento: acidente.horaAtendimento || '',
          unidadeAtendimento: acidente.unidadeAtendimento || '',
          internamento: acidente.internamento || false,
          duracaoInternamento: acidente.duracaoInternamento || 0,
          catNas: acidente.catNas || false,
          registroPolicial: acidente.registroPolicial || false,
          encaminhamentoJuntaMedica: acidente.encaminhamentoJuntaMedica || false,
          afastamento: acidente.afastamento || false,
          outrosTrabalhadoresAtingidos: acidente.outrosTrabalhadoresAtingidos || false,
          quantidadeTrabalhadoresAtingidos: acidente.quantidadeTrabalhadoresAtingidos || 0,
          status: acidente.status || 'Aberto',
        });

        // Buscar detalhes do trabalhador para exibição
        if (identificador) {
          try {
            let t = null;
            
            // 1. Tentar buscar por ID se parecer um ObjectId
            if (identificador.length > 20) {
              t = await trabalhadorService.obterPorId(identificador).catch(() => null);
            }
            
            // 2. Tentar buscar por CPF se não encontrou ou não era ID
            if (!t) {
              t = await trabalhadorService.buscarPorCpf(identificador).catch(() => null);
            }

            if (t) {
              setTrabalhadorNome(t.nome);
              // Atualizar o trabalhadorId no form para o CPF (mais amigável)
              setFormData(prev => prev ? { ...prev, trabalhadorId: t.cpf || identificador } : null);
            } else if (typeof acidente.trabalhadorId === 'object' && acidente.trabalhadorId.nome) {
              // Fallback para o que veio populado do backend
              setTrabalhadorNome(acidente.trabalhadorId.nome);
              if (acidente.trabalhadorId.cpf) {
                setFormData(prev => prev ? { ...prev, trabalhadorId: acidente.trabalhadorId.cpf } : null);
              }
            }
          } catch (err) {
            console.error('Erro ao buscar trabalhador:', err);
          }
        }
      } catch (error) {
        toast.error('Erro ao carregar acidente');
        navigate('/acidentes');
      } finally {
        setIsLoading(false);
      }
    };

    carregarAcidente();
  }, [id, navigate, setCurrentAcidente]);

  const validar = (): boolean => {
    if (!formData) return false;
    const newErrors: { [key: string]: string } = {};

    if (!formData.tipoAcidente) newErrors.tipoAcidente = 'Tipo é obrigatório';
    if (!formData.descricao || formData.descricao.length < 10) {
      newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!formData) return;
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === '' ? 0 : parseInt(value, 10) || 0,
    });
  };

  const handleAddLesao = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && novaLesao.trim() && formData) {
      e.preventDefault();
      if (!formData.lesoes.includes(novaLesao.trim())) {
        setFormData({
          ...formData,
          lesoes: [...formData.lesoes, novaLesao.trim()]
        });
      }
      setNovaLesao('');
    }
  };

  const removerLesao = (lesao: string) => {
    if (formData) {
      setFormData({
        ...formData,
        lesoes: formData.lesoes.filter(l => l !== lesao)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !formData || !validar()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSaving(true);

      const converterDataLocal = (dataString: string): string => {
        if (!dataString) return '';
        const [year, month, day] = dataString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        return date.toISOString();
      };
      
      const acidenteAtuzalizar = {
        ...formData,
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
      };

      const acidenteAtualizado = await acidenteService.atualizar(id, acidenteAtuzalizar);
      atualizarAcidente(id, acidenteAtualizado);

      toast.success('Acidente atualizado com sucesso!');
      navigate('/acidentes');
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar acidente');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-amber-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando dados do acidente...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/acidentes')}
            className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Editar Acidente</h1>
            <p className="text-slate-500 font-medium">Atualize as informações do registro de acidente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Identificação (Read Only) */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden opacity-90">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <User size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Identificação</h2>
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">CPF do Trabalhador</label>
                    <input
                      disabled
                      value={formData?.trabalhadorId}
                      className="w-full px-4 py-3 bg-slate-100 border-transparent rounded-2xl text-slate-500 font-mono cursor-not-allowed"
                    />
                    {trabalhadorNome && (
                      <div className="mt-2 flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 px-3 py-1 rounded-lg w-fit border border-slate-100">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        {trabalhadorNome}
                      </div>
                    )}
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
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data do Acidente *</label>
                    <input
                      type="date"
                      required
                      name="dataAcidente"
                      value={formData?.dataAcidente}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data da Notificação</label>
                    <input
                      type="date"
                      name="dataNotificacao"
                      value={formData?.dataNotificacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Horário</label>
                    <input
                      type="time"
                      name="horario"
                      value={formData?.horario}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Horário após início da jornada</label>
                    <input
                      type="time"
                      name="horarioAposInicioJornada"
                      value={formData?.horarioAposInicioJornada}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Acidente *</label>
                    <select
                      required
                      name="tipoAcidente"
                      value={formData?.tipoAcidente}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-amber-600"
                    >
                      {TIPOS_ACIDENTE.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Trauma</label>
                    <select
                      name="tipoTrauma"
                      value={formData?.tipoTrauma}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {tiposTrauma.map(t => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Agente Causador</label>
                    <select
                      name="agenteCausador"
                      value={formData?.agenteCausador}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {agentesCausador.map(a => (
                        <option key={a.nome} value={a.nome}>{a.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Parte do Corpo</label>
                    <select
                      name="parteCorpo"
                      value={formData?.parteCorpo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {partesCorpo.map(p => (
                        <option key={p.nome} value={p.nome}>{p.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Estado (UF)</label>
                    <input
                      name="estado"
                      value={formData?.estado}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono"
                      placeholder="Ex: SP"
                      maxLength={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2 text-amber-600">Descrição do Acidente *</label>
                    <textarea
                      required
                      name="descricao"
                      value={formData?.descricao}
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
                      value={formData?.descricaoTrauma}
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
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Local do Acidente</label>
                    <input
                      name="local"
                      value={formData?.local}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Lesões Identificadas</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData?.lesoes.map(lesao => (
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
                      placeholder="Adicione uma nova lesão e pressione Enter..."
                    />
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
                      checked={formData?.atendimentoMedico}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="atendimentoMedico" className="text-sm font-bold text-slate-600">
                      Houve atendimento médico?
                    </label>
                  </div>
                  {formData?.atendimentoMedico && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-blue-50 rounded-2xl">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Data</label>
                        <input
                          type="date"
                          name="dataAtendimento"
                          value={formData?.dataAtendimento}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Hora</label>
                        <input
                          type="time"
                          name="horaAtendimento"
                          value={formData?.horaAtendimento}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Unidade</label>
                        <input
                          name="unidadeAtendimento"
                          value={formData?.unidadeAtendimento}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Nome da unidade"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="internamento"
                      id="internamento"
                      checked={formData?.internamento}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="internamento" className="text-sm font-bold text-slate-600">
                      Houve internamento?
                    </label>
                  </div>
                  {formData?.internamento && (
                    <div className="p-4 bg-orange-50 rounded-2xl">
                      <label className="block text-sm font-bold text-slate-600 mb-2">Duração (horas)</label>
                      <input
                        type="number"
                        name="duracaoInternamento"
                        value={formData?.duracaoInternamento}
                        onChange={handleNumberChange}
                        min="0"
                        className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Quantidade de horas"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações Adicionais</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-red-50 rounded-xl">
                      <input
                        type="checkbox"
                        name="catNas"
                        checked={formData?.catNas}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">CAT/NAS?</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-blue-50 rounded-xl">
                      <input
                        type="checkbox"
                        name="registroPolicial"
                        checked={formData?.registroPolicial}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Registro Policial?</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-purple-50 rounded-xl">
                      <input
                        type="checkbox"
                        name="encaminhamentoJuntaMedica"
                        checked={formData?.encaminhamentoJuntaMedica}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Junta Médica?</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group p-3 bg-green-50 rounded-xl">
                      <input
                        type="checkbox"
                        name="afastamento"
                        checked={formData?.afastamento}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Afastamento?</span>
                    </label>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="outrosTrabalhadoresAtingidos"
                        id="outrosTrabalhadoresAtingidos"
                        checked={formData?.outrosTrabalhadoresAtingidos}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-yellow-600 focus:ring-yellow-500"
                      />
                      <label htmlFor="outrosTrabalhadoresAtingidos" className="text-sm font-bold text-slate-600">
                        Outros trabalhadores foram atingidos?
                      </label>
                    </div>
                    {formData?.outrosTrabalhadoresAtingidos && (
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Quantidade</label>
                        <input
                          type="number"
                          name="quantidadeTrabalhadoresAtingidos"
                          value={formData?.quantidadeTrabalhadoresAtingidos}
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
                    <label className="block text-sm font-bold text-slate-600 mb-2">Status do Registro</label>
                    <select
                      name="status"
                      value={formData?.status}
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
                        checked={formData?.feriado}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500 transition-all"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Ocorreu em Feriado?</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="comunicado"
                        checked={formData?.comunicado}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500 transition-all"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Acidente Comunicado?</span>
                    </label>
                  </div>

                  {formData?.comunicado && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-bold text-slate-600 mb-2">Data da Comunicação</label>
                      <input
                        type="date"
                        name="dataComunicacao"
                        value={formData?.dataComunicacao}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-amber-100 disabled:opacity-50 active:scale-95"
              >
                {isSaving ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default EditarAcidente;
