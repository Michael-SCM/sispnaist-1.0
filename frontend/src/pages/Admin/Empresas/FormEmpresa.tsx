import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmpresaStore } from '../../../store/empresaStore.js';
import { ArrowLeft, Save, Building2, MapPin, Mail, Phone, Info } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import toast from 'react-hot-toast';

const FormEmpresa: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { empresaAtual, fetchEmpresa, createEmpresa, updateEmpresa, loading, error, limparErro } = useEmpresaStore();

  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
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
    if (id) {
      fetchEmpresa(id);
    }
  }, [id, fetchEmpresa, limparErro]);

  useEffect(() => {
    if (id && empresaAtual) {
      setFormData({
        razaoSocial: empresaAtual.razaoSocial || '',
        nomeFantasia: empresaAtual.nomeFantasia || '',
        cnpj: empresaAtual.cnpj || '',
        email: empresaAtual.email || '',
        telefone: empresaAtual.telefone || '',
        ativa: empresaAtual.ativa ?? true,
        endereco: {
          logradouro: empresaAtual.endereco?.logradouro || '',
          numero: empresaAtual.endereco?.numero || '',
          complemento: empresaAtual.endereco?.complemento || '',
          bairro: empresaAtual.endereco?.bairro || '',
          cidade: empresaAtual.endereco?.cidade || '',
          estado: empresaAtual.endereco?.estado || '',
          cep: empresaAtual.endereco?.cep || '',
        },
      });
    }
  }, [id, empresaAtual]);

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
    try {
      if (id) {
        await updateEmpresa(id, formData);
        toast.success('Empresa atualizada com sucesso');
      } else {
        await createEmpresa(formData);
        toast.success('Empresa criada com sucesso');
      }
      navigate('/admin/empresas');
    } catch (err) {
      toast.error('Erro ao salvar empresa');
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/empresas')}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {id ? 'Editar Empresa' : 'Nova Empresa'}
            </h1>
            <p className="text-slate-500 font-medium">
              {id ? 'Atualize as informações da organização' : 'Cadastre uma nova organização no sistema'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Main Data */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados Principais</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Razão Social *</label>
                    <input
                      required
                      name="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                      placeholder="Ex: Empresa de Tecnologia Ltda"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Nome Fantasia</label>
                    <input
                      name="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">CNPJ *</label>
                    <input
                      required
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Localização</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Logradouro</label>
                    <input
                      name="endereco.logradouro"
                      value={formData.endereco.logradouro}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Número</label>
                    <input
                      name="endereco.numero"
                      value={formData.endereco.numero}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Bairro</label>
                    <input
                      name="endereco.bairro"
                      value={formData.endereco.bairro}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Cidade</label>
                    <input
                      name="endereco.cidade"
                      value={formData.endereco.cidade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Estado (UF)</label>
                    <input
                      name="endereco.estado"
                      maxLength={2}
                      value={formData.endereco.estado}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact & Status */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Status & Contato</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Status da Empresa</label>
                    <select
                      name="ativa"
                      value={String(formData.ativa)}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-blue-600"
                    >
                      <option value="true">Ativa</option>
                      <option value="false">Inativa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Mail size={14} /> E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Phone size={14} /> Telefone
                    </label>
                    <input
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Salvar Alterações</span>
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

export default FormEmpresa;
