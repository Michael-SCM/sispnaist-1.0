import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { TextInput, Select, DatePicker } from '../../components/FormFields.js';
import { useTrabalhadorStore } from '../../store/trabalhadorStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import empresaService from '../../services/empresaService.js';
import unidadeService from '../../services/unidadeService.js';
import { ITrabalhador, IEmpresa, IUnidade } from '../../types/index.js';
import toast from 'react-hot-toast';

export const NovoTrabalhador: React.FC = () => {
  const navigate = useNavigate();
  const { adicionarTrabalhador } = useTrabalhadorStore();
  const [isLoading, setIsLoading] = useState(false);
  const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
  const [unidades, setUnidades] = useState<IUnidade[]>([]);

  // Carregar empresas ao montar o componente
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

  const [formData, setFormData] = useState<Partial<ITrabalhador>>({
    nome: '',
    cpf: '',
    email: '',
    sexo: 'M',
    dataNascimento: '',
    vinculo: { situacao: 'Ativo' },
    trabalho: {},
    endereco: {},
  });

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
    if (!formData.nome || !formData.cpf) {
      toast.error('Nome e CPF são obrigatórios');
      return;
    }

    try {
      setIsLoading(true);
      const novo = await trabalhadorService.criar(formData);
      adicionarTrabalhador(novo);
      toast.success('Trabalhador cadastrado com sucesso');
      navigate('/trabalhadores');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar trabalhador');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Novo Trabalhador</h1>
          <p className="text-gray-600 mt-2">Cadastre um novo funcionário no sistema.</p>
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
              <TextInput label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" required />

              <TextInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
              <TextInput label="Matrícula" name="matricula" value={formData.matricula} onChange={handleChange} />
              <DatePicker label="Data de Nascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} />

              <Select
                label="Sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                options={[{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }, { value: 'O', label: 'Outro' }]}
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
              <TextInput label="Estado" name="endereco.estado" value={formData.endereco?.estado} onChange={handleChange} />
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
                options={[
                  { value: 'Ativo', label: 'Ativo' }, 
                  { value: 'Afastado', label: 'Afastado' }, 
                  { value: 'Desligado', label: 'Desligado' },
                  { value: 'Aposentado', label: 'Aposentado' }
                ]}
              />
              <TextInput label="Tipo de Vínculo" name="vinculo.tipo" value={formData.vinculo?.tipo} onChange={handleChange} placeholder="ex: Efetivo, CLT, Estágio" />
              <DatePicker label="Data de Entrada" name="trabalho.dataEntrada" value={formData.trabalho?.dataEntrada} onChange={handleChange} />
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
              disabled={isLoading}
              className="px-10 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Cadastrar Trabalhador'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
