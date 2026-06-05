import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useForm } from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  senha: string;
  [key: string]: string | number | boolean;
}




export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const setUser = useAuthStore((state) => state.setUser);
  const { values, handleChange, handleBlur, reset } = useForm<LoginFormData>({
    email: '',
    senha: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user } = await authService.login(values.email, values.senha);
      setUser(user);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
      reset();
    } catch (error) {
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      if (isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || 'Email ou senha inválidos.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">SISPNAIST</h2>
        
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

          <div className="text-center">
            <Link 
              to="/forgot-password" 
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Esqueci a senha
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem conta?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
