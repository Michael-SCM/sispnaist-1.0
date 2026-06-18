import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useForm } from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';
import { required, email as emailRule, validateField, validate } from '../utils/validators.js';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  senha: string;
  [key: string]: string | number | boolean;
}

const loginSchema = {
  email: [required(), emailRule()],
  senha: [required('Senha é obrigatória')],
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { values, errors, touched, handleChange, handleBlur, setFieldError, reset } = useForm<LoginFormData>({
    email: '',
    senha: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const statusRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    handleBlur(e);
    const error = validateField(values, loginSchema, name as keyof LoginFormData);
    if (error) setFieldError(name, error);
    else setFieldError(name, '');
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    handleChange(e);
    if (touched[name]) {
      const error = validateField(values, loginSchema, name as keyof LoginFormData);
      if (error) setFieldError(name, error);
      else setFieldError(name, '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors = validate(values, loginSchema);
    for (const [field, msg] of Object.entries(fieldErrors)) {
      setFieldError(field, msg);
    }
    if (Object.keys(fieldErrors).length > 0) return;

    setIsLoading(true);
    statusRef.current?.focus();

    try {
      const { user, accessToken, refreshToken } = await authService.login(values.email, values.senha);
      setAuth(user, accessToken, refreshToken);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
      reset();
    } catch (error: any) {
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

  const emailErrorId = 'login-email-error';
  const senhaErrorId = 'login-senha-error';

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">SISPNAIST</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Formulário de login"
          aria-busy={isLoading}
          noValidate
        >
          <div aria-live="polite" aria-atomic="true">
            <div
              ref={statusRef}
              tabIndex={-1}
              className="sr-only"
              role="status"
            >
              {isLoading ? 'Enviando dados de login...' : ''}
            </div>
          </div>

          <div>
            <label htmlFor="login-email" className="label">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              className={`input${errors.email ? ' border-red-500' : ''}`}
              autoComplete="email"
              disabled={isLoading}
              aria-invalid={!!(errors.email && touched.email)}
              aria-describedby={errors.email && touched.email ? emailErrorId : undefined}
              required
            />
            {errors.email && touched.email && (
              <p id={emailErrorId} className="text-red-600 text-xs mt-1" role="alert">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="login-senha" className="label">Senha</label>
            <input
              id="login-senha"
              type="password"
              name="senha"
              value={values.senha}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              className={`input${errors.senha ? ' border-red-500' : ''}`}
              autoComplete="current-password"
              disabled={isLoading}
              aria-invalid={!!(errors.senha && touched.senha)}
              aria-describedby={errors.senha && touched.senha ? senhaErrorId : undefined}
              required
            />
            {errors.senha && touched.senha && (
              <p id={senhaErrorId} className="text-red-600 text-xs mt-1" role="alert">{errors.senha}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label={isLoading ? 'Entrando...' : 'Entrar'}
          >
            {isLoading && <Loader2 className="animate-spin" size={18} aria-hidden="true" />}
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
              tabIndex={0}
            >
              Esqueci a senha
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center" aria-label="Navegação para cadastro">
          <p className="text-sm text-gray-600">
            Não tem conta?{' '}
            <Link
              to="/register"
              className="text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};
