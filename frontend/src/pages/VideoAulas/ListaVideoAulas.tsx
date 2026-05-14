import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useVideoAulaStore } from '../../store/videoAulaStore.js';
import { videoAulaService } from '../../services/videoAulaService.js';
import { useAuthStore } from '../../store/authStore.js';
import { IVideoAula } from '../../types/index.js';
import { 
  Play, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Video,
  Clock,
  Eye,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ListaVideoAulas: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.perfil === 'admin' || user?.perfil === 'gestor';
  
  const {
    videoAulas,
    total,
    page,
    pages,
    isLoading,
    setVideoAulas,
    setPaginacao,
    setIsLoading,
    removerVideoAula,
  } = useVideoAulaStore();

  const [localSearch, setLocalSearch] = useState('');
  const [categoria, setCategoria] = useState('');

  const carregarVideoAulas = async (pageNumber: number = 1) => {
    try {
      setIsLoading(true);
      const filtros: any = { ativo: true };
      if (categoria) filtros.categoria = categoria;
      
      const data = await videoAulaService.listar(pageNumber, 12, filtros);
      setVideoAulas(data.data || []);
      if (data.total !== undefined) {
        setPaginacao({
          total: data.total,
          pages: data.totalPages,
          page: data.page,
          limit: data.limit,
        });
      }
    } catch (error) {
      toast.error('Erro ao carregar vídeo aulas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarVideoAulas(1);
  }, [categoria]);

  const handleDeletar = async (e: React.MouseEvent, video: IVideoAula) => {
    e.stopPropagation();
    if (!window.confirm(`Tem certeza que deseja deletar o vídeo "${video.titulo}"?`)) {
      return;
    }

    try {
      await videoAulaService.deletar(video._id!);
      removerVideoAula(video._id!);
      toast.success('Vídeo deletado com sucesso');
    } catch (error) {
      toast.error('Erro ao deletar vídeo');
      console.error(error);
    }
  };

  const filteredVideos = videoAulas.filter(video => 
    video.titulo.toLowerCase().includes(localSearch.toLowerCase()) || 
    video.descricao?.toLowerCase().includes(localSearch.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-800 p-8 rounded-3xl shadow-xl text-white">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
              <Video size={36} className="text-blue-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Capacitação & Treinamento</h1>
              <p className="text-blue-200 font-medium opacity-90">Plataforma de vídeo aulas interativas</p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/video-aulas/novo')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-blue-50 text-blue-900 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                <Plus size={20} />
                Novo Vídeo
              </button>
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar vídeos por título ou descrição..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            />
          </div>
          <div className="w-full md:w-64 shrink-0">
            <select 
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-600 cursor-pointer"
            >
              <option value="">Todas as Categorias</option>
              <option value="sst">SST</option>
              <option value="integracao">Integração</option>
              <option value="seguranca">Segurança</option>
              <option value="saude">Saúde Ocupacional</option>
              <option value="outros">Outros</option>
            </select>
          </div>
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl p-4 shadow-sm border border-slate-100 h-72">
                <div className="w-full h-40 bg-slate-100 rounded-2xl mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
            <Video className="mx-auto h-16 w-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Não encontramos nenhuma vídeo aula correspondente aos seus filtros. Tente buscar por outros termos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <div 
                key={video._id}
                onClick={() => navigate(`/video-aulas/${video._id}`)}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group cursor-pointer flex flex-col"
              >
                {/* Thumbnail Area */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.titulo} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <Video size={48} className="text-slate-700" />
                    </div>
                  )}
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300">
                      <Play size={28} className="text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {video.duracao && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-xs font-bold tracking-wider">
                      {video.duracao}
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {video.titulo}
                    </h3>
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/video-aulas/${video._id}/editar`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDeletar(e, video)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                    {video.descricao || 'Sem descrição'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Eye size={14} className="text-blue-400" />
                      <span>{video.visualizacoes || 0} views</span>
                    </div>
                    {video.categoria && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Tag size={14} className="text-emerald-400" />
                        <span>{video.categoria}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            <button
              disabled={page === 1 || isLoading}
              onClick={() => carregarVideoAulas(page - 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Anterior
            </button>
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => carregarVideoAulas(i + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  page === i + 1
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === pages || isLoading}
              onClick={() => carregarVideoAulas(page + 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ListaVideoAulas;
