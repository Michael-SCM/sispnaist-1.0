import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVacinacaoStore } from '../../store/vacinacaoStore.js';
import { vacinacaoService } from '../../services/vacinacaoService.js';
import { useForm } from '../../hooks/useForm.js';
import { DatePicker } from '../../components/FormFields.js';
import { Header } from '../../components/Header.js';
import { Footer } from '../../components/Footer.js';
import toast from 'react-hot-toast';

interface EditarVacinacaoFormData {
  trabalhadorId: string;
  vacina: string;
  dataVacinacao: string;
  proximoDose: string;
  unidadeSaude: string;
  profissional: string;
  certificado: string;
}

export const EditarVacinacao: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentVacinacao, setCurrentVacinacao, atualizarVacinacao } = useVacinacaoStore();
  const { values, handleChange, handleBlur, setValues } = useForm<EditarVacinacaoFormData>({
    trabalhadorId: '',
    vacina: '',
    dataVacinacao: '',
    proximoDose: '',
    unidadeSaude: '',
    profissional: '',
    certificado: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(true);

  useEffect(() => {
    // Extrair CPF do trabalhador (pode vir como objeto por populate)
    const extrairCPF = (trabalhador: any): string => {
      if (typeof trabalhador === 'string') return trabalhador;
      if (trabalhador && typeof trabalhador === 'object' && trabalhador.cpf) {
        return trabalhador.cpf;
      }
      return '';
    };

    const carregarVacinacao = async () => {
      if (!id) return;

      try {
        const { vacinacao } = await vacinacaoService.obter(id);
        setCurrentVacinacao(vacinacao);

        setValues({
          trabalhadorId: extrairCPF(vacinacao.trabalhadorId),
          vacina: vacinacao.vacina,
          dataVacinacao: vacinacao.dataVacinacao ? new Date(vacinacao.dataVacinacao).toISOString().split('T')[0] : '',
          proximoDose: vacinacao.proximoDose ? new Date(vacinacao.proximoDose).toISOString().split('T')[0] : '',
          unidadeSaude: vacinacao.unidadeSaude || '',
          profissional: vacinacao.profissional || '',
          certificado: vacinacao.certificado || '',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao carregar vacinação';
        toast.error(message);
      } finally {
        setIsCarregando(false);
      }
    };

    carregarVacinacao();
  }, [id, setCurrentVacinacao, setValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    // Validação básica
    if (!values.vacina || !values.dataVacinacao) {
      toast.error('Preencha os campos obrigatórios: Vacina e Data');
      return;
    }

    setIsLoading(true);

    try {
      const formData = {
        vacina: values.vacina,
        dataVacinacao: values.dataVacinacao,
        proximoDose: values.proximoDose || undefined,
        unidadeSaude: values.unidadeSaude || undefined,
        profissional: values.profissional || undefined,
        certificado: values.certificado || undefined,
      };

      const resultado = await vacinacaoService.atualizar(id, formData);
      atualizarVacinacao(id, resultado.vacinacao);

      toast.success('Vacinação atualizada com sucesso!');
      navigate('/vacinacoes');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar vacinação';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCarregando) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Carregando vacinação...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Vacinação</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
            {/* Trabalhador (somente leitura) */}
            <div>
              <label className="label">Trabalhador (somente leitura)</label>
              <input
                type="text"
                value={values.trabalhadorId}
                disabled
                className="input bg-gray-100 cursor-not-allowed"
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
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
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
