import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import empresaService from '../../../services/empresaService.js';
import unidadeService from '../../../services/unidadeService.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import { ITrabalhadorRiscoOcupacional, ITrabalhador, IEmpresa, IUnidade } from '../../../types/index.js';
import {
  Shield,
  ArrowLeft,
  Save,
  Loader2,
  Building2,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  empresaId: string;
  unidadeId: string;
  categoria: string;
  tipoRisco: string;
  presente: boolean;
  observacao: string;
  intensidade: string;
  fonteGeradora: string;
  frequenciaExposicao: string;
  duracaoExposicao: string;
  epcUtilizado: boolean;
  epcDescricao: string;
  epiUtilizado: boolean;
  epiDescricao: string;
  caEpis: string;
  medidasControle: string;
  dataAvaliacao: string;
  avaliador: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  empresaId: '',
  unidadeId: '',
  categoria: '',
  tipoRisco: '',
  presente: true,
  observacao: '',
  intensidade: '',
  fonteGeradora: '',
  frequenciaExposicao: '',
  duracaoExposicao: '',
  epcUtilizado: false,
  epcDescricao: '',
  epiUtilizado: false,
  epiDescricao: '',
  caEpis: '',
  medidasControle: '',
  dataAvaliacao: '',
  avaliador: '',
  ativo: true,
};

export const FormRiscoOcupacional: React.FC = () => {
  const { id, riscoId } = useParams<{ id: string; riscoId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(riscoId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
  const [unidades, setUnidades] = useState<IUnidade[]>([]);
  const [unidadesFiltradas, setUnidadesFiltradas] = useState<IUnidade[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  const { itens: tiposRisco } = useCatalogo('tipoRisco');
  const { itens: agentes } = useCatalogo('agente');

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      carregarEmpresas();
      carregarUnidades();
      if (isEdicao && riscoId) carregarRisco();
    }
  }, [id, riscoId]);

  useEffect(() => {
    if (formData.empresaId) {
      setUnidadesFiltradas(unidades.filter(u => u.empresaId === formData.empresaId || (typeof u.empresaId === 'object' && (u.empresaId as any)._id === formData.empresaId)));
      if (!unidadesFiltradas.some(u => u._id === formData.unidadeId)) {
        setFormData(prev => ({ ...prev, unidadeId: '' }));
      }
    } else {
      setUnidadesFiltradas([]);
      setFormData(prev => ({ ...prev, unidadeId: '' }));
    }
  }, [formData.empresaId, unidades]);

  const tiposFiltrados = formData.categoria
    ? tiposRisco.filter(t => t.sigla === formData.categoria)
    : tiposRisco;

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarEmpresas = async () => {
    try {
      const data = await empresaService.listarAtivas();
      setEmpresas(data);
    } catch {
      toast.error('Erro ao carregar empresas');
    }
  };

  const carregarUnidades = async () => {
    try {
      const data = await unidadeService.listarAtivas();
      setUnidades(data);
    } catch {
      toast.error('Erro ao carregar unidades');
    }
  };

  const carregarRisco = async () => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarRiscosOcupacionais(id!);
      const risco = lista.find((r: ITrabalhadorRiscoOcupacional) => r._id === riscoId);
      if (risco) {
        setFormData({
          empresaId: typeof risco.empresaId === 'object' ? (risco.empresaId as any)._id : risco.empresaId || '',
          unidadeId: typeof risco.unidadeId === 'object' ? (risco.unidadeId as any)._id : risco.unidadeId || '',
          categoria: risco.categoria || '',
          tipoRisco: risco.tipoRisco || '',
          presente: risco.presente !== false,
          observacao: risco.observacao || '',
          intensidade: risco.intensidade || '',
          fonteGeradora: risco.fonteGeradora || '',
          frequenciaExposicao: risco.frequenciaExposicao || '',
          duracaoExposicao: risco.duracaoExposicao || '',
          epcUtilizado: risco.epcUtilizado || false,
          epcDescricao: risco.epcDescricao || '',
          epiUtilizado: risco.epiUtilizado || false,
          epiDescricao: risco.epiDescricao || '',
          caEpis: (risco.caEpis || []).join(', '),
          medidasControle: risco.medidasControle || '',
          dataAvaliacao: risco.dataAvaliacao ? risco.dataAvaliacao.split('T')[0] : '',
          avaliador: risco.avaliador || '',
          ativo: risco.ativo !== false,
        });
      } else {
        toast.error('Risco não encontrado');
        navigate(`/trabalhadores/${id}/riscos-ocupacionais`);
      }
    } catch {
      toast.error('Erro ao carregar risco');
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};
    if (!formData.empresaId) novoErros.empresaId = 'Obrigatório';
    if (!formData.unidadeId) novoErros.unidadeId = 'Obrigatório';
    if (!formData.categoria) novoErros.categoria = 'Obrigatório';
    if (!formData.tipoRisco) novoErros.tipoRisco = 'Obrigatório';
    setErrors(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) { toast.error('Preencha os campos obrigatórios'); return; }
    try {
      setIsLoading(true);
      const dados: Partial<ITrabalhadorRiscoOcupacional> = {
        empresaId: formData.empresaId,
        unidadeId: formData.unidadeId,
        categoria: formData.categoria,
        tipoRisco: formData.tipoRisco,
        presente: formData.presente,
        observacao: formData.observacao,
        intensidade: formData.intensidade || undefined,
        fonteGeradora: formData.fonteGeradora,
        frequenciaExposicao: formData.frequenciaExposicao,
        duracaoExposicao: formData.duracaoExposicao,
        epcUtilizado: formData.epcUtilizado,
        epcDescricao: formData.epcDescricao,
        epiUtilizado: formData.epiUtilizado,
        epiDescricao: formData.epiDescricao,
        caEpis: formData.caEpis ? formData.caEpis.split(',').map(s => s.trim()).filter(Boolean) : [],
        medidasControle: formData.medidasControle,
        dataAvaliacao: formData.dataAvaliacao ? new Date(formData.dataAvaliacao) : undefined,
        avaliador: formData.avaliador,
        ativo: formData.ativo,
      };
      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarRiscoOcupacional(id!, riscoId!, dados);
        toast.success('Risco atualizado!');
      } else {
        await submoduloTrabalhadorService.criarRiscoOcupacional(id!, dados);
        toast.success('Risco registrado!');
      }
      navigate(`/trabalhadores/${id}/riscos-ocupacionais`);
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
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/trabalhadores/${id}/riscos-ocupacionais`)} className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Risco Ocupacional' : 'Novo Risco Ocupacional'}
            </h1>
            {trabalhador && (
              <p className="text-slate-500 font-medium">Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span></p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Local do Risco */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <MapPin size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Local de Atuação</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Empresa <span className="text-red-500">*</span></label>
                    <select
                      required name="empresaId" value={formData.empresaId} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {empresas.map(e => (
                        <option key={e._id} value={e._id}>{e.razaoSocial}</option>
                      ))}
                    </select>
                    {errors.empresaId && <p className="mt-1 text-xs text-red-500 font-bold">{errors.empresaId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Unidade <span className="text-red-500">*</span></label>
                    <select
                      required name="unidadeId" value={formData.unidadeId} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      disabled={!formData.empresaId}
                    >
                      <option value="">{formData.empresaId ? 'Selecione...' : 'Selecione empresa primeiro'}</option>
                      {unidadesFiltradas.map(u => (
                        <option key={u._id} value={u._id}>{u.nome}</option>
                      ))}
                    </select>
                    {errors.unidadeId && <p className="mt-1 text-xs text-red-500 font-bold">{errors.unidadeId}</p>}
                  </div>
                </div>
              </div>

              {/* Identificação do Risco */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Shield size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Identificação do Risco</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Categoria <span className="text-red-500">*</span></label>
                    <select
                      required name="categoria" value={formData.categoria} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {agentes.map(a => (
                        <option key={a.nome} value={a.nome}>{a.nome}</option>
                      ))}
                    </select>
                    {errors.categoria && <p className="mt-1 text-xs text-red-500 font-bold">{errors.categoria}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Risco <span className="text-red-500">*</span></label>
                    <select
                      required name="tipoRisco" value={formData.tipoRisco} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {tiposFiltrados.map(t => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                    {errors.tipoRisco && <p className="mt-1 text-xs text-red-500 font-bold">{errors.tipoRisco}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Intensidade</label>
                    <select name="intensidade" value={formData.intensidade} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      <option value="baixo">Baixo</option>
                      <option value="medio">Médio</option>
                      <option value="alto">Alto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Presente?</label>
                    <div className="flex items-center gap-4 h-full pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="presente" checked={formData.presente} onChange={() => setFormData(prev => ({ ...prev, presente: true }))} className="w-4 h-4 text-amber-600" /> Sim
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="presente" checked={!formData.presente} onChange={() => setFormData(prev => ({ ...prev, presente: false }))} className="w-4 h-4 text-amber-600" /> Não
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Fonte Geradora</label>
                    <input name="fonteGeradora" value={formData.fonteGeradora} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="Ex: Máquina X, Setor Y"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Frequência de Exposição</label>
                    <select name="frequenciaExposicao" value={formData.frequenciaExposicao} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      <option value="diaria">Diária</option>
                      <option value="semanal">Semanal</option>
                      <option value="quinzenal">Quinzenal</option>
                      <option value="mensal">Mensal</option>
                      <option value="eventual">Eventual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Duração da Exposição</label>
                    <input name="duracaoExposicao" value={formData.duracaoExposicao} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="Ex: 8h/dia, 2h/semana"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Observação</label>
                    <textarea name="observacao" value={formData.observacao} onChange={handleChange} rows={2}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                      placeholder="Observações adicionais..."
                    />
                  </div>
                </div>
              </div>

              {/* Medidas de Controle */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Building2 size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Medidas de Controle</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="epcUtilizado" checked={formData.epcUtilizado} onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500 transition-all" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">EPC Utilizado?</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="epiUtilizado" checked={formData.epiUtilizado} onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500 transition-all" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">EPI Utilizado?</span>
                  </label>
                  {formData.epcUtilizado && (
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Descrição do EPC</label>
                      <input name="epcDescricao" value={formData.epcDescricao} onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                        placeholder="Descrição do equipamento de proteção coletiva"
                      />
                    </div>
                  )}
                  {formData.epiUtilizado && (
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Descrição do EPI</label>
                      <input name="epiDescricao" value={formData.epiDescricao} onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                        placeholder="Descrição do equipamento de proteção individual"
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">CA dos EPIs (separados por vírgula)</label>
                    <input name="caEpis" value={formData.caEpis} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono"
                      placeholder="Ex: 12345, 67890"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Medidas de Controle</label>
                    <textarea name="medidasControle" value={formData.medidasControle} onChange={handleChange} rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                      placeholder="Descreva as medidas de controle implementadas..."
                    />
                  </div>
                </div>
              </div>

              {/* Avaliação */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Shield size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Avaliação</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data da Avaliação</label>
                    <input type="date" name="dataAvaliacao" value={formData.dataAvaliacao} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Avaliador</label>
                    <input name="avaliador" value={formData.avaliador} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="Nome do avaliador"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Shield size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Controle</h2>
                </div>
                <div className="p-8 space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-amber-600 focus:ring-amber-500 transition-all" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Risco Ativo?</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Desmarque se controlado</span>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-amber-100 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><Save size={20} /><span>{isEdicao ? 'Salvar Alterações' : 'Registrar Risco'}</span></>
                )}
              </button>

              <button type="button" onClick={() => navigate(`/trabalhadores/${id}/riscos-ocupacionais`)}
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

export default FormRiscoOcupacional;
