import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { TextInput, TextArea, DatePicker, Checkbox } from '../../components/FormFields.js';
import { useDoencaStore } from '../../store/doencaStore.js';
import { doencaService } from '../../services/doencaService.js';
import { IDoenca } from '../../types/index.js';
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

export const EditarDoenca: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { atualizarDoenca } = useDoencaStore();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      carregarDoenca();
    }
  }, [id]);

  // Extrair CPF do trabalhador (pode vir como objeto por populate)
  const extrairCPF = (trabalhador: any): string => {
    if (typeof trabalhador === 'string') return trabalhador;
    if (trabalhador && typeof trabalhador === 'object' && trabalhador.cpf) {
      return trabalhador.cpf;
    }
    return '';
  };

  const carregarDoenca = async () => {
    try {
      setIsLoading(true);
      const doenca = await doencaService.obter(id!);
      setFormData({
        trabalhadorId: extrairCPF(doenca.trabalhadorId),
        dataInicio: doenca.dataInicio ? new Date(doenca.dataInicio).toISOString().split('T')[0] : '',
        dataFim: doenca.dataFim ? new Date(doenca.dataFim).toISOString().split('T')[0] : '',
        codigoDoenca: doenca.codigoDoenca || '',
        nomeDoenca: doenca.nomeDoenca || '',
        relatoClinico: doenca.relatoClinico || '',
        profissionalSaude: doenca.profissionalSaude || '',
        ativo: doenca.ativo !== false,
      });
    } catch (error) {
      toast.error('Erro ao carregar doença');
      console.error(error);
      navigate('/doencas');
    } finally {
      setIsLoading(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData?.dataInicio) {
      novoErros.dataInicio = 'Data de início é obrigatória';
    }

    if (!formData?.codigoDoenca.trim()) {
      novoErros.codigoDoenca = 'Código da doença é obrigatório';
    }

    if (!formData?.nomeDoenca.trim()) {
      novoErros.nomeDoenca = 'Nome da doença é obrigatório';
    } else if (formData.nomeDoenca.trim().length < 3) {
      novoErros.nomeDoenca = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (formData?.dataFim && new Date(formData.dataFim) < new Date(formData.dataInicio)) {
      novoErros.dataFim = 'Data final não pode ser anterior à data de início';
    }

    setErrors(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;

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

    if (!id || !formData || !validar()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSaving(true);

      const doencaAtualizar: Partial<FormData> = {
        ...formData,
        // Limpar dataFim se não foi preenchida
        dataFim: formData.dataFim ? formData.dataFim : undefined,
      };

      const doencaAtualizada = await doencaService.atualizar(id, doencaAtualizar as any);
      atualizarDoenca(id, doencaAtualizada);
      toast.success('Doença atualizada com sucesso!');
      navigate('/doencas');
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar doença');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!formData) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Editar Doença</h1>
          <p className="text-gray-600 mt-2">Atualize as informações da doença ocupacional</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trabalhador (Apenas Leitura) */}
            <TextInput
              label="CPF do Trabalhador"
              value={formData.trabalhadorId}
              disabled
              help="Este campo não pode ser alterado"
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
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
              >
                {isSaving ? 'Salvando...' : 'Atualizar Doença'}
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
