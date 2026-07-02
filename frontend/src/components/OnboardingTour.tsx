import React, { useState, useEffect, useCallback } from 'react';
import { GraduationCap, PlayCircle, ClipboardCheck, Award, ArrowRight, X } from 'lucide-react';

const STORAGE_KEY = 'sispnaist_onboarding_visto';

interface TourStep {
  icon: React.ComponentType<{ size?: number }>;
  titulo: string;
  descricao: string;
  cor: string;
}

const passos: TourStep[] = [
  {
    icon: GraduationCap,
    titulo: 'Capacitação & Treinamento',
    descricao: 'Bem-vindo ao módulo de capacitação do SISPNAIST! Aqui você encontra videoaulas, tutoriais e materiais educativos para aprimorar seus conhecimentos em SST, segurança da informação e gestão do sistema.',
    cor: 'from-blue-600 to-indigo-700'
  },
  {
    icon: PlayCircle,
    titulo: 'Assista às Videoaulas',
    descricao: 'Navegue pelos vídeos disponíveis organizados por categoria: SST, Integração, Segurança da Informação, Saúde Ocupacional e outros. Clique em qualquer vídeo para assistir.',
    cor: 'from-emerald-500 to-teal-600'
  },
  {
    icon: ClipboardCheck,
    titulo: 'Teste seus Conhecimentos',
    descricao: 'Após assistir cada videoaula, responda ao quiz para testar seu aprendizado. Você precisa de no mínimo 70% de acertos para ser aprovado.',
    cor: 'from-violet-500 to-purple-600'
  },
  {
    icon: Award,
    titulo: 'Receba seu Certificado',
    descricao: 'Ao ser aprovado no quiz, você poderá emitir um certificado de conclusão personalizado com seu nome, CPF e o código de autenticação do SISPNAIST.',
    cor: 'from-amber-500 to-orange-600'
  }
];

interface OnboardingTourProps {
  onClose?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onClose }) => {
  const [passoAtual, setPassoAtual] = useState(0);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const jaVisto = localStorage.getItem(STORAGE_KEY);
    if (!jaVisto) {
      const timer = setTimeout(() => setVisivel(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFechar = useCallback(() => {
    setVisivel(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    if (onClose) onClose();
  }, [onClose]);

  const handleProximo = useCallback(() => {
    if (passoAtual < passos.length - 1) {
      setPassoAtual((prev) => prev + 1);
    } else {
      handleFechar();
    }
  }, [passoAtual, handleFechar]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleFechar();
    if (e.key === 'Enter' || e.key === ' ') handleProximo();
  }, [handleFechar, handleProximo]);

  if (!visivel) return null;

  const passo = passos[passoAtual];
  const Icon = passo.icon;
  const isUltimo = passoAtual === passos.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleFechar}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Tour guiado de capacitação"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${passo.cor} p-8 text-white relative`}>
          <button
            onClick={handleFechar}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            aria-label="Fechar tour"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <Icon size={36} />
            </div>
            <div>
              <p className="text-sm font-bold text-white/70">
                Passo {passoAtual + 1} de {passos.length}
              </p>
              <h2 className="text-2xl font-black">{passo.titulo}</h2>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2 mt-6">
            {passos.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === passoAtual
                    ? 'w-8 bg-white'
                    : index < passoAtual
                    ? 'w-2 bg-white/60'
                    : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="text-slate-600 leading-relaxed text-lg">
            {passo.descricao}
          </p>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleFechar}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors px-4 py-2"
            >
              Pular tour
            </button>

            <button
              onClick={handleProximo}
              className={`flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 bg-gradient-to-r ${passo.cor}`}
            >
              {isUltimo ? 'Começar!' : 'Próximo'}
              {!isUltimo && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
