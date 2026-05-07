import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorVinculo, ITrabalhador } from '../../../types/index.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import { 
  ClipboardList, 
  ArrowLeft, 
  Save, 
  Briefcase, 
  Building, 
  Calendar, 
  Info,
  CheckCircle2,
  Loader2,
  DollarSign,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  tipoVinculo: string;
  matricula: string;
  funcao: string;
  jornadaTrabalho: string;
  turnoTrabalho: string;
  dataInicio: string;
  dataFim: string;
  situacao: string;
  empresaTerceirizada: string;
  setor: string;
  cargo: string;
  ocupacao: string;
  cargaHoraria: string;
  salario: string;
  observacoes: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  tipoVinculo: '',
  matricula: '',
  funcao: '',
  jornadaTrabalho: '',
  turnoTrabalho: '',
  dataInicio: '',
  dataFim: '',
  situacao: 'Ativo',
  empresaTerceirizada: '',
  setor: '',
  cargo: '',
  ocupacao: '',
  cargaHoraria: '',
  salario: '',
  observacoes: '',
  ativo: true,
};

export const FormVinculo: React.FC = () => {
  const { id, vinculoId } = useParams<{ id: string; vinculoId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(vinculoId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  // Catálogos
  const { itens: tiposVinculo } = useCatalogo('tipoVinculo');
  const { itens: jornadas } = useCatalogo('jornadaTrabalho');
  const { itens: turnos } = useCatalogo('turnoTrabalho');
  const { itens: situacoes } = useCatalogo('situacaoTrabalho');

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && vinculoId) {
        carregarVinculo();
      }
    }
  }, [id, vinculoId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarVinculo = async () => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarVinculos(id!);
      const vinculo = lista.find((v: ITrabalhadorVinculo) => v._id === vinculoId);
      if (vinculo) {
        setFormData({
          tipoVinculo: vinculo.tipoVinculo || '',
          matricula: (vinculo as any).matricula || '',
          funcao: vinculo.funcao || '',
          jornadaTrabalho: vinculo.jornadaTrabalho || '',
          turnoTrabalho: vinculo.turnoTrabalho || '',
          dataInicio: vinculo.dataInicio ? vinculo.dataInicio.split('T')[0] : '',
          dataFim: vinculo.dataFim ? vinculo.dataFim.split('T')[0] : '',
          situacao: vinculo.situacao || 'Ativo',
          empresaTerceirizada: vinculo.empresaTerceirizada || '',
          setor: vinculo.setor || '',
          cargo: vinculo.cargo || '',
          ocupacao: vinculo.ocupacao || '',
          cargaHoraria: vinculo.cargaHoraria ? vinculo.cargaHoraria.toString() : '',
          salario: vinculo.salario ? vinculo.salario.toString() : '',
          observacoes: vinculo.observacoes || '',
          ativo: vinculo.ativo !== false,
        });
      } else {
        toast.error('Vínculo não encontrado');
        navigate(`/trabalhadores/${id}/vinculos`);
      }
    } catch (error) {
      toast.error('Erro ao carregar vínculo');
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};
    if (!formData.tipoVinculo) novoErros.tipoVinculo = 'Obrigatório';
    if (!formData.matricula.trim()) novoErros.matricula = 'Obrigatória';
    if (!formData.jornadaTrabalho) novoErros.jornadaTrabalho = 'Obrigatória';
    if (!formData.dataInicio) novoErros.dataInicio = 'Obrigatória';
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

      const dados: Partial<ITrabalhadorVinculo> = {
        ...formData,
        cargaHoraria: formData.cargaHoraria ? Number(formData.cargaHoraria) : undefined,
        salario: formData.salario ? Number(formData.salario) : undefined,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarVinculo(id!, vinculoId!, dados);
        toast.success('Vínculo atualizado!');
      } else {
        await submoduloTrabalhadorService.criarVinculo(id!, dados);
        toast.success('Vínculo registrado!');
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
          <Loader2 size={48} className="text-emerald-600 animate-spin" />
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
            onClick={() => navigate(`/trabalhadores/${id}/vinculos`)}
            className="p-3 hover:bg-emerald-50 rounded-2xl transition-all text-emerald-600 active:scale-90"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações do Cargo */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Briefcase size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Ocupação e Cargo</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Matrícula *</label>
                    <input
                      required
                      name="matricula"
                      value={formData.matricula}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                      placeholder="Número da Matrícula"
                    />
                    {errors.matricula && <p className="mt-1 text-xs text-red-500 font-bold">{errors.matricula}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Cargo</label>
                    <input
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                      placeholder="Ex: Auxiliar Administrativo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Função</label>
                    <input
                      name="funcao"
                      value={formData.funcao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                      placeholder="Função específica"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Setor</label>
                    <input
                      name="setor"
                      value={formData.setor}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Ex: Almoxarifado"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Ocupação (CBO)</label>
                    <input
                      name="ocupacao"
                      value={formData.ocupacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                      placeholder="Código CBO"
                    />
                  </div>
                </div>
              </div>

              {/* Vínculo e Jornada */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <ClipboardList size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Configurações de Vínculo</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Vínculo *</label>
                    <select
                      required
                      name="tipoVinculo"
                      value={formData.tipoVinculo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-600"
                    >
                      <option value="">Selecione...</option>
                      {tiposVinculo.map((t) => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Jornada *</label>
                    <select
                      required
                      name="jornadaTrabalho"
                      value={formData.jornadaTrabalho}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
                    >
                      <option value="">Selecione...</option>
                      {jornadas.map((j) => (
                        <option key={j.nome} value={j.nome}>{j.nome}</option>
                      ))}
                    </select>
                    {errors.jornadaTrabalho && <p className="mt-1 text-xs text-red-500 font-bold">{errors.jornadaTrabalho}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Turno</label>
                    <select
                      name="turnoTrabalho"
                      value={formData.turnoTrabalho}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {turnos.map((t) => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Situação</label>
                    <select
                      name="situacao"
                      value={formData.situacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    >
                      {situacoes.map((s) => (
                        <option key={s.nome} value={s.nome}>{s.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Financeiro e Datas */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <DollarSign size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Datas e Remuneração</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Calendar size={14} /> Início *
                    </label>
                    <input
                      type="date"
                      required
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Calendar size={14} /> Fim (Rescisão)
                    </label>
                    <input
                      type="date"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Clock size={14} /> Carga Horária Semanal
                    </label>
                    <input
                      type="number"
                      name="cargaHoraria"
                      value={formData.cargaHoraria}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Ex: 40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <DollarSign size={14} /> Salário Mensal
                    </label>
                    <input
                      type="number"
                      name="salario"
                      value={formData.salario}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Outras Informações</h2>
                </div>
                <div className="p-8 space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-emerald-600 focus:ring-emerald-500 transition-all"
                    />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Vínculo Ativo?</span>
                  </label>

                  <div className="pt-4 border-t border-slate-50">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Empresa Terceirizada</label>
                    <input
                      name="empresaTerceirizada"
                      value={formData.empresaTerceirizada}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs"
                      placeholder="Nome da empresa"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-50">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Observações</label>
                    <textarea
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none text-xs"
                      placeholder="Notas adicionais..."
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEdicao ? 'Salvar Alterações' : 'Registrar Vínculo'}</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(`/trabalhadores/${id}/vinculos`)}
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

export default FormVinculo;
