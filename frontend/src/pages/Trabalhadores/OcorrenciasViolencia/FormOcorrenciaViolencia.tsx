import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorOcorrenciaViolencia, ITrabalhador } from '../../../types/index.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import {
  ShieldAlert,
  ArrowLeft,
  Save,
  Calendar,
  FileText,
  Info,
  CheckCircle2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  dataOcorrencia: string;
  localOcorrencia: string;
  tipoViolencia: string;
  tipoViolenciaSexual: string;
  motivoViolencia: string;
  meioAgressao: string;
  tipoAutorViolencia: string;
  descricaoOcorrencia: string;
  boletimOcorrencia: string;
  medidasTomadas: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  dataOcorrencia: '',
  localOcorrencia: '',
  tipoViolencia: '',
  tipoViolenciaSexual: '',
  motivoViolencia: '',
  meioAgressao: '',
  tipoAutorViolencia: '',
  descricaoOcorrencia: '',
  boletimOcorrencia: '',
  medidasTomadas: '',
  ativo: true,
};

export const FormOcorrenciaViolencia: React.FC = () => {
  const { id, ocorrenciaId } = useParams<{ id: string; ocorrenciaId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(ocorrenciaId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  // Catálogos
  const { itens: tiposViolencia } = useCatalogo('tipoViolencia');
  const { itens: motivosViolencia } = useCatalogo('motivoViolencia');
  const { itens: meiosAgressao } = useCatalogo('meioAgressao');
  const { itens: tiposAutor } = useCatalogo('tipoAutorViolencia');

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && ocorrenciaId) {
        carregarOcorrencia();
      }
    }
  }, [id, ocorrenciaId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarOcorrencia = async () => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarOcorrenciasViolencia(id!);
      const ocorrencia = lista.find((o: ITrabalhadorOcorrenciaViolencia) => o._id === ocorrenciaId);
      if (ocorrencia) {
        setFormData({
          dataOcorrencia: ocorrencia.dataOcorrencia ? ocorrencia.dataOcorrencia.split('T')[0] : '',
          localOcorrencia: ocorrencia.localOcorrencia || '',
          tipoViolencia: ocorrencia.tipoViolencia || '',
          tipoViolenciaSexual: ocorrencia.tipoViolenciaSexual || '',
          motivoViolencia: ocorrencia.motivoViolencia || '',
          meioAgressao: ocorrencia.meioAgressao || '',
          tipoAutorViolencia: ocorrencia.tipoAutorViolencia || '',
          descricaoOcorrencia: ocorrencia.descricaoOcorrencia || '',
          boletimOcorrencia: ocorrencia.boletimOcorrencia || '',
          medidasTomadas: ocorrencia.medidasTomadas || '',
          ativo: ocorrencia.ativo !== false,
        });
      } else {
        toast.error('Ocorrência não encontrada');
        navigate(`/trabalhadores/${id}/ocorrencias-violencia`);
      }
    } catch (error) {
      toast.error('Erro ao carregar ocorrência');
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData.dataOcorrencia) novoErros.dataOcorrencia = 'Obrigatória';
    if (!formData.tipoViolencia) novoErros.tipoViolencia = 'Obrigatório';
    if (!formData.motivoViolencia) novoErros.motivoViolencia = 'Obrigatório';
    if (!formData.meioAgressao) novoErros.meioAgressao = 'Obrigatório';
    if (!formData.tipoAutorViolencia) novoErros.tipoAutorViolencia = 'Obrigatório';
    if (!formData.descricaoOcorrencia) novoErros.descricaoOcorrencia = 'Obrigatória';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      setIsLoading(true);

      const dados: Partial<ITrabalhadorOcorrenciaViolencia> = {
        ...formData,
        dataOcorrencia: formData.dataOcorrencia ? new Date(formData.dataOcorrencia) : undefined,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarOcorrenciaViolencia(id!, ocorrenciaId!, dados);
        toast.success('Ocorrência atualizada!');
      } else {
        await submoduloTrabalhadorService.criarOcorrenciaViolencia(id!, dados);
        toast.success('Ocorrência registrada!');
      }

      navigate(`/trabalhadores/${id}/ocorrencias-violencia`);
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
          <Loader2 size={48} className="text-red-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando dados...</p>
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
            onClick={() => navigate(`/trabalhadores/${id}/ocorrencias-violencia`)}
            className="p-3 hover:bg-red-50 rounded-2xl transition-all text-red-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Ocorrência de Violência' : 'Nova Ocorrência de Violência'}
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
              {/* Dados da Ocorrência */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-red-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados da Ocorrência</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data da Ocorrência *</label>
                    <input
                      type="date"
                      required
                      name="dataOcorrencia"
                      value={formData.dataOcorrencia}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium"
                    />
                    {errors.dataOcorrencia && <p className="mt-1 text-xs text-red-500 font-bold">{errors.dataOcorrencia}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Local da Ocorrência</label>
                    <input
                      name="localOcorrencia"
                      value={formData.localOcorrencia}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      placeholder="Local do incidente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Violência *</label>
                    <select
                      required
                      name="tipoViolencia"
                      value={formData.tipoViolencia}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-red-600"
                    >
                      <option value="">Selecione...</option>
                      {tiposViolencia.map((t) => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                    {errors.tipoViolencia && <p className="mt-1 text-xs text-red-500 font-bold">{errors.tipoViolencia}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Violência Sexual</label>
                    <select
                      name="tipoViolenciaSexual"
                      value={formData.tipoViolenciaSexual}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {tiposViolencia.map((t) => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Motivo da Violência *</label>
                    <select
                      required
                      name="motivoViolencia"
                      value={formData.motivoViolencia}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {motivosViolencia.map((m) => (
                        <option key={m.nome} value={m.nome}>{m.nome}</option>
                      ))}
                    </select>
                    {errors.motivoViolencia && <p className="mt-1 text-xs text-red-500 font-bold">{errors.motivoViolencia}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Meio de Agressão *</label>
                    <select
                      required
                      name="meioAgressao"
                      value={formData.meioAgressao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {meiosAgressao.map((m) => (
                        <option key={m.nome} value={m.nome}>{m.nome}</option>
                      ))}
                    </select>
                    {errors.meioAgressao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.meioAgressao}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Autor *</label>
                    <select
                      required
                      name="tipoAutorViolencia"
                      value={formData.tipoAutorViolencia}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {tiposAutor.map((t) => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                    {errors.tipoAutorViolencia && <p className="mt-1 text-xs text-red-500 font-bold">{errors.tipoAutorViolencia}</p>}
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={20} className="text-red-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Descrição e Medidas</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Descrição da Ocorrência *</label>
                    <textarea
                      required
                      name="descricaoOcorrencia"
                      value={formData.descricaoOcorrencia}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                      placeholder="Descreva detalhadamente a ocorrência..."
                    />
                    {errors.descricaoOcorrencia && <p className="mt-1 text-xs text-red-500 font-bold">{errors.descricaoOcorrencia}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Boletim de Ocorrência</label>
                    <input
                      name="boletimOcorrencia"
                      value={formData.boletimOcorrencia}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all font-mono"
                      placeholder="Número do BO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Medidas Tomadas</label>
                    <textarea
                      name="medidasTomadas"
                      value={formData.medidasTomadas}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                      placeholder="Descreva as medidas tomadas após a ocorrência..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-red-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Controle</h2>
                </div>
                <div className="p-8 space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-red-600 focus:ring-red-500 transition-all"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Ocorrência Ativa?</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Desmarque se já concluída</span>
                    </div>
                  </label>

                  <div className="pt-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold">Registro Protegido</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      As informações desta ocorrência são protegidas e sigilosas.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-red-100 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEdicao ? 'Salvar Alterações' : 'Registrar Ocorrência'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/trabalhadores/${id}/ocorrencias-violencia`)}
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

export default FormOcorrenciaViolencia;
