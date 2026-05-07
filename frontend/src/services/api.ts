import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sispnaist-1-0.onrender.com/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para retry (tentar novamente em caso de erro de rede ou 5xx)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any;

    // Se não houver config ou retry não estiver habilitado, retorne o erro
    if (!config || config.retryCount >= 3) {
      return Promise.reject(error);
    }

    // Incrementar o contador de tentativas
    config.retryCount = config.retryCount || 0;
    config.retryCount += 1;

    // Apenas tentar novamente em erros de rede ou erros 5xx (servidor instável)
    const shouldRetry = !error.response || (error.response.status >= 500 && error.response.status <= 599);

    if (shouldRetry) {
      console.warn(`Tentativa de reconexão ${config.retryCount}/3...`);
      // Esperar um pouco antes de tentar novamente (exponential backoff simples)
      const delay = config.retryCount * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return axiosInstance(config);
    }

    return Promise.reject(error);
  }
);

// Interceptor para adicionar token à requisição
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
