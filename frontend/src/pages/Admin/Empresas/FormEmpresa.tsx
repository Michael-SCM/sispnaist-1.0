import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmpresaStore } from '../../../store/empresaStore.js';
import { ArrowLeft, Save, Building2 } from 'lucide-react';

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
      } else {
        await createEmpresa(formData);
      }
      navigate('/admin/empresas');
    } catch (err) {
      // Erro já tratado no store
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/empresas')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Editar Empresa' : 'Nova Empresa'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Atualize os dados da empresa' : 'Preencha os dados da nova empresa'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-6 space-y-8">
          {/* Dados Básicos */}
          <section>
            <div className="flex items-center mb-4 text-blue-600">
              <Building2 className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Dados da Empresa</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Razão Social *</label>
                <input
                  type="text"
                  name="razaoSocial"
                  required
                  value={formData.razaoSocial}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nome Fantasia</label>
                <input
                  type="text"
                  name="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">CNPJ * (99.999.999/9999-99)</label>
                <input
                  type="text"
                  name="cnpj"
                  required
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  name="ativa"
                  value={String(formData.ativa)}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="true">Ativa</option>
                  <option value="false">Inativa</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Endereço */}
          <section>
            <div className="flex items-center mb-4 text-blue-600">
              <Save className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Endereço</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-700">Logradouro</label>
                <input
                  type="text"
                  name="endereco.logradouro"
                  value={formData.endereco.logradouro}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  name="endereco.numero"
                  value={formData.endereco.numero}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Bairro</label>
                <input
                  type="text"
                  name="endereco.bairro"
                  value={formData.endereco.bairro}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Cidade</label>
                <input
                  type="text"
                  name="endereco.cidade"
                  value={formData.endereco.cidade}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Estado (UF)</label>
                <input
                  type="text"
                  name="endereco.estado"
                  maxLength={2}
                  value={formData.endereco.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">CEP (99999-999)</label>
                <input
                  type="text"
                  name="endereco.cep"
                  value={formData.endereco.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/empresas')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="animate-spin mr-2">...</span>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Empresa
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormEmpresa;
