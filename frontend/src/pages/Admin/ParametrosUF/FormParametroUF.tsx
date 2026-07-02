import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { parametroUfService } from '../../../services/parametroUfService.js';
import { ArrowLeft, Save, Settings2 } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import toast from 'react-hot-toast';

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const TIPOS = ['texto', 'numero', 'data', 'hora', 'boolean', 'json'];

const FormParametroUF: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    chave: '',
    valor: '',
    descricao: '',
    uf: 'SP',
    categoria: '',
    tipo: 'texto',
    ativo: true,
    dataInicioVigencia: new Date().toISOString().slice(0, 10),
    dataFimVigencia: ''
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      parametroUfService.obter(id)
        .then(p => {
          setFormData({
            chave: p.chave || '',
            valor: p.valor || '',
            descricao: p.descricao || '',
            uf: p.uf || 'SP',
            categoria: p.categoria || '',
            tipo: p.tipo || 'texto',
            ativo: p.ativo ?? true,
            dataInicioVigencia: p.dataInicioVigencia ? new Date(p.dataInicioVigencia).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            dataFimVigencia: p.dataFimVigencia ? new Date(p.dataFimVigencia).toISOString().slice(0, 10) : ''
          });
        })
        .catch(() => toast.error('Erro ao carregar parâmetro'))
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
        await parametroUfService.atualizar(id, data);
        toast.success('Parâmetro atualizado com sucesso');
      } else {
        await parametroUfService.criar(data);
        toast.success('Parâmetro criado com sucesso');
      }
      navigate('/admin/parametros-uf');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao salvar parâmetro';
      toast.error(msg);
    } finally {
      setSaving(false);
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

  return (
    <MainLayout>
      <DocumentTitle title={id ? 'Editar Parâmetro por UF' : 'Novo Parâmetro por UF'} />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/parametros-uf')}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 active:scale-90">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {id ? 'Editar Parâmetro por UF' : 'Novo Parâmetro por UF'}
            </h1>
            <p className="text-slate-500 font-medium">
              {id ? 'Atualize as informações do parâmetro' : 'Configure um novo parâmetro para um estado'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Settings2 size={20} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Informações do Parâmetro</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Chave *</label>
                    <input type="text" name="chave" value={formData.chave} onChange={handleChange} required
                      placeholder="prazo_acidente_sp"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">UF *</label>
                    <select name="uf" value={formData.uf} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Valor *</label>
                  <input type="text" name="valor" value={formData.valor} onChange={handleChange} required
                    placeholder="30"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleChange}
                    placeholder="Prazo em dias para comunicação de acidente em SP"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
                    <input type="text" name="categoria" value={formData.categoria} onChange={handleChange}
                      placeholder="acidente, vacinacao, geral"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tipo *</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Settings2 size={20} className="text-purple-600" />
                  <h2 className="text-lg font-bold text-slate-900">Vigência</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Data Início</label>
                    <input type="date" name="dataInicioVigencia" value={formData.dataInicioVigencia} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Data Fim</label>
                    <input type="date" name="dataFimVigencia" value={formData.dataFimVigencia} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Status</h2>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-bold text-slate-700">Parâmetro ativo</span>
                </label>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <button type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold disabled:opacity-50">
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

export default FormParametroUF;
