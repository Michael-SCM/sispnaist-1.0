import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useDoencaStore } from '../../store/doencaStore.js';
import { doencaService } from '../../services/doencaService.js';
import { IDoenca } from '../../types/index.js';
import {
  HeartPulse,
  ArrowLeft,
  Edit,
  User,
  Calendar,
  FileText,
  Clock,
  Stethoscope,
  Loader2,
  Activity,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DocumentTitle } from '../../hooks/useDocumentTitle.js';

export const DetalhesDoenca: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setCurrentDoenca } = useDoencaStore();

  const [doenca, setDoenca] = useState<IDoenca | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTrabalhadorNome = () => {
    if (!doenca) return 'Não informado';
    const tid = doenca.trabalhadorId;
    if (typeof tid === 'object' && tid?.nome) return tid.nome;
    return 'Não informado';
  };

  const getTrabalhadorCpf = () => {
    if (!doenca) return 'Não informado';
    const tid = doenca.trabalhadorId;
    if (typeof tid === 'object' && tid?.cpf) return tid.cpf;
    return 'Não informado';
  };

  useEffect(() => {
    const carregarDoenca = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await doencaService.obter(id);
        setDoenca(data);
        setCurrentDoenca(data);
      } catch (error) {
        toast.error('Erro ao carregar detalhes da doença');
        navigate('/doencas');
      } finally {
        setIsLoading(false);
      }
    };

    carregarDoenca();
  }, [id, navigate, setCurrentDoenca]);

  if (isLoading) {
    return (
      <MainLayout>
        <DocumentTitle title="Detalhes da Doença" />
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-rose-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando detalhes...</p>
        </div>
      </MainLayout>
    );
  }

  if (!doenca) return null;

  const formatarData = (data: any) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <MainLayout>
      <DocumentTitle title="Detalhes da Doença" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/doencas')}
              className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-rose-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detalhes da Doença</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  doenca.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {doenca.ativo ? 'Ativa' : 'Encerrada'}
                </span>
              </div>
              <p className="text-slate-500 font-medium">Protocolo: <span className="font-mono">{doenca._id}</span></p>
            </div>
          </div>
          <Link
            to={`/doencas/${doenca._id}/editar`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-100 active:scale-95"
          >
            <Edit size={20} />
            Editar Registro
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Data de Início</p>
              <p className="text-xl font-bold text-slate-900">{formatarData(doenca.dataInicio)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Stethoscope size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Código CID</p>
              <p className="text-xl font-bold text-slate-900">{doenca.codigoDoenca || 'N/I'}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Nome da Doença</p>
              <p className="text-xl font-bold text-slate-900 truncate max-w-[150px]">{doenca.nomeDoenca}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Relato Clínico */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <FileText size={20} className="text-rose-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Relato Clínico</h2>
              </div>
              <div className="p-8">
                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {doenca.relatoClinico || 'Nenhum relato clínico registrado.'}
                </p>
              </div>
            </div>

            {/* Informações da Doença */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <HeartPulse size={20} className="text-rose-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações da Doença</h2>
              </div>
              <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                {doenca.profissionalSaude && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profissional de Saúde</p>
                    <p className="font-bold text-slate-700">{doenca.profissionalSaude}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Relação com o Trabalho</p>
                  <p className="font-bold text-slate-700">
                    {{
                      comum: 'Comum (sem relação)',
                      ocupacional: 'Doença Ocupacional (DRT)',
                      acidente: 'Acidente de Trabalho',
                    }[doenca.relacaoTrabalho || 'comum']}
                  </p>
                </div>
                {doenca.dataFim && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data de Encerramento</p>
                    <p className="font-bold text-slate-700">{formatarData(doenca.dataFim)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trabalhador */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <User size={20} className="text-rose-600" />
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

            {/* Status */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <AlertCircle size={20} className="text-rose-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Status</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Situação</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${doenca.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {doenca.ativo ? 'Ativa' : 'Encerrada'}
                  </span>
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
                  <p className="text-xs font-medium text-slate-200">{doenca.dataCriacao ? new Date(doenca.dataCriacao).toLocaleString('pt-BR') : 'Não disponível'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Última Atualização</p>
                  <p className="text-xs font-medium text-slate-200">{doenca.dataAtualizacao ? new Date(doenca.dataAtualizacao).toLocaleString('pt-BR') : 'Não disponível'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesDoenca;