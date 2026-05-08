import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useAcidenteStore } from '../../store/acidenteStore.js';
import { acidenteService } from '../../services/acidenteService.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { IAcidente, IAcidentePopulated } from '../../types/index.js';
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
  Loader2,
  Dna,
  PlusCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { materialBiologicoService } from '../../services/materialBiologicoService.js';
import { IMaterialBiologico } from '../../types/index.js';

export const DetalhesAcidente: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setCurrentAcidente } = useAcidenteStore();

  const [acidente, setAcidente] = useState<IAcidente | IAcidentePopulated | null>(null);
  const [fichaBiologica, setFichaBiologica] = useState<IMaterialBiologico | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFicha, setIsLoadingFicha] = useState(false);

  // Helper para acessar nome do trabalhador (pode vir populado ou como ID string)
  const getTrabalhadorNome = () => {
    if (!acidente) return 'Não informado';
    const tid = acidente.trabalhadorId;
    if (typeof tid === 'object' && tid?.nome) return tid.nome;
    return 'Não informado';
  };

  const getTrabalhadorCpf = () => {
    if (!acidente) return 'Não informado';
    const tid = acidente.trabalhadorId;
    if (typeof tid === 'object' && tid?.cpf) return tid.cpf;
    return 'Não informado';
  };

  useEffect(() => {
    const carregarAcidente = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await acidenteService.obter(id);
        setAcidente(data);
        setCurrentAcidente(data);

        // Se for material biológico, buscar a ficha técnica
        if (data.tipoAcidente === 'Acidente com Material Biológico') {
          setIsLoadingFicha(true);
          const ficha = await materialBiologicoService.obterPorAcidente(id);
          setFichaBiologica(ficha);
          setIsLoadingFicha(false);
        }
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

            {/* Informações do Acidente */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações do Acidente</h2>
              </div>
              <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                {acidente.dataNotificacao && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data da Notificação</p>
                    <p className="font-bold text-slate-700">{formatarData(acidente.dataNotificacao)}</p>
                  </div>
                )}
                {acidente.horarioAposInicioJornada && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horário Após Início da Jornada</p>
                    <p className="font-bold text-slate-700">{acidente.horarioAposInicioJornada}</p>
                  </div>
                )}
                {acidente.tipoTrauma && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Trauma</p>
                    <p className="font-bold text-slate-700">{acidente.tipoTrauma}</p>
                  </div>
                )}
                {acidente.agenteCausador && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Agente Causador</p>
                    <p className="font-bold text-slate-700">{acidente.agenteCausador}</p>
                  </div>
                )}
                {acidente.parteCorpo && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parte do Corpo</p>
                    <p className="font-bold text-slate-700">{acidente.parteCorpo}</p>
                  </div>
                )}
                {acidente.estado && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado (UF)</p>
                    <p className="font-bold text-slate-700">{acidente.estado}</p>
                  </div>
                )}
              </div>
              {acidente.descricaoTrauma && (
                <div className="px-8 pb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Descrição do Trauma</p>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">{acidente.descricaoTrauma}</p>
                </div>
              )}
            </div>

            {/* Atendimento Médico */}
            {acidente.atendimentoMedico && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Atendimento Médico</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {acidente.dataAtendimento && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data do Atendimento</p>
                      <p className="font-bold text-slate-700">{formatarData(acidente.dataAtendimento)}</p>
                    </div>
                  )}
                  {acidente.horaAtendimento && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hora do Atendimento</p>
                      <p className="font-bold text-slate-700">{acidente.horaAtendimento}</p>
                    </div>
                  )}
                  {acidente.unidadeAtendimento && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidade de Atendimento</p>
                      <p className="font-bold text-slate-700">{acidente.unidadeAtendimento}</p>
                    </div>
                  )}
                </div>
                {acidente.internamento && (
                  <div className="px-8 pb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100">
                      Internamento: {acidente.duracaoInternamento ? `${acidente.duracaoInternamento} horas` : 'Sim'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Informações Adicionais */}
            {(acidente.catNas || acidente.registroPolicial || acidente.encaminhamentoJuntaMedica || acidente.afastamento || acidente.outrosTrabalhadoresAtingidos) && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-amber-600" />
                  <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Informações Adicionais</h2>
                </div>
                <div className="p-8">
                  <div className="flex flex-wrap gap-3">
                    {acidente.catNas && (
                      <span className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-100">CAT/NAS</span>
                    )}
                    {acidente.registroPolicial && (
                      <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100">Registro Policial</span>
                    )}
                    {acidente.encaminhamentoJuntaMedica && (
                      <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold border border-purple-100">Encaminhamento Junta Médica</span>
                    )}
                    {acidente.afastamento && (
                      <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100">Afastamento</span>
                    )}
                    {acidente.outrosTrabalhadoresAtingidos && (
                      <span className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-bold border border-yellow-100">
                        Outros Trabalhadores Atingidos{acidente.quantidadeTrabalhadoresAtingidos ? ` (${acidente.quantidadeTrabalhadoresAtingidos})` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

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

            {/* Card de Material Biológico (Integrado) */}
            {acidente.tipoAcidente === 'Acidente com Material Biológico' && (
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 py-5 bg-emerald-600 border-b border-emerald-500 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Dna size={20} />
                    <h2 className="font-bold uppercase text-sm tracking-wider">Dados Clínicos de Exposição</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {fichaBiologica ? (
                      <button
                        onClick={() => navigate(`/acidentes/material-biologico/${fichaBiologica._id}/editar`)}
                        className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all"
                      >
                        Editar Ficha
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/acidentes/material-biologico/novo', { state: { acidenteId: acidente._id } })}
                        className="px-4 py-1.5 bg-white text-emerald-700 rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        Criar Ficha
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-8">
                  {isLoadingFicha ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-emerald-600" />
                    </div>
                  ) : fichaBiologica ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Exposição</p>
                          <p className="font-bold text-slate-700">{fichaBiologica.tipoExposicao || 'N/I'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Agente Causador</p>
                          <p className="font-bold text-slate-700">{fichaBiologica.agente || 'N/I'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Material Orgânico</p>
                          <p className="font-bold text-slate-700">{fichaBiologica.materialOrganico || 'N/I'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Evolução do Caso</p>
                          <p className="font-bold text-slate-700">{fichaBiologica.evolucaoCaso || 'N/I'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PrEP Acompanhamento</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${fichaBiologica.acompanhamentoPrEP ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {fichaBiologica.acompanhamentoPrEP ? 'Sim' : 'Não'}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Reavaliação</p>
                          <p className="font-bold text-emerald-600">
                            {fichaBiologica.dataReavaliacao ? new Date(fichaBiologica.dataReavaliacao).toLocaleDateString('pt-BR') : 'Agendar'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">Ficha Técnica Pendente</p>
                        <p className="text-sm text-slate-500">Este acidente do tipo biológico ainda não possui dados clínicos registrados.</p>
                      </div>
                      <button
                        onClick={() => navigate('/acidentes/material-biologico/novo', { state: { acidenteId: acidente._id } })}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-100"
                      >
                        Registrar Agora
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  <p className="font-bold text-slate-900">{getTrabalhadorNome()}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">CPF</p>
                  <p className="font-mono text-slate-600">{getTrabalhadorCpf()}</p>
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

            {/* Datas do Registro */}
            <div className="bg-slate-900 rounded-3xl p-6 text-slate-400 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} />
                <span className="text-xs font-black uppercase tracking-wider">Datas do Registro</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Criação</p>
                  <p className="text-xs font-medium text-slate-200">{acidente.dataCriacao ? new Date(acidente.dataCriacao).toLocaleString('pt-BR') : 'Não disponível'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Última Atualização</p>
                  <p className="text-xs font-medium text-slate-200">{acidente.dataAtualizacao ? new Date(acidente.dataAtualizacao).toLocaleString('pt-BR') : 'Não disponível'}</p>
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
