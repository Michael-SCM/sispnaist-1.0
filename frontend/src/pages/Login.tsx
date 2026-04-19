import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  senha: string;
  [key: string]: string | undefined;
}


export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { values, handleChange, handleBlur, reset } = useForm<LoginFormData>({
    email: '',
    senha: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, token } = await authService.login(values.email, values.senha);
      setAuth(user, token);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">SISPATNAIST</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              name="senha"
              value={values.senha}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem conta?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Cadastre-se aqui
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
