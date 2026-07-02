import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { preferenciaService } from '../services/preferenciaService.js';

export const AlertaOrientacaoMobile: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [aberto, setAberto] = useState(false);
  const [naoMostrar, setNaoMostrar] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|webOS/i.test(
      navigator.userAgent
    );

    if (!isMobile) {
      setCarregando(false);
      return;
    }

    const verificarPreferencia = async () => {
      try {
        const prefs = await preferenciaService.obterMinhas();
        if (!prefs.ocultarAlertaOrientacao) {
          setAberto(true);
        }
      } catch {
        setAberto(true);
      } finally {
        setCarregando(false);
      }
    };

    verificarPreferencia();
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleFechar();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [aberto]);

  const handleFechar = async () => {
    if (naoMostrar) {
      try {
        await preferenciaService.atualizarMinhas({ ocultarAlertaOrientacao: true });
      } catch {
        // fallback silencioso
      }
    }
    setAberto(false);
  };

  if (carregando || !aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Aviso de orientação">
      <div className="bg-white rounded-2xl shadow-2xl mx-4 p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">📱</div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Aviso
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Para uma melhor visualização dos dados, recomendamos utilizar o aparelho na horizontal.
        </p>

        <label className="flex items-center justify-center gap-2 mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={naoMostrar}
            onChange={(e) => setNaoMostrar(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Não mostrar esta mensagem novamente</span>
        </label>

        <button
          onClick={handleFechar}
          className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
