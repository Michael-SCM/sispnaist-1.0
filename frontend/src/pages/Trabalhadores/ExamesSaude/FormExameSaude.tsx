import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { esocialService } from '../../../services/esocialService.js';
import { ITrabalhadorExameSaude, ITrabalhador } from '../../../types/index.js';
import {
  Stethoscope, ArrowLeft, Save, Loader2, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  numeroAso: string;
  dataAso: string;
  dataValidadeAso: string;
  tipoAso: string;
  medicoNome: string;
  medicoCRM: string;
  medicoUFCrm: string;
  resultado: string;
  observacaoMedica: string;
  examesRealizados: string;
  riscosOcupacionais: string;
  medicoPcmsmoNome: string;
  medicoPcmsmoCrm: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  numeroAso: '',
  dataAso: '',
  dataValidadeAso: '',
  tipoAso: '',
  medicoNome: '',
  medicoCRM: '',
  medicoUFCrm: '',
  resultado: '',
  observacaoMedica: '',
  examesRealizados: '',
  riscosOcupacionais: '',
  medicoPcmsmoNome: '',
  medicoPcmsmoCrm: '',
  ativo: true,
};

export const FormExameSaude: React.FC = () => {
  const { id, exameId } = useParams<{ id: string; exameId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(exameId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && exameId) carregarExame();
    }
  }, [id, exameId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarExame = async () => {
    try {
      setIsCarregando(true);
      const exame = await submoduloTrabalhadorService.obterExameSaude(id!, exameId!);
      if (exame) {
        setFormData({
          numeroAso: exame.numeroAso || '',
          dataAso: exame.dataAso ? exame.dataAso.split('T')[0] : '',
          dataValidadeAso: exame.dataValidadeAso ? exame.dataValidadeAso.split('T')[0] : '',
          tipoAso: exame.tipoAso || '',
          medicoNome: exame.medicoNome || '',
          medicoCRM: exame.medicoCRM || '',
          medicoUFCrm: exame.medicoUFCrm || '',
          resultado: exame.resultado || '',
          observacaoMedica: exame.observacaoMedica || '',
          examesRealizados: (exame.examesRealizados || []).join(', '),
          riscosOcupacionais: (exame.riscosOcupacionais || []).join(', '),
          medicoPcmsmoNome: exame.medicoPcmsmoNome || '',
          medicoPcmsmoCrm: exame.medicoPcmsmoCrm || '',
          ativo: exame.ativo !== false,
        });
      } else {
        toast.error('Exame não encontrado');
        navigate(`/trabalhadores/${id}/exames-saude`);
      }
    } catch {
      toast.error('Erro ao carregar exame');
    } finally {
      setIsCarregando(false);
    }
  };

  const handleConsultarEsocial2220 = async () => {
    if (!trabalhador?.cpf) {
      toast.error('Trabalhador sem CPF para consulta no e-Social');
      return;
    }
    try {
      const dados = await esocialService.buscarPorCpf(trabalhador.cpf);
      const asoList = dados.eventos?.s2220;
      if (!asoList || asoList.length === 0) {
        toast('Nenhum ASO encontrado no e-Social para este trabalhador', { icon: 'ℹ️' });
        return;
      }
      const aso = asoList.sort((a, b) => new Date(b.dataExame).getTime() - new Date(a.dataExame).getTime())[0];
      setFormData((prev) => ({
        ...prev,
        numeroAso: aso.id || '',
        dataAso: aso.dataExame ? aso.dataExame.split('T')[0] : '',
        dataValidadeAso: aso.dataValidade ? aso.dataValidade.split('T')[0] : '',
        tipoAso: aso.tipoExame?.toLowerCase() || '',
        medicoNome: aso.medicoNome || '',
        medicoCRM: aso.medicoCRM || '',
        medicoUFCrm: aso.medicoUFCrm || '',
        resultado: aso.resultado || '',
        observacaoMedica: aso.observacaoMedica || '',
        examesRealizados: (aso.examesRealizados || []).join(', '),
        riscosOcupacionais: (aso.riscosOcupacionais || []).join(', '),
        medicoPcmsmoNome: aso.medicoPcmsmoNome || '',
        medicoPcmsmoCrm: aso.medicoPcmsmoCrm || '',
      }));
      toast.success(`Dados do ASO ${aso.id} carregados do e-Social`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Trabalhador não encontrado no e-Social');
      } else {
        toast.error(error.message || 'Erro ao consultar e-Social');
      }
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};
    if (!formData.dataAso) novoErros.dataAso = 'Obrigatório';
    if (!formData.tipoAso) novoErros.tipoAso = 'Obrigatório';
    if (!formData.medicoNome) novoErros.medicoNome = 'Obrigatório';
    if (!formData.medicoCRM) novoErros.medicoCRM = 'Obrigatório';
    if (!formData.resultado) novoErros.resultado = 'Obrigatório';
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
      const dados: Partial<ITrabalhadorExameSaude> = {
        numeroAso: formData.numeroAso || undefined,
        dataAso: formData.dataAso ? new Date(formData.dataAso) : new Date(),
        dataValidadeAso: formData.dataValidadeAso ? new Date(formData.dataValidadeAso) : undefined,
        tipoAso: formData.tipoAso as any,
        medicoNome: formData.medicoNome,
        medicoCRM: formData.medicoCRM,
        medicoUFCrm: formData.medicoUFCrm || undefined,
        resultado: formData.resultado as any,
        observacaoMedica: formData.observacaoMedica || undefined,
        examesRealizados: formData.examesRealizados ? formData.examesRealizados.split(',').map(s => s.trim()).filter(Boolean) : [],
        riscosOcupacionais: formData.riscosOcupacionais ? formData.riscosOcupacionais.split(',').map(s => s.trim()).filter(Boolean) : [],
        medicoPcmsmoNome: formData.medicoPcmsmoNome || undefined,
        medicoPcmsmoCrm: formData.medicoPcmsmoCrm || undefined,
        ativo: formData.ativo,
      };
      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarExameSaude(id!, exameId!, dados);
        toast.success('Exame atualizado!');
      } else {
        await submoduloTrabalhadorService.criarExameSaude(id!, dados);
        toast.success('Exame registrado!');
      }
      navigate(`/trabalhadores/${id}/exames-saude`);
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCarregando) {
    return (
      <MainLayout>
        <DocumentTitle title="Formulário de Exame de Saúde" />
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando dados...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <DocumentTitle title="Formulário de Exame de Saúde" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/trabalhadores/${id}/exames-saude`)} className="p-3 hover:bg-emerald-50 rounded-2xl transition-all text-emerald-600 active:scale-90">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Exame de Saúde' : 'Novo Exame de Saúde'}
            </h1>
            {trabalhador && (
              <p className="text-slate-500 font-medium">Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span></p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Dados do ASO */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Stethoscope size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados do ASO (S-2220)</h2>
                  <button
                    type="button"
                    onClick={handleConsultarEsocial2220}
                    className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Search size={14} />
                    Importar do e-Social
                  </button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Número ASO</label>
                    <input type="text" name="numeroAso" value={formData.numeroAso} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: ASO-2024-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Exame <span className="text-red-500">*</span></label>
                    <select name="tipoAso" value={formData.tipoAso} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="admissional">Admissional</option>
                      <option value="periodico">Periódico</option>
                      <option value="retorno">Retorno ao Trabalho</option>
                      <option value="mudanca">Mudança de Função</option>
                      <option value="demissional">Demissional</option>
                    </select>
                    {errors.tipoAso && <p className="mt-1 text-xs text-red-500 font-bold">{errors.tipoAso}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data do Exame <span className="text-red-500">*</span></label>
                    <input type="date" name="dataAso" value={formData.dataAso} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    {errors.dataAso && <p className="mt-1 text-xs text-red-500 font-bold">{errors.dataAso}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data de Validade</label>
                    <input type="date" name="dataValidadeAso" value={formData.dataValidadeAso} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Resultado <span className="text-red-500">*</span></label>
                    <select name="resultado" value={formData.resultado} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="apto">Apto</option>
                      <option value="inapto">Inapto</option>
                      <option value="apto_com_restricoes">Apto com Restrições</option>
                    </select>
                    {errors.resultado && <p className="mt-1 text-xs text-red-500 font-bold">{errors.resultado}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Médico do Trabalho <span className="text-red-500">*</span></label>
                    <input type="text" name="medicoNome" value={formData.medicoNome} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Nome do médico" />
                    {errors.medicoNome && <p className="mt-1 text-xs text-red-500 font-bold">{errors.medicoNome}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">CRM <span className="text-red-500">*</span></label>
                    <input type="text" name="medicoCRM" value={formData.medicoCRM} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: CRM 12345" />
                    {errors.medicoCRM && <p className="mt-1 text-xs text-red-500 font-bold">{errors.medicoCRM}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">UF do CRM</label>
                    <input type="text" name="medicoUFCrm" value={formData.medicoUFCrm} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: BA" maxLength={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Exames Realizados (separados por vírgula)</label>
                    <input type="text" name="examesRealizados" value={formData.examesRealizados} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: Hemograma, Acuidade Visual, Audiometria" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Riscos Ocupacionais (separados por vírgula)</label>
                    <input type="text" name="riscosOcupacionais" value={formData.riscosOcupacionais} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: Ruído, Movimentos Repetitivos" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Observação Médica</label>
                    <textarea name="observacaoMedica" value={formData.observacaoMedica} onChange={handleChange} rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                      placeholder="Observações do médico sobre o exame..." />
                  </div>
                </div>
              </div>

              {/* Médico PCMSO */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Stethoscope size={20} className="text-slate-500" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Médico Coordenador (PCMSO)</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Nome</label>
                    <input type="text" name="medicoPcmsmoNome" value={formData.medicoPcmsmoNome} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Nome do médico coordenador do PCMSO" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">CRM</label>
                    <input type="text" name="medicoPcmsmoCrm" value={formData.medicoPcmsmoCrm} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: CRM 67890" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Stethoscope size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Controle</h2>
                </div>
                <div className="p-8 space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-emerald-600 focus:ring-emerald-500 transition-all" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Registro Ativo?</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Desmarque se substituído</span>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><Save size={20} /><span>{isEdicao ? 'Salvar Alterações' : 'Registrar Exame'}</span></>
                )}
              </button>

              <button type="button" onClick={() => navigate(`/trabalhadores/${id}/exames-saude`)}
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

export default FormExameSaude;
