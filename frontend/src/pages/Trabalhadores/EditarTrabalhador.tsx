import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { TextInput, Select, DatePicker } from '../../components/FormFields.js';
import { useTrabalhadorStore } from '../../store/trabalhadorStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import empresaService from '../../services/empresaService.js';
import unidadeService from '../../services/unidadeService.js';
import { useCatalogo } from '../../hooks/useCatalogo.js';
import { ITrabalhador, IEmpresa, IUnidade } from '../../types/index.js';
import toast from 'react-hot-toast';

export const EditarTrabalhador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { atualizarTrabalhador } = useTrabalhadorStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
  const [unidades, setUnidades] = useState<IUnidade[]>([]);

  const [formData, setFormData] = useState<Partial<ITrabalhador>>({});

  // Catálogos
  const { itens: sexos } = useCatalogo('sexo');
  const { itens: racas } = useCatalogo('racaCor');
  const { itens: escolaridades } = useCatalogo('escolaridade');
  const { itens: estadosCivis } = useCatalogo('estadoCivil');
  const { itens: tiposSanguineos } = useCatalogo('tipoSanguineo');
  const { itens: situacoesTrabalho } = useCatalogo('situacaoTrabalho');
  const { itens: tiposVinculo } = useCatalogo('tipoVinculo');

  // Carregar empresas
  useEffect(() => {
    const carregarEmpresas = async () => {
      try {
        const response = await empresaService.listarAtivas();
        // A estrutura do retorno é: { status: 'success', data: { empresas: [], total: number } }
        const empresasData = response.data?.empresas || response.empresas || [];
        setEmpresas(empresasData);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      }
    };
    carregarEmpresas();
  }, []);

  // Carregar unidades ativas
  useEffect(() => {
    const carregarUnidades = async () => {
      try {
        const response = await unidadeService.listarAtivas();
        const unidadesData = response.data?.unidades || response.unidades || [];
        setUnidades(unidadesData);
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
      }
    };
    carregarUnidades();
  }, []);

  useEffect(() => {
    const carregarTrabalhador = async () => {
      if (!id) return;
      try {
        const t = await trabalhadorService.obterPorId(id);
        setFormData(t);
      } catch (error) {
        toast.error('Erro ao carregar trabalhador');
        navigate('/trabalhadores');
      } finally {
        setIsLoading(false);
      }
    };
    carregarTrabalhador();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Tratar campos aninhados (ex: endereco.logradouro)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ITrabalhador] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsSaving(true);
      const atualizado = await trabalhadorService.atualizar(id, formData);
      atualizarTrabalhador(id, atualizado);
      toast.success('Trabalhador atualizado com sucesso');
      navigate('/trabalhadores');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar trabalhador');
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

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Editar Trabalhador</h1>
          <p className="text-gray-600 mt-2">Atualize as informações do funcionário.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Pessoais */}
          <section className="card">
            <h2 className="text-xl font-bold mb-6 text-blue-600 border-b pb-2 flex items-center gap-2">
              <span>👤</span> Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TextInput label="Nome Completo" name="nome" value={formData.nome} onChange={handleChange} required />
              </div>
              <TextInput label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} required disabled help="CPF não pode ser alterado diretamente" />

              <TextInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
              <DatePicker label="Data de Nascimento" name="dataNascimento" value={formData.dataNascimento?.split('T')[0]} onChange={handleChange} />

              <Select
                label="Sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                options={sexos.map((s) => ({ value: s.sigla || s.nome, label: s.nome }))}
                placeholder="Selecione..."
              />

              <Select
                label="Raça/Cor"
                name="raca"
                value={formData.raca || ''}
                onChange={handleChange}
                options={racas.map((r) => ({ value: r.nome, label: r.nome }))}
                placeholder="Selecione..."
              />

              <Select
                label="Escolaridade"
                name="escolaridade"
                value={formData.escolaridade || ''}
                onChange={handleChange}
                options={escolaridades.map((e) => ({ value: e.nome, label: e.nome }))}
                placeholder="Selecione..."
              />

              <Select
                label="Estado Civil"
                name="estadoCivil"
                value={formData.estadoCivil || ''}
                onChange={handleChange}
                options={estadosCivis.map((e) => ({ value: e.nome, label: e.nome }))}
                placeholder="Selecione..."
              />

              <Select
                label="Tipo Sanguíneo"
                name="tipoSanguineo"
                value={formData.tipoSanguineo || ''}
                onChange={handleChange}
                options={tiposSanguineos.map((t) => ({ value: t.sigla || t.nome, label: t.nome }))}
                placeholder="Selecione..."
              />
            </div>
          </section>

          {/* Endereço */}
          <section className="card">
            <h2 className="text-xl font-bold mb-6 text-green-600 border-b pb-2 flex items-center gap-2">
              <span>🏠</span> Endereço
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <TextInput label="Logradouro" name="endereco.logradouro" value={formData.endereco?.logradouro} onChange={handleChange} />
              </div>
              <TextInput label="Número" name="endereco.numero" value={formData.endereco?.numero} onChange={handleChange} />
              <TextInput label="Bairro" name="endereco.bairro" value={formData.endereco?.bairro} onChange={handleChange} />
              <TextInput label="Cidade" name="endereco.cidade" value={formData.endereco?.cidade} onChange={handleChange} />
              <TextInput label="Estado" name="endereco.state" value={formData.endereco?.estado} onChange={handleChange} />
            </div>
          </section>

          {/* Vínculo */}
          <section className="card">
            <h2 className="text-xl font-bold mb-6 text-purple-600 border-b pb-2 flex items-center gap-2">
              <span>📄</span> Vínculo e Contrato
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Select
                  label="Empresa"
                  name="empresa"
                  value={formData.empresa || ''}
                  onChange={handleChange}
                  options={empresas.map((emp) => ({
                    value: emp._id || '',
                    label: `${emp.razaoSocial} - ${emp.cnpj}`,
                  }))}
                  placeholder="Selecione uma empresa..."
                />
              </div>
              <Select
                label="Unidade"
                name="unidade"
                value={formData.unidade || ''}
                onChange={handleChange}
                options={unidades.map((uni) => ({
                  value: uni._id || '',
                  label: uni.nome,
                }))}
                placeholder="Selecione uma unidade..."
              />
              <Select
                label="Situação"
                name="vinculo.situacao"
                value={formData.vinculo?.situacao}
                onChange={handleChange}
                options={situacoesTrabalho.map((s) => ({ value: s.nome, label: s.nome }))}
                placeholder="Selecione..."
              />
              <TextInput label="Matrícula" name="matricula" value={formData.matricula} onChange={handleChange} />
              <Select
                label="Tipo de Vínculo"
                name="vinculo.tipo"
                value={formData.vinculo?.tipo}
                onChange={handleChange}
                options={tiposVinculo.map((t) => ({ value: t.nome, label: t.nome }))}
                placeholder="Selecione..."
              />
              <DatePicker label="Data de Entrada" name="trabalho.dataEntrada" value={formData.trabalho?.dataEntrada?.split('T')[0]} onChange={handleChange} />
              <TextInput label="Cargo" name="trabalho.cargo" value={formData.trabalho?.cargo} onChange={handleChange} />
              <TextInput label="Setor" name="trabalho.setor" value={formData.trabalho?.setor} onChange={handleChange} />
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/trabalhadores')}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-10 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Atualizar Dados'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
