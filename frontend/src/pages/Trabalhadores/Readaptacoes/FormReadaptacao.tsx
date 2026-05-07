import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorReadaptacao, ITrabalhador } from '../../../types/index.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import {
  RefreshCcw,
  ArrowLeft,
  Save,
  Calendar,
  FileText,
  Info,
  CheckCircle2,
  Loader2,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  dataReadaptacao: string;
  motivo: string;
  cid: string;
  mudancaSetor: boolean;
  setorOrigem: string;
  setorReadaptacao: string;
  mudancaFuncao: boolean;
  funcaoAnterior: string;
  funcaoNova: string;
  restricao: string;
  novasAtribuicoes: string;
  acompanhamento: string;
  grauSatisfacao: string;
  laudoMedico: string;
  tempoReadaptacao: string;
  dataRetorno: string;
  observacoes: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  dataReadaptacao: '',
  motivo: '',
  cid: '',
  mudancaSetor: false,
  setorOrigem: '',
  setorReadaptacao: '',
  mudancaFuncao: false,
  funcaoAnterior: '',
  funcaoNova: '',
  restricao: '',
  novasAtribuicoes: '',
  acompanhamento: '',
  grauSatisfacao: '',
  laudoMedico: '',
  tempoReadaptacao: '',
  dataRetorno: '',
  observacoes: '',
  ativo: true,
};

export const FormReadaptacao: React.FC = () => {
  const { id, readaptacaoId } = useParams<{ id: string; readaptacaoId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(readaptacaoId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  // Catálogos
  const { itens: motivosReadaptacao } = useCatalogo('motivoReadaptacao');
  const { itens: temposReadaptacao } = useCatalogo('tempoReadaptacao');
  const { itens: acompanhamentos } = useCatalogo('acompanhamentoReadaptacao');
  const { itens: grausSatisfacao } = useCatalogo('grauSatisfacao');

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && readaptacaoId) {
        carregarReadaptacao();
      }
    }
  }, [id, readaptacaoId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarReadaptacao = async () => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarReadaptacoes(id!);
      const readaptacao = lista.find((r: ITrabalhadorReadaptacao) => r._id === readaptacaoId);
      if (readaptacao) {
        setFormData({
          dataReadaptacao: readaptacao.dataReadaptacao ? readaptacao.dataReadaptacao.split('T')[0] : '',
          motivo: readaptacao.motivo || '',
          cid: readaptacao.cid || '',
          mudancaSetor: (readaptacao as any).mudancaSetor || false,
          setorOrigem: (readaptacao as any).setorOrigem || '',
          setorReadaptacao: (readaptacao as any).setorReadaptacao || '',
          mudancaFuncao: (readaptacao as any).mudancaFuncao || false,
          funcaoAnterior: (readaptacao as any).funcaoAnterior || '',
          funcaoNova: (readaptacao as any).funcaoNova || '',
          restricao: (readaptacao as any).restricao || '',
          novasAtribuicoes: (readaptacao as any).novasAtribuicoes || '',
          acompanhamento: (readaptacao as any).acompanhamento || '',
          grauSatisfacao: (readaptacao as any).grauSatisfacao || '',
          laudoMedico: readaptacao.laudoMedico || '',
          tempoReadaptacao: readaptacao.tempoReadaptacao || '',
          dataRetorno: readaptacao.dataRetorno ? readaptacao.dataRetorno.split('T')[0] : '',
          observacoes: readaptacao.observacoes || '',
          ativo: readaptacao.ativo !== false,
        });
      } else {
        toast.error('Readaptação não encontrada');
        navigate(`/trabalhadores/${id}/readaptacoes`);
      }
    } catch (error) {
      toast.error('Erro ao carregar readaptação');
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData.dataReadaptacao) novoErros.dataReadaptacao = 'Obrigatória';
    if (!formData.motivo) novoErros.motivo = 'Obrigatório';
    if (!formData.setorOrigem.trim()) novoErros.setorOrigem = 'Obrigatório';
    if (!formData.setorReadaptacao.trim()) novoErros.setorReadaptacao = 'Obrigatório';
    if (!formData.funcaoAnterior.trim()) novoErros.funcaoAnterior = 'Obrigatória';
    if (!formData.funcaoNova.trim()) novoErros.funcaoNova = 'Obrigatória';
    if (!formData.tempoReadaptacao) novoErros.tempoReadaptacao = 'Obrigatório';
    if (!formData.restricao.trim()) novoErros.restricao = 'Obrigatória';
    if (!formData.novasAtribuicoes.trim()) novoErros.novasAtribuicoes = 'Obrigatórias';
    if (!formData.acompanhamento) novoErros.acompanhamento = 'Obrigatório';
    if (!formData.grauSatisfacao) novoErros.grauSatisfacao = 'Obrigatório';

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

      const dados: Partial<ITrabalhadorReadaptacao> = {
        ...formData,
        dataReadaptacao: formData.dataReadaptacao ? new Date(formData.dataReadaptacao) : undefined,
        dataRetorno: formData.dataRetorno ? new Date(formData.dataRetorno) : undefined,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarReadaptacao(id!, readaptacaoId!, dados);
        toast.success('Readaptação atualizada!');
      } else {
        await submoduloTrabalhadorService.criarReadaptacao(id!, dados);
        toast.success('Readaptação registrada!');
      }

      navigate(`/trabalhadores/${id}/readaptacoes`);
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
          <Loader2 size={48} className="text-purple-600 animate-spin" />
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
            onClick={() => navigate(`/trabalhadores/${id}/readaptacoes`)}
            className="p-3 hover:bg-purple-50 rounded-2xl transition-all text-purple-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Readaptação' : 'Nova Readaptação'}
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
              {/* Dados da Readaptação */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <RefreshCcw size={20} className="text-purple-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados da Readaptação</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data da Readaptação *</label>
                    <input
                      type="date"
                      required
                      name="dataReadaptacao"
                      value={formData.dataReadaptacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                    />
                    {errors.dataReadaptacao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.dataReadaptacao}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Motivo *</label>
                    <select
                      required
                      name="motivo"
                      value={formData.motivo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-purple-600"
                    >
                      <option value="">Selecione...</option>
                      {motivosReadaptacao.map((m) => (
                        <option key={m.nome} value={m.nome}>{m.nome}</option>
                      ))}
                    </select>
                    {errors.motivo && <p className="mt-1 text-xs text-red-500 font-bold">{errors.motivo}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Código CID</label>
                    <input
                      name="cid"
                      value={formData.cid}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono"
                      placeholder="Ex: J30.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Tempo de Readaptação *</label>
                    <select
                      required
                      name="tempoReadaptacao"
                      value={formData.tempoReadaptacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-bold"
                    >
                      <option value="">Selecione...</option>
                      {temposReadaptacao.map((t) => (
                        <option key={t.nome} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                    {errors.tempoReadaptacao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.tempoReadaptacao}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Laudo Médico</label>
                    <input
                      name="laudoMedico"
                      value={formData.laudoMedico}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Número do Laudo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data de Retorno</label>
                    <input
                      type="date"
                      name="dataRetorno"
                      value={formData.dataRetorno}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Atividades */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Activity size={20} className="text-purple-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Atividades</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Setor de Origem *</label>
                    <input
                      required
                      name="setorOrigem"
                      value={formData.setorOrigem}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Setor anterior"
                    />
                    {errors.setorOrigem && <p className="mt-1 text-xs text-red-500 font-bold">{errors.setorOrigem}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Setor de Readaptação *</label>
                    <input
                      required
                      name="setorReadaptacao"
                      value={formData.setorReadaptacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Novo setor"
                    />
                    {errors.setorReadaptacao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.setorReadaptacao}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Função Anterior *</label>
                    <input
                      required
                      name="funcaoAnterior"
                      value={formData.funcaoAnterior}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Função anterior"
                    />
                    {errors.funcaoAnterior && <p className="mt-1 text-xs text-red-500 font-bold">{errors.funcaoAnterior}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Função Nova *</label>
                    <input
                      required
                      name="funcaoNova"
                      value={formData.funcaoNova}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Nova função"
                    />
                    {errors.funcaoNova && <p className="mt-1 text-xs text-red-500 font-bold">{errors.funcaoNova}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-6 pt-4 border-t border-slate-50">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Descrição da Restrição *</label>
                      <textarea
                        required
                        name="restricao"
                        value={formData.restricao}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                        placeholder="Detalhes das restrições funcionais"
                      />
                      {errors.restricao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.restricao}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Novas Atribuições *</label>
                      <textarea
                        required
                        name="novasAtribuicoes"
                        value={formData.novasAtribuicoes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                        placeholder="O que o trabalhador passará a fazer"
                      />
                      {errors.novasAtribuicoes && <p className="mt-1 text-xs text-red-500 font-bold">{errors.novasAtribuicoes}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Acompanhamento *</label>
                    <select
                      required
                      name="acompanhamento"
                      value={formData.acompanhamento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {acompanhamentos.map((a) => (
                        <option key={a.nome} value={a.nome}>{a.nome}</option>
                      ))}
                    </select>
                    {errors.acompanhamento && <p className="mt-1 text-xs text-red-500 font-bold">{errors.acompanhamento}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Grau de Satisfação *</label>
                    <select
                      required
                      name="grauSatisfacao"
                      value={formData.grauSatisfacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {grausSatisfacao.map((g) => (
                        <option key={g.nome} value={g.nome}>{g.nome}</option>
                      ))}
                    </select>
                    {errors.grauSatisfacao && <p className="mt-1 text-xs text-red-500 font-bold">{errors.grauSatisfacao}</p>}
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={20} className="text-purple-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Observações</h2>
                </div>
                <div className="p-8">
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                    placeholder="Descreva detalhes relevantes sobre esta readaptação..."
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-purple-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Controle</h2>
                </div>
                <div className="p-8 space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="mudancaSetor"
                      checked={formData.mudancaSetor}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-purple-600 focus:ring-purple-500 transition-all"
                    />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Mudou de Setor?</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group pt-4 border-t border-slate-50">
                    <input
                      type="checkbox"
                      name="mudancaFuncao"
                      checked={formData.mudancaFuncao}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-purple-600 focus:ring-purple-500 transition-all"
                    />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Mudou de Função?</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group pt-4 border-t border-slate-50">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-slate-200 text-purple-600 focus:ring-purple-500 transition-all"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Readaptação Ativa?</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Desmarque se já concluída</span>
                    </div>
                  </label>

                  <div className="pt-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold">Registro Validado</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Assegure que as atividades e datas estão de acordo com o laudo médico apresentado.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-purple-100 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEdicao ? 'Salvar Alterações' : 'Registrar Readaptação'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/trabalhadores/${id}/readaptacoes`)}
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

export default FormReadaptacao;
