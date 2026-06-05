import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { materialBiologicoService } from '../../../services/materialBiologicoService.js';
import { IMaterialBiologico, IAcidentePopulated } from '../../../types/index.js';
import {
  Dna, ArrowLeft, Edit, Trash2, Shield, Activity, Calendar,
  AlertTriangle, Stethoscope, User, Clock, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const VisualizarMaterialBiologico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ficha, setFicha] = useState<IMaterialBiologico | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      try {
        const data = await materialBiologicoService.obter(id);
        setFicha(data);
      } catch (error) {
        toast.error('Erro ao carregar ficha técnica');
        navigate('/acidentes/material-biologico');
      } finally {
        setIsLoading(false);
      }
    };
    carregar();
  }, [id]);

  const handleDeletar = async () => {
    if (!window.confirm('Tem certeza que deseja deletar esta ficha técnica?')) return;
    try {
      await materialBiologicoService.deletar(id!);
      toast.success('Ficha técnica deletada com sucesso');
      navigate('/acidentes/material-biologico');
    } catch (error) {
      toast.error('Erro ao deletar ficha técnica');
    }
  };

  const getAcidente = (): IAcidentePopulated | null => {
    if (!ficha?.acidenteId || typeof ficha.acidenteId === 'string') return null;
    return ficha.acidenteId;
  };

  const getTrabalhadorNome = (): string => {
    const ac = getAcidente();
    if (!ac?.trabalhadorId) return 'N/A';
    if (typeof ac.trabalhadorId === 'object' && ac.trabalhadorId?.nome) return ac.trabalhadorId.nome;
    return 'N/A';
  };

  const getTrabalhadorId = (): string | null => {
    const ac = getAcidente();
    if (!ac?.trabalhadorId) return null;
    if (typeof ac.trabalhadorId === 'object' && ac.trabalhadorId?._id) return ac.trabalhadorId._id;
    return null;
  };

  const getAcidenteId = (): string | null => {
    const ac = getAcidente();
    return ac?._id || null;
  };

  const formatDate = (date: string | undefined | null): string => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-100 rounded-2xl w-1/3" />
            <div className="h-64 bg-slate-100 rounded-3xl" />
            <div className="h-48 bg-slate-100 rounded-3xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!ficha) return null;

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const ac = getAcidente();
                if (ac?._id) navigate(`/acidentes/${ac._id}`);
                else navigate('/acidentes/material-biologico');
              }}
              className="p-3 hover:bg-emerald-50 rounded-2xl transition-all text-emerald-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ficha Técnica</h1>
              <p className="text-slate-500 font-medium">Detalhes da exposição biológica</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/acidentes/material-biologico/${id}/editar`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Edit size={18} />
              Editar
            </button>
            <button
              onClick={handleDeletar}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all active:scale-95"
            >
              <Trash2 size={18} />
              Excluir
            </button>
          </div>
        </div>

        {/* Worker Info Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2">
            <User size={20} className="text-emerald-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Trabalhador</h2>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                <User size={28} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{getTrabalhadorNome()}</p>
                {getTrabalhadorId() && (
                  <Link
                    to={`/trabalhadores/${getTrabalhadorId()}`}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline"
                  >
                    Ver perfil completo →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Acidente Info Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2">
            <AlertTriangle size={20} className="text-emerald-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Acidente de Origem</h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Data do Acidente</p>
                <p className="text-lg font-bold text-slate-700">{formatDate(getAcidente()?.dataAcidente)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tipo</p>
                <p className="text-lg font-bold text-slate-700">{getAcidente()?.tipoAcidente || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Descrição</p>
                <p className="text-slate-600">{getAcidente()?.descricao || 'N/A'}</p>
              </div>
            </div>
            {getAcidenteId() && (
              <Link
                to={`/acidentes/${getAcidenteId()}`}
                className="inline-flex items-center gap-1 mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium underline"
              >
                Ver detalhes do acidente →
              </Link>
            )}
          </div>
        </div>

        {/* Exposicao Data Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2">
            <Shield size={20} className="text-emerald-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados da Exposição</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tipo de Exposição</p>
              <p className="text-lg font-bold text-slate-700">{ficha.tipoExposicao || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Material Orgânico</p>
              <p className="text-lg font-bold text-slate-700">{ficha.materialOrganico || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Agente Causador</p>
              <p className="text-lg font-bold text-slate-700">{ficha.agente || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Circunstância</p>
              <p className="text-lg font-bold text-slate-700">{ficha.circunstanciaAcidente || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">EPI</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${ficha.usoEPI ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {ficha.usoEPI ? 'Sim' : 'Não'}
              </span>
            </div>
          </div>
        </div>

        {/* Sorologia Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2">
            <Activity size={20} className="text-emerald-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Sorologia e Conduta</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Sorologia Paciente</p>
              <p className="text-lg font-bold text-slate-700">{ficha.sorologiaPaciente || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Sorologia Acidentado</p>
              <p className="text-lg font-bold text-slate-700">{ficha.sorologiaAcidentado || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Conduta</p>
              <p className="text-lg font-bold text-slate-700">{ficha.conduta || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Evolução do Caso</p>
              <p className="text-lg font-bold text-slate-700">{ficha.evolucaoCaso || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Acompanhamento Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2">
            <Stethoscope size={20} className="text-emerald-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Acompanhamento</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Acompanhamento PrEP</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${ficha.acompanhamentoPrEP ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {ficha.acompanhamentoPrEP ? 'Sim' : 'Não'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Data de Reavaliação</p>
              <p className="text-lg font-bold text-slate-700">{formatDate(ficha.dataReavaliacao)}</p>
            </div>
            {ficha.acompanhamentoPrEP && ficha.descAcompanhamentoPrEP && (
              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Descrição PrEP</p>
                <p className="text-slate-600">{ficha.descAcompanhamentoPrEP}</p>
              </div>
            )}
            <div className={ficha.acompanhamentoPrEP && ficha.descAcompanhamentoPrEP ? '' : 'md:col-span-2'}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Efeito Colateral Permanente</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${ficha.efeitoColateralPermanente ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                {ficha.efeitoColateralPermanente ? 'Sim' : 'Não'}
              </span>
            </div>
            {ficha.efeitoColateralPermanente && ficha.descEfeitoColateralPermanente && (
              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Descrição do Efeito Colateral</p>
                <p className="text-slate-600">{ficha.descEfeitoColateralPermanente}</p>
              </div>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            Criado em: {formatDate(ficha.dataCriacao)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            Atualizado em: {formatDate(ficha.dataAtualizacao)}
          </span>
        </div>
      </div>
    </MainLayout>
  );
};
