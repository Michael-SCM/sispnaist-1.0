import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { TextInput, DatePicker, Select } from '../../../components/FormFields.js';
import { submoduloTrabalhadorService } from '../../../services/submoduloTrabalhadorService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhadorDependente, ITrabalhador } from '../../../types/index.js';
import { useCatalogo } from '../../../hooks/useCatalogo.js';
import toast from 'react-hot-toast';

interface FormData {
  nome: string;
  cpf: string;
  dataNascimento: string;
  parentesco: string;
  dependentIR: boolean;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  parentesco: '',
  dependentIR: false,
  ativo: true,
};

// Catálogos carregados dinamicamente

export const FormDependente: React.FC = () => {
  const { id, dependenteId } = useParams<{ id: string; dependenteId: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(dependenteId);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCarregando, setIsCarregando] = useState(isEdicao);

  // Catálogos
  const { itens: parentescos } = useCatalogo('parentesco');

  useEffect(() => {
    if (id) {
      carregarTrabalhador();
      if (isEdicao && dependenteId) {
        carregarDependente();
      }
    }
  }, [id, dependenteId]);

  const carregarTrabalhador = async () => {
    try {
      const t = await trabalhadorService.obterPorId(id!);
      setTrabalhador(t);
    } catch (error) {
      toast.error('Erro ao carregar trabalhador');
      console.error(error);
    }
  };

  const carregarDependente = async () => {
    try {
      setIsCarregando(true);
      const lista = await submoduloTrabalhadorService.listarDependentes(id!);
      const dependente = lista.find((d: ITrabalhadorDependente) => d._id === dependenteId);
      if (dependente) {
        setFormData({
          nome: dependente.nome || '',
          cpf: dependente.cpf || '',
          dataNascimento: dependente.dataNascimento ? dependente.dataNascimento.split('T')[0] : '',
          parentesco: dependente.parentesco || '',
          dependentIR: dependente.dependentIR !== false,
          ativo: dependente.ativo !== false,
        });
      } else {
        toast.error('Dependente não encontrado');
        navigate(`/trabalhadores/${id}/dependentes`);
      }
    } catch (error) {
      toast.error('Erro ao carregar dependente');
      console.error(error);
    } finally {
      setIsCarregando(false);
    }
  };

  const validar = (): boolean => {
    const novoErros: Record<string, string> = {};

    if (!formData.nome.trim()) {
      novoErros.nome = 'Nome é obrigatório';
    }

    if (!formData.parentesco) {
      novoErros.parentesco = 'Parentesco é obrigatório';
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

      const dados: Partial<ITrabalhadorDependente> = {
        ...formData,
        cpf: formData.cpf || undefined,
        dataNascimento: formData.dataNascimento || undefined,
      };

      if (isEdicao) {
        await submoduloTrabalhadorService.atualizarDependente(id!, dependenteId!, dados);
        toast.success('Dependente atualizado com sucesso!');
      } else {
        await submoduloTrabalhadorService.criarDependente(id!, dados);
        toast.success('Dependente registrado com sucesso!');
      }

      navigate(`/trabalhadores/${id}/dependentes`);
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao salvar dependente');
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
              to={`/trabalhadores/${id}/dependentes`}
              className="hover:text-blue-600 transition"
            >
              ← Voltar aos dependentes
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdicao ? 'Editar Dependente' : 'Novo Dependente'}
          </h1>
          {trabalhador && (
            <p className="text-gray-600 mt-1">
              {trabalhador.nome} — CPF: {trabalhador.cpf}
            </p>
          )}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome e CPF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome completo do dependente"
                error={errors.nome}
                required
              />

              <TextInput
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="123.456.789-00"
                help="Opcional"
              />
            </div>

            {/* Data de Nascimento e Parentesco */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Data de Nascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                help="Opcional"
              />

              <Select
                label="Parentesco"
                name="parentesco"
                value={formData.parentesco}
                onChange={handleChange}
                options={parentescos.map((p: any) => ({ value: p.sigla || p.nome, label: p.nome }))}
                placeholder="Selecione..."
                error={errors.parentesco}
                required
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  id="dependentIR"
                  name="dependentIR"
                  type="checkbox"
                  checked={formData.dependentIR}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="dependentIR" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Dependente para Imposto de Renda
                </label>
              </div>

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
                  Dependente Ativo
                </label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                {isLoading ? 'Salvando...' : isEdicao ? 'Atualizar Dependente' : 'Registrar Dependente'}
              </button>
              <Link
                to={`/trabalhadores/${id}/dependentes`}
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

