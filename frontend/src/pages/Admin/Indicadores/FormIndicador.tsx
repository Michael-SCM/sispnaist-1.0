import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { indicadorService } from '../../../services/indicadorService.js';
import type { IIndicador, IMetricaDisponivel, IFormulaIndicador } from '../../../types/indicadores.js';
import { CATEGORIAS, PERIODICIDADES, CORES, ICONES, UFS } from '../../../types/indicadores.js';
import { ArrowLeft, Save, BarChart3, Play } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import toast from 'react-hot-toast';

const TIPOS_FORMULA: { value: IFormulaIndicador['type']; label: string; desc: string }[] = [
  { value: 'simple', label: 'Métrica Simples', desc: 'Usa o valor direto de uma métrica' },
  { value: 'percentage', label: 'Percentual', desc: '(Numerador / Denominador) × 100' },
  { value: 'ratio', label: 'Razão', desc: 'Numerador / Denominador' },
  { value: 'difference', label: 'Diferença', desc: 'Métrica 1 - Métrica 2' },
];

const corHexMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  red: 'bg-red-50 border-red-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  purple: 'bg-purple-50 border-purple-200',
  orange: 'bg-orange-50 border-orange-200',
};

const FormIndicador: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [valorCalculado, setValorCalculado] = useState<number | null>(null);
  const [alcancouMeta, setAlcancouMeta] = useState<boolean | null>(null);
  const [metricas, setMetricas] = useState<IMetricaDisponivel[]>([]);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: 'geral',
    tipo: 'quantitativo' as 'quantitativo' | 'percentual',
    formula: {
      type: 'simple' as IFormulaIndicador['type'],
      metric: '',
      numerator: '',
      denominator: '',
      metric1: '',
      metric2: '',
    },
    meta: '',
    unidade: '',
    periodicidade: 'mensal',
    uf: '',
    icone: '📊',
    cor: 'blue',
    ordem: 0,
    ativo: true,
  });

  useEffect(() => {
    indicadorService.obterMetricas()
      .then(res => setMetricas(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      indicadorService.obter(id)
        .then((ind: IIndicador) => {
          setFormData({
            nome: ind.nome || '',
            descricao: ind.descricao || '',
            categoria: ind.categoria || 'geral',
            tipo: ind.tipo || 'quantitativo',
            formula: {
              type: ind.formula?.type || 'simple',
              metric: ind.formula?.metric || '',
              numerator: ind.formula?.numerator || '',
              denominator: ind.formula?.denominator || '',
              metric1: ind.formula?.metric1 || '',
              metric2: ind.formula?.metric2 || '',
            },
            meta: ind.meta != null ? String(ind.meta) : '',
            unidade: ind.unidade || '',
            periodicidade: ind.periodicidade || 'mensal',
            uf: ind.uf || '',
            icone: ind.icone || '📊',
            cor: ind.cor || 'blue',
            ordem: ind.ordem ?? 0,
            ativo: ind.ativo ?? true,
          });
        })
        .catch(() => toast.error('Erro ao carregar indicador'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith('formula.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        formula: { ...prev.formula, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleFormulaTypeChange = (type: IFormulaIndicador['type']) => {
    setFormData(prev => ({
      ...prev,
      formula: { type, metric: '', numerator: '', denominator: '', metric1: '', metric2: '' }
    }));
  };

  const getMetricasPorCategoria = (cat?: string) => {
    if (!cat) return metricas;
    return metricas.filter(m => m.categoria === cat || cat === 'geral');
  };

  const metricasFiltradas = getMetricasPorCategoria(formData.categoria);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: any = {
        ...formData,
        meta: formData.meta !== '' ? Number(formData.meta) : null,
        ordem: Number(formData.ordem),
        uf: formData.uf || undefined,
      };

      if (id) {
        await indicadorService.atualizar(id, data);
        toast.success('Indicador atualizado com sucesso');
      } else {
        await indicadorService.criar(data);
        toast.success('Indicador criado com sucesso');
      }
      navigate('/admin/indicadores');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao salvar indicador';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCalcular = async () => {
    if (id) {
      try {
        setCalculando(true);
        const resultado = await indicadorService.calcular(id, formData.uf || undefined);
        setValorCalculado(resultado.valor);
        setAlcancouMeta(resultado.alcancouMeta);
      } catch {
        toast.error('Erro ao calcular indicador');
      } finally {
        setCalculando(false);
      }
    }
  };

  const renderFormulaFields = () => {
    switch (formData.formula.type) {
      case 'simple':
        return (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Métrica *</label>
            <select name="formula.metric" value={formData.formula.metric} onChange={handleChange} required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
              <option value="">Selecione uma métrica</option>
              {metricasFiltradas.map(m => (
                <option key={m.chave} value={m.chave}>{m.nome} — {m.descricao}</option>
              ))}
            </select>
          </div>
        );
      case 'percentage':
      case 'ratio':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Numerador *</label>
              <select name="formula.numerator" value={formData.formula.numerator} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                <option value="">Selecione</option>
                {metricasFiltradas.map(m => (
                  <option key={m.chave} value={m.chave}>{m.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Denominador *</label>
              <select name="formula.denominator" value={formData.formula.denominator} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                <option value="">Selecione</option>
                {metricasFiltradas.map(m => (
                  <option key={m.chave} value={m.chave}>{m.nome}</option>
                ))}
              </select>
            </div>
          </div>
        );
      case 'difference':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Métrica 1 *</label>
              <select name="formula.metric1" value={formData.formula.metric1} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                <option value="">Selecione</option>
                {metricasFiltradas.map(m => (
                  <option key={m.chave} value={m.chave}>{m.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Métrica 2 *</label>
              <select name="formula.metric2" value={formData.formula.metric2} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                <option value="">Selecione</option>
                {metricasFiltradas.map(m => (
                  <option key={m.chave} value={m.chave}>{m.nome}</option>
                ))}
              </select>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-slate-100 rounded w-48" />
          <div className="h-96 bg-slate-50 rounded-3xl" />
        </div>
      </MainLayout>
    );
  }

  const formulaLabel = TIPOS_FORMULA.find(t => t.value === formData.formula.type);

  return (
    <MainLayout>
      <DocumentTitle title={id ? 'Editar Indicador' : 'Novo Indicador'} />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/indicadores')}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 active:scale-90">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {id ? 'Editar Indicador' : 'Novo Indicador'}
            </h1>
            <p className="text-slate-500 font-medium">
              {id ? 'Atualize as informações do indicador' : 'Crie um novo indicador personalizado'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <BarChart3 size={20} className="text-purple-600" />
                  <h2 className="text-lg font-bold text-slate-900">Informações do Indicador</h2>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nome *</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} required
                    placeholder="Ex: Taxa de acidentes resolvidos"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleChange}
                    placeholder="Descreva o propósito deste indicador"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Categoria *</label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                      {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tipo *</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                      <option value="quantitativo">Quantitativo (#)</option>
                      <option value="percentual">Percentual (%)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <BarChart3 size={20} className="text-green-600" />
                  <h2 className="text-lg font-bold text-slate-900">Fórmula</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TIPOS_FORMULA.map(tf => (
                    <button key={tf.value} type="button" onClick={() => handleFormulaTypeChange(tf.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.formula.type === tf.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}>
                      <span className="block font-bold text-slate-800">{tf.label}</span>
                      <span className="block text-xs text-slate-500 mt-1">{tf.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {formData.formula.type && (
                    <p className="text-sm text-slate-500 mb-3">
                      Fórmula selecionada: <strong className="text-slate-700">{formulaLabel?.label}</strong>
                      {formData.formula.type === 'simple' && formData.formula.metric && (
                        <span> → {metricas.find(m => m.chave === formData.formula.metric)?.nome || formData.formula.metric}</span>
                      )}
                      {formData.formula.type === 'percentage' && (
                        <span> → {metricas.find(m => m.chave === formData.formula.numerator)?.nome || '?'} / {metricas.find(m => m.chave === formData.formula.denominator)?.nome || '?'} × 100</span>
                      )}
                      {formData.formula.type === 'ratio' && (
                        <span> → {metricas.find(m => m.chave === formData.formula.numerator)?.nome || '?'} / {metricas.find(m => m.chave === formData.formula.denominator)?.nome || '?'}</span>
                      )}
                      {formData.formula.type === 'difference' && (
                        <span> → {metricas.find(m => m.chave === formData.formula.metric1)?.nome || '?'} - {metricas.find(m => m.chave === formData.formula.metric2)?.nome || '?'}</span>
                      )}
                    </p>
                  )}
                  {renderFormulaFields()}
                </div>

                {id && (
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={handleCalcular} disabled={calculando}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold disabled:opacity-50 text-sm">
                      <Play size={16} />
                      {calculando ? 'Calculando...' : 'Calcular Valor Atual'}
                    </button>
                    {valorCalculado != null && (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                        alcancouMeta === true ? 'bg-green-50 text-green-700' :
                        alcancouMeta === false ? 'bg-red-50 text-red-600' :
                        'bg-slate-50 text-slate-700'
                      }`}>
                        Valor: {formData.tipo === 'percentual' ? `${valorCalculado}%` : valorCalculado}
                        {alcancouMeta === true && ' ✓ Meta atingida'}
                        {alcancouMeta === false && ' ✗ Abaixo da meta'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <BarChart3 size={20} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Meta e Periodicidade</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Meta</label>
                    <input type="number" name="meta" value={formData.meta} onChange={handleChange}
                      placeholder="Ex: 80"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Unidade</label>
                    <input type="text" name="unidade" value={formData.unidade} onChange={handleChange}
                      placeholder="Ex: pessoas, dias, %"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Periodicidade *</label>
                    <select name="periodicidade" value={formData.periodicidade} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                      {PERIODICIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">UF (opcional)</label>
                  <select name="uf" value={formData.uf} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                    <option value="">Nacional (todas as UFs)</option>
                    {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Personalização</h2>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ícone</label>
                  <div className="grid grid-cols-5 gap-2">
                    {ICONES.map(ic => (
                      <button key={ic.value} type="button" onClick={() => setFormData(prev => ({ ...prev, icone: ic.value }))}
                        className={`p-2 text-xl rounded-xl border-2 transition-all ${
                          formData.icone === ic.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-transparent hover:border-slate-200'
                        }`}>
                        {ic.value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cor</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CORES.map(c => (
                      <button key={c} type="button" onClick={() => setFormData(prev => ({ ...prev, cor: c }))}
                        className={`p-3 rounded-xl border-2 text-xs font-bold transition-all capitalize ${
                          formData.cor === c
                            ? 'border-purple-500 ring-2 ring-purple-200'
                            : 'border-transparent'
                        } ${corHexMap[c] || 'bg-slate-50'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ordem</label>
                  <input type="number" name="ordem" value={formData.ordem} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                </div>

                <label className="flex items-center gap-3">
                  <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm font-bold text-slate-700">Indicador ativo</span>
                </label>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <button type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 font-bold disabled:opacity-50">
                  <Save size={20} />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default FormIndicador;
