import React from 'react';
import { maskCPF, unmaskCPF } from '../utils/cpfMask.js';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useForm } from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';
import {
  required,
  email as emailRule,
  password,
  cpf as cpfRule,
  dateOfBirth,
  matchField,
  minLength,
  validateField,
  validate,
} from '../utils/validators.js';
import toast from 'react-hot-toast';

interface RegisterFormData {
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  senha: string;
  confirmarSenha: string;
  [key: string]: string | number | boolean;
}

const registerSchema = {
  nome: [required(), minLength(3, 'Nome deve ter pelo menos 3 caracteres')],
  email: [required(), emailRule()],
  cpf: [required(), cpfRule()],
  dataNascimento: [required(), dateOfBirth()],
  senha: [required(), password()],
  confirmarSenha: [required(), matchField(() => values.senha, 'senha')],
};

let values: RegisterFormData;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const form = useForm<RegisterFormData>({
    nome: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    senha: '',
    confirmarSenha: '',
  });
  values = form.values;
  const { errors, touched, handleChange, handleBlur, setFieldError, reset, setValues } = form;
  const [isLoading, setIsLoading] = React.useState(false);
  const statusRef = React.useRef<HTMLDivElement>(null);

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    handleBlur(e);
    const error = validateField(values, registerSchema, name as keyof RegisterFormData);
    if (error) setFieldError(name, error);
    else setFieldError(name, '');
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    handleChange(e);
    if (touched[name]) {
      const error = validateField(values, registerSchema, name as keyof RegisterFormData);
      if (error) setFieldError(name, error);
      else setFieldError(name, '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors = validate(values, registerSchema);
    for (const [field, msg] of Object.entries(fieldErrors)) {
      setFieldError(field, msg);
    }
    if (Object.keys(fieldErrors).length > 0) return;

    setIsLoading(true);
    statusRef.current?.focus();

    try {
      const response = await authService.register({
        nome: values.nome,
        email: values.email,
        cpf: maskCPF(values.cpf),
        dataNascimento: values.dataNascimento,
        senha: values.senha,
      });

      toast.success(response.message || 'Cadastro realizado com sucesso! Verifique seu e-mail para ativar sua conta.');
      navigate('/login');
      reset();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao fazer cadastro';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const errorClass = (field: string) => (errors[field] && touched[field] ? ' border-red-500' : '');

  const fieldProps = (name: string, label: string, autoComplete: string) => ({
    id: `register-${name}`,
    name,
    label,
    autoComplete,
    errorId: `register-${name}-error`,
    describedBy: errors[name] && touched[name] ? `register-${name}-error` : undefined,
  });

  const renderField = (
    name: string,
    label: string,
    autoComplete: string,
    extra?: { type?: string; placeholder?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }
  ) => {
    const p = fieldProps(name, label, autoComplete);
    return (
      <div>
        <label htmlFor={p.id} className="label">{label}</label>
        <input
          id={p.id}
          type={extra?.type || 'text'}
          name={name}
          value={values[name] as string}
          onChange={extra?.onChange || handleFieldChange}
          onBlur={handleFieldBlur}
          className={`input${errorClass(name)}`}
          placeholder={extra?.placeholder}
          autoComplete={autoComplete}
          disabled={isLoading}
          aria-invalid={!!(errors[name] && touched[name])}
          aria-describedby={p.describedBy}
          required
        />
        {errors[name] && touched[name] && (
          <p id={p.errorId} className="text-red-600 text-xs mt-1" role="alert">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">SISPNAIST</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Formulário de cadastro"
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
              {isLoading ? 'Enviando dados de cadastro...' : ''}
            </div>
          </div>

          {renderField('nome', 'Nome Completo', 'name')}
          {renderField('email', 'Email', 'email', { type: 'email' })}
          {renderField('cpf', 'CPF (XXX.XXX.XXX-XX)', 'off', {
            placeholder: '000.000.000-00',
            onChange: (e) => {
              const unmasked = unmaskCPF(e.target.value);
              (setValues as any)({ ...values, cpf: unmasked });
              if (touched.cpf) {
                const error = validateField({ ...values, cpf: unmasked }, registerSchema, 'cpf');
                if (error) setFieldError('cpf', error);
                else setFieldError('cpf', '');
              }
            },
          })}
          {renderField('dataNascimento', 'Data de Nascimento', 'bday', { type: 'date' })}

          <div>
            <label htmlFor="register-senha" className="label">Senha</label>
            <input
              id="register-senha"
              type="password"
              name="senha"
              value={values.senha}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              className={`input${errorClass('senha')}`}
              autoComplete="new-password"
              disabled={isLoading}
              aria-invalid={!!(errors.senha && touched.senha)}
              aria-describedby={errors.senha && touched.senha ? 'register-senha-error' : 'register-senha-hint'}
              required
            />
            {errors.senha && touched.senha && (
              <p id="register-senha-error" className="text-red-600 text-xs mt-1" role="alert">{errors.senha}</p>
            )}
            <p id="register-senha-hint" className="text-gray-500 text-xs mt-1">
              Mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial
            </p>
          </div>

          <div>
            <label htmlFor="register-confirmarSenha" className="label">Confirme a Senha</label>
            <input
              id="register-confirmarSenha"
              type="password"
              name="confirmarSenha"
              value={values.confirmarSenha}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              className={`input${errorClass('confirmarSenha')}`}
              autoComplete="new-password"
              disabled={isLoading}
              aria-invalid={!!(errors.confirmarSenha && touched.confirmarSenha)}
              aria-describedby={errors.confirmarSenha && touched.confirmarSenha ? 'register-confirmarSenha-error' : undefined}
              required
            />
            {errors.confirmarSenha && touched.confirmarSenha && (
              <p id="register-confirmarSenha-error" className="text-red-600 text-xs mt-1" role="alert">{errors.confirmarSenha}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label={isLoading ? 'Cadastrando...' : 'Cadastrar'}
          >
            {isLoading && <Loader2 className="animate-spin" size={18} aria-hidden="true" />}
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem conta?{' '}
            <a
              href="/login"
              className="text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
            >
              Faça login aqui
            </a>
          </p>
        </div>
      </div>
    </main>
  );
};
