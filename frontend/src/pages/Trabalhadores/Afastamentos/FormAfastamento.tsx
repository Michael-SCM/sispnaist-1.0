import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorAfastamento, ITrabalhador } from '../../../types/index.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import { 
  Stethoscope, 
  ArrowLeft, 
  Save, 
  Calendar, 
  FileText, 
  Activity, 
  Info,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  tipoAfastamento: string;
  motivoAfastamento: string;
  cid: string;
  dataInicio: string;
  dataFim: string;
  dataRetorno: string;
  laudoMedico: string;
  observacoes: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  tipoAfastamento: '',
  motivoAfastamento: '',
  cid: '',
  dataInicio: '',
  dataFim: '',
  dataRetorno: '',
  laudoMedico: '',
  observacoes: '',
  ativo: true,
};

export const FormAfastamento: React.FC = () => {
  const { id, afastamentoId } = useParams<{ id: string; afastamentoId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(afastamentoId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  // Catálogos
  const { itens: tiposAfastamento } = useCatalogo('tipoAfastamento');
  const { itens: motivosAfastamento } = useCatalogo('motivoAfastamento');

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && afastamentoId) {
        carregarAfastamento();
      }
    }
  }, [id, afastamentoId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarAfastamento = async () => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarAfastamentos(id!);
      const afastamento = lista.find((a: ITrabalhadorAfastamento) => a._id === afastamentoId);
      if (afastamento) {
        setFormData({
          tipoAfastamento: afastamento.tipoAfastamento || '',
          motivoAfastamento: afastamento.motivoAfastamento || '',
          cid: afastamento.cid || '',
          dataInicio: afastamento.dataInicio ? afastamento.dataInicio.split('T')[0] : '',
          dataFim: afastamento.dataFim ? afastamento.dataFim.split('T')[0] : '',
          dataRetorno: afastamento.dataRetorno ? afastamento.dataRetorno.split('T')[0] : '',
          laudoMedico: afastamento.laudoMedico || '',
          observacoes: afastamento.observacoes || '',
          ativo: afastamento.ativo !== false,
        });
      } else {
        toast.error('Afastamento não encontrado');
        navigate(`/trabalhadores/${id}/afastamentos`);
      }
    } catch (error) {
      toast.error('Erro ao carregar afastamento');
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData.tipoAfastamento) novoErros.tipoAfastamento = 'Obrigatório';
    if (!formData.motivoAfastamento) novoErros.motivoAfastamento = 'Obrigatório';
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

      const dados: Partial<ITrabalhadorAfastamento> = {
        ...formData,
        dataFim: formData.dataFim || undefined,
        dataRetorno: formData.dataRetorno || undefined,
        laudoMedico: formData.laudoMedico || undefined,
        observacoes: formData.observacoes || undefined,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarAfastamento(id!, afastamentoId!, dados);
        toast.success('Afastamento atualizado!');
      } else {
        await submoduloTrabalhadorService.criarAfastamento(id!, dados);
        toast.success('Afastamento registrado!');
      }

      navigate(`/trabalhadores/${id}/afastamentos`);
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
          <Loader2 size={48} className="text-amber-600 animate-spin" />
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
            onClick={() => navigate(`/trabalhadores/${id}/afastamentos`)}
            className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Afastamento' : 'Novo Afastamento'}
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
              {/* Informações do Afastamento */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Stethoscope size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados do Afastamento</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo *</label>
                    <select
                      required
                      name="tipoAfastamento"
                      value={formData.tipoAfastamento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-amber-600"
                    >
                      <option value="">Selecione...</option>
                      {tiposAfastamento.map((t) => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                    {errors.tipoAfastamento && <p className="mt-1 text-xs text-red-500 font-bold">{errors.tipoAfastamento}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Motivo *</label>
                    <select
                      required
                      name="motivoAfastamento"
                      value={formData.motivoAfastamento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {motivosAfastamento.map((m) => (
                        <option key={m.nome} value={m.nome}>{m.nome}</option>
                      ))}
                    </select>
                    {errors.motivoAfastamento && <p className="mt-1 text-xs text-red-500 font-bold">{errors.motivoAfastamento}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Código CID</label>
                    <input
                      name="cid"
                      value={formData.cid}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono"
                      placeholder="Ex: J30.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Laudo Médico</label>
                    <input
                      name="laudoMedico"
                      value={formData.laudoMedico}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="Nº do Laudo ou Ref."
                    />
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Calendar size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Período de Ausência</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Início *</label>
                    <input
                      type="date"
                      required
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Fim Previsto</label>
                    <input
                      type="date"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Retorno Efetivo</label>
                    <input
                      type="date"
                      name="dataRetorno"
                      value={formData.dataRetorno}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações Adicionais</h2>
                </div>
                <div className="p-8">
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                    placeholder="Descreva detalhes relevantes sobre este afastamento..."
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Controle</h2>
                </div>
                <div className="p-8 space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500 transition-all"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Afastamento Ativo?</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Desmarque se já concluído</span>
                    </div>
                  </label>

                  <div className="pt-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold">Registro Validado</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Assegure que as datas de início e fim estejam de acordo com o atestado ou laudo médico apresentado.
                    </p>
                  </div>
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
                    <span>{isEdicao ? 'Salvar Alterações' : 'Registrar Afastamento'}</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(`/trabalhadores/${id}/afastamentos`)}
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

export default FormAfastamento;
