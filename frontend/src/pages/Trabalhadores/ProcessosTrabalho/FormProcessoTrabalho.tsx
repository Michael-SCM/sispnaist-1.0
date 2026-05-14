import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorProcessoTrabalho, ITrabalhador } from '../../../types/index.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import {
  Briefcase,
  ArrowLeft,
  Save,
  Calendar,
  Building,
  Clock,
  Info,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  setor: string;
  cargo: string;
  funcao: string;
  jornadaTrabalho: string;
  turnoTrabalho: string;
  jornadaSemanal: string;
  questionarioId: string;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  setor: '',
  cargo: '',
  funcao: '',
  jornadaTrabalho: '',
  turnoTrabalho: '',
  jornadaSemanal: '',
  questionarioId: '',
  dataInicio: '',
  dataFim: '',
  observacoes: '',
  ativo: true,
};

export const FormProcessoTrabalho: React.FC = () => {
  const { id, processoId } = useParams<{ id: string; processoId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(processoId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  // Catálogos
  const { itens: jornadas } = useCatalogo('jornadaTrabalho');
  const { itens: turnos } = useCatalogo('turnoTrabalho');

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && processoId) {
        carregarProcesso();
      }
    }
  }, [id, processoId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarProcesso = async () => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarProcessosTrabalho(id!);
      const processo = lista.find((p: ITrabalhadorProcessoTrabalho) => p._id === processoId);
      if (processo) {
        setFormData({
          setor: processo.setor || '',
          cargo: processo.cargo || '',
          funcao: processo.funcao || '',
          jornadaTrabalho: processo.jornadaTrabalho || '',
          turnoTrabalho: processo.turnoTrabalho || '',
          jornadaSemanal: processo.jornadaSemanal || '',
          questionarioId: (processo as any).questionarioId || '',
          dataInicio: processo.dataInicio ? processo.dataInicio.split('T')[0] : '',
          dataFim: processo.dataFim ? processo.dataFim.split('T')[0] : '',
          observacoes: processo.observacoes || '',
          ativo: processo.ativo !== false,
        });
      } else {
        toast.error('Processo de trabalho não encontrado');
        navigate(`/trabalhadores/${id}/processos-trabalho`);
      }
    } catch (error) {
      toast.error('Erro ao carregar processo');
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData.setor) novoErros.setor = 'Obrigatório';
    if (!formData.cargo) novoErros.cargo = 'Obrigatório';
    if (!formData.funcao) novoErros.funcao = 'Obrigatória';
    if (!formData.dataInicio) novoErros.dataInicio = 'Obrigatória';

    if (!formData.questionarioId) {
      novoErros.questionarioId = 'Obrigatório';
    } else {
      const v = formData.questionarioId.trim();
      const objectIdRegex = /^[a-fA-F0-9]{24}$/;
      if (!objectIdRegex.test(v)) {
        novoErros.questionarioId = 'questionárioId inválido (mín. 24 e máx. 50 caracteres)';
      }
    }

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

      const dados: Partial<ITrabalhadorProcessoTrabalho> = {
        ...formData,
        dataInicio: formData.dataInicio ? new Date(formData.dataInicio) : undefined,
        dataFim: formData.dataFim ? new Date(formData.dataFim) : undefined,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarProcessoTrabalho(id!, processoId!, dados);
        toast.success('Processo de trabalho atualizado!');
      } else {
        await submoduloTrabalhadorService.criarProcessoTrabalho(id!, dados);
        toast.success('Processo de trabalho registrado!');
      }

      navigate(`/trabalhadores/${id}/processos-trabalho`);
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
          <Loader2 size={48} className="text-cyan-600 animate-spin" />
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
            onClick={() => navigate(`/trabalhadores/${id}/processos-trabalho`)}
            className="p-3 hover:bg-cyan-50 rounded-2xl transition-all text-cyan-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Processo de Trabalho' : 'Novo Processo de Trabalho'}
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
              {/* Dados do Processo */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Briefcase size={20} className="text-cyan-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados do Processo</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Setor *</label>
                    <input
                      name="setor"
                      required
                      value={formData.setor}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                      placeholder="Ex: Almoxarifado"
                    />
                    {errors.setor && <p className="mt-1 text-xs text-red-500 font-bold">{errors.setor}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Cargo *</label>
                    <input
                      name="cargo"
                      required
                      value={formData.cargo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                      placeholder="Ex: Auxiliar Administrativo"
                    />
                    {errors.cargo && <p className="mt-1 text-xs text-red-500 font-bold">{errors.cargo}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Função *</label>
                    <input
                      name="funcao"
                      required
                      value={formData.funcao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
                      placeholder="Função específica"
                    />
                    {errors.funcao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.funcao}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Jornada Semanal</label>
                    <input
                      name="jornadaSemanal"
                      value={formData.jornadaSemanal}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                      placeholder="Ex: 40 horas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Questionário *</label>
                    <input
                      name="questionarioId"
                      required
                      value={formData.questionarioId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-mono"
                      placeholder="ID do questionário respondido"
                    />
                    {errors.questionarioId && <p className="mt-1 text-xs text-red-500 font-bold">{errors.questionarioId}</p>}
                  </div>
                </div>
              </div>

              {/* Jornada e Turno */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Clock size={20} className="text-cyan-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Jornada e Turno</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Jornada de Trabalho</label>
                    <select
                      name="jornadaTrabalho"
                      value={formData.jornadaTrabalho}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {jornadas.map((j) => (
                        <option key={j.nome} value={j.nome}>{j.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Turno de Trabalho</label>
                    <select
                      name="turnoTrabalho"
                      value={formData.turnoTrabalho}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {turnos.map((t) => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Datas e Observações */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Calendar size={20} className="text-cyan-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Período e Observações</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data de Início *</label>
                    <input
                      type="date"
                      required
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                    />
                    {errors.dataInicio && <p className="mt-1 text-xs text-red-500 font-bold">{errors.dataInicio}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data de Fim</label>
                    <input
                      type="date"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Observações</label>
                    <textarea
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none"
                      placeholder="Descreva detalhes relevantes sobre este processo de trabalho..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-cyan-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Controle</h2>
                </div>
                <div className="p-8 space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-cyan-600 focus:ring-cyan-500 transition-all"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Processo Ativo?</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Desmarque se já encerrado</span>
                    </div>
                  </label>

                  <div className="pt-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold">Registro Validado</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Mantenha o histórico de processos de trabalho atualizado para fins de registro.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-cyan-100 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEdicao ? 'Salvar Alterações' : 'Registrar Processo'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/trabalhadores/${id}/processos-trabalho`)}
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

export default FormProcessoTrabalho;
