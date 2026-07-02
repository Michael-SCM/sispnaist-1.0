import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { regraValidacaoService, IEntidadeOpcao, ICampoOpcao } from '../../../services/regraValidacaoService.js';
import { ArrowLeft, Save, Gavel } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import toast from 'react-hot-toast';

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const TIPOS_LOCALIDADE = [
  { valor: 'nacional', rotulo: 'Nacional (todo o Brasil)' },
  { valor: 'uf', rotulo: 'Por UF (estado)' },
  { valor: 'municipio', rotulo: 'Por Município' }
];

const TIPOS_VALIDACAO = [
  { valor: 'obrigatorio', rotulo: 'Obrigatório', desc: 'Campo é obrigatório' },
  { valor: 'regex', rotulo: 'Regex (padrão)', desc: 'Valor deve corresponder a uma expressão regular' },
  { valor: 'min', rotulo: 'Valor mínimo', desc: 'Valor numérico mínimo' },
  { valor: 'max', rotulo: 'Valor máximo', desc: 'Valor numérico máximo' },
  { valor: 'enum', rotulo: 'Lista de valores', desc: 'Valores permitidos (separados por vírgula)' },
  { valor: 'lengthMin', rotulo: 'Comprimento mínimo', desc: 'Número mínimo de caracteres' },
  { valor: 'lengthMax', rotulo: 'Comprimento máximo', desc: 'Número máximo de caracteres' },
  { valor: 'personalizado', rotulo: 'Personalizado', desc: 'Validação personalizada (sempre gera erro)' }
];

const FormRegraValidacao: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entidades, setEntidades] = useState<IEntidadeOpcao[]>([]);
  const [campos, setCampos] = useState<ICampoOpcao[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    entidade: 'trabalhador',
    campo: '',
    tipoLocalidade: 'nacional',
    ufs: [] as string[],
    municipios: [] as string[],
    tipoValidacao: 'obrigatorio',
    valorValidacao: '',
    mensagemErro: '',
    prioridade: 0,
    ativo: true,
    dataInicioVigencia: new Date().toISOString().slice(0, 10),
    dataFimVigencia: ''
  });

  const [municipioInput, setMunicipioInput] = useState('');

  useEffect(() => {
    regraValidacaoService.listarEntidades()
      .then(setEntidades)
      .catch(() => toast.error('Erro ao carregar entidades'));
  }, []);

  useEffect(() => {
    regraValidacaoService.listarCampos(formData.entidade)
      .then(setCampos)
      .catch(() => {});
  }, [formData.entidade]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      regraValidacaoService.obter(id)
        .then(r => {
          setFormData({
            nome: r.nome || '',
            descricao: r.descricao || '',
            entidade: r.entidade,
            campo: r.campo || '',
            tipoLocalidade: r.tipoLocalidade,
            ufs: r.ufs || [],
            municipios: r.municipios || [],
            tipoValidacao: r.tipoValidacao,
            valorValidacao: r.valorValidacao || '',
            mensagemErro: r.mensagemErro || '',
            prioridade: r.prioridade ?? 0,
            ativo: r.ativo ?? true,
            dataInicioVigencia: r.dataInicioVigencia ? new Date(r.dataInicioVigencia).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            dataFimVigencia: r.dataFimVigencia ? new Date(r.dataFimVigencia).toISOString().slice(0, 10) : ''
          });
        })
        .catch(() => toast.error('Erro ao carregar regra'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const toggleUf = (uf: string) => {
    setFormData(prev => ({
      ...prev,
      ufs: prev.ufs.includes(uf)
        ? prev.ufs.filter(u => u !== uf)
        : [...prev.ufs, uf]
    }));
  };

  const selectAllUfs = () => setFormData(prev => ({ ...prev, ufs: [...UFS] }));
  const clearAllUfs = () => setFormData(prev => ({ ...prev, ufs: [] }));

  const addMunicipio = () => {
    const m = municipioInput.trim();
    if (m && !formData.municipios.includes(m)) {
      setFormData(prev => ({ ...prev, municipios: [...prev.municipios, m] }));
      setMunicipioInput('');
    }
  };

  const removeMunicipio = (m: string) => {
    setFormData(prev => ({ ...prev, municipios: prev.municipios.filter(x => x !== m) }));
  };

  const handleMunicipioKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addMunicipio(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: any = {
        ...formData,
        dataFimVigencia: formData.dataFimVigencia || undefined
      };
      if (data.dataInicioVigencia) {
        data.dataInicioVigencia = new Date(data.dataInicioVigencia).toISOString();
      }
      if (data.dataFimVigencia) {
        data.dataFimVigencia = new Date(data.dataFimVigencia).toISOString();
      }

      if (id) {
        await regraValidacaoService.atualizar(id, data);
        toast.success('Regra atualizada com sucesso');
      } else {
        await regraValidacaoService.criar(data);
        toast.success('Regra criada com sucesso');
      }
      navigate('/admin/regras-validacao');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao salvar regra';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-slate-100 rounded w-48" />
          <div className="h-96 bg-slate-50 rounded-3xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <DocumentTitle title={id ? 'Editar Regra de Validação' : 'Nova Regra de Validação'} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/regras-validacao')}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 active:scale-90">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {id ? 'Editar Regra de Validação' : 'Nova Regra de Validação'}
            </h1>
            <p className="text-slate-500 font-medium">
              {id ? 'Atualize as informações da regra' : 'Configure uma nova regra de validação por localidade'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Gavel size={20} className="text-amber-600" />
                  <h2 className="text-lg font-bold text-slate-900">Informações da Regra</h2>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nome *</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} required
                    placeholder="Ex: CAT obrigatória para acidente típico em SP"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleChange}
                    placeholder="Descreva o propósito e contexto da regra"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Entidade *</label>
                    <select name="entidade" value={formData.entidade} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                      {entidades.map(e => (
                        <option key={e.valor} value={e.valor}>{e.rotulo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Campo *</label>
                    <select name="campo" value={formData.campo} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                      <option value="">Selecione um campo</option>
                      {campos.map(c => (
                        <option key={c.valor} value={c.valor}>{c.rotulo}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Gavel size={20} className="text-amber-600" />
                  <h2 className="text-lg font-bold text-slate-900">Validação</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Validação *</label>
                    <select name="tipoValidacao" value={formData.tipoValidacao} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                      {TIPOS_VALIDACAO.map(t => (
                        <option key={t.valor} value={t.valor}>{t.rotulo}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-1">
                      {TIPOS_VALIDACAO.find(t => t.valor === formData.tipoValidacao)?.desc}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Valor da Validação *</label>
                    <input type="text" name="valorValidacao" value={formData.valorValidacao} onChange={handleChange}
                      placeholder={formData.tipoValidacao === 'obrigatorio' ? 'true' : formData.tipoValidacao === 'enum' ? 'Valor1,Valor2,Valor3' : formData.tipoValidacao === 'regex' ? '^\\d{11}$' : 'Ex: 10'}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      required={formData.tipoValidacao !== 'personalizado'} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mensagem de Erro *</label>
                  <input type="text" name="mensagemErro" value={formData.mensagemErro} onChange={handleChange} required
                    placeholder="Ex: CAT é obrigatória para acidentes típicos no estado de São Paulo"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Prioridade</label>
                  <input type="number" name="prioridade" value={formData.prioridade} onChange={handleChange} min={0}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                  <p className="text-xs text-slate-400 mt-1">Maior prioridade vence em caso de conflito entre regras</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Gavel size={20} className="text-amber-600" />
                  <h2 className="text-lg font-bold text-slate-900">Abrangência Local</h2>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Localidade *</label>
                  <select name="tipoLocalidade" value={formData.tipoLocalidade} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                    {TIPOS_LOCALIDADE.map(t => (
                      <option key={t.valor} value={t.valor}>{t.rotulo}</option>
                    ))}
                  </select>
                </div>

                {formData.tipoLocalidade === 'uf' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-slate-700">Unidades Federativas (UFs)</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={selectAllUfs}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800">Selecionar Todas</button>
                        <button type="button" onClick={clearAllUfs}
                          className="text-xs font-bold text-slate-500 hover:text-slate-700">Limpar</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
                      {UFS.map(uf => (
                        <button type="button" key={uf} onClick={() => toggleUf(uf)}
                          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                            formData.ufs.includes(uf)
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}>
                          {uf}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.tipoLocalidade === 'municipio' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Municípios</label>
                    <div className="flex gap-2 mb-3">
                      <input type="text" value={municipioInput}
                        onChange={e => setMunicipioInput(e.target.value)}
                        onKeyDown={handleMunicipioKeyDown}
                        placeholder="Digite o nome do município e pressione Enter"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                      <button type="button" onClick={addMunicipio}
                        className="px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all font-bold text-sm">
                        Adicionar
                      </button>
                    </div>
                    {formData.municipios.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.municipios.map(m => (
                          <span key={m}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold">
                            {m}
                            <button type="button" onClick={() => removeMunicipio(m)}
                              className="text-amber-400 hover:text-amber-600 ml-1">&times;</button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Nenhum município adicionado</p>
                    )}
                  </div>
                )}

                {formData.tipoLocalidade === 'nacional' && (
                  <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4">
                    Esta regra se aplica a <strong>todo o território nacional</strong>, independentemente da localidade.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Gavel size={20} className="text-amber-600" />
                  <h2 className="text-lg font-bold text-slate-900">Vigência</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Data Início *</label>
                    <input type="date" name="dataInicioVigencia" value={formData.dataInicioVigencia} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Data Fim</label>
                    <input type="date" name="dataFimVigencia" value={formData.dataFimVigencia} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                    <p className="text-xs text-slate-400 mt-1">Deixe em branco para vigência indefinida</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Status</h2>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                  <span className="text-sm font-bold text-slate-700">Regra ativa</span>
                </label>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <button type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-100 font-bold disabled:opacity-50">
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

export default FormRegraValidacao;
