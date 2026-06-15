import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { informacaoService, ITrabalhadorInformacao } from '../../../services/informacaoService.js';
import { uploadService } from '../../../services/uploadService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhador } from '../../../types/index.js';
import {
  Plus, Edit, Trash2, ArrowLeft, Heart, Pill, AlertCircle, Wine, Cigarette,
  Zap, ClipboardList, Download, Loader2, Stethoscope, FileText,
  Droplet, Activity, Calendar, Eye, FileUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const InfoCard = ({ label, value, icon: Icon, color }: { label: string; value?: string | number | null; icon: any; color: string }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
    <div className={`p-2 ${color} bg-white rounded-xl shadow-sm`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value ?? '-'}</p>
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
    <Icon size={20} className="text-amber-600" />
    <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">{title}</h2>
  </div>
);

export const ListaInformacoes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [informacoes, setInformacoes] = useState<ITrabalhadorInformacao[]>([]);
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [t, info] = await Promise.all([
        trabalhadorService.obterPorId(id!),
        informacaoService.listarPorTrabalhador(id!),
      ]);
      setTrabalhador(t);
      setInformacoes(info);
    } catch (error) {
      toast.error('Erro ao carregar informações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletar = async (infoId: string) => {
    if (confirm('Tem certeza que deseja excluir estas informações?')) {
      try {
        await informacaoService.deletar(id!, infoId);
        setInformacoes([]);
        toast.success('Informações removidas com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover informações');
      }
    }
  };

  const info = informacoes[0];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-amber-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando informações...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/trabalhadores/${id}`)}
            className="p-3 hover:bg-amber-50 rounded-2xl transition-all text-amber-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Informações Históricas</h1>
            {trabalhador && (
              <p className="text-slate-500 font-medium">
                Trabalhador: <span className="text-slate-900 font-bold">{trabalhador.nome}</span>
              </p>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        {!info ? (
          /* Estado vazio */
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-xl p-16 space-y-6">
            <div className="p-5 bg-amber-50 rounded-full">
              <Stethoscope size={48} className="text-amber-600" />
            </div>
            <p className="text-lg font-medium text-slate-500">Nenhuma informação cadastrada ainda</p>
            <button
              onClick={() => navigate(`/trabalhadores/${id}/informacoes/novo`)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-100 active:scale-95 text-lg"
            >
              <Plus size={24} />
              Novas Informações
            </button>
          </div>
        ) : (
          /* Detalhamento completo - estilo DetalhesTrabalhador */
          <div className="space-y-6">
            {/* Dados de Saúde */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <SectionHeader icon={Heart} title="Dados de Saúde" />
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Tipo Sanguíneo" value={info.tipoSanguineo} icon={Droplet} color="text-red-500" />
                <InfoCard label="Medicamentos" value={info.medicamentos} icon={Pill} color="text-purple-500" />
              </div>
            </div>

            {/* Alergias e Acompanhamentos */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <SectionHeader icon={AlertCircle} title="Alergias e Acompanhamentos" />
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Possui Alergias?" value={info.allergy ? 'Sim' : 'Não'} icon={AlertCircle} color="text-red-500" />
                {info.allergy && <InfoCard label="Descrição das Alergias" value={info.descricaoAlergia} icon={AlertCircle} color="text-orange-500" />}
                <InfoCard label="Acompanhamento Médico?" value={info.acompanhamentoMedico ? 'Sim' : 'Não'} icon={Heart} color="text-blue-500" />
                {info.acompanhamentoMedico && <InfoCard label="Motivo do Acompanhamento" value={info.acompanhamentoMedicoMotivo} icon={Heart} color="text-indigo-500" />}
                <InfoCard label="Programa de Reabilitação?" value={info.acompanhamentoReabilitacao ? 'Sim' : 'Não'} icon={Activity} color="text-green-500" />
              </div>
            </div>

            {/* Hábitos e Estilo de Vida */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <SectionHeader icon={Wine} title="Hábitos e Estilo de Vida" />
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Consumo de Álcool" value={info.usoAlcool ? `Sim (${info.dosesAlcool} doses/dia)` : 'Não'} icon={Wine} color="text-yellow-500" />
                <InfoCard label="Uso de Cigarro" value={info.usoCigarro ? `Sim (${info.macosCigarro} maços/dia)` : 'Não'} icon={Cigarette} color="text-orange-500" />
                <InfoCard label="Uso de Outras Substâncias" value={info.usoOutraDroga ? 'Sim' : 'Não'} icon={Zap} color="text-purple-500" />
                {info.usoOutraDroga && <InfoCard label="Descrição das Substâncias" value={info.outraDrogaDescricao} icon={Zap} color="text-violet-500" />}
              </div>
            </div>

            {/* Exames */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <SectionHeader icon={ClipboardList} title="Exames" />
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard label="Exames Realizados" value={info.exames?.realizados || 'Não informado'} icon={ClipboardList} color="text-teal-500" />
                  <InfoCard label="Resultados" value={info.exames?.resultados || 'Não informado'} icon={Eye} color="text-cyan-500" />
                  <InfoCard label="Periodicidade" value={info.exames?.periodicidade} icon={Calendar} color="text-teal-500" />
                </div>
                {(info.exames?.anexos?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Anexos</p>
                    <div className="flex flex-wrap gap-2">
                      {info.exames.anexos.map((uploadId) => (
                        <button
                          key={uploadId}
                          onClick={() => uploadService.download(uploadId)}
                          className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl border border-teal-200 transition-all text-sm font-medium"
                        >
                          <FileUp size={14} />
                          <span className="truncate max-w-[200px]">{uploadId}</span>
                          <Download size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <SectionHeader icon={FileText} title="Observações" />
              <div className="p-8">
                <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-600">
                    <FileText size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-700 whitespace-pre-line">
                    {info.observacoes || 'Nenhuma observação complementar registrada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => navigate(`/trabalhadores/${id}/informacoes/${info._id}/editar`)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-100 active:scale-95"
              >
                <Edit size={20} />
                Editar Informações
              </button>
              <button
                onClick={() => handleDeletar(info._id!)}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all active:scale-95"
              >
                <Trash2 size={20} />
                Excluir
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ListaInformacoes;
