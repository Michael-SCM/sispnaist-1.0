import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useTrabalhadorStore } from '../../store/trabalhadorStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import empresaService from '../../services/empresaService.js';
import unidadeService from '../../services/unidadeService.js';
import { useCatalogo } from '../../hooks/useCatalogo.js';
import { ITrabalhador, IEmpresa, IUnidade } from '../../types/index.js';
import { 
  Users, 
  ArrowLeft, 
  Save, 
  User, 
  MapPin, 
  Briefcase, 
  Info,
  Mail,
  Fingerprint,
  Building,
  Calendar,
  CheckCircle2,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

export const NovoTrabalhador: React.FC = () => {
  const navigate = useNavigate();
  const { adicionarTrabalhador } = useTrabalhadorStore();
  const [isLoading, setIsLoading] = useState(false);
  const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
  const [unidades, setUnidades] = useState<IUnidade[]>([]);

  // Catálogos
  const { itens: sexos } = useCatalogo('sexo');
  const { itens: racas } = useCatalogo('racaCor');
  const { itens: escolaridades } = useCatalogo('escolaridade');
  const { itens: estadosCivis } = useCatalogo('estadoCivil');
  const { itens: tiposSanguineos } = useCatalogo('tipoSanguineo');

  useEffect(() => {
    const carregarEmpresas = async () => {
      try {
        const response = await empresaService.listarAtivas();
        const empresasData = response.data?.empresas || response.empresas || [];
        setEmpresas(empresasData);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      }
    };
    carregarEmpresas();
  }, []);

  useEffect(() => {
    const carregarUnidades = async () => {
      try {
        const response = await unidadeService.listarAtivas();
        const unidadesData = response.data?.unidades || response.unidades || [];
        setUnidades(unidadesData);
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
      }
    };
    carregarUnidades();
  }, []);

  const [formData, setFormData] = useState<Partial<ITrabalhador>>({
    nome: '',
    cpf: '',
    email: '',
    sexo: 'M',
    dataNascimento: '',
    vinculo: { situacao: 'Ativo' },
    trabalho: {},
    endereco: {},
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ITrabalhador] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.cpf) {
      toast.error('Nome e CPF são obrigatórios');
      return;
    }

    try {
      setIsLoading(true);
      const novo = await trabalhadorService.criar(formData);
      adicionarTrabalhador(novo);
      toast.success('Trabalhador cadastrado com sucesso');
      navigate('/trabalhadores');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar trabalhador');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/trabalhadores')}
            className="p-3 hover:bg-blue-50 rounded-2xl transition-all text-blue-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Novo Trabalhador</h1>
            <p className="text-slate-500 font-medium">Cadastre um novo funcionário no sistema</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Data Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dados Pessoais */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados Pessoais</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Nome Completo *</label>
                    <input
                      required
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                      placeholder="Ex: João da Silva Santos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">CPF *</label>
                    <input
                      required
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data de Nascimento</label>
                    <input
                      type="date"
                      name="dataNascimento"
                      value={formData.dataNascimento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Sexo</label>
                    <select
                      name="sexo"
                      value={formData.sexo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-blue-600"
                    >
                      {sexos.map((s) => (
                        <option key={s.sigla || s.nome} value={s.sigla || s.nome}>{s.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Estado Civil</label>
                    <select
                      name="estadoCivil"
                      value={formData.estadoCivil || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {estadosCivis.map((e) => (
                        <option key={e.nome} value={e.nome}>{e.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Endereço Residencial</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Logradouro</label>
                    <input
                      name="endereco.logradouro"
                      value={formData.endereco?.logradouro || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Número</label>
                    <input
                      name="endereco.numero"
                      value={formData.endereco?.numero || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Bairro</label>
                    <input
                      name="endereco.bairro"
                      value={formData.endereco?.bairro || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Cidade</label>
                    <input
                      name="endereco.cidade"
                      value={formData.endereco?.cidade || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Estado (UF)</label>
                    <input
                      name="endereco.estado"
                      value={formData.endereco?.estado || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Side Column */}
            <div className="space-y-6">
              {/* Trabalho & Vínculo */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Briefcase size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Vínculo Profissional</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Empresa</label>
                    <select
                      name="empresa"
                      value={formData.empresa || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {empresas.map((emp) => (
                        <option key={emp._id} value={emp._id}>{emp.razaoSocial}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Unidade</label>
                    <select
                      name="unidade"
                      value={formData.unidade || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione...</option>
                      {unidades.map((uni) => (
                        <option key={uni._id} value={uni._id}>{uni.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Situação</label>
                    <select
                      name="vinculo.situacao"
                      value={formData.vinculo?.situacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-blue-600"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Afastado">Afastado</option>
                      <option value="Desligado">Desligado</option>
                      <option value="Aposentado">Aposentado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Cargo</label>
                    <input
                      name="trabalho.cargo"
                      value={formData.trabalho?.cargo || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Ex: Analista de Sistemas"
                    />
                  </div>
                </div>
              </div>

              {/* Contato & Saúde */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Mail size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Contato & Saúde</h2>
                </div>
                <div className="p-8 space-y-6">
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
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                      <Heart size={14} className="text-rose-500" /> Tipo Sanguíneo
                    </label>
                    <select
                      name="tipoSanguineo"
                      value={formData.tipoSanguineo || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {tiposSanguineos.map((t) => (
                        <option key={t.sigla || t.nome} value={t.sigla || t.nome}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Cadastrar Trabalhador</span>
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

export default NovoTrabalhador;
