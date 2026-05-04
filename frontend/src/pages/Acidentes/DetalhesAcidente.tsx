import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useAcidenteStore } from '../../store/acidenteStore.js';
import { acidenteService } from '../../services/acidenteService.js';
import { IAcidente } from '../../types/index.js';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Edit, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Info,
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DetalhesAcidente: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setCurrentAcidente } = useAcidenteStore();

  const [acidente, setAcidente] = useState<IAcidente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarAcidente = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await acidenteService.obter(id);
        setAcidente(data);
        setCurrentAcidente(data);
      } catch (error) {
        toast.error('Erro ao carregar detalhes do acidente');
        navigate('/acidentes');
      } finally {
        setIsLoading(false);
      }
    };

    carregarAcidente();
  }, [id, navigate, setCurrentAcidente]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-amber-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando detalhes...</p>
        </div>
      </MainLayout>
    );
  }

  if (!acidente) return null;

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
              onClick={() => navigate('/acidentes')}
              className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detalhes do Acidente</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  acidente.status === 'Aberto' ? 'bg-amber-100 text-amber-700' :
                  acidente.status === 'Em Análise' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {acidente.status || 'Aberto'}
                </span>
              </div>
              <p className="text-slate-500 font-medium">Protocolo: <span className="font-mono">{acidente._id}</span></p>
            </div>
          </div>
          <Link
            to={`/acidentes/${acidente._id}/editar`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-100 active:scale-95"
          >
            <Edit size={20} />
            Editar Registro
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Data da Ocorrência</p>
              <p className="text-xl font-bold text-slate-900">{formatarData(acidente.dataAcidente)}</p>
              {acidente.horario && <p className="text-sm text-slate-500 font-medium">{acidente.horario}</p>}
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tipo de Acidente</p>
              <p className="text-xl font-bold text-slate-900">{acidente.tipoAcidente}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Localização</p>
              <p className="text-xl font-bold text-slate-900 truncate max-w-[150px]">{acidente.local || 'Não informado'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ocorrência */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <FileText size={20} className="text-amber-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Relato do Acidente</h2>
              </div>
              <div className="p-8">
                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {acidente.descricao}
                </p>
              </div>
            </div>

            {/* Lesões */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Lesões Identificadas</h2>
              </div>
              <div className="p-8">
                {acidente.lesoes && acidente.lesoes.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {acidente.lesoes.map((lesao, index) => (
                      <span key={index} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-2xl text-sm font-bold border border-rose-100">
                        {lesao}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium italic">Nenhuma lesão informada no registro</p>
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
                <User size={20} className="text-amber-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Trabalhador</h2>
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Nome Completo</p>
                  <p className="font-bold text-slate-900">{(acidente.trabalhadorId as any)?.nome || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">CPF</p>
                  <p className="font-mono text-slate-600">{(acidente.trabalhadorId as any)?.cpf || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Comunicação */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Info size={20} className="text-amber-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Comunicação</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Comunicado?</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${acidente.comunicado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {acidente.comunicado ? 'Sim' : 'Não'}
                  </span>
                </div>
                {acidente.comunicado && (
                  <div className="pt-4 border-t border-slate-50">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Data da Comunicação</p>
                    <p className="font-bold text-slate-900">{formatarData(acidente.dataComunicacao)}</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-sm font-bold text-slate-600">Ocorreu em Feriado?</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${acidente.feriado ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {acidente.feriado ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-slate-900 rounded-3xl p-6 text-slate-400 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} />
                <span className="text-xs font-black uppercase tracking-wider">Histórico do Registro</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Criação</p>
                  <p className="text-xs font-medium text-slate-200">{new Date(acidente.dataCriacao!).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Última Atualização</p>
                  <p className="text-xs font-medium text-slate-200">{new Date(acidente.dataAtualizacao!).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesAcidente;
