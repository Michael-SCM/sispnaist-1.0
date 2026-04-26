import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { TextInput, TextArea, DatePicker, Select } from '../../../components/FormFields.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorAfastamento, ITrabalhador } from '../../../types/index.js';
import toast from 'react-hot-toast';

interface FormData {
  tipoAfastamento: string;
  motivoAfastamento: string;
  cid: string;
  dataInicio: string;
  dataFim: string;
  dataRetorno: string;
  laudoMedico: string;
  observacoes: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  tipoAfastamento: '',
  motivoAfastamento: '',
  cid: '',
  dataInicio: '',
  dataFim: '',
  dataRetorno: '',
  laudoMedico: '',
  observacoes: '',
  ativo: true,
};

// Opções temporárias até os catálogos serem implementados
const TIPOS_AFASTAMENTO = [
  { value: 'Licença Médica', label: 'Licença Médica' },
  { value: 'Licença Maternidade', label: 'Licença Maternidade' },
  { value: 'Licença Paternidade', label: 'Licença Paternidade' },
  { value: 'Acidente de Trabalho', label: 'Acidente de Trabalho' },
  { value: 'Doença Ocupacional', label: 'Doença Ocupacional' },
  { value: 'Afastamento Preventivo', label: 'Afastamento Preventivo' },
  { value: 'Outro', label: 'Outro' },
];

const MOTIVOS_AFASTAMENTO = [
  { value: 'Doença', label: 'Doença' },
  { value: 'Acidente', label: 'Acidente' },
  { value: 'Cirurgia', label: 'Cirurgia' },
  { value: 'Tratamento Médico', label: 'Tratamento Médico' },
  { value: 'Repouso Médico', label: 'Repouso Médico' },
  { value: 'COVID-19', label: 'COVID-19' },
  { value: 'Outro', label: 'Outro' },
];

export const FormAfastamento: React.FC = () => {
  const { id, afastamentoId } = useParams<{ id: string; afastamentoId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(afastamentoId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && afastamentoId) {
        carregarAfastamento();
      }
    }
  }, [id, afastamentoId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
      console.error(error);
    }
  };

  const carregarAfastamento = async () => {
    try {
      setIsCarregando(true);
      // Usar listar e filtrar já que não há endpoint específico de obter por ID no service
      const lista = await submoduloTrabalhadorService.listarAfastamentos(id!);
      const afastamento = lista.find((a: ITrabalhadorAfastamento) => a._id === afastamentoId);
      if (afastamento) {
        setFormData({
          tipoAfastamento: afastamento.tipoAfastamento || '',
          motivoAfastamento: afastamento.motivoAfastamento || '',
          cid: afastamento.cid || '',
          dataInicio: afastamento.dataInicio ? afastamento.dataInicio.split('T')[0] : '',
          dataFim: afastamento.dataFim ? afastamento.dataFim.split('T')[0] : '',
          dataRetorno: afastamento.dataRetorno ? afastamento.dataRetorno.split('T')[0] : '',
          laudoMedico: afastamento.laudoMedico || '',
          observacoes: afastamento.observacoes || '',
          ativo: afastamento.ativo !== false,
        });
      } else {
        toast.error('Afastamento não encontrado');
        navigate(`/trabalhadores/${id}/afastamentos`);
      }
    } catch (error) {
      toast.error('Erro ao carregar afastamento');
      console.error(error);
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData.tipoAfastamento) {
      novoErros.tipoAfastamento = 'Tipo de afastamento é obrigatório';
    }

    if (!formData.motivoAfastamento) {
      novoErros.motivoAfastamento = 'Motivo do afastamento é obrigatório';
    }

    if (!formData.dataInicio) {
      novoErros.dataInicio = 'Data de início é obrigatória';
    }

    if (formData.dataFim && new Date(formData.dataFim) < new Date(formData.dataInicio)) {
      novoErros.dataFim = 'Data de fim não pode ser anterior à data de início';
    }

    if (formData.dataRetorno && new Date(formData.dataRetorno) < new Date(formData.dataInicio)) {
      novoErros.dataRetorno = 'Data de retorno não pode ser anterior à data de início';
    }

    setErrors(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

      const dados: Partial<ITrabalhadorAfastamento> = {
        ...formData,
        dataFim: formData.dataFim || undefined,
        dataRetorno: formData.dataRetorno || undefined,
        laudoMedico: formData.laudoMedico || undefined,
        observacoes: formData.observacoes || undefined,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarAfastamento(id!, afastamentoId!, dados);
        toast.success('Afastamento atualizado com sucesso!');
      } else {
        await submoduloTrabalhadorService.criarAfastamento(id!, dados);
        toast.success('Afastamento registrado com sucesso!');
      }

      navigate(`/trabalhadores/${id}/afastamentos`);
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao salvar afastamento');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCarregando) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link
              to={`/trabalhadores/${id}/afastamentos`}
              className="hover:text-blue-600 transition"
            >
              ← Voltar aos afastamentos
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdicao ? 'Editar Afastamento' : 'Novo Afastamento'}
          </h1>
          {trabalhador && (
            <p className="text-gray-600 mt-1">
              {trabalhador.nome} — CPF: {trabalhador.cpf}
            </p>
          )}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo e Motivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Afastamento"
                name="tipoAfastamento"
                value={formData.tipoAfastamento}
                onChange={handleChange}
                options={TIPOS_AFASTAMENTO}
                placeholder="Selecione..."
                error={errors.tipoAfastamento}
                required
              />

              <Select
                label="Motivo do Afastamento"
                name="motivoAfastamento"
                value={formData.motivoAfastamento}
                onChange={handleChange}
                options={MOTIVOS_AFASTAMENTO}
                placeholder="Selecione..."
                error={errors.motivoAfastamento}
                required
              />
            </div>

            {/* CID e Datas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                label="CID"
                name="cid"
                value={formData.cid}
                onChange={handleChange}
                placeholder="Ex: J30"
                help="Código CID-10 da doença/condição"
              />

              <DatePicker
                label="Data de Início"
                name="dataInicio"
                value={formData.dataInicio}
                onChange={handleChange}
                error={errors.dataInicio}
                required
              />

              <DatePicker
                label="Data de Fim"
                name="dataFim"
                value={formData.dataFim}
                onChange={handleChange}
                error={errors.dataFim}
                help="Deixe em branco se ainda estiver afastado"
              />
            </div>

            {/* Data de Retorno e Laudo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Data de Retorno"
                name="dataRetorno"
                value={formData.dataRetorno}
                onChange={handleChange}
                error={errors.dataRetorno}
                help="Data efetiva de retorno ao trabalho"
              />

              <TextInput
                label="Laudo Médico"
                name="laudoMedico"
                value={formData.laudoMedico}
                onChange={handleChange}
                placeholder="Número ou referência do laudo"
              />
            </div>

            {/* Observações */}
            <TextArea
              label="Observações"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Informações adicionais sobre o afastamento..."
              rows={4}
            />

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                id="ativo"
                name="ativo"
                type="checkbox"
                checked={formData.ativo}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="ativo" className="text-sm font-medium text-gray-700 cursor-pointer">
                Afastamento Ativo
              </label>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                {isLoading ? 'Salvando...' : isEdicao ? 'Atualizar Afastamento' : 'Registrar Afastamento'}
              </button>
              <Link
                to={`/trabalhadores/${id}/afastamentos`}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium text-center transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

