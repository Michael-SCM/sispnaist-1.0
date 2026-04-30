import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUnidadeStore } from '../../../store/unidadeStore.js';
import { useEmpresaStore } from '../../../store/empresaStore.js';
import { ArrowLeft, Save, Home, MapPin, Building2, Info } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import toast from 'react-hot-toast';

const FormUnidade: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { unidadeAtual, fetchUnidade, createUnidade, updateUnidade, loading, error, limparErro } = useUnidadeStore();
  const { empresas, fetchEmpresas } = useEmpresaStore();

  const [formData, setFormData] = useState({
    nome: '',
    empresaId: '',
    tipo: 'Própria',
    ativa: true,
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    },
  });

  useEffect(() => {
    limparErro();
    fetchEmpresas();
    if (id) {
      fetchUnidade(id);
    }
  }, [id, fetchUnidade, fetchEmpresas, limparErro]);

  useEffect(() => {
    if (id && unidadeAtual) {
      setFormData({
        nome: unidadeAtual.nome || '',
        empresaId: typeof unidadeAtual.empresaId === 'object' ? unidadeAtual.empresaId._id : unidadeAtual.empresaId || '',
        tipo: unidadeAtual.tipo || 'Própria',
        ativa: unidadeAtual.ativa ?? true,
        endereco: {
          logradouro: unidadeAtual.endereco?.logradouro || '',
          numero: unidadeAtual.endereco?.numero || '',
          complemento: unidadeAtual.endereco?.complemento || '',
          bairro: unidadeAtual.endereco?.bairro || '',
          cidade: unidadeAtual.endereco?.cidade || '',
          estado: unidadeAtual.endereco?.estado || '',
          cep: unidadeAtual.endereco?.cep || '',
        },
      });
    }
  }, [id, unidadeAtual]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'ativa' ? value === 'true' : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.empresaId) {
      toast.error('Selecione uma empresa');
      return;
    }

    try {
      if (id) {
        await updateUnidade(id, formData);
        toast.success('Unidade atualizada com sucesso');
      } else {
        await createUnidade(formData);
        toast.success('Unidade criada com sucesso');
      }
      navigate('/admin/unidades');
    } catch (err) {
      toast.error('Erro ao salvar unidade');
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/unidades')}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {id ? 'Editar Unidade' : 'Nova Unidade'}
            </h1>
            <p className="text-slate-500 font-medium">
              {id ? 'Atualize as informações da unidade' : 'Cadastre uma nova unidade vinculada a uma empresa'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Main Data */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Home size={20} className="text-indigo-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Identificação</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Nome da Unidade *</label>
                    <input
                      required
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                      placeholder="Ex: Unidade Operacional Norte"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Building2 size={14} /> Empresa Vinculada *
                    </label>
                    <select
                      required
                      name="empresaId"
                      value={formData.empresaId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    >
                      <option value="">Selecione uma empresa...</option>
                      {empresas.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.razaoSocial}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <MapPin size={20} className="text-indigo-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Endereço</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Logradouro</label>
                    <input
                      name="endereco.logradouro"
                      value={formData.endereco.logradouro}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Número</label>
                    <input
                      name="endereco.numero"
                      value={formData.endereco.numero}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Bairro</label>
                    <input
                      name="endereco.bairro"
                      value={formData.endereco.bairro}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Cidade</label>
                    <input
                      name="endereco.cidade"
                      value={formData.endereco.cidade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">UF</label>
                    <input
                      name="endereco.estado"
                      maxLength={2}
                      value={formData.endereco.estado}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Status */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-indigo-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Status</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Status da Unidade</label>
                    <select
                      name="ativa"
                      value={String(formData.ativa)}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-indigo-600"
                    >
                      <option value="true">Ativa</option>
                      <option value="false">Inativa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 font-bold">Tipo</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="Própria">Própria</option>
                      <option value="Terceirizada">Terceirizada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Salvar Unidade</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default FormUnidade;
