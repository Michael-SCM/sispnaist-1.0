import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useTrabalhadorStore } from '../../store/trabalhadorStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { ITrabalhador } from '../../types/index.js';
import toast from 'react-hot-toast';

export const DetalhesTrabalhador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentTrabalhador } = useTrabalhadorStore();
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarTrabalhador = async () => {
      if (!id) return;
      try {
        const t = await trabalhadorService.obterPorId(id);
        setTrabalhador(t);
        setCurrentTrabalhador(t);
      } catch (error) {
        toast.error('Erro ao carregar trabalhador');
        navigate('/trabalhadores');
      } finally {
        setIsLoading(false);
      }
    };
    carregarTrabalhador();
  }, [id, navigate, setCurrentTrabalhador]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!trabalhador) return null;

  const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="py-2">
      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-lg text-gray-800 font-medium">{value || '-'}</p>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto pb-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 leading-tight">{trabalhador.nome}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                trabalhador.vinculo?.situacao === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {trabalhador.vinculo?.situacao || 'Desconhecido'}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500 font-medium">CPF: {trabalhador.cpf}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/trabalhadores/${trabalhador._id}/editar`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-md shadow-blue-100"
            >
              Editar Funcionário
            </Link>
            <button
              onClick={() => navigate('/trabalhadores')}
              className="bg-white border border-gray-200 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition font-bold"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section className="card p-8">
              <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded">👤</span> Dados Cadastrais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <InfoRow label="Nome da Mãe" value={trabalhador.nomeMae} />
                <InfoRow label="Data de Nascimento" value={trabalhador.dataNascimento ? new Date(trabalhador.dataNascimento).toLocaleDateString('pt-BR') : '-'} />
                <InfoRow label="Matrícula" value={trabalhador.matricula} />
                <InfoRow label="Cartão SUS" value={trabalhador.cartaoSus} />
                <InfoRow label="Sexo" value={trabalhador.sexo === 'M' ? 'Masculino' : trabalhador.sexo === 'F' ? 'Feminino' : 'Outro'} />
                <InfoRow label="Escolaridade" value={trabalhador.escolaridade} />
                <InfoRow label="Estado Civil" value={trabalhador.estadoCivil} />
                <InfoRow label="Raça" value={trabalhador.raca} />
              </div>
            </section>

            <section className="card p-8">
              <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                <span className="p-2 bg-purple-50 text-purple-600 rounded">💼</span> Trabalho e Vínculo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <InfoRow label="Cargo" value={trabalhador.trabalho?.cargo} />
                <InfoRow label="Setor" value={trabalhador.trabalho?.setor} />
                <InfoRow label="Função" value={trabalhador.trabalho?.funcao} />
                <InfoRow label="Ocupação (CBO)" value={trabalhador.trabalho?.ocupacao} />
                <InfoRow label="Tipo de Vínculo" value={trabalhador.vinculo?.tipo} />
                <InfoRow label="Turno" value={trabalhador.vinculo?.turno} />
                <InfoRow label="Jornada" value={trabalhador.vinculo?.jornada} />
                <InfoRow label="Data de Entrada" value={trabalhador.trabalho?.dataEntrada ? new Date(trabalhador.trabalho.dataEntrada).toLocaleDateString('pt-BR') : '-'} />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section className="card p-8 bg-gray-50 border-none">
              <h2 className="text-xl font-black text-gray-800 mb-6">Contatos</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email</p>
                    <p className="text-gray-700 font-medium break-all">{trabalhador.email || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📱</span>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Celular</p>
                    <p className="text-gray-700 font-medium">{trabalhador.celular || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="card p-8 bg-green-50/30 border-green-100">
              <h3 className="text-lg font-black text-green-800 mb-4 tracking-tight">Localização</h3>
              <div className="space-y-3">
                <p className="text-sm text-green-800/70 font-medium">
                  {trabalhador.endereco?.logradouro}, {trabalhador.endereco?.numero}
                </p>
                <p className="text-sm text-green-800/70 font-medium">
                  {trabalhador.endereco?.bairro}
                </p>
                <p className="text-sm text-green-800/70 font-medium font-bold">
                  {trabalhador.endereco?.cidade} - {trabalhador.endereco?.estado}
                </p>
                <p className="text-xs text-green-600 font-bold uppercase">CEP: {trabalhador.endereco?.cep}</p>
              </div>
            </section>

            <section className="card p-8 bg-blue-50/30 border-blue-100">
              <h3 className="text-lg font-black text-blue-800 mb-4 tracking-tight">Submódulos</h3>
              <div className="space-y-3">
                <Link
                  to={`/trabalhadores/${trabalhador._id}/afastamentos`}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-sm transition group"
                >
                  <span className="text-2xl">🏥</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 group-hover:text-blue-700 transition">Afastamentos</p>
                    <p className="text-xs text-gray-500">Gerenciar afastamentos médicos</p>
                  </div>
                  <span className="text-blue-400 group-hover:text-blue-600 transition">→</span>
                </Link>
                <Link
                  to={`/trabalhadores/${trabalhador._id}/dependentes`}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-sm transition group"
                >
                  <span className="text-2xl">👨‍👩‍👧</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 group-hover:text-blue-700 transition">Dependentes</p>
                    <p className="text-xs text-gray-500">Gerenciar dependentes do trabalhador</p>
                  </div>
                  <span className="text-blue-400 group-hover:text-blue-600 transition">→</span>
                </Link>
                <Link
                  to={`/trabalhadores/${trabalhador._id}/vinculos`}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-sm transition group"
                >
                  <span className="text-2xl">📋</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 group-hover:text-blue-700 transition">Vínculos</p>
                    <p className="text-xs text-gray-500">Gerenciar vínculos empregatícios</p>
                  </div>
                  <span className="text-blue-400 group-hover:text-blue-600 transition">→</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
