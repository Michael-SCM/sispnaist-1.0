import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUnidadeStore } from '../../../store/unidadeStore.js';
import { useEmpresaStore } from '../../../store/empresaStore.js';
import { ArrowLeft, Save, MapPin } from 'lucide-react';

const FormUnidade: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { unidadeAtual, fetchUnidade, createUnidade, updateUnidade, loading, error, limparErro } = useUnidadeStore();
  const { empresas, fetchEmpresas } = useEmpresaStore();

  const [formData, setFormData] = useState({
    nome: '',
    empresaId: '',
    gestor: '',
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
    fetchEmpresas(1, 100);
    if (id) {
      fetchUnidade(id);
    }
  }, [id, fetchUnidade, fetchEmpresas, limparErro]);

  useEffect(() => {
    if (id && unidadeAtual) {
      setFormData({
        nome: unidadeAtual.nome || '',
        empresaId: typeof unidadeAtual.empresaId === 'string' 
          ? unidadeAtual.empresaId 
          : (unidadeAtual.empresaId as any)?._id || '',
        gestor: unidadeAtual.gestor || '',
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
    try {
      if (id) {
        await updateUnidade(id, formData);
      } else {
        await createUnidade(formData);
      }
      navigate('/admin/unidades');
    } catch (err) {
      // Erro já tratado no store
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/unidades')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Editar Unidade' : 'Nova Unidade'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Atualize os dados da unidade' : 'Preencha os dados da nova unidade/setor'}
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
              <MapPin className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Dados da Unidade</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nome da Unidade *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="Ex: Matriz, Filial Norte, Departamento de RH"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Empresa *</label>
                <select
                  name="empresaId"
                  required
                  value={formData.empresaId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Selecione uma empresa</option>
                  {empresas.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Gestor Responsável</label>
                <input
                  type="text"
                  name="gestor"
                  value={formData.gestor}
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
            </div>
          </section>

          {/* Endereço */}
          <section>
            <div className="flex items-center mb-4 text-blue-600">
              <MapPin className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Localização</h2>
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
            </div>
          </section>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/unidades')}
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
            Salvar Unidade
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormUnidade;
