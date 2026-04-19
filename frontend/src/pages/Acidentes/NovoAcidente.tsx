import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { TextInput, TextArea, Select, DatePicker, TimePicker, Checkbox, MultiSelect } from '../../components/FormFields.js';
import { useAcidenteStore } from '../../store/acidenteStore.js';
import { acidenteService } from '../../services/acidenteService.js';
import { IAcidente } from '../../types/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import toast from 'react-hot-toast';


interface FormData {
  trabalhadorId: string;
  dataAcidente: string;
  horario: string;
  tipoAcidente: string;
  descricao: string;
  local: string;
  lesoes: string[];
  feriado: boolean;
  comunicado: boolean;
  dataComunicacao: string;
  status: 'Aberto' | 'Em Análise' | 'Fechado';
}

const INITIAL_FORM: FormData = {
  trabalhadorId: '',
  dataAcidente: '',
  horario: '',
  tipoAcidente: '',
  descricao: '',
  local: '',
  lesoes: [],
  feriado: false,
  comunicado: false,
  dataComunicacao: '',
  status: 'Aberto' as const,
};

const TIPOS_ACIDENTE = [
  { value: 'Típico', label: 'Acidente Típico' },
  { value: 'Trajeto', label: 'Acidente de Trajeto' },
  { value: 'Doença Ocupacional', label: 'Doença Ocupacional' },
  { value: 'Acidente com Material Biológico', label: 'Material Biológico' },
  { value: 'Violência', label: 'Violência' },
];

export const NovoAcidente: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { adicionarAcidente } = useAcidenteStore();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [trabalhadorNome, setTrabalhadorNome] = useState<string | null>(null);

  // Buscar trabalhador por CPF
  React.useEffect(() => {
    const buscarTrabalhador = async () => {
      if (formData.trabalhadorId.length >= 14) { // Formato XXX.XXX.XXX-XX tem 14 caracteres
        try {
          const t = await trabalhadorService.buscarPorCpf(formData.trabalhadorId);
          if (t) {
            setTrabalhadorNome(t.nome);
          } else {
            setTrabalhadorNome(null);
          }
        } catch (error) {
          console.error('Erro ao buscar trabalhador:', error);
          setTrabalhadorNome(null);
        }
      } else {
        setTrabalhadorNome(null);
      }
    };

    const timer = setTimeout(buscarTrabalhador, 500);
    return () => clearTimeout(timer);
  }, [formData.trabalhadorId]);

  // Validar formulário
  const validar = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.trabalhadorId) {
      newErrors.trabalhadorId = 'Trabalhador é obrigatório';
    }
    if (!formData.dataAcidente) {
      newErrors.dataAcidente = 'Data é obrigatória';
    }
    if (!formData.tipoAcidente) {
      newErrors.tipoAcidente = 'Tipo de acidente é obrigatório';
    }
    if (!formData.descricao || formData.descricao.length < 10) {
      newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manipular mudanças de input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData({
      ...formData,
      [name]: finalValue,
    });

    // Limpar erro do campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Adicionar lesão
  const adicionarLesao = (lesao: string) => {
    if (!formData.lesoes.includes(lesao)) {
      setFormData({
        ...formData,
        lesoes: [...formData.lesoes, lesao],
      });
    }
  };

  // Remover lesão
  const removerLesao = (lesao: string) => {
    setFormData({
      ...formData,
      lesoes: formData.lesoes.filter((l) => l !== lesao),
    });
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsLoading(true);

      // Função para converter data local YYYY-MM-DD para ISO considerando fuso horário
      const converterDataLocal = (dataString: string): string => {
        if (!dataString) return '';
        // dataString vem como "YYYY-MM-DD" do input type="date"
        const [year, month, day] = dataString.split('-');
        // Criar a data às 00:00:00 no fuso horário local
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        return date.toISOString();
      };

      const acidenteData: Partial<IAcidente> = {
        ...formData,
        // Se trebalhadorId vazio, usar ID do usuário autenticado
        trabalhadorId: formData.trabalhadorId || user?._id || '',
        // Converter data local para ISO
        dataAcidente: formData.dataAcidente ? converterDataLocal(formData.dataAcidente) : undefined,
        // Limpar dataComunicacao se não foi comunicado
        dataComunicacao: formData.comunicado && formData.dataComunicacao 
          ? converterDataLocal(formData.dataComunicacao)
          : undefined,
      };

      const novoAcidente = await acidenteService.criar(acidenteData);
      adicionarAcidente(novoAcidente);

      toast.success('Acidente registrado com sucesso!');
      navigate('/acidentes');
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao registrar acidente');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Novo Acidente</h1>
          <p className="text-gray-600 mt-2">Registre um novo acidente de trabalho</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trabalhador */}
            <div className="relative">
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
              {trabalhadorNome && (
                <div className="mt-1 text-sm text-green-600 font-medium">
                  Trabalhador encontrado: {trabalhadorNome}
                </div>
              )}
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Data do Acidente"
                name="dataAcidente"
                value={formData.dataAcidente}
                onChange={handleChange}
                error={errors.dataAcidente}
                required
                max={new Date().toISOString().split('T')[0]}
              />

              <TimePicker
                label="Horário"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
              />
            </div>

            {/* Tipo de Acidente */}
            <Select
              label="Tipo de Acidente"
              name="tipoAcidente"
              value={formData.tipoAcidente}
              onChange={handleChange}
              options={TIPOS_ACIDENTE}
              error={errors.tipoAcidente}
              required
              placeholder="Selecione o tipo de acidente..."
            />

            {/* Descrição */}
            <TextArea
              label="Descrição do Acidente"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva detalhadamente o que aconteceu..."
              error={errors.descricao}
              required
              rows={5}
            />

            {/* Local */}
            <TextInput
              label="Local do Acidente"
              name="local"
              value={formData.local}
              onChange={handleChange}
              placeholder="Onde o acidente ocorreu?"
            />

            {/* Lesões */}
            <MultiSelect
              label="Lesões"
              name="lesoes"
              values={formData.lesoes}
              onAdd={adicionarLesao}
              onRemove={removerLesao}
              placeholder="Digite a lesão e pressione Enter"
              help="Adicione as lesões causadas pelo acidente"
            />

            {/* Feriado */}
            <Checkbox
              label="O acidente ocorreu em feriado?"
              name="feriado"
              checked={formData.feriado}
              onChange={handleChange}
            />

            {/* Comunicado */}
            <Checkbox
              label="Acidente foi comunicado?"
              name="comunicado"
              checked={formData.comunicado}
              onChange={handleChange}
              help="Informe se o acidente foi comunicado aos órgãos responsáveis"
            />

            {/* Data Comunicação */}
            {formData.comunicado && (
              <DatePicker
                label="Data da Comunicação"
                name="dataComunicacao"
                value={formData.dataComunicacao}
                onChange={handleChange}
              />
            )}

            {/* Status */}
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'Aberto', label: 'Aberto' },
                { value: 'Em Análise', label: 'Em Análise' },
                { value: 'Fechado', label: 'Fechado' },
              ]}
            />

            {/* Botões */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Salvando...' : 'Salvar Acidente'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/acidentes')}
                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
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
