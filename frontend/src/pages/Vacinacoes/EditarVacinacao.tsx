import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Loader2,
  Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  trabalhadorId: string;
  vacina: string;
  dataVacinacao: string;
  proximoDose: string;
  unidadeSaude: string;
  profissional: string;
  certificado: string;
}

export const EditarVacinacao: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setCurrentVacinacao, atualizarVacinacao } = useVacinacaoStore();
  
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(true);

  useEffect(() => {
    const extrairCPF = (trabalhador: any): string => {
      if (typeof trabalhador === 'string') return trabalhador;
      if (trabalhador && typeof trabalhador === 'object' && trabalhador.cpf) {
        return trabalhador.cpf;
      }
      return '';
    };

    const carregarVacinacao = async () => {
      if (!id) return;
      try {
        const { vacinacao } = await vacinacaoService.obter(id);
        setCurrentVacinacao(vacinacao);

        setFormData({
          trabalhadorId: extrairCPF(vacinacao.trabalhadorId),
          vacina: vacinacao.vacina,
          dataVacinacao: vacinacao.dataVacinacao ? new Date(vacinacao.dataVacinacao).toISOString().split('T')[0] : '',
          proximoDose: vacinacao.proximoDose ? new Date(vacinacao.proximoDose).toISOString().split('T')[0] : '',
          unidadeSaude: vacinacao.unidadeSaude || '',
          profissional: vacinacao.profissional || '',
          certificado: vacinacao.certificado || '',
        });
      } catch (error) {
        toast.error('Erro ao carregar vacinação');
        navigate('/vacinacoes');
      } finally {
        setIsCarregando(false);
      }
    };

    carregarVacinacao();
  }, [id, setCurrentVacinacao, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData) return;

    if (!formData.vacina || !formData.dataVacinacao) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend = {
        vacina: formData.vacina,
        dataVacinacao: formData.dataVacinacao,
        proximoDose: formData.proximoDose || undefined,
        unidadeSaude: formData.unidadeSaude || undefined,
        profissional: formData.profissional || undefined,
        certificado: formData.certificado || undefined,
      };

      const resultado = await vacinacaoService.atualizar(id, dataToSend);
      atualizarVacinacao(id, resultado.vacinacao);

      toast.success('Vacinação atualizada com sucesso!');
      navigate('/vacinacoes');
    } catch (error) {
      toast.error('Erro ao atualizar vacinação');
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

  if (!formData) return null;

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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Editar Vacinação</h1>
            <p className="text-slate-500 font-medium">Atualização de registro de imunização</p>
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
                      <Fingerprint size={14} /> Trabalhador (CPF)
                    </label>
                    <input
                      disabled
                      value={formData.trabalhadorId}
                      className="w-full px-4 py-3 bg-slate-100 border-transparent rounded-2xl outline-none font-mono text-slate-500 cursor-not-allowed"
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
                  />
                  
                  <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Validado</span>
                    </div>
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
                    <span>Salvar Alterações</span>
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

export default EditarVacinacao;
