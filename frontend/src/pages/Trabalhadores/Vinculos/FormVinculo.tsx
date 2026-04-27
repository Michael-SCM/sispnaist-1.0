import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { TextInput, TextArea, DatePicker, Select } from '../../../components/FormFields.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorVinculo, ITrabalhador } from '../../../types/index.js';
import toast from 'react-hot-toast';

interface FormData {
  tipoVinculo: string;
  funcao: string;
  jornadaTrabalho: string;
  turnoTrabalho: string;
  dataInicio: string;
  dataFim: string;
  situacao: string;
  empresaTerceirizada: string;
  setor: string;
  cargo: string;
  ocupacao: string;
  cargaHoraria: string;
  salario: string;
  observacoes: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  tipoVinculo: '',
  funcao: '',
  jornadaTrabalho: '',
  turnoTrabalho: '',
  dataInicio: '',
  dataFim: '',
  situacao: 'Ativo',
  empresaTerceirizada: '',
  setor: '',
  cargo: '',
  ocupacao: '',
  cargaHoraria: '',
  salario: '',
  observacoes: '',
  ativo: true,
};

// Opções temporárias até os catálogos serem implementados
const TIPOS_VINCULO = [
  { value: 'Estatutário', label: 'Estatutário' },
  { value: 'CLT', label: 'CLT' },
  { value: 'Temporário', label: 'Temporário' },
  { value: 'Terceirizado', label: 'Terceirizado' },
  { value: 'Comissionado', label: 'Comissionado' },
  { value: 'Outro', label: 'Outro' },
];

const JORNADAS = [
  { value: '20h', label: '20 horas/semana' },
  { value: '30h', label: '30 horas/semana' },
  { value: '40h', label: '40 horas/semana' },
  { value: '44h', label: '44 horas/semana' },
  { value: 'Outra', label: 'Outra' },
];

const TURNOS = [
  { value: 'Manhã', label: 'Manhã' },
  { value: 'Tarde', label: 'Tarde' },
  { value: 'Noite', label: 'Noite' },
  { value: 'Madrugada', label: 'Madrugada' },
  { value: 'Integral', label: 'Integral' },
  { value: 'Rodízio', label: 'Rodízio' },
];

const SITUACOES = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Afastado', label: 'Afastado' },
  { value: 'Desligado', label: 'Desligado' },
  { value: 'Licenciado', label: 'Licenciado' },
];

export const FormVinculo: React.FC = () => {
  const { id, vinculoId } = useParams<{ id: string; vinculoId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(vinculoId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && vinculoId) {
        carregarVinculo();
      }
    }
  }, [id, vinculoId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
      console.error(error);
    }
  };

  const carregarVinculo = async () => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarVinculos(id!);
      const vinculo = lista.find((v: ITrabalhadorVinculo) => v._id === vinculoId);
      if (vinculo) {
        setFormData({
          tipoVinculo: vinculo.tipoVinculo || '',
          funcao: vinculo.funcao || '',
          jornadaTrabalho: vinculo.jornadaTrabalho || '',
          turnoTrabalho: vinculo.turnoTrabalho || '',
          dataInicio: vinculo.dataInicio ? vinculo.dataInicio.split('T')[0] : '',
          dataFim: vinculo.dataFim ? vinculo.dataFim.split('T')[0] : '',
          situacao: vinculo.situacao || 'Ativo',
          empresaTerceirizada: vinculo.empresaTerceirizada || '',
          setor: vinculo.setor || '',
          cargo: vinculo.cargo || '',
          ocupacao: vinculo.ocupacao || '',
          cargaHoraria: vinculo.cargaHoraria ? vinculo.cargaHoraria.toString() : '',
          salario: vinculo.salario ? vinculo.salario.toString() : '',
          observacoes: vinculo.observacoes || '',
          ativo: vinculo.ativo !== false,
        });
      } else {
        toast.error('Vínculo não encontrado');
        navigate(`/trabalhadores/${id}/vinculos`);
      }
    } catch (error) {
      toast.error('Erro ao carregar vínculo');
      console.error(error);
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData.tipoVinculo) {
      novoErros.tipoVinculo = 'Tipo de vínculo é obrigatório';
    }

    if (!formData.dataInicio) {
      novoErros.dataInicio = 'Data de início é obrigatória';
    }

    if (formData.dataFim && new Date(formData.dataFim) < new Date(formData.dataInicio)) {
      novoErros.dataFim = 'Data de fim não pode ser anterior à data de início';
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

      const dados: Partial<ITrabalhadorVinculo> = {
        ...formData,
        dataFim: formData.dataFim || undefined,
        funcao: formData.funcao || undefined,
        jornadaTrabalho: formData.jornadaTrabalho || undefined,
        turnoTrabalho: formData.turnoTrabalho || undefined,
        empresaTerceirizada: formData.empresaTerceirizada || undefined,
        setor: formData.setor || undefined,
        cargo: formData.cargo || undefined,
        ocupacao: formData.ocupacao || undefined,
        cargaHoraria: formData.cargaHoraria ? Number(formData.cargaHoraria) : undefined,
        salario: formData.salario ? Number(formData.salario) : undefined,
        observacoes: formData.observacoes || undefined,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarVinculo(id!, vinculoId!, dados);
        toast.success('Vínculo atualizado com sucesso!');
      } else {
        await submoduloTrabalhadorService.criarVinculo(id!, dados);
        toast.success('Vínculo registrado com sucesso!');
      }

      navigate(`/trabalhadores/${id}/vinculos`);
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao salvar vínculo');
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
              to={`/trabalhadores/${id}/vinculos`}
              className="hover:text-blue-600 transition"
            >
              ← Voltar aos vínculos
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdicao ? 'Editar Vínculo' : 'Novo Vínculo'}
          </h1>
          {trabalhador && (
            <p className="text-gray-600 mt-1">
              {trabalhador.nome} — CPF: {trabalhador.cpf}
            </p>
          )}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Vínculo e Situação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Vínculo"
                name="tipoVinculo"
                value={formData.tipoVinculo}
                onChange={handleChange}
                options={TIPOS_VINCULO}
                placeholder="Selecione..."
                error={errors.tipoVinculo}
                required
              />

              <Select
                label="Situação"
                name="situacao"
                value={formData.situacao}
                onChange={handleChange}
                options={SITUACOES}
                placeholder="Selecione..."
              />
            </div>

            {/* Cargo e Função */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                placeholder="Cargo do trabalhador"
              />

              <TextInput
                label="Função"
                name="funcao"
                value={formData.funcao}
                onChange={handleChange}
                placeholder="Função exercida"
              />
            </div>

            {/* Setor e Ocupação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Setor"
                name="setor"
                value={formData.setor}
                onChange={handleChange}
                placeholder="Setor de trabalho"
              />

              <TextInput
                label="Ocupação (CBO)"
                name="ocupacao"
                value={formData.ocupacao}
                onChange={handleChange}
                placeholder="Código CBO"
              />
            </div>

            {/* Jornada e Turno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Jornada de Trabalho"
                name="jornadaTrabalho"
                value={formData.jornadaTrabalho}
                onChange={handleChange}
                options={JORNADAS}
                placeholder="Selecione..."
              />

              <Select
                label="Turno"
                name="turnoTrabalho"
                value={formData.turnoTrabalho}
                onChange={handleChange}
                options={TURNOS}
                placeholder="Selecione..."
              />
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                help="Deixe em branco se ainda estiver vigente"
              />
            </div>

            {/* Carga Horária e Salário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Carga Horária (semanal)"
                name="cargaHoraria"
                value={formData.cargaHoraria}
                onChange={handleChange}
                type="number"
                placeholder="Ex: 40"
                help="Horas por semana"
              />

              <TextInput
                label="Salário"
                name="salario"
                value={formData.salario}
                onChange={handleChange}
                type="number"
                placeholder="0,00"
                help="Valor mensal"
              />
            </div>

            {/* Empresa Terceirizada */}
            <TextInput
              label="Empresa Terceirizada"
              name="empresaTerceirizada"
              value={formData.empresaTerceirizada}
              onChange={handleChange}
              placeholder="Nome da empresa terceirizada, se aplicável"
            />

            {/* Observações */}
            <TextArea
              label="Observações"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Informações adicionais sobre o vínculo..."
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
                Vínculo Ativo
              </label>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                {isLoading ? 'Salvando...' : isEdicao ? 'Atualizar Vínculo' : 'Registrar Vínculo'}
              </button>
              <Link
                to={`/trabalhadores/${id}/vinculos`}
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

