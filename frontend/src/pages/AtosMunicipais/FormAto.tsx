import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Search, 
  MapPin, 
  FileText, 
  Globe,
  Info,
  Gavel
} from 'lucide-react';
import atosService, { AtoMunicipalInovacao } from '../../services/atosService';
import enderecoService, { Bairro, Logradouro } from '../../services/enderecoService';
import { MainLayout } from '../../layouts/MainLayout.js';
import toast from 'react-hot-toast';

const FormAto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<AtoMunicipalInovacao>>({
    nr_ato: '',
    ano_ato: new Date().getFullYear(),
    nm_cidade: '',
    nm_estado: '',
    link_ato_legal: '',
    nm_tipo: '',
    nm_subtipo: '',
    nm_categoria: '',
    nm_classe_categoria: '',
    texto_legal: '',
    texto_ementa: '',
    ativo: true
  });

  const [loading, setLoading] = useState(false);
  
  // States for Address Search
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [logradouros, setLogradouros] = useState<Logradouro[]>([]);
  const [termoBairro, setTermoBairro] = useState('');

  useEffect(() => {
    if (isEditing) {
      carregarAto();
    }
  }, [id]);

  const carregarAto = async () => {
    try {
      const data = await atosService.obter(id!);
      setFormData(data);
    } catch (error) {
      toast.error('Erro ao carregar dados do ato');
      navigate('/atos-municipais');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await atosService.atualizar(id!, formData);
        toast.success('Ato atualizado com sucesso');
      } else {
        await atosService.criar(formData);
        toast.success('Ato criado com sucesso');
      }
      navigate('/atos-municipais');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao salvar ato';
      toast.error(msg);
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
            onClick={() => navigate('/atos-municipais')}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEditing ? 'Editar Ato Municipal' : 'Novo Ato Municipal'}
            </h1>
            <p className="text-slate-500 font-medium">Preencha as informações legais do marco regulatório</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Identificação Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={20} className="text-indigo-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Identificação do Ato</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Número do Ato *</label>
                    <input
                      required
                      name="nr_ato"
                      value={formData.nr_ato}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                      placeholder="Ex: 123/2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Ano *</label>
                    <input
                      required
                      type="number"
                      name="ano_ato"
                      value={formData.ano_ato}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2 pl-1 text-indigo-600 flex items-center gap-2">
                      <Globe size={14} /> Link do Ato Legal (URL)
                    </label>
                    <input
                      name="link_ato_legal"
                      value={formData.link_ato_legal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                      placeholder="https://diariooficial.municipio.gov.br/..."
                    />
                  </div>
                </div>
              </div>

              {/* Conteúdo Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Gavel size={20} className="text-indigo-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Conteúdo Legal</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Ementa (Resumo)</label>
                    <textarea
                      name="texto_ementa"
                      rows={3}
                      value={formData.texto_ementa}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-medium"
                      placeholder="Breve descrição do conteúdo do ato..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Texto Legal Completo</label>
                    <textarea
                      name="texto_legal"
                      rows={8}
                      value={formData.texto_legal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Cole aqui o texto na íntegra..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar: Location & Category */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <MapPin size={20} className="text-indigo-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Localidade</h2>
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Cidade *</label>
                    <input
                      required
                      name="nm_cidade"
                      value={formData.nm_cidade}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Estado (UF) *</label>
                    <input
                      required
                      name="nm_estado"
                      maxLength={2}
                      value={formData.nm_estado}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase font-bold"
                      placeholder="Ex: SP"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-indigo-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Classificação</h2>
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Tipo</label>
                    <input
                      name="nm_tipo"
                      value={formData.nm_tipo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Ex: Lei, Decreto..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 pl-1">Categoria</label>
                    <input
                      name="nm_categoria"
                      value={formData.nm_categoria}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Ex: Inovação Aberta"
                    />
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
                    <span>Salvar Ato Legal</span>
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

export default FormAto;
