import React, { useState, useCallback, useEffect } from 'react';
import { ClipboardCheck, ArrowLeft, ArrowRight, Award, X, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { IQuestaoSessao, IResultadoQuiz } from '../types';

interface QuizModalProps {
  questoes: IQuestaoSessao[];
  totalQuestoes: number;
  onSubmit: (respostas: number[]) => Promise<IResultadoQuiz>;
  onClose: () => void;
}

const LABELS = ['A', 'B', 'C', 'D', 'E'];

export const QuizModal: React.FC<QuizModalProps> = ({ questoes, totalQuestoes, onSubmit, onClose }) => {
  const [passo, setPasso] = useState<'intro' | 'quiz' | 'resultado'>('intro');
  const [respostas, setRespostas] = useState<number[]>(new Array(questoes.length).fill(-1));
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultado, setResultado] = useState<IResultadoQuiz | null>(null);

  const questao = questoes[questaoAtual];
  const respondidas = respostas.filter((r) => r >= 0).length;
  const todasRespondidas = respondidas === totalQuestoes;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && passo !== 'resultado') onClose();
    if (passo === 'quiz' && !isNaN(Number(e.key)) && Number(e.key) >= 1 && Number(e.key) <= LABELS.length) {
      const idx = Number(e.key) - 1;
      if (questao && idx < questao.opcoes.length) {
        selecionarOpcao(idx);
      }
    }
  }, [onClose, passo, questaoAtual, questao]);

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

  const irParaQuestao = (index: number) => {
    setQuestaoAtual(index);
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
      aria-label="Prova de conhecimento"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur rounded-xl">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Prova de Conhecimento</h2>
              <p className="text-white/70 text-xs mt-0.5">{totalQuestoes} questões</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Intro Step */}
          {passo === 'intro' && (
            <div className="p-6 space-y-5">
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <h3 className="font-bold text-amber-900 mb-3">Instruções</h3>
                <ul className="space-y-2 text-amber-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-bold shrink-0">1.</span>
                    Responda todas as {totalQuestoes} questões de múltipla escolha
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold shrink-0">2.</span>
                    Cada questão tem {LABELS.length} opções (A-E), apenas uma correta
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold shrink-0">3.</span>
                    Use as teclas <kbd className="px-1.5 py-0.5 bg-white rounded text-xs font-mono">1</kbd> a <kbd className="px-1.5 py-0.5 bg-white rounded text-xs font-mono">{LABELS.length}</kbd> para responder rápido
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold shrink-0">4.</span>
                    Ao finalizar, veja o gabarito com seus acertos e erros
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setPasso('quiz')}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Começar Prova
              </button>
            </div>
          )}

          {/* Quiz Step */}
          {passo === 'quiz' && (
            <div className="p-6 space-y-5">
              {/* Progress + Question numbers */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-300"
                      style={{ width: `${(respondidas / totalQuestoes) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{respondidas}/{totalQuestoes}</span>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {questoes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => irParaQuestao(index)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        index === questaoAtual
                          ? 'bg-amber-500 text-white shadow-md'
                          : respostas[index] >= 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Question */}
              <div key={questaoAtual} className="animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-black text-sm shrink-0">
                    {questaoAtual + 1}
                  </span>
                  <p className="text-base font-bold text-slate-800 leading-relaxed pt-1.5">
                    {questao.pergunta}
                  </p>
                </div>

                <div className="space-y-2 ml-2">
                  {questao.opcoes.map((opcao, index) => (
                    <button
                      key={index}
                      onClick={() => selecionarOpcao(index)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                        respostas[questaoAtual] === index
                          ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg mr-3 text-xs font-bold shrink-0 ${
                        respostas[questaoAtual] === index
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {LABELS[index] || index}
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
                  className="flex items-center gap-1.5 px-4 py-2 text-slate-500 font-bold hover:text-slate-700 disabled:opacity-30 transition-all rounded-xl hover:bg-slate-50 text-sm"
                >
                  <ArrowLeft size={16} />
                  Anterior
                </button>

                {questaoAtual < totalQuestoes - 1 ? (
                  <button
                    onClick={proximaQuestao}
                    disabled={respostas[questaoAtual] < 0}
                    className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 disabled:opacity-40 transition-all text-sm"
                  >
                    Próxima
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!todasRespondidas || isSubmitting}
                    className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-40 transition-all text-sm"
                  >
                    {isSubmitting ? 'Corrigindo...' : 'Finalizar Prova'}
                    <Award size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Result Step */}
          {passo === 'resultado' && resultado && (
            <div className="p-6 space-y-5">
              {/* Score Summary */}
              <div className={`rounded-2xl p-6 text-center border-2 ${
                resultado.aprovado
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`inline-flex p-3 rounded-full mb-3 ${
                  resultado.aprovado ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {resultado.aprovado
                    ? <CheckCircle2 size={36} className="text-emerald-600" />
                    : <AlertCircle size={36} className="text-red-500" />
                  }
                </div>

                <h3 className={`text-xl font-black mb-1 ${
                  resultado.aprovado ? 'text-emerald-800' : 'text-red-800'
                }`}>
                  {resultado.aprovado ? 'Aprovado!' : 'Não foi desta vez'}
                </h3>

                <div className="flex items-center justify-center gap-6 my-4">
                  <div className="text-center">
                    <p className="text-3xl font-black text-slate-800">{resultado.pontuacao}%</p>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">Pontuação</p>
                  </div>
                  <div className="w-px h-10 bg-slate-200" />
                  <div className="text-center">
                    <p className="text-3xl font-black text-slate-800">{resultado.acertos}/{resultado.totalQuestoes}</p>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">Acertos</p>
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-500">
                  Mínimo: {resultado.pontuacaoMinima}% · Tentativa {resultado.tentativa}
                  {resultado.tentativasRestantes > 0 && !resultado.aprovado && (
                    <> · Restam {resultado.tentativasRestantes}
                    {resultado.tentativasRestantes === 1 ? ' tentativa' : ' tentativas'}</>
                  )}
                </p>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-700 text-sm px-1">Gabarito</h3>
                {resultado.detalhes.map((d, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border-2 p-4 ${
                      d.correta
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {d.correta
                        ? <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        : <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">
                          <span className="text-xs text-slate-400 mr-1.5">Q{i + 1}.</span>
                          {d.pergunta}
                        </p>
                      </div>
                    </div>

                    <div className="ml-7 space-y-1">
                      {d.opcoes.map((opcao, oIndex) => {
                        const isUserAnswer = d.respostaUsuario === oIndex;
                        const isCorrectAnswer = d.respostaCorreta === oIndex;
                        let estilo = 'text-slate-500';
                        if (isCorrectAnswer && isUserAnswer) estilo = 'text-emerald-700 font-bold';
                        else if (isCorrectAnswer) estilo = 'text-emerald-600 font-bold';
                        else if (isUserAnswer && !d.correta) estilo = 'text-red-600 font-bold line-through';
                        return (
                          <p key={oIndex} className={`text-xs leading-relaxed ${estilo}`}>
                            <span className="font-mono mr-1">{LABELS[oIndex]}.</span>
                            {opcao}
                            {isCorrectAnswer && <span className="ml-1 text-emerald-500">✓</span>}
                            {isUserAnswer && !d.correta && <span className="ml-1 text-red-500">(sua resposta)</span>}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {!resultado.aprovado && resultado.tentativasRestantes > 0 && (
                  <button
                    onClick={() => {
                      setRespostas(new Array(questoes.length).fill(-1));
                      setQuestaoAtual(0);
                      setPasso('intro');
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                  >
                    Tentar Novamente
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
