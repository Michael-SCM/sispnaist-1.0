import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../../../store/userStore.js';
import { ArrowLeft, Save, Shield, User } from 'lucide-react';

const EditarUsuario: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuarioAtual, fetchUser, updateUser, loading, error, limparErro } = useUserStore();

  const [formData, setFormData] = useState({
    perfil: '',
    ativo: true,
  });

  useEffect(() => {
    limparErro();
    if (id) {
      fetchUser(id);
    }
  }, [id, fetchUser, limparErro]);

  useEffect(() => {
    if (usuarioAtual) {
      setFormData({
        perfil: usuarioAtual.perfil || 'trabalhador',
        ativo: usuarioAtual.ativo ?? true,
      });
    }
  }, [usuarioAtual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateUser(id, formData);
      navigate('/admin/usuarios');
    } catch (err) {
      // Erro tratado no store
    }
  };

  if (!usuarioAtual && loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/admin/usuarios')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Permissões</h1>
          <p className="text-gray-600">Alterar perfil e status de acesso do usuário</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-6 bg-blue-50 border-b border-blue-100 flex items-center space-x-4">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {usuarioAtual?.nome.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900">{usuarioAtual?.nome}</h2>
            <p className="text-blue-700">{usuarioAtual?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Nível de Acesso (Perfil)
            </label>
            <select
              value={formData.perfil}
              onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="admin">Administrador (Acesso total)</option>
              <option value="saude">Saúde (Acesso a fichas clínicas)</option>
              <option value="gestor">Gestor (Visualização e relatórios)</option>
              <option value="trabalhador">Trabalhador (Perfil básico)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Status da Conta
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, ativo: true })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${formData.ativo ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}
              >
                Ativa (Pode logar)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, ativo: false })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${!formData.ativo ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-500'}`}
              >
                Inativa (Bloqueado)
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/usuarios')}
              className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarUsuario;
