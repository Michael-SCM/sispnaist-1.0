import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Search, 
  MapPin, 
  FileText, 
  Globe,
  Info
} from 'lucide-react';
import atosService, { AtoMunicipalInovacao } from '../../services/atosService';
import enderecoService, { Bairro, Logradouro } from '../../services/enderecoService';
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

  const buscarBairros = async () => {
    if (termoBairro.length < 3) return;
    try {
      const res = await enderecoService.buscarBairros(termoBairro);
      setBairros(res);
    } catch (error) {
      console.error('Erro ao buscar bairros', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/atos-municipais')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {isEditing ? 'Editar Ato Municipal' : 'Novo Ato Municipal'}
          </h1>
          <p className="text-slate-500">Preencha as informações legais do ato de inovação.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-700">Identificação do Ato</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Número do Ato *</label>
              <input
                required
                name="nr_ato"
                value={formData.nr_ato}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ex: 123/2024"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ano *</label>
              <input
                required
                type="number"
                name="ano_ato"
                value={formData.ano_ato}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Link do Ato Legal (URL)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="link_ato_legal"
                  value={formData.link_ato_legal}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="https://diariooficial..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Localidade Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <MapPin size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-700">Localidade</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Cidade *</label>
              <input
                required
                name="nm_cidade"
                value={formData.nm_cidade}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Estado (UF) *</label>
              <input
                required
                name="nm_estado"
                maxLength={2}
                value={formData.nm_estado}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
                placeholder="Ex: SP"
              />
            </div>
          </div>
        </div>

        {/* Detalhes Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <Info size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-700">Conteúdo e Classificação</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
                <input
                  name="nm_tipo"
                  value={formData.nm_tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Categoria</label>
                <input
                  name="nm_categoria"
                  value={formData.nm_categoria}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ementa</label>
              <textarea
                name="texto_ementa"
                rows={3}
                value={formData.texto_ementa}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                placeholder="Breve resumo do ato..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Texto Legal</label>
              <textarea
                name="texto_legal"
                rows={6}
                value={formData.texto_legal}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Texto completo da lei ou decreto..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pb-12">
          <button
            type="button"
            onClick={() => navigate('/atos-municipais')}
            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save size={20} />
            )}
            Salvar Ato
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormAto;
