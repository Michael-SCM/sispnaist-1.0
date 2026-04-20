import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sispnaist-1-0.onrender.com/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
    const errorMessage = (error.response?.data as any)?.message || 
                        error.message || 
                        'Erro na requisição';
    
    const customError = new Error(errorMessage);
    return Promise.reject(customError);
  }
);

export default axiosInstance;
