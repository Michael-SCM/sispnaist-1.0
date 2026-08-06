import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useForm } from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';
import { required, email as emailRule, validateField, validate } from '../utils/validators.js';
import toast from 'react-hot-toast';
import { DocumentTitle } from '../hooks/useDocumentTitle.js';

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
  const setPreAuth = useAuthStore((state) => state.setPreAuth);
  const preAuthToken = useAuthStore((state) => state.preAuthToken);
  const { values, errors, touched, handleChange, handleBlur, setFieldError, reset } = useForm<LoginFormData>({
    email: '',
    senha: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [needs2FA, setNeeds2FA] = React.useState(false);
  const [codigo, setCodigo] = React.useState('');
  const [isResending, setIsResending] = React.useState(false);
  const [confiarDispositivo, setConfiarDispositivo] = React.useState(false);
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
      const result = await authService.login(values.email, values.senha);

      // Login em 2 passos: aguardar o código enviado por e-mail
      if (result.needs2FA && result.preAuthToken) {
        setPreAuth(result.preAuthToken);
        setNeeds2FA(true);
        setCodigo('');
        toast.success('Código de verificação enviado para o seu e-mail.');
        return;
      }

      if (!result.user || !result.accessToken || !result.refreshToken) {
        throw new Error('Resposta de login inválida.');
      }

      setAuth(result.user, result.accessToken, result.refreshToken);
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

  const handleCodigoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(codigo)) {
      toast.error('Informe o código de 6 dígitos enviado para o seu e-mail.');
      return;
    }

    const token = preAuthToken;
    if (!token) {
      toast.error('Sessão de verificação expirada. Faça o login novamente.');
      setNeeds2FA(false);
      setPreAuth(null);
      return;
    }

    setIsLoading(true);
    statusRef.current?.focus();

    try {
      const result = await authService.verificar2FA(token, codigo, confiarDispositivo);
      if (!result.user || !result.accessToken || !result.refreshToken) {
        throw new Error('Resposta de verificação inválida.');
      }

      setAuth(result.user, result.accessToken, result.refreshToken);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
      reset();
    } catch (error: any) {
      let errorMessage = 'Código inválido ou expirado.';
      if (isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const result = await authService.enviarCodigo2FA(values.email, values.senha);
      setPreAuth(result.preAuthToken);
      toast.success('Um novo código foi enviado para o seu e-mail.');
    } catch (error: any) {
      let errorMessage = 'Erro ao reenviar o código.';
      if (isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    setNeeds2FA(false);
    setPreAuth(null);
    setCodigo('');
    setConfiarDispositivo(false);
  };

  const emailErrorId = 'login-email-error';
  const senhaErrorId = 'login-senha-error';

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <DocumentTitle title="Login" />
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">SISPNAIST</h1>

        {!needs2FA ? (
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
        ) : (
          <form
            onSubmit={handleCodigoSubmit}
            className="space-y-4"
            aria-label="Formulário de verificação de código"
            aria-busy={isLoading}
            noValidate
          >
            <div aria-live="polite" aria-atomic="true">
              <div ref={statusRef} tabIndex={-1} className="sr-only" role="status">
                {isLoading ? 'Verificando código...' : ''}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Enviamos um código de verificação para o seu e-mail. Informe o código de 6 dígitos abaixo para concluir o login.
              </p>
            </div>

            <div>
              <label htmlFor="login-codigo" className="label">Código de verificação</label>
              <input
                id="login-codigo"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                className="input text-center text-xl tracking-widest"
                disabled={isLoading}
                placeholder="000000"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="confiar-dispositivo"
                type="checkbox"
                checked={confiarDispositivo}
                onChange={(e) => setConfiarDispositivo(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="confiar-dispositivo" className="text-sm text-gray-600 select-none">
                Confiar neste dispositivo por 24 horas
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label={isLoading ? 'Verificando...' : 'Verificar código'}
            >
              {isLoading && <Loader2 className="animate-spin" size={18} aria-hidden="true" />}
              {isLoading ? 'Verificando...' : 'Verificar código'}
            </button>

            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || isLoading}
                className="text-sm font-semibold text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                tabIndex={0}
              >
                {isResending ? 'Enviando novo código...' : 'Não recebi o código. Reenviar'}
              </button>
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded transition-colors"
                tabIndex={0}
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Voltar ao login
              </button>
            </div>
          </form>
        )}

        {!needs2FA && (
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
        )}
      </div>
    </main>
  );
};
