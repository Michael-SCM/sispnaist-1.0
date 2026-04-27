import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DataTable } from '../../../components/DataTable.js';
import { catalogoService } from '../../../services/catalogoService.js';
import { ICatalogoItem } from '../../../types/index.js';
import toast from 'react-hot-toast';

const NOMES_ENTIDADES: Record<string, string> = {
  escolaridade: 'Escolaridade',
  estadoCivil: 'Estado Civil',
  racaCor: 'Raça/Cor',
  sexo: 'Sexo',
  tipoSanguineo: 'Tipo Sanguíneo',
  situacaoTrabalho: 'Situação de Trabalho',
  funcao: 'Função',
  jornadaTrabalho: 'Jornada de Trabalho',
  turnoTrabalho: 'Turno de Trabalho',
};

interface FormData {
  nome: string;
  sigla: string;
  descricao: string;
  ordem: string;
  ativo: boolean;
}

const INITIAL_FORM: FormData = {
  nome: '',
  sigla: '',
  descricao: '',
  ordem: '0',
  ativo: true,
};

export const ItensCatalogo: React.FC = () => {
  const { entidade } = useParams<{ entidade: string }>();
  const navigate = useNavigate();
  const [itens, setItens] = useState<ICatalogoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

  const nomeEntidade = entidade ? NOMES_ENTIDADES[entidade] || entidade : '';

  useEffect(() => {
    if (entidade) {
      carregarItens();
    }
  }, [entidade]);

  const carregarItens = async () => {
    try {
      setIsLoading(true);
      const response = await catalogoService.listar(entidade!, 1, 100, undefined);
      setItens(response.data);
    } catch (error) {
      toast.error('Erro ao carregar itens do catálogo');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      const data = {
        ...formData,
        ordem: Number(formData.ordem) || 0,
      };

      if (editingId) {
        await catalogoService.atualizar(entidade!, editingId, data);
        toast.success('Item atualizado com sucesso!');
      } else {
        await catalogoService.criar(entidade!, data);
        toast.success('Item criado com sucesso!');
      }

      setFormData(INITIAL_FORM);
      setShowForm(false);
      setEditingId(null);
      carregarItens();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar item');
    }
  };

  const handleEditar = (item: ICatalogoItem) => {
    setFormData({
      nome: item.nome,
      sigla: item.sigla || '',
      descricao: item.descricao || '',
      ordem: String(item.ordem || 0),
      ativo: item.ativo !== false,
    });
    setEditingId(item._id || null);
    setShowForm(true);
  };

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await catalogoService.deletar(entidade!, id);
      setItens((prev) => prev.filter((i) => i._id !== id));
      toast.success('Item removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover item');
    }
  };

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'sigla', header: 'Sigla', render: (v: string) => v || '-' },
    {
      key: 'ativo',
      header: 'Status',
      render: (v: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            v ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {v ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'ordem',
      header: 'Ordem',
      render: (v: number) => v ?? '-',
    },
  ];

  const actions = [
    {
      label: 'Editar',
      onClick: (item: ICatalogoItem) => handleEditar(item),
      variant: 'primary' as const,
    },
    {
      label: 'Remover',
      onClick: (item: ICatalogoItem) => handleDeletar(item._id!),
      variant: 'danger' as const,
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link to="/admin/catalogos" className="hover:text-blue-600 transition">
                ← Voltar aos catálogos
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{nomeEntidade}</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os itens do catálogo <strong>{nomeEntidade}</strong>.
            </p>
          </div>
          <button
            onClick={() => {
              setFormData(INITIAL_FORM);
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md shadow-blue-100 transition"
          >
            {showForm ? 'Cancelar' : '+ Novo Item'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? 'Editar Item' : 'Novo Item'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Masculino"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sigla</label>
                <input
                  type="text"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: M"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                <input
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição opcional..."
                />
              </div>
              <div className="flex items-center gap-2 lg:col-span-2">
                <input
                  id="ativo"
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                  Ativo
                </label>
              </div>
              <div className="lg:col-span-4 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  {editingId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabela */}
        <div className="card">
          <DataTable
            columns={columns}
            data={itens}
            isLoading={isLoading}
            actions={actions}
            emptyMessage={`Nenhum item cadastrado em ${nomeEntidade}.`}
          />
        </div>
      </div>
    </MainLayout>
  );
};

