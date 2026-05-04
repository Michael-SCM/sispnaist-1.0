import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useDoencaStore } from '../../store/doencaStore.js';
import { doencaService } from '../../services/doencaService.js';
import { IDoenca } from '../../types/index.js';
import { 
  HeartPulse, 
  ArrowLeft, 
  Save, 
  Stethoscope, 
  Calendar, 
  FileText, 
  User, 
  Info,
  CheckCircle2,
  Loader2,
  Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  trabalhadorId: string;
  dataInicio: string;
  dataFim: string;
  codigoDoenca: string;
  nomeDoenca: string;
  relatoClinico: string;
  profissionalSaude: string;
  ativo: boolean;
}

export const EditarDoenca: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { atualizarDoenca } = useDoencaStore();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      carregarDoenca();
    }
  }, [id]);

  const extrairCPF = (trabalhador: any): string => {
    if (typeof trabalhador === 'string') return trabalhador;
    if (trabalhador && typeof trabalhador === 'object' && trabalhador.cpf) {
      return trabalhador.cpf;
    }
    return '';
  };

  const carregarDoenca = async () => {
    try {
      setIsLoading(true);
      const doenca = await doencaService.obter(id!);
      setFormData({
        trabalhadorId: extrairCPF(doenca.trabalhadorId),
        dataInicio: doenca.dataInicio ? new Date(doenca.dataInicio).toISOString().split('T')[0] : '',
        dataFim: doenca.dataFim ? new Date(doenca.dataFim).toISOString().split('T')[0] : '',
        codigoDoenca: doenca.codigoDoenca || '',
        nomeDoenca: doenca.nomeDoenca || '',
        relatoClinico: doenca.relatoClinico || '',
        profissionalSaude: doenca.profissionalSaude || '',
        ativo: doenca.ativo !== false,
      });
    } catch (error) {
      toast.error('Erro ao carregar doença');
      navigate('/doencas');
    } finally {
      setIsLoading(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};
    if (!formData?.dataInicio) novoErros.dataInicio = 'Obrigatória';
    if (!formData?.codigoDoenca.trim()) novoErros.codigoDoenca = 'Obrigatório';
    if (!formData?.nomeDoenca.trim()) novoErros.nomeDoenca = 'Obrigatório';
    setErrors(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
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

    if (!id || !formData || !validar()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      setIsSaving(true);
      const doencaAtualizar: Partial<FormData> = {
        ...formData,
        dataFim: formData.dataFim ? formData.dataFim : undefined,
      };

      const doencaAtualizada = await doencaService.atualizar(id, doencaAtualizar as any);
      atualizarDoenca(id, doencaAtualizada);
      toast.success('Doença atualizada com sucesso!');
      navigate('/doencas');
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar doença');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-rose-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando diagnóstico...</p>
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
            onClick={() => navigate('/doencas')}
            className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-rose-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Editar Doença</h1>
            <p className="text-slate-500 font-medium">Atualização de acompanhamento clínico</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Diagnóstico */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Stethoscope size={20} className="text-rose-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados do Diagnóstico</h2>
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
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Código CID *</label>
                    <input
                      required
                      name="codigoDoenca"
                      value={formData.codigoDoenca}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Início dos Sintomas *</label>
                    <input
                      type="date"
                      required
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Nome da Doença *</label>
                    <input
                      required
                      name="nomeDoenca"
                      value={formData.nomeDoenca}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Relato Clínico */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={20} className="text-rose-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Evolução Clínica</h2>
                </div>
                <div className="p-8">
                  <textarea
                    name="relatoClinico"
                    value={formData.relatoClinico}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all resize-none"
                    placeholder="Atualize as observações sobre a evolução da doença..."
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-rose-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Status</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Profissional Responsável</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        name="profissionalSaude"
                        value={formData.profissionalSaude}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data Encerramento</label>
                    <input
                      type="date"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group pt-4 border-t border-slate-50">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-rose-600 focus:ring-rose-500 transition-all"
                    />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Doença Ativa?</span>
                  </label>

                  <div className="pt-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold">Registro Atualizado</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-rose-100 disabled:opacity-50 active:scale-95"
              >
                {isSaving ? (
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
                onClick={() => navigate('/doencas')}
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

export default EditarDoenca;
