import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';
import { DocumentTitle } from '../hooks/useDocumentTitle.js';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando suas credenciais...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de ativação ausente ou inválido.');
      return;
    }

    const performVerification = async () => {
      try {
        const successMessage = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(successMessage || 'E-mail verificado e conta ativada com sucesso!');
        toast.success('Conta ativada com sucesso!');
      } catch (error: any) {
        setStatus('error');
        const errorMsg = error.response?.data?.message || error.message || 'Link expirado ou inválido.';
        setMessage(errorMsg);
      }
    };

    // Atraso sutil para dar feedback visual de verificação ao usuário
    const timer = setTimeout(() => {
      performVerification();
    }, 1500);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 via-blue-50 to-emerald-50 p-4">
      <DocumentTitle title="Verificar Email" />
      <div className="bg-white/80 backdrop-blur-lg border border-white/40 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center transform transition-all duration-500 scale-100 hover:shadow-indigo-100/50">
        <h2 className="text-3xl font-extrabold text-blue-600 mb-6 tracking-wide">SISPNAIST</h2>

        {status === 'loading' && (
          <div className="space-y-6 animate-pulse">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Verificando sua conta</h3>
              <p className="text-slate-500 font-medium">{message}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="flex justify-center animate-bounce">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-500 shadow-lg shadow-emerald-100">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-emerald-700 mb-2">E-mail Confirmado!</h3>
              <p className="text-slate-600 font-medium px-2">{message}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95 duration-150 hover:shadow-emerald-200"
            >
              Ir para o Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center border-4 border-rose-500 shadow-lg shadow-rose-100">
                <svg className="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-rose-700 mb-2">Ops! Ocorreu um Erro</h3>
              <p className="text-slate-600 font-medium px-4">{message}</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/register')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95 duration-150"
              >
                Voltar para o Cadastro
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-semibold transition-all active:scale-95 duration-150 text-sm"
              >
                Voltar para o Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
