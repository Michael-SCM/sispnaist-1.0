import React from 'react';
import { maskCPF, unmaskCPF } from '../utils/cpfMask';

import { useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

interface RegisterFormData {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmaSenha: string;
  [key: string]: string | number | boolean;
}



export const Register: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { values, handleChange, handleBlur, reset } = useForm<RegisterFormData>({
    nome: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    senha: '',
    confirmaSenha: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (values.senha !== values.confirmaSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const { user, token } = await authService.register({
        nome: values.nome,
        email: values.email,
        cpf: values.cpf,
        dataNascimento: values.dataNascimento,
        senha: values.senha,
      });

      setAuth(user, token);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/dashboard');
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer cadastro';
      toast.error(message);
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
            <label className="label">Nome Completo</label>
            <input
              type="text"
              name="nome"
              value={values.nome}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input"
              required
            />
          </div>

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
            <label className="label">CPF (XXX.XXX.XXX-XX)</label>
            <input
              type="text"
              name="cpf"
              value={maskCPF(values.cpf)}
              onChange={(e) => {
                const unmasked = unmaskCPF(e.target.value);
                // manter estado apenas com dígitos
                (handleChange as any)({
                  target: { name: 'cpf', value: unmasked },
                });
              }}
              onBlur={handleBlur}
              className="input"
              placeholder="000.000.000-00"
              required
            />

          </div>

          <div>
            <label className="label">Data de Nascimento</label>
            <input
              type="date"
              name="dataNascimento"
              value={values.dataNascimento}
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

          <div>
            <label className="label">Confirme a Senha</label>
            <input
              type="password"
              name="confirmaSenha"
              value={values.confirmaSenha}
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
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem conta?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Faça login aqui
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
