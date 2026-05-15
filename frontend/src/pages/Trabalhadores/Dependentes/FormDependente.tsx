import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorDependente, ITrabalhador } from '../../../types/index.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import { 
  Users2, 
  ArrowLeft, 
  Save, 
  User, 
  Fingerprint, 
  Calendar, 
  Heart, 
  Info,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { maskCPF } from '../../../utils/cpfMask.js';

interface FormData {
  nome: string;
  cpf: string;
  dataNascimento: string;
  parentesco: string;
  dependentIR: boolean;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  parentesco: '',
  dependentIR: false,
  ativo: true,
};

export const FormDependente: React.FC = () => {
  const { id, dependenteId } = useParams<{ id: string; dependenteId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(dependenteId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  // Catálogos
  const { itens: parentescos } = useCatalogo('parentesco');

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && dependenteId) {
        carregarDependente();
      }
    }
  }, [id, dependenteId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarDependente = async () => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarDependentes(id!);
      const dependente = lista.find((d: ITrabalhadorDependente) => d._id === dependenteId);
      if (dependente) {
        setFormData({
          nome: dependente.nome || '',
          cpf: dependente.cpf || '',
          dataNascimento: dependente.dataNascimento ? dependente.dataNascimento.split('T')[0] : '',
          parentesco: dependente.parentesco || '',
          dependentIR: dependente.dependentIR !== false,
          ativo: dependente.ativo !== false,
        });
      } else {
        toast.error('Dependente não encontrado');
        navigate(`/trabalhadores/${id}/dependentes`);
      }
    } catch (error) {
      toast.error('Erro ao carregar dependente');
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData.nome.trim()) novoErros.nome = 'Obrigatório';
    if (!formData.dataNascimento) novoErros.dataNascimento = 'Obrigatória';
    if (!formData.parentesco) novoErros.parentesco = 'Obrigatório';

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

      const dados: Partial<ITrabalhadorDependente> = {
        ...formData,
        // Backend valida CPF no formato XXX.XXX.XXX-XX
        cpf: formData.cpf ? maskCPF(formData.cpf) : undefined,
        dataNascimento: formData.dataNascimento || undefined,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarDependente(id!, dependenteId!, dados);
        toast.success('Dependente atualizado!');
      } else {
        await submoduloTrabalhadorService.criarDependente(id!, dados);
        toast.success('Dependente registrado!');
      }

      navigate(`/trabalhadores/${id}/dependentes`);
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
          <Loader2 size={48} className="text-rose-600 animate-spin" />
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
            onClick={() => navigate(`/trabalhadores/${id}/dependentes`)}
            className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-rose-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Dependente' : 'Novo Dependente'}
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
              {/* Identificação */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <User size={20} className="text-rose-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Identificação do Dependente</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Nome Completo *</label>
                    <input
                      required
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                      placeholder="Nome do dependente"
                    />
                    {errors.nome && <p className="mt-1 text-xs text-red-500 font-bold">{errors.nome}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">CPF</label>
                    <input
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-mono"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data de Nascimento *</label>
                    <input
                      required
                      type="date"
                      name="dataNascimento"
                      value={formData.dataNascimento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                    />
                    {errors.dataNascimento && <p className="mt-1 text-xs text-red-500 font-bold">{errors.dataNascimento}</p>}
                  </div>
                </div>
              </div>

              {/* Relação */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Heart size={20} className="text-rose-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Relação e Vínculo</h2>
                </div>
                <div className="p-8">
                  <div className="max-w-md">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Grau de Parentesco *</label>
                    <select
                      required
                      name="parentesco"
                      value={formData.parentesco}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-rose-600"
                    >
                      <option value="">Selecione...</option>
                      {parentescos.map((p: any) => (
                        <option key={p.sigla || p.nome} value={p.sigla || p.nome}>{p.nome}</option>
                      ))}
                    </select>
                    {errors.parentesco && <p className="mt-1 text-xs text-red-500 font-bold">{errors.parentesco}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-rose-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Status & Fiscal</h2>
                </div>
                <div className="p-8 space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="dependentIR"
                      checked={formData.dependentIR}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-rose-600 focus:ring-rose-500 transition-all"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Dependente p/ IR?</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Imposto de Renda</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group pt-4 border-t border-slate-50">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-rose-600 focus:ring-rose-500 transition-all"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Dependente Ativo?</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Status do cadastro</span>
                    </div>
                  </label>

                  <div className="pt-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold">Dados Confirmados</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-rose-100 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEdicao ? 'Salvar Alterações' : 'Registrar Dependente'}</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(`/trabalhadores/${id}/dependentes`)}
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

export default FormDependente;
