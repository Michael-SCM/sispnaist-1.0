import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { DocumentTitle } from '../../hooks/useDocumentTitle.js';
import { videoAulaService } from '../../services/videoAulaService.js';
import { quizService } from '../../services/quizService.js';
import { treinamentoService } from '../../services/treinamentoService.js';
import { IVideoAula, IProgressoTreinamento, IResultadoQuiz, IQuestaoSessao } from '../../types/index.js';
import { QuizModal } from '../../components/QuizModal.js';
import { ArrowLeft, Eye, Clock, Tag, ClipboardCheck, Award, BookOpen, Heart, CheckCircle2, Loader2, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<IVideoAula | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progresso, setProgresso] = useState<IProgressoTreinamento | null>(null);
  const [progressoCarregado, setProgressoCarregado] = useState(false);
  const [temQuiz, setTemQuiz] = useState(false);
  const [quizCarregado, setQuizCarregado] = useState(false);

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestoes, setQuizQuestoes] = useState<IQuestaoSessao[]>([]);
  const [iniciandoQuiz, setIniciandoQuiz] = useState(false);

  const [emitindoCertificado, setEmitindoCertificado] = useState(false);
  const [certificadoEmitido, setCertificadoEmitido] = useState(false);

  const [marcandoAssistido, setMarcandoAssistido] = useState(false);

  // YouTube player custom controls
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [ytReady, setYtReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ytCurrentTime, setYtCurrentTime] = useState(0);
  const [ytDuration, setYtDuration] = useState(0);
  const [ytVolume, setYtVolume] = useState(100);
  const [ytMuted, setYtMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const progressTimerRef = useRef<ReturnType<typeof setInterval>>();
  const ytPlayerRef = useRef<any>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

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
      setTemQuiz(!!data && data.questoes.length >= 10);
    } catch {
      setTemQuiz(false);
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

  const iniciarQuiz = useCallback(async () => {
    if (!id) return;
    try {
      setIniciandoQuiz(true);
      const data = await treinamentoService.iniciarQuiz(id);
      setQuizQuestoes(data.questoes);
      setShowQuiz(true);
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao iniciar quiz');
    } finally {
      setIniciandoQuiz(false);
    }
  }, [id]);

  const handleMarcarAssistido = async () => {
    if (!id) return;
    try {
      setMarcandoAssistido(true);
      const data = await treinamentoService.marcarAssistido(id);
      setProgresso(data);

      if (temQuiz && !data.quizAprovado) {
        setTimeout(() => iniciarQuiz(), 600);
      }
    } catch {
      toast.error('Erro ao registrar progresso');
    } finally {
      setMarcandoAssistido(false);
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
    if (resultado.aprovado) {
      setCertificadoEmitido(false);
    }
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

  const extractVideoId = (url: string): string => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1]?.split('&')[0] || '';
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1]?.split('?')[0] || '';
    }
    return '';
  };

  // Inicializa o player do YouTube via IFrame API com controles customizados
  useEffect(() => {
    if (!video?.url) return;

    const videoId = extractVideoId(video.url);
    if (!videoId) return;

    const initPlayer = () => {
      if (!playerContainerRef.current) return;
      const newPlayer = new (window as any).YT.Player(playerContainerRef.current, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          fs: 0,
          playsinline: 1,
          cc_load_policy: 0,
          enablejsapi: 1,
          autoplay: 0,
        },
        events: {
          onReady: (e: any) => {
            ytPlayerRef.current = e.target;
            setYtPlayer(e.target);
            setYtDuration(e.target.getDuration());
            setYtVolume(e.target.getVolume());
            setYtReady(true);
          },
          onStateChange: (e: any) => {
            const state = e.data;
            setIsPlaying(state === 1);
            if (state === 1) {
              setYtDuration(e.target.getDuration());
              startProgressTracking(e.target);
              startHideTimer();
            } else {
              stopProgressTracking();
              if (state === 2) stopHideTimer();
            }
            if (state === 0) setControlsVisible(true);
          },
        },
      });
    };

    if ((window as any).YT?.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [video?.url]);

  const startProgressTracking = (player: any) => {
    stopProgressTracking();
    progressTimerRef.current = setInterval(() => {
      if (player?.getCurrentTime) {
        setYtCurrentTime(player.getCurrentTime());
      }
    }, 250);
  };

  const stopProgressTracking = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = undefined;
    }
  };

  const startHideTimer = () => {
    stopHideTimer();
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  };

  const stopHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = undefined;
    }
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (isPlaying) startHideTimer();
  };

  const togglePlay = () => {
    if (!ytPlayer) return;
    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ytPlayer || !ytDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    ytPlayer.seekTo(ratio * ytDuration, true);
  };

  const toggleMute = () => {
    if (!ytPlayer) return;
    if (ytMuted) {
      ytPlayer.unMute();
      setYtMuted(false);
    } else {
      ytPlayer.mute();
      setYtMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!ytPlayer) return;
    const v = parseInt(e.target.value);
    ytPlayer.setVolume(v);
    setYtVolume(v);
    if (v === 0) {
      ytPlayer.mute();
      setYtMuted(true);
    } else if (ytMuted) {
      ytPlayer.unMute();
      setYtMuted(false);
    }
  };

  const toggleFullscreen = () => {
    const el = playerContainerRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const changeQuality = (q: string) => {
    if (!ytPlayer) return;
    ytPlayer.setPlaybackQuality(q);
    setShowSettings(false);
    toast.success(`Qualidade: ${q.toUpperCase()}`);
  };

  const changeSpeed = (rate: number) => {
    if (!ytPlayer) return;
    ytPlayer.setPlaybackRate(rate);
    setShowSettings(false);
    toast.success(`Velocidade: ${rate}x`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        const settingsBtn = document.querySelector('[aria-label="Configurações"]');
        if (settingsBtn && !settingsBtn.contains(e.target as Node)) {
          setShowSettings(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPct = ytDuration > 0 ? (ytCurrentTime / ytDuration) * 100 : 0;

  if (isLoading) {
    return (
      <MainLayout>
        <DocumentTitle title="Carregando..." />
        <div className="p-6 max-w-5xl mx-auto flex justify-center items-center h-96">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
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

  return (
    <MainLayout>
      <DocumentTitle title={video?.titulo ? `Vídeo: ${video.titulo}` : 'Vídeo Aula'} />
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
        
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
          <div
            className="relative aspect-video bg-black w-full group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { if (isPlaying) startHideTimer(); }}
          >
            {/* YouTube Player Container */}
            <div
              ref={playerContainerRef}
              className="absolute top-0 left-0 w-full h-full"
              id="youtube-player-container"
            ></div>

            {!ytReady && video?.url && (
              <div className="absolute inset-0 flex items-center justify-center text-white/60 text-center p-6 z-10">
                <Loader2 className="animate-spin h-10 w-10" />
              </div>
            )}

            {!video?.url && (
              <div className="absolute inset-0 flex items-center justify-center text-white/80 text-center p-6">
                URL do vídeo inválida ou vazia.
              </div>
            )}

            {/* Center Play Button (when paused) */}
            {ytReady && !isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center z-20 bg-black/10 transition-opacity"
                aria-label="Assistir vídeo"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-all">
                  <Play size={40} className="text-white ml-2" fill="white" />
                </div>
              </button>
            )}

            {/* Custom Controls Bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-2 px-3 md:px-4 transition-opacity duration-300 z-30 ${
                controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {/* Progress Bar */}
              <div
                className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-3 group/progress hover:h-2.5 transition-all"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-red-600 rounded-full relative"
                  style={{ width: `${progressPct}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center gap-2 md:gap-3 text-white">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label={isPlaying ? 'Pausar' : 'Assistir'}
                >
                  {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                </button>

                {/* Time */}
                <span className="text-xs font-mono text-white/80 min-w-[80px]">
                  {formatTime(ytCurrentTime)} / {formatTime(ytDuration)}
                </span>

                <div className="flex-1" />

                {/* Volume */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label={ytMuted ? 'Ativar som' : 'Mutar'}
                  >
                    {ytMuted || ytVolume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-200 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ytMuted ? 0 : ytVolume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 accent-red-600 cursor-pointer"
                      aria-label="Volume"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="relative">
                  <button
                    onClick={handleSettingsClick}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Configurações"
                  >
                    <Settings size={18} />
                  </button>
                  {showSettings && (
                    <div
                      ref={settingsRef}
                      className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900/95 backdrop-blur rounded-xl shadow-2xl border border-white/10 py-2 z-50"
                    >
                      <p className="px-4 py-1.5 text-xs text-white/50 uppercase tracking-wider font-bold">Qualidade</p>
                      {['hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small'].map(q => (
                        <button
                          key={q}
                          onClick={() => changeQuality(q)}
                          className="w-full text-left px-4 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors"
                        >
                          {q === 'hd2160' ? '4K' : q === 'hd1440' ? '2K' : q === 'hd1080' ? '1080p' : q === 'hd720' ? '720p' : q === 'large' ? '480p' : q === 'medium' ? '360p' : '240p'}
                        </button>
                      ))}
                      <div className="border-t border-white/10 my-2" />
                      <p className="px-4 py-1.5 text-xs text-white/50 uppercase tracking-wider font-bold">Velocidade</p>
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => changeSpeed(rate)}
                          className="w-full text-left px-4 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors"
                        >
                          {rate === 1 ? 'Normal' : `${rate}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Tela cheia"
                >
                  {document.fullscreenElement ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>
          </div>

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
          <button
            onClick={handleMarcarAssistido}
            disabled={progresso?.assistido || marcandoAssistido}
            className={`flex items-center justify-center gap-3 p-5 rounded-2xl font-bold transition-all ${
              progresso?.assistido
                ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 cursor-default'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-md active:scale-[0.98]'
            }`}
          >
            {marcandoAssistido ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <BookOpen size={24} />
            )}
            {progresso?.assistido ? 'Assistido ✓' : 'Marcar como Assistido'}
          </button>

          {/* Quiz Button - opens directly using iniciarQuiz */}
          {quizCarregado && temQuiz && (
            <button
              onClick={iniciarQuiz}
              disabled={!progresso?.assistido || progresso?.quizAprovado || iniciandoQuiz}
              className={`flex items-center justify-center gap-3 p-5 rounded-2xl font-bold transition-all ${
                progresso?.quizAprovado
                  ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 cursor-default'
                  : progresso?.assistido
                  ? 'bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:shadow-md active:scale-[0.98]'
                  : 'bg-slate-50 border-2 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={!progresso?.assistido ? 'Assista ao vídeo primeiro' : ''}
            >
              {iniciandoQuiz ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <ClipboardCheck size={24} />
              )}
              {progresso?.quizAprovado
                ? `Aprovado (${progresso.melhormaPontuacao}%)`
                : progresso?.quizRealizado
                ? 'Fazer Prova Novamente'
                : 'Fazer Prova'}
            </button>
          )}

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
            title={!progresso?.quizAprovado ? 'Seja aprovado na prova primeiro' : ''}
          >
            {emitindoCertificado ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Award size={24} />
            )}
            {emitindoCertificado
              ? 'Emitindo...'
              : certificadoEmitido
              ? 'Certificado Emitido ✓'
              : 'Emitir Certificado'}
          </button>
        </div>

        {/* Info when no quiz */}
        {quizCarregado && !temQuiz && progresso?.assistido && (
          <div className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-200">
            <p className="text-slate-500 font-medium text-sm">
              Este vídeo não possui prova de conhecimento. Assista e marque como assistido para registro de progresso.
            </p>
          </div>
        )}

        {/* Quiz Modal - uses the updated component */}
        {showQuiz && quizQuestoes.length > 0 && (
          <QuizModal
            questoes={quizQuestoes}
            totalQuestoes={quizQuestoes.length}
            onSubmit={handleQuizSubmit}
            onClose={() => {
              setShowQuiz(false);
              carregarProgresso();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default VideoPlayer;
