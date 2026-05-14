import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { videoAulaService } from '../../services/videoAulaService.js';
import { IVideoAula } from '../../types/index.js';
import { TextInput, Select, TextArea } from '../../components/FormFields';
import { ArrowLeft, Save, Video, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const FormVideoAula: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<IVideoAula>>({
    titulo: '',
    descricao: '',
    url: '',
    thumbnail: '',
    duracao: '',
    categoria: '',
    ativo: true,
    tags: []
  });

  useEffect(() => {
    if (isEditing) {
      carregarVideo();
    }
  }, [id]);

  const carregarVideo = async () => {
    try {
      setIsLoading(true);
      const data = await videoAulaService.obter(id!);
      setFormData({
        ...data,
        tags: data.tags || []
      });
    } catch (error) {
      toast.error('Erro ao carregar dados do vídeo');
      console.error(error);
      navigate('/video-aulas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(t => t.trim()).filter(t => t);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.url) {
      toast.error('Preencha os campos obrigatórios (Título e URL)');
      return;
    }

    try {
      setIsLoading(true);
      if (isEditing) {
        await videoAulaService.atualizar(id!, formData);
        toast.success('Vídeo atualizado com sucesso!');
      } else {
        await videoAulaService.criar(formData);
        toast.success('Vídeo cadastrado com sucesso!');
      }
      navigate('/video-aulas');
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar vídeo' : 'Erro ao cadastrar vídeo');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/video-aulas')}
              className="p-3 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-sm border border-slate-100"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {isEditing ? 'Editar Vídeo Aula' : 'Nova Vídeo Aula'}
              </h1>
              <p className="text-slate-500 font-medium">Preencha as informações do material de capacitação</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-3 text-lg font-bold text-slate-800 pb-4 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Video size={20} />
              </div>
              Informações Principais
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                label="Título do Vídeo *"
                name="titulo"
                value={formData.titulo || ''}
                onChange={handleChange}
                placeholder="Ex: Treinamento de EPI"
                required
              />
              <Select
                label="Categoria"
                name="categoria"
                value={formData.categoria || ''}
                onChange={handleChange}
                options={[
                  { value: 'sst', label: 'Saúde e Segurança do Trabalho (SST)' },
                  { value: 'integracao', label: 'Integração de Novos Funcionários' },
                  { value: 'seguranca', label: 'Segurança da Informação' },
                  { value: 'saude', label: 'Saúde Ocupacional' },
                  { value: 'outros', label: 'Outros' }
                ]}
              />
              <div className="md:col-span-2">
                <TextArea
                  label="Descrição"
                  name="descricao"
                  value={formData.descricao || ''}
                  onChange={handleChange}
                  placeholder="Descreva brevemente o conteúdo deste vídeo"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-lg font-bold text-slate-800 pb-4 border-b border-slate-100 mt-8">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <PlayCircle size={20} />
              </div>
              Mídia e Configurações
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <TextInput
                  label="URL do Vídeo (YouTube, Vimeo, etc) *"
                  name="url"
                  value={formData.url || ''}
                  onChange={handleChange}
                  placeholder="Ex: https://www.youtube.com/watch?v=..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <TextInput
                  label="URL da Capa (Thumbnail)"
                  name="thumbnail"
                  value={formData.thumbnail || ''}
                  onChange={handleChange}
                  placeholder="Link para a imagem de capa (opcional)"
                />
              </div>

              <TextInput
                label="Duração"
                name="duracao"
                value={formData.duracao || ''}
                onChange={handleChange}
                placeholder="Ex: 10:45"
              />

              <TextInput
                label="Tags (separadas por vírgula)"
                name="tags"
                value={(formData.tags || []).join(', ')}
                onChange={handleTagsChange}
                placeholder="Ex: epi, segurança, nr32"
              />

              <div className="flex items-center gap-3 mt-4 md:col-span-2">
                <input
                  type="checkbox"
                  id="ativo"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                />
                <label htmlFor="ativo" className="font-bold text-slate-700 cursor-pointer">
                  Vídeo Ativo (Visível para os usuários)
                </label>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/video-aulas')}
              className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-200/50 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              <Save size={20} />
              {isEditing ? 'Atualizar Vídeo' : 'Salvar Vídeo'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default FormVideoAula;
