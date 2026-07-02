import React, { useState, useCallback, useEffect } from 'react';
import { ClipboardCheck, ArrowLeft, ArrowRight, Award, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { IQuiz, IResultadoQuiz } from '../types';

interface QuizModalProps {
  quiz: IQuiz;
  onSubmit: (respostas: number[]) => Promise<IResultadoQuiz>;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quiz, onSubmit, onClose }) => {
  const [passo, setPasso] = useState<'intro' | 'quiz' | 'resultado'>('intro');
  const [respostas, setRespostas] = useState<number[]>(new Array(quiz.questoes.length).fill(-1));
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultado, setResultado] = useState<IResultadoQuiz | null>(null);

  const questao = quiz.questoes[questaoAtual];
  const totalQuestoes = quiz.questoes.length;
  const respondidas = respostas.filter((r) => r >= 0).length;
  const todasRespondidas = respondidas === totalQuestoes;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && passo !== 'resultado') onClose();
  }, [onClose, passo]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const selecionarOpcao = (opcaoIndex: number) => {
    const novasRespostas = [...respostas];
    novasRespostas[questaoAtual] = opcaoIndex;
    setRespostas(novasRespostas);
  };

  const proximaQuestao = () => {
    if (questaoAtual < totalQuestoes - 1) {
      setQuestaoAtual((prev) => prev + 1);
    }
  };

  const questaoAnterior = () => {
    if (questaoAtual > 0) {
      setQuestaoAtual((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!todasRespondidas) return;
    setIsSubmitting(true);
    try {
      const res = await onSubmit(respostas);
      setResultado(res);
      setPasso('resultado');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={passo !== 'resultado' ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Quiz de conhecimento"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            aria-label="Fechar quiz"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 backdrop-blur rounded-xl">
              <ClipboardCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{quiz.titulo}</h2>
              {passo === 'intro' && (
                <p className="text-white/70 text-sm mt-1">{totalQuestoes} questões · Mínimo {quiz.pontuacaoMinima}%</p>
              )}
            </div>
          </div>
        </div>

        {/* Intro Step */}
        {passo === 'intro' && (
          <div className="p-8 space-y-6">
            <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100">
              <h3 className="font-bold text-violet-900 mb-3">Instruções</h3>
              <ul className="space-y-2 text-violet-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold mr-1">1.</span>
                  Responda todas as {totalQuestoes} questões de múltipla escolha
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mr-1">2.</span>
                  Você precisa de no mínimo <strong>{quiz.pontuacaoMinima}%</strong> de acertos
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mr-1">3.</span>
                  Tentativas permitidas: <strong>{quiz.tentativasPermitidas}</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mr-1">4.</span>
                  Ao ser aprovado, você poderá emitir seu certificado
                </li>
              </ul>
            </div>
            <button
              onClick={() => setPasso('quiz')}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Começar Quiz
            </button>
          </div>
        )}

        {/* Quiz Step */}
        {passo === 'quiz' && (
          <div className="p-8 space-y-6">
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${((questaoAtual + 1) / totalQuestoes) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-500 shrink-0">
                {questaoAtual + 1}/{totalQuestoes}
              </span>
            </div>

            {/* Question */}
            <div key={questaoAtual} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-6">
                {questao.pergunta}
              </h3>

              <div className="space-y-3">
                {questao.opcoes.map((opcao, index) => (
                  <button
                    key={index}
                    onClick={() => selecionarOpcao(index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      respostas[questaoAtual] === index
                        ? 'border-violet-500 bg-violet-50 text-violet-900 font-bold'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg mr-3 text-sm font-bold shrink-0 ${
                      respostas[questaoAtual] === index
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {opcao}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={questaoAnterior}
                disabled={questaoAtual === 0}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold hover:text-slate-700 disabled:opacity-30 transition-all rounded-xl hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {questaoAtual < totalQuestoes - 1 ? (
                  <button
                    onClick={proximaQuestao}
                    disabled={respostas[questaoAtual] < 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 disabled:opacity-40 transition-all"
                  >
                    Próxima
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!todasRespondidas || isSubmitting}
                    className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-40 transition-all"
                  >
                    {isSubmitting ? 'Enviando...' : 'Finalizar Quiz'}
                    <Award size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result Step */}
        {passo === 'resultado' && resultado && (
          <div className="p-8 space-y-6">
            <div className={`rounded-2xl p-8 text-center border-2 ${
              resultado.aprovado
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`inline-flex p-4 rounded-full mb-4 ${
                resultado.aprovado ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {resultado.aprovado ? (
                  <CheckCircle2 size={48} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={48} className="text-red-500" />
                )}
              </div>

              <h3 className={`text-2xl font-black mb-2 ${
                resultado.aprovado ? 'text-emerald-800' : 'text-red-800'
              }`}>
                {resultado.aprovado ? 'Parabéns! Você foi aprovado!' : 'Não foi desta vez'}
              </h3>

              <div className="flex items-center justify-center gap-8 my-6">
                <div className="text-center">
                  <p className="text-4xl font-black text-slate-800">{resultado.pontuacao}%</p>
                  <p className="text-sm font-bold text-slate-500 mt-1">Pontuação</p>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div className="text-center">
                  <p className="text-4xl font-black text-slate-800">{resultado.acertos}/{resultado.totalQuestoes}</p>
                  <p className="text-sm font-bold text-slate-500 mt-1">Acertos</p>
                </div>
              </div>

              {resultado.aprovado ? (
                <p className="text-emerald-700 font-medium">
                  Mínimo exigido: {resultado.pontuacaoMinima}% · Tentativa {resultado.tentativa}
                </p>
              ) : (
                <div>
                  <p className="text-red-700 font-medium mb-2">
                    Mínimo exigido: {resultado.pontuacaoMinima}% · Tentativa {resultado.tentativa}
                  </p>
                  {resultado.tentativasRestantes > 0 && (
                    <p className="text-slate-600">
                      Você ainda tem <strong>{resultado.tentativasRestantes}</strong> tentativa(s) restante(s).
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!resultado.aprovado && resultado.tentativasRestantes > 0 && (
                <button
                  onClick={() => {
                    setRespostas(new Array(quiz.questoes.length).fill(-1));
                    setQuestaoAtual(0);
                    setPasso('intro');
                  }}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Tentar Novamente
                </button>
              )}
              <button
                onClick={onClose}
                className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                  resultado.aprovado
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {resultado.aprovado ? 'Ver Certificado' : 'Fechar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
