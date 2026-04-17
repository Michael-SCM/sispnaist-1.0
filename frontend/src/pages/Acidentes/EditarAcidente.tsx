import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { TextInput, TextArea, Select, DatePicker, TimePicker, Checkbox, MultiSelect } from '../../components/FormFields.js';
import { useAcidenteStore } from '../../store/acidenteStore.js';
import { acidenteService } from '../../services/acidenteService.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { IAcidente } from '../../types/index.js';
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
  status: string;
}

const TIPOS_ACIDENTE = [
  { value: 'Típico', label: 'Acidente Típico' },
  { value: 'Trajeto', label: 'Acidente de Trajeto' },
  { value: 'Doença Ocupacional', label: 'Doença Ocupacional' },
  { value: 'Acidente com Material Biológico', label: 'Material Biológico' },
  { value: 'Violência', label: 'Violência' },
];

export const EditarAcidente: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setCurrentAcidente, atualizarAcidente } = useAcidenteStore();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [trabalhadorNome, setTrabalhadorNome] = useState<string | null>(null);

  // Buscar nome do trabalhador quando CPF mudar
  useEffect(() => {
    const buscarTrabalhador = async () => {
      if (formData?.trabalhadorId && formData.trabalhadorId.length >= 14) {
        try {
          const t = await trabalhadorService.buscarPorCpf(formData.trabalhadorId);
          if (t) setTrabalhadorNome(t.nome);
        } catch (error) {
          console.error(error);
        }
      }
    };
    buscarTrabalhador();
  }, [formData?.trabalhadorId]);

  // Formatar data para formato YYYY-MM-DD
  const formatarDataInput = (data: string | Date | undefined): string => {
    if (!data) return '';
    const date = new Date(data);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Extrair CPF do trabalhador (pode vir como objeto por populate)
  const extrairCPF = (trabalhador: any): string => {
    if (typeof trabalhador === 'string') return trabalhador;
    if (trabalhador && typeof trabalhador === 'object' && trabalhador.cpf) {
      return trabalhador.cpf;
    }
    return '';
  };

  // Garantir que lesões é sempre um array de strings
  const garantirArrayLesoes = (lesoes: any): string[] => {
    if (!lesoes) return [];

    // Já é um array normal
    if (Array.isArray(lesoes)) {
      return lesoes
        .map((l: any) => (typeof l === 'string' ? l : String(l)))
        .filter(Boolean);
    }

    // Pode vir como string JSON "["fratura","corte"]"
    if (typeof lesoes === 'string') {
      try {
        const parsed = JSON.parse(lesoes);
        if (Array.isArray(parsed)) return parsed.filter((l: any) => typeof l === 'string');
      } catch {
        // string simples (uma lesão)
        return lesoes.trim() ? [lesoes.trim()] : [];
      }
    }

    // Objeto estilo array-like { 0: 'fratura', 1: 'corte' }
    if (typeof lesoes === 'object') {
      return Object.values(lesoes)
        .map((l: any) => (typeof l === 'string' ? l : String(l)))
        .filter(Boolean);
    }

    return [];
  };

  // Carregar acidente
  useEffect(() => {
    const carregarAcidente = async () => {
      if (!id) {
        toast.error('ID do acidente não fornecido');
        navigate('/acidentes');
        return;
      }

      try {
        setIsLoading(true);
        const acidente = await acidenteService.obter(id);
        setCurrentAcidente(acidente);

        setFormData({
          trabalhadorId: extrairCPF(acidente.trabalhadorId),
          dataAcidente: formatarDataInput(acidente.dataAcidente),
          horario: acidente.horario || '',
          tipoAcidente: acidente.tipoAcidente,
          descricao: acidente.descricao,
          local: acidente.local || '',
          lesoes: garantirArrayLesoes(acidente.lesoes),
          feriado: acidente.feriado || false,
          comunicado: acidente.comunicado || false,
          dataComunicacao: formatarDataInput(acidente.dataComunicacao),
          status: acidente.status || 'Aberto',
        });
      } catch (error) {
        toast.error('Erro ao carregar acidente');
        console.error(error);
        navigate('/acidentes');
      } finally {
        setIsLoading(false);
      }
    };

    carregarAcidente();
  }, [id, navigate, setCurrentAcidente]);

  // Validar formulário
  const validar = (): boolean => {
    if (!formData) return false;

    const newErrors: { [key: string]: string } = {};

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
    if (!formData) return;

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
    if (formData && !formData.lesoes.includes(lesao)) {
      setFormData({
        ...formData,
        lesoes: [...formData.lesoes, lesao],
      });
    }
  };

  // Remover lesão
  const removerLesao = (lesao: string) => {
    if (formData) {
      setFormData({
        ...formData,
        lesoes: formData.lesoes.filter((l) => l !== lesao),
      });
    }
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !formData || !validar()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSaving(true);

      // Função para converter data local YYYY-MM-DD para ISO considerando fuso horário
      const converterDataLocal = (dataString: string): string => {
        if (!dataString) return '';
        // dataString vem como "YYYY-MM-DD" do input type="date"
        const [year, month, day] = dataString.split('-');
        // Criar a data às 12:00:00 no fuso horário local
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        return date.toISOString();
      };
      
      // Preparar dados para envio - converter datas para ISO
      const acidenteAtuzalizar: Partial<FormData> = {
        ...formData,
        dataAcidente: formData.dataAcidente ? converterDataLocal(formData.dataAcidente) : undefined,
        dataComunicacao: formData.comunicado && formData.dataComunicacao 
          ? converterDataLocal(formData.dataComunicacao)
          : undefined,
        // Garantir que lesões é um array
        lesoes: Array.isArray(formData.lesoes) ? formData.lesoes : [],
      };

      const acidenteAtualizado = await acidenteService.atualizar(id, acidenteAtuzalizar as any);

      atualizarAcidente(id, acidenteAtualizado);
      toast.success('Acidente atualizado com sucesso!');
      navigate('/acidentes');
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar acidente');
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
    return (
      <MainLayout>
        <div className="text-center py-10">
          <p className="text-gray-600">Erro ao carregar acidente</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Editar Acidente</h1>
          <p className="text-gray-600 mt-2">Atualize os dados do acidente</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trabalhador (somente leitura) */}
            <div className="relative">
              <TextInput
                label="CPF do Trabalhador"
                name="trabalhadorId"
                value={formData.trabalhadorId}
                onChange={() => {}}
                disabled
                help="Campo não pode ser alterado"
              />
              {trabalhadorNome && (
                <div className="mt-1 text-sm text-green-600 font-medium">
                  Trabalhador: {trabalhadorNome}
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
            <div>
              <MultiSelect
                label="Lesões"
                name="lesoes"
                values={formData.lesoes || []}
                onAdd={adicionarLesao}
                onRemove={removerLesao}
                placeholder="Digite a lesão e pressione Enter"
              />
            </div>

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
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Salvando...' : 'Atualizar Acidente'}
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
