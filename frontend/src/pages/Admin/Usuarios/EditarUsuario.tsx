import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api.js';
import { useEmpresaStore } from '../../../store/empresaStore.js';
import { useUnidadeStore } from '../../../store/unidadeStore.js';
import { ArrowLeft, Save, User, Shield, Building2, MapPin, Mail, Key } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import toast from 'react-hot-toast';

const EditarUsuario: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { empresas, fetchEmpresas } = useEmpresaStore();
  const { unidades, fetchUnidades } = useUnidadeStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    perfil: 'trabalhador',
    empresa: '',
    unidade: '',
    ativo: true,
  });

  useEffect(() => {
    fetchEmpresas();
    fetchUnidades();
    if (isEditing) {
      carregarUsuario();
    }
  }, [id]);

  const carregarUsuario = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/usuarios/${id}`);
      const user = response.data.data.usuario;
      setFormData({
        nome: user.nome,
        email: user.email,
        password: '', // Não carregamos a senha
        perfil: user.perfil,
        empresa: user.empresa || '',
        unidade: user.unidade || '',
        ativo: user.ativo,
      });
    } catch (error) {
      toast.error('Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as any).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        // Na edição, se a senha estiver vazia, removemos para não alterar
        const dataToSend = { ...formData };
        if (!dataToSend.password) delete (dataToSend as any).password;
        await api.put(`/usuarios/${id}`, dataToSend);
        toast.success('Usuário atualizado com sucesso');
      } else {
        if (!formData.password) {
          toast.error('Senha é obrigatória para novos usuários');
          return;
        }
        await api.post('/usuarios', formData);
        toast.success('Usuário criado com sucesso');
      }
      navigate('/admin/usuarios');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/usuarios')}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
            </h1>
            <p className="text-slate-500 font-medium">
              Defina as permissões e vínculos institucionais do colaborador
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Data */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <User size={20} className="text-slate-900" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Perfil do Usuário</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Nome Completo *</label>
                    <input
                      required
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
                      placeholder="Ex: João da Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Mail size={14} /> E-mail de Acesso *
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Key size={14} /> {isEditing ? 'Alterar Senha' : 'Senha *'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                      placeholder={isEditing ? 'Deixe vazio para manter' : 'Mínimo 6 caracteres'}
                    />
                  </div>
                </div>
              </div>

              {/* Institutional Vínculos */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Building2 size={20} className="text-slate-900" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Vínculo Institucional</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Empresa</label>
                    <select
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {empresas.map(emp => (
                        <option key={emp._id} value={emp.razaoSocial}>{emp.razaoSocial}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Unidade</label>
                    <select
                      name="unidade"
                      value={formData.unidade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {unidades.map(uni => (
                        <option key={uni._id} value={uni.nome}>{uni.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar: Access Control */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Shield size={20} className="text-slate-900" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Nível de Acesso</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-4">Perfil do Sistema</label>
                    <div className="space-y-3">
                      {['admin', 'gestor', 'trabalhador'].map((p) => (
                        <label key={p} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                          formData.perfil === p ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                        }`}>
                          <span className="capitalize font-bold">{p}</span>
                          <input 
                            type="radio" 
                            name="perfil" 
                            value={p} 
                            checked={formData.perfil === p}
                            onChange={handleChange}
                            className="hidden"
                          />
                          {formData.perfil === p && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-12 h-6 rounded-full relative transition-all ${formData.ativo ? 'bg-green-500' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.ativo ? 'left-7' : 'left-1'}`}></div>
                      </div>
                      <span className="font-bold text-slate-700">Usuário Ativo</span>
                      <input 
                        type="checkbox" 
                        name="ativo" 
                        checked={formData.ativo} 
                        onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl font-bold transition-all shadow-xl shadow-slate-100 disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Salvar Usuário</span>
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

export default EditarUsuario;
