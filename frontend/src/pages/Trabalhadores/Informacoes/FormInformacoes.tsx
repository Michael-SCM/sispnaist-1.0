import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { informacaoService, ITrabalhadorInformacao } from '../../../services/informacaoService.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import { ITrabalhador } from '../../../types/index.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Heart,
  Activity,
  Wine,
  Cigarette,
  Zap,
  Stethoscope,
  Pill
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  doencaBase: string;
  estadoVacinal: string;
  tipoDroga: string;
  tipoSanguineo: string;
  medicamentos: string;
  allergy: boolean;
  descricaoAlergia: string;
  acompanhamentoMedico: boolean;
  acompanhamentoReabilitacao: boolean;
  usoAlcool: boolean;
  dosesAlcool: number;
  usoCigarro: boolean;
  macosCigarro: number;
  usoOutraDroga: boolean;
  frequenciaUso: string;
}

const INITIAL_FORM: FormData = {
  doencaBase: '',
  estadoVacinal: '',
  tipoDroga: '',
  tipoSanguineo: '',
  medicamentos: '',
  allergy: false,
  descricaoAlergia: '',
  acompanhamentoMedico: false,
  acompanhamentoReabilitacao: false,
  usoAlcool: false,
  dosesAlcool: 0,
  usoCigarro: false,
  macosCigarro: 0,
  usoOutraDroga: false,
  frequenciaUso: '',
};

export const FormInformacoes: React.FC = () => {
  const { id, infoId } = useParams<{ id: string; infoId?: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(infoId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  // Catálogos
  const { itens: doencasBase } = useCatalogo('doencaBase');
  const { itens: estadosVacinas } = useCatalogo('estadoVacinal');
  const { itens: tiposDroga } = useCatalogo('tipoDroga');
  const { itens: tiposSanguineos } = useCatalogo('tipoSanguineo');

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && infoId) {
        carregarInformacao();
      }
    }
  }, [id, infoId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
    }
  };

  const carregarInformacao = async () => {
    try {
      setIsCarregando(true);
      const info = await informacaoService.obterPorId(id!, infoId!);
      if (info) {
        setFormData({
          doencaBase: info.doencaBase || '',
          estadoVacinal: info.estadoVacinal || '',
          tipoDroga: info.tipoDroga || '',
          tipoSanguineo: info.tipoSanguineo || '',
          medicamentos: info.medicamentos || '',
          allergy: info.allergy || false,
          descricaoAlergia: info.descricaoAlergia || '',
          acompanhamentoMedico: info.acompanhamentoMedico || false,
          acompanhamentoReabilitacao: info.acompanhamentoReabilitacao || false,
          usoAlcool: info.usoAlcool || false,
          dosesAlcool: info.dosesAlcool || 0,
          usoCigarro: info.usoCigarro || false,
          macosCigarro: info.macosCigarro || 0,
          usoOutraDroga: info.usoOutraDroga || false,
          frequenciaUso: info.frequenciaUso || '',
        });
      } else {
        toast.error('Informações não encontradas');
        navigate(`/trabalhadores/${id}/informacoes`);
      }
    } catch (error) {
      toast.error('Erro ao carregar informações');
    } finally {
      setIsCarregando(false);
    }
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === '' ? 0 : parseInt(value, 10) || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdicao && infoId) {
        await informacaoService.atualizar(id!, infoId, formData);
        toast.success('Informações atualizadas com sucesso!');
      } else {
        await informacaoService.criar(id!, formData);
        toast.success('Informações salvas com sucesso!');
      }
      navigate(`/trabalhadores/${id}/informacoes`);
    } catch (error) {
      toast.error(isEdicao ? 'Erro ao atualizar informações' : 'Erro ao salvar informações');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-purple-600';
  const labelCls = 'block text-sm font-bold text-slate-600 mb-2';
  const selectCls = 'w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm';

  if (isCarregando) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/trabalhadores/${id}/informacoes`)}
            className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdicao ? 'Editar Informações' : 'Novas Informações'}
            </h1>
            {trabalhador && (
              <p className="text-slate-500 font-medium">
                Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Seção: Dados de Saúde */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Stethoscope size={20} />
                Dados de Saúde
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Doença de Base</label>
                  <select
                    name="doencaBase"
                    value={formData.doencaBase}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Selecione...</option>
                    {doencasBase.map((d) => (
                      <option key={d.nome} value={d.nome}>{d.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Estado Vacinal</label>
                  <select
                    name="estadoVacinal"
                    value={formData.estadoVacinal}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Selecione...</option>
                    {estadosVacinas.map((e) => (
                      <option key={e.nome} value={e.nome}>{e.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo Sanguíneo</label>
                  <select
                    name="tipoSanguineo"
                    value={formData.tipoSanguineo}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Selecione...</option>
                    {tiposSanguineos.map((t) => (
                      <option key={t.nome} value={t.nome}>{t.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Medicamentos</label>
                  <input
                    type="text"
                    name="medicamentos"
                    value={formData.medicamentos}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Medicamentos em uso"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Alergias */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <AlertCircle size={20} />
                Alergias
              </h3>
              <div className="p-6 bg-red-50 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="allergy"
                    id="allergy"
                    checked={formData.allergy}
                    onChange={handleChange}
                    className="w-5 h-5 text-red-600 rounded border-red-300 focus:ring-red-500"
                  />
                  <label htmlFor="allergy" className="text-sm font-bold text-slate-600">
                    Tem algum tipo de alergia?
                  </label>
                </div>
                {formData.allergy && (
                  <div>
                    <label className={labelCls}>Descrição da(s) alergia(s)</label>
                    <textarea
                      name="descricaoAlergia"
                      value={formData.descricaoAlergia}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-red-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      placeholder="Descreva as alergias..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Seção: Acompanhamentos */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Heart size={20} />
                Acompanhamentos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-2xl space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="acompanhamentoMedico"
                      id="acompanhamentoMedico"
                      checked={formData.acompanhamentoMedico}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                    />
                    <label htmlFor="acompanhamentoMedico" className="text-sm font-bold text-slate-600">
                      Acompanhamento médico?
                    </label>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-2xl space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="acompanhamentoReabilitacao"
                      id="acompanhamentoReabilitacao"
                      checked={formData.acompanhamentoReabilitacao}
                      onChange={handleChange}
                      className="w-5 h-5 text-green-600 rounded border-green-300 focus:ring-green-500"
                    />
                    <label htmlFor="acompanhamentoReabilitacao" className="text-sm font-bold text-slate-600">
                      Acompanhamento reabilitação?
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Uso de Substâncias */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Wine size={20} />
                Uso de Substâncias
              </h3>

              {/* Álcool */}
              <div className="p-4 bg-yellow-50 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="usoAlcool"
                    id="usoAlcool"
                    checked={formData.usoAlcool}
                    onChange={handleChange}
                    className="w-5 h-5 text-yellow-600 rounded border-yellow-300 focus:ring-yellow-500"
                  />
                  <label htmlFor="usoAlcool" className="text-sm font-bold text-slate-600">
                    Usa álcool?
                  </label>
                </div>
                {formData.usoAlcool && (
                  <div>
                    <label className={labelCls}>Quantidade de doses diárias</label>
                    <input
                      type="number"
                      name="dosesAlcool"
                      value={formData.dosesAlcool}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none"
                      placeholder="Quantidade de doses"
                    />
                  </div>
                )}
              </div>

              {/* Cigarro */}
              <div className="p-4 bg-orange-50 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="usoCigarro"
                    id="usoCigarro"
                    checked={formData.usoCigarro}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                  />
                  <label htmlFor="usoCigarro" className="text-sm font-bold text-slate-600">
                    Usa cigarro?
                  </label>
                </div>
                {formData.usoCigarro && (
                  <div>
                    <label className={labelCls}>Quantidade de maços diários</label>
                    <input
                      type="number"
                      name="macosCigarro"
                      value={formData.macosCigarro}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Quantidade de maços"
                    />
                  </div>
                )}
              </div>

              {/* Outras Drogas */}
              <div className="p-4 bg-purple-50 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="usoOutraDroga"
                    id="usoOutraDroga"
                    checked={formData.usoOutraDroga}
                    onChange={handleChange}
                    className="w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
                  />
                  <label htmlFor="usoOutraDroga" className="text-sm font-bold text-slate-600">
                    Usa outras drogas?
                  </label>
                </div>
                {formData.usoOutraDroga && (
                  <div>
                    <div className="mb-2">
                      <label className={labelCls}>Tipo de droga</label>
                      <select
                        name="tipoDroga"
                        value={formData.tipoDroga}
                        onChange={handleChange}
                        className={selectCls}
                      >
                        <option value="">Selecione...</option>
                        {tiposDroga.map((t) => (
                          <option key={t.nome} value={t.nome}>{t.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Frequência de uso</label>
                      <input
                        type="text"
                        name="frequenciaUso"
                        value={formData.frequenciaUso}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Frequência de uso"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/trabalhadores/${id}/informacoes`)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-100 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={20} />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default FormInformacoes;
