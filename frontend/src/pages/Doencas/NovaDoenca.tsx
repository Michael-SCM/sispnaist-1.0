import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { TextInput, TextArea, DatePicker, Checkbox } from '../../components/FormFields.js';
import { useDoencaStore } from '../../store/doencaStore.js';
import { doencaService } from '../../services/doencaService.js';
import { IDoenca } from '../../types/index.js';
import { useAuthStore } from '../../store/authStore.js';
import toast from 'react-hot-toast';

interface FormData {
  trabalhadorId: string;
  dataInicio: string;
  dataFim: string;
  codigoDoenca: string;
  nomeDoenca: string;
  relatoClinico: string;
  profissionalSaude: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  trabalhadorId: '',
  dataInicio: '',
  dataFim: '',
  codigoDoenca: '',
  nomeDoenca: '',
  relatoClinico: '',
  profissionalSaude: '',
  ativo: true,
};

export const NovaDoenca: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { adicionarDoenca } = useDoencaStore();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData.dataInicio) {
      novoErros.dataInicio = 'Data de início é obrigatória';
    }

    if (!formData.codigoDoenca.trim()) {
      novoErros.codigoDoenca = 'Código da doença é obrigatório';
    }

    if (!formData.nomeDoenca.trim()) {
      novoErros.nomeDoenca = 'Nome da doença é obrigatório';
    } else if (formData.nomeDoenca.trim().length < 3) {
      novoErros.nomeDoenca = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (formData.dataFim && new Date(formData.dataFim) < new Date(formData.dataInicio)) {
      novoErros.dataFim = 'Data final não pode ser anterior à data de início';
    }

    setErrors(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData({
      ...formData,
      [name]: finalValue,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsLoading(true);

      const doencaData: Partial<IDoenca> = {
        ...formData,
        trabalhadorId: formData.trabalhadorId || user?._id || '',
        // Limpar dataFim se não foi preenchida
        dataFim: formData.dataFim ? formData.dataFim : undefined,
      };

      const novaDoenca = await doencaService.criar(doencaData);
      adicionarDoenca(novaDoenca);

      toast.success('Doença registrada com sucesso!');
      navigate('/doencas');
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao registrar doença');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Nova Doença</h1>
          <p className="text-gray-600 mt-2">Registre uma nova doença ocupacional</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trabalhador */}
            <TextInput
              label="CPF do Trabalhador"
              name="trabalhadorId"
              value={formData.trabalhadorId}
              onChange={handleChange}
              placeholder="Informe o CPF do trabalhador"
              error={errors.trabalhadorId}
              required
              help={user ? `(Você: ${user.cpf})` : undefined}
            />

            {/* Código e Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Código da Doença"
                name="codigoDoenca"
                value={formData.codigoDoenca}
                onChange={handleChange}
                placeholder="Ex: J30"
                error={errors.codigoDoenca}
                required
              />

              <DatePicker
                label="Data de Início"
                name="dataInicio"
                value={formData.dataInicio}
                onChange={handleChange}
                error={errors.dataInicio}
                required
              />
            </div>

            {/* Nome da Doença */}
            <TextInput
              label="Nome da Doença"
              name="nomeDoenca"
              value={formData.nomeDoenca}
              onChange={handleChange}
              placeholder="Ex: Alergia respiratória"
              error={errors.nomeDoenca}
              required
            />

            {/* Data de Fim */}
            <DatePicker
              label="Data de Encerramento"
              name="dataFim"
              value={formData.dataFim}
              onChange={handleChange}
              error={errors.dataFim}
              help="Deixe em branco se a doença ainda está ativa"
            />

            {/* Relato Clínico */}
            <TextArea
              label="Relato Clínico"
              name="relatoClinico"
              value={formData.relatoClinico}
              onChange={handleChange}
              placeholder="Descreva o diagnóstico e observações clínicas..."
              rows={5}
            />

            {/* Profissional de Saúde */}
            <TextInput
              label="Profissional de Saúde"
              name="profissionalSaude"
              value={formData.profissionalSaude}
              onChange={handleChange}
              placeholder="Nome do médico ou profissional responsável"
            />

            {/* Status */}
            <Checkbox
              label="Doença Ativa"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
              help="Marque se a doença ainda está ativa"
            />

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
              >
                {isLoading ? 'Salvando...' : 'Registrar Doença'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/doencas')}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};
