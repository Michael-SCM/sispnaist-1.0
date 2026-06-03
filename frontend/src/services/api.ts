import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sispnaist-1-0.onrender.com/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token à requisição
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor único de resposta: trata 401, retry em 5xx/erro de rede, e extrai mensagens de erro
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any;

    // 401 = token inválido/expirado → limpar e redirecionar
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Sessão expirada. Faça login novamente.');
      setTimeout(() => { window.location.href = '/login'; }, 2500);
      return Promise.reject(error);
    }

    // Tentar novamente em erros de rede ou 5xx (até 3 tentativas)
    if (config && config.retryCount < 3) {
      const shouldRetry = !error.response || (error.response.status >= 500 && error.response.status <= 599);
      if (shouldRetry) {
        config.retryCount = (config.retryCount || 0) + 1;
        console.warn(`Tentativa de reconexão ${config.retryCount}/3...`);
        await new Promise(resolve => setTimeout(resolve, config.retryCount * 1000));
        return axiosInstance(config);
      }
    }

    // Extrair mensagem de erro detalhada do servidor
    const responseData = error.response?.data as any;
    const errorMessage = responseData?.message || error.message || 'Erro na requisição';

    const customError = new Error(errorMessage) as any;
    if (responseData?.errors) {
      customError.details = responseData.errors;
    }
    if (responseData?.receivedBody) {
      customError.receivedBody = responseData.receivedBody;
    }

    return Promise.reject(customError);
  }
);

export default axiosInstance;
