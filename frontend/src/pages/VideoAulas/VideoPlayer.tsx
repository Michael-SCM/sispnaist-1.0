import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { DocumentTitle } from '../../hooks/useDocumentTitle.js';
import { videoAulaService } from '../../services/videoAulaService.js';
import { quizService } from '../../services/quizService.js';
import { treinamentoService } from '../../services/treinamentoService.js';
import { IVideoAula, IQuiz, IProgressoTreinamento, IResultadoQuiz } from '../../types/index.js';
import { QuizModal } from '../../components/QuizModal.js';
import { ArrowLeft, Eye, Clock, Tag, ClipboardCheck, Award, BookOpen, Heart, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<IVideoAula | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<IQuiz | null>(null);
  const [quizCarregado, setQuizCarregado] = useState(false);
  const [progresso, setProgresso] = useState<IProgressoTreinamento | null>(null);
  const [progressoCarregado, setProgressoCarregado] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [emitindoCertificado, setEmitindoCertificado] = useState(false);
  const [certificadoEmitido, setCertificadoEmitido] = useState(false);

  useEffect(() => {
    carregarVideo();
  }, [id]);

  useEffect(() => {
    if (video && id) {
      carregarQuiz();
      carregarProgresso();
    }
  }, [video]);

  const carregarVideo = async () => {
    try {
      setIsLoading(true);
      const resp: any = await videoAulaService.obter(id!);
      const data: any = resp?.data ?? resp;
      if (!data) {
        toast.error('Vídeo não encontrado');
        navigate('/video-aulas');
        return;
      }
      setVideo(data);
    } catch (error) {
      toast.error('Erro ao carregar vídeo');
      console.error(error);
      navigate('/video-aulas');
    } finally {
      setIsLoading(false);
    }
  };

  const carregarQuiz = async () => {
    try {
      const data = await quizService.obterPorVideo(id!);
      setQuiz(data);
    } catch {
      setQuiz(null);
    } finally {
      setQuizCarregado(true);
    }
  };

  const carregarProgresso = async () => {
    try {
      const data = await treinamentoService.obterProgresso(id!);
      setProgresso(data);
      setCertificadoEmitido(data.certificadoEmitido);
    } catch {
      setProgresso(null);
    } finally {
      setProgressoCarregado(true);
    }
  };

  const handleMarcarAssistido = async () => {
    if (!id) return;
    try {
      const data = await treinamentoService.marcarAssistido(id);
      setProgresso(data);
      toast.success('Progresso registrado!');
    } catch {
      toast.error('Erro ao registrar progresso');
    }
  };

  const handleAlternarFavorito = async () => {
    if (!id) return;
    try {
      const data = await treinamentoService.alternarFavorito(id);
      setProgresso(data);
      toast.success(data.favorito ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    } catch {
      toast.error('Erro ao atualizar favorito');
    }
  };

  const handleQuizSubmit = async (respostas: number[]): Promise<IResultadoQuiz> => {
    const resultado = await treinamentoService.submeterQuiz(id!, respostas);
    await carregarProgresso();
    return resultado;
  };

  const handleEmitirCertificado = async () => {
    if (!id) return;
    try {
      setEmitindoCertificado(true);
      await treinamentoService.emitirCertificado(id);
      setCertificadoEmitido(true);
      await carregarProgresso();
      toast.success('Certificado emitido com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao emitir certificado');
    } finally {
      setEmitindoCertificado(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
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
        <DocumentTitle title="Carregando..." />
        <div className="p-6 max-w-5xl mx-auto flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!video) {
    return (
      <MainLayout>
        <DocumentTitle title="Vídeo não encontrado" />
        <div className="p-6 max-w-5xl mx-auto text-center text-slate-600">
          Vídeo não disponível.
        </div>
      </MainLayout>
    );
  }

  const embedUrl = video?.url ? getEmbedUrl(video.url) : '';

  return (
    <MainLayout>
      <DocumentTitle title={video?.titulo ? `Vídeo: ${video.titulo}` : 'Vídeo Aula'} />
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/video-aulas')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors w-fit"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>

          {progressoCarregado && (
            <button
              onClick={handleAlternarFavorito}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                progresso?.favorito
                  ? 'bg-red-50 text-red-500 hover:bg-red-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              aria-label={progresso?.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart size={18} fill={progresso?.favorito ? 'currentColor' : 'none'} />
              {progresso?.favorito ? 'Favoritado' : 'Favoritar'}
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          
          {/* Video Player Container */}
          <div className="relative aspect-video bg-black w-full">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={video.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/80 text-center p-6">
                URL do vídeo inválida ou vazia.
                <div className="mt-2 text-xs text-white/60 break-all">
                  url: {video?.url}
                </div>
              </div>
            )}
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

                {/* Progress Badge */}
                {progressoCarregado && progresso && (
                  <>
                    {progresso.assistido && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                        <CheckCircle2 size={14} />
                        Assistido
                      </div>
                    )}
                    {progresso.quizAprovado && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs">
                        <Award size={14} />
                        Aprovado ({progresso.melhormaPontuacao}%)
                      </div>
                    )}
                  </>
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

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mark as watched */}
          <button
            onClick={handleMarcarAssistido}
            disabled={progresso?.assistido}
            className={`flex items-center justify-center gap-3 p-5 rounded-2xl font-bold transition-all ${
              progresso?.assistido
                ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 cursor-default'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-md active:scale-[0.98]'
            }`}
          >
            <BookOpen size={24} />
            {progresso?.assistido ? 'Assistido ✓' : 'Marcar como Assistido'}
          </button>

          {/* Take Quiz */}
          {quizCarregado && quiz && (
            <button
              onClick={() => setShowQuiz(true)}
              disabled={!progresso?.assistido}
              className={`flex items-center justify-center gap-3 p-5 rounded-2xl font-bold transition-all ${
                progresso?.quizAprovado
                  ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 cursor-default'
                  : progresso?.assistido
                  ? 'bg-white border-2 border-violet-300 text-violet-700 hover:bg-violet-50 hover:shadow-md active:scale-[0.98]'
                  : 'bg-slate-50 border-2 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={!progresso?.assistido ? 'Assista ao vídeo primeiro' : ''}
            >
              <ClipboardCheck size={24} />
              {progresso?.quizAprovado
                ? `Quiz Aprovado (${progresso.melhormaPontuacao}%)`
                : progresso?.quizRealizado
                ? 'Tentar Quiz Novamente'
                : 'Fazer Quiz'}
            </button>
          )}

          {/* Certificate */}
          <button
            onClick={handleEmitirCertificado}
            disabled={!progresso?.quizAprovado || certificadoEmitido || emitindoCertificado}
            className={`flex items-center justify-center gap-3 p-5 rounded-2xl font-bold transition-all ${
              certificadoEmitido
                ? 'bg-amber-50 text-amber-600 border-2 border-amber-200 cursor-default'
                : progresso?.quizAprovado
                ? 'bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:shadow-md active:scale-[0.98]'
                : 'bg-slate-50 border-2 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title={!progresso?.quizAprovado ? 'Seja aprovado no quiz primeiro' : ''}
          >
            <Award size={24} />
            {emitindoCertificado
              ? 'Emitindo...'
              : certificadoEmitido
              ? 'Certificado Emitido ✓'
              : 'Emitir Certificado'}
          </button>
        </div>

        {/* Quiz Modal */}
        {showQuiz && quiz && (
          <QuizModal
            quiz={quiz}
            onSubmit={handleQuizSubmit}
            onClose={() => setShowQuiz(false)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default VideoPlayer;
