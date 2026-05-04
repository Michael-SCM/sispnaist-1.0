import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useAcidenteStore } from '../../store/acidenteStore.js';
import { acidenteService } from '../../services/acidenteService.js';
import { IAcidente } from '../../types/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
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
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  trabalhadorId: string;
  dataAcidente: string;
  horario: string;
  tipoAcidente: string;
  descricao: string;
  local: string;
  lesoes: string[];
  feriado: boolean;
  comunicado: boolean;
  dataComunicacao: string;
  status: 'Aberto' | 'Em Análise' | 'Fechado';
}

const INITIAL_FORM: FormData = {
  trabalhadorId: '',
  dataAcidente: '',
  horario: '',
  tipoAcidente: '',
  descricao: '',
  local: '',
  lesoes: [],
  feriado: false,
  comunicado: false,
  dataComunicacao: '',
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

      const acidenteData: Partial<IAcidente> = {
        ...formData,
        trabalhadorId: formData.trabalhadorId || user?._id || '',
        dataAcidente: formData.dataAcidente ? converterDataLocal(formData.dataAcidente) : undefined,
        dataComunicacao: formData.comunicado && formData.dataComunicacao 
          ? converterDataLocal(formData.dataComunicacao)
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Novo Acidente</h1>
            <p className="text-slate-500 font-medium">Registre uma nova ocorrência de trabalho</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Identificação */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <User size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Identificação do Trabalhador</h2>
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">CPF do Trabalhador *</label>
                    <input
                      required
                      name="trabalhadorId"
                      value={formData.trabalhadorId}
                      onChange={handleChange}
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

              {/* Detalhes do Acidente */}
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
                      value={formData.dataAcidente}
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Acidente *</label>
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2 text-amber-600">Descrição Detalhada *</label>
                    <textarea
                      required
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                      placeholder="Descreva minuciosamente o ocorrido..."
                    />
                    {errors.descricao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.descricao}</p>}
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
                      value={formData.local}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="Ex: Almoxarifado Central"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Lesões Identificadas</label>
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
    </MainLayout>
  );
};

export default NovoAcidente;
