import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

export const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<{
    frontend: boolean;
    backend: boolean;
    apiUrl: string;
    token: boolean;
    error?: string;
  }>({
    frontend: true,
    backend: false,
    apiUrl: '',
    token: false,
  });

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      // Tentar ler do env, se falhar usa default
      let apiUrl = '';
      try {
        apiUrl = import.meta.env.VITE_API_URL || '';
      } catch {
        apiUrl = '';
      }
      
      if (!apiUrl) {
        apiUrl = 'http://localhost:3001/api';
      }
      
      const token = localStorage.getItem('token');

      // Tentar acessar health endpoint
      try {
        const response = await api.get('/health');
        setStatus({
          frontend: true,
          backend: response.status === 200,
          apiUrl,
          token: !!token,
        });
      } catch (error) {
        setStatus({
          frontend: true,
          backend: false,
          apiUrl,
          token: !!token,
          error: `Backend não respondeu: ${(error as Error).message}`,
        });
      }
    } catch (error) {
      setStatus({
        frontend: true,
        backend: false,
        apiUrl: 'Desconhecida',
        token: false,
        error: `Erro ao verificar: ${(error as Error).message}`,
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-xs text-sm font-mono z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800">🏥 Health Check</h3>
        <button
          onClick={checkHealth}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Atualizar
        </button>
      </div>

      <div className="space-y-1 text-xs">
        <p>
          Frontend:{' '}
          <span className={status.frontend ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {status.frontend ? '✅ OK' : '❌ ERRO'}
          </span>
        </p>
        <p>
          Backend:{' '}
          <span className={status.backend ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {status.backend ? '✅ OK' : '❌ ERRO'}
          </span>
        </p>
        <p className="break-words">API URL: {status.apiUrl}</p>
        <p>
          Token:{' '}
          <span className={status.token ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>
            {status.token ? '✅ SIM' : '⚠️ NÃO'}
          </span>
        </p>
        {status.error && <p className="text-red-500 mt-2">{status.error}</p>}
      </div>
    </div>
  );
};
