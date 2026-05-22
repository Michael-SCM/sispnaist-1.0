import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useVacinacaoStore } from '../../store/vacinacaoStore.js';
import { vacinacaoService } from '../../services/vacinacaoService.js';
import { IVacinacao } from '../../types/index.js';
import {
  Syringe,
  ArrowLeft,
  Edit,
  User,
  Calendar,
  FileText,
  Clock,
  Loader2,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DetalhesVacinacao: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setCurrentVacinacao } = useVacinacaoStore();

  const [vacinacao, setVacinacao] = useState<IVacinacao | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTrabalhadorNome = () => {
    if (!vacinacao) return 'Não informado';
    const tid = vacinacao.trabalhadorId;
    if (typeof tid === 'object' && tid?.nome) return tid.nome;
    return 'Não informado';
  };

  const getTrabalhadorCpf = () => {
    if (!vacinacao) return 'Não informado';
    const tid = vacinacao.trabalhadorId;
    if (typeof tid === 'object' && tid?.cpf) return tid.cpf;
    return 'Não informado';
  };

  useEffect(() => {
    const carregarVacinacao = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await vacinacaoService.obter(id);
        setVacinacao(data.vacinacao);
        setCurrentVacinacao(data.vacinacao);
      } catch (error) {
        toast.error('Erro ao carregar detalhes da vacinação');
        navigate('/vacinacoes');
      } finally {
        setIsLoading(false);
      }
    };

    carregarVacinacao();
  }, [id, navigate, setCurrentVacinacao]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando detalhes...</p>
        </div>
      </MainLayout>
    );
  }

  if (!vacinacao) return null;

  const formatarData = (data: any) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vacinacoes')}
              className="p-3 hover:bg-emerald-50 rounded-2xl transition-all text-emerald-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detalhes da Vacinação</h1>
              <p className="text-slate-500 font-medium">Protocolo: <span className="font-mono">{vacinacao._id}</span></p>
            </div>
          </div>
          <Link
            to={`/vacinacoes/${vacinacao._id}/editar`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Edit size={20} />
            Editar Registro
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Syringe size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Vacina</p>
              <p className="text-xl font-bold text-slate-900">{vacinacao.vacina}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Data da Aplicação</p>
              <p className="text-xl font-bold text-slate-900">{formatarData(vacinacao.dataVacinacao)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Próxima Dose</p>
              <p className="text-xl font-bold text-slate-900">{formatarData(vacinacao.proximoDose)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações da Vacinação */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Syringe size={20} className="text-emerald-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações da Vacinação</h2>
              </div>
              <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                {vacinacao.unidadeSaude && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidade de Saúde</p>
                    <p className="font-bold text-slate-700">{vacinacao.unidadeSaude}</p>
                  </div>
                )}
                {vacinacao.profissional && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profissional Responsável</p>
                    <p className="font-bold text-slate-700">{vacinacao.profissional}</p>
                  </div>
                )}
                {vacinacao.lote && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lote</p>
                    <p className="font-bold text-slate-700">{vacinacao.lote}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Certificado */}
            {vacinacao.certificado && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={20} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Certificado</h2>
                </div>
                <div className="p-8">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{vacinacao.certificado}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trabalhador */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <User size={20} className="text-emerald-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Trabalhador</h2>
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Nome Completo</p>
                  <p className="font-bold text-slate-900">{getTrabalhadorNome()}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">CPF</p>
                  <p className="font-mono text-slate-600">{getTrabalhadorCpf()}</p>
                </div>
              </div>
            </div>

            {/* Datas do Registro */}
            <div className="bg-slate-900 rounded-3xl p-6 text-slate-400 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} />
                <span className="text-xs font-black uppercase tracking-wider">Datas do Registro</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Criação</p>
                  <p className="text-xs font-medium text-slate-200">{vacinacao.dataCriacao ? new Date(vacinacao.dataCriacao).toLocaleString('pt-BR') : 'Não disponível'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Última Atualização</p>
                  <p className="text-xs font-medium text-slate-200">{vacinacao.dataAtualizacao ? new Date(vacinacao.dataAtualizacao).toLocaleString('pt-BR') : 'Não disponível'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesVacinacao;