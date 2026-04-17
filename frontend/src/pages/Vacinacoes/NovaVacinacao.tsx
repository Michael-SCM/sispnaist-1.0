import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVacinacaoStore } from '../../store/vacinacaoStore.js';
import { vacinacaoService } from '../../services/vacinacaoService.js';
import { useForm } from '../../hooks/useForm.js';
import { DatePicker } from '../../components/FormFields.js';
import { Header } from '../../components/Header.js';
import { Footer } from '../../components/Footer.js';
import toast from 'react-hot-toast';

interface NovaVacinacaoFormData {
  trabalhadorId: string;
  vacina: string;
  dataVacinacao: string;
  proximoDose: string;
  unidadeSaude: string;
  profissional: string;
  certificado: string;
}

export const NovaVacinacao: React.FC = () => {
  const navigate = useNavigate();
  const { adicionarVacinacao } = useVacinacaoStore();
  const { values, handleChange, handleBlur, reset } = useForm<NovaVacinacaoFormData>({
    trabalhadorId: '',
    vacina: '',
    dataVacinacao: '',
    proximoDose: '',
    unidadeSaude: '',
    profissional: '',
    certificado: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!values.trabalhadorId || !values.vacina || !values.dataVacinacao) {
      toast.error('Preencha os campos obrigatórios: Trabalhador, Vacina e Data');
      return;
    }

    setIsLoading(true);

    try {
      const formData = {
        trabalhadorId: values.trabalhadorId,
        vacina: values.vacina,
        dataVacinacao: values.dataVacinacao,
        proximoDose: values.proximoDose || undefined,
        unidadeSaude: values.unidadeSaude || undefined,
        profissional: values.profissional || undefined,
        certificado: values.certificado || undefined,
      };

      const resultado = await vacinacaoService.criar(formData);
      adicionarVacinacao(resultado.vacinacao);

      toast.success('Vacinação criada com sucesso!');
      reset();
      navigate('/vacinacoes');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar vacinação';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Nova Vacinação</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
            {/* Trabalhador */}
            <div>
              <label className="label">Trabalhador (CPF ou ID) *</label>
              <input
                type="text"
                name="trabalhadorId"
                value={values.trabalhadorId}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="111.111.111-11"
                className="input"
                required
              />
            </div>

            {/* Vacina */}
            <div>
              <label className="label">Vacina *</label>
              <input
                type="text"
                name="vacina"
                value={values.vacina}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ex: COVID-19, Gripe, Hepatite B"
                className="input"
                required
              />
            </div>

            {/* Data da Vacinação */}
            <div>
              <label className="label">Data da Vacinação *</label>
              <DatePicker
                name="dataVacinacao"
                value={values.dataVacinacao}
                onChange={handleChange}
              />
            </div>

            {/* Próxima Dose */}
            <div>
              <label className="label">Próxima Dose</label>
              <DatePicker
                name="proximoDose"
                value={values.proximoDose}
                onChange={handleChange}
              />
            </div>

            {/* Unidade de Saúde */}
            <div>
              <label className="label">Unidade de Saúde</label>
              <input
                type="text"
                name="unidadeSaude"
                value={values.unidadeSaude}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ex: Centro de Saúde X"
                className="input"
              />
            </div>

            {/* Profissional */}
            <div>
              <label className="label">Profissional</label>
              <input
                type="text"
                name="profissional"
                value={values.profissional}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ex: Dr. João Silva"
                className="input"
              />
            </div>

            {/* Certificado */}
            <div>
              <label className="label">Certificado / Observações</label>
              <textarea
                name="certificado"
                value={values.certificado}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Informações sobre o certificado ou observações"
                className="input"
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar Vacinação'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/vacinacoes')}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};
