import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { videoAulaService } from '../../services/videoAulaService.js';
import { IVideoAula } from '../../types/index.js';
import { ArrowLeft, Eye, Clock, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<IVideoAula | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarVideo();
  }, [id]);

  const carregarVideo = async () => {
    try {
      setIsLoading(true);
      const data = await videoAulaService.obter(id!);
      setVideo(data);
    } catch (error) {
      toast.error('Erro ao carregar vídeo');
      navigate('/video-aulas');
    } finally {
      setIsLoading(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    // Basic YouTube embed URL converter
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-5xl mx-auto flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!video) return null;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
        
        {/* Navigation */}
        <button
          onClick={() => navigate('/video-aulas')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors w-fit"
        >
          <ArrowLeft size={20} />
          Voltar para Lista de Vídeos
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          
          {/* Video Player Container */}
          <div className="relative aspect-video bg-black w-full">
            <iframe
              src={getEmbedUrl(video.url)}
              title={video.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0"
            ></iframe>
          </div>

          {/* Video Information */}
          <div className="p-8">
            <div className="flex flex-col gap-4">
              
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                {video.titulo}
              </h1>

              <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-slate-100 text-sm font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-blue-500" />
                  {video.visualizacoes} visualizações
                </div>
                
                {video.duracao && (
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-amber-500" />
                    {video.duracao}
                  </div>
                )}

                {video.categoria && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg uppercase tracking-wider text-xs">
                    {video.categoria}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Descrição</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {video.descricao || 'Nenhuma descrição fornecida.'}
                </p>
              </div>

              {video.tags && video.tags.length > 0 && (
                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <Tag size={18} className="text-slate-400 mr-2" />
                  {video.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default VideoPlayer;
