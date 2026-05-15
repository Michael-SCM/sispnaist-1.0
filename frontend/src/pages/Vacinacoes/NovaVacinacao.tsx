import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useVacinacaoStore } from '../../store/vacinacaoStore.js';
import { vacinacaoService } from '../../services/vacinacaoService.js';
import { 
  Syringe, 
  ArrowLeft, 
  Save, 
  Calendar, 
  Building2, 
  UserCircle, 
  FileText, 
  Info,
  CheckCircle2,
  AlertCircle,
  Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';
import { maskCPF, unmaskCPF } from '../../utils/cpfMask';


interface FormData {
  trabalhadorId: string;
  vacina: string;
  dataVacinacao: string;
  proximoDose: string;
  unidadeSaude: string;
  profissional: string;
  certificado: string;
}

const INITIAL_FORM: FormData = {
  trabalhadorId: '',
  vacina: '',
  dataVacinacao: '',
  proximoDose: '',
  unidadeSaude: '',
  profissional: '',
  certificado: '',
};

export const NovaVacinacao: React.FC = () => {
  const navigate = useNavigate();
  const { adicionarVacinacao } = useVacinacaoStore();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};
    if (!formData.trabalhadorId) novoErros.trabalhadorId = 'Obrigatório';
    if (!formData.vacina) novoErros.vacina = 'Obrigatória';
    if (!formData.dataVacinacao) novoErros.dataVacinacao = 'Obrigatória';
    
    setErrors(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend = {
        ...formData,
        proximoDose: formData.proximoDose || undefined,
        unidadeSaude: formData.unidadeSaude || undefined,
        profissional: formData.profissional || undefined,
        certificado: formData.certificado || undefined,
      };

      const resultado = await vacinacaoService.criar(dataToSend);
      adicionarVacinacao(resultado.vacinacao);

      toast.success('Vacinação registrada com sucesso!');
      navigate('/vacinacoes');
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao registrar vacinação');
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
            onClick={() => navigate('/vacinacoes')}
            className="p-3 hover:bg-emerald-50 rounded-2xl transition-all text-emerald-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nova Vacinação</h1>
            <p className="text-slate-500 font-medium">Registro de imunização do trabalhador</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações da Vacina */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Syringe size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados da Imunização</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Fingerprint size={14} /> Trabalhador (CPF) *
                    </label>
                    <input
                      required
                      name="trabalhadorId"
                      value={maskCPF(formData.trabalhadorId)}
                      onChange={(e) => {
                        const unmasked = unmaskCPF(e.target.value);
                        setFormData(prev => ({ ...prev, trabalhadorId: unmasked }));
                        if (errors['trabalhadorId']) setErrors(prev => ({ ...prev, trabalhadorId: '' }));
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                      placeholder="000.000.000-00"
                    />

                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Vacina Aplicada *</label>
                    <input
                      required
                      name="vacina"
                      value={formData.vacina}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-600"
                      placeholder="Ex: Hepatite B, Influenza, COVID-19"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data da Aplicação *</label>
                    <input
                      type="date"
                      required
                      name="dataVacinacao"
                      value={formData.dataVacinacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Próxima Dose / Reforço</label>
                    <input
                      type="date"
                      name="proximoDose"
                      value={formData.proximoDose}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Local e Profissional */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Building2 size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Local de Atendimento</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Unidade de Saúde</label>
                    <input
                      name="unidadeSaude"
                      value={formData.unidadeSaude}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Ex: UBS Santa Cecília"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Profissional Responsável</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        name="profissional"
                        value={formData.profissional}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Nome do Aplicador"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Notas</h2>
                </div>
                <div className="p-8">
                  <label className="block text-sm font-bold text-slate-600 mb-2">Observações / Lote</label>
                  <textarea
                    name="certificado"
                    value={formData.certificado}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none text-sm"
                    placeholder="Informações do lote, fabricante ou validade..."
                  />
                  
                  <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Validado</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-black">
                      Certifique-se de conferir a data e o lote antes de salvar o registro.
                    </p>
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
                    <span>Salvar Registro</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/vacinacoes')}
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

export default NovaVacinacao;
