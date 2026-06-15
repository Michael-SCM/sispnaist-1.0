import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { informacaoService, ITrabalhadorInformacao } from '../../../services/informacaoService.js';
import { uploadService } from '../../../services/uploadService.js';
import { trabalhadorService } from '../../../services/trabalhadorService.js';
import { ITrabalhador } from '../../../types/index.js';
import {
  Plus, Edit, Trash2, ArrowLeft, Heart, Pill, AlertCircle, Wine, Cigarette,
  Zap, ClipboardList, Download, Loader2, Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';

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
          /* Estado vazio - botão centralizado */
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
          /* Detalhamento completo */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-amber-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Histórico e Informações de Saúde</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/trabalhadores/${id}/informacoes/${info._id}/editar`)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl transition-all active:scale-95 text-sm"
                >
                  <Edit size={16} />
                  Editar Informações
                </button>
                <button
                  onClick={() => handleDeletar(info._id!)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all active:scale-95 text-sm"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Tipo Sanguíneo</span>
                  <span className="font-semibold text-slate-700 block text-lg">{info.tipoSanguineo || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Medicamentos de Uso Contínuo</span>
                  <span className="font-semibold text-slate-700 block text-lg">{info.medicamentos || 'Nenhum informado'}</span>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4">Alergias e Acompanhamento Médico</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Possui Alergias?</span>
                    <span className="font-semibold text-slate-700 block">{info.allergy ? 'Sim' : 'Não'}</span>
                  </div>
                  {info.allergy && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Descrição das Alergias</span>
                      <span className="font-semibold text-slate-700 block">{info.alergiasDescricao || 'Não descritas'}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Acompanhamento Médico?</span>
                    <span className="font-semibold text-slate-700 block">{info.acompanhamentoMedico ? 'Sim' : 'Não'}</span>
                  </div>
                  {info.acompanhamentoMedico && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Motivo do Acompanhamento</span>
                      <span className="font-semibold text-slate-700 block">{info.acompanhamentoMedicoMotivo || 'Não informado'}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Programa de Reabilitação?</span>
                  <span className="font-semibold text-slate-700 block">{info.acompanhamentoReabilitacao ? 'Sim' : 'Não'}</span>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4">Hábitos e Estilo de Vida</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Consumo de Álcool</span>
                    <span className="font-semibold text-slate-700 block">
                      {info.usoAlcool ? `Sim (${info.dosesAlcool} doses/semana)` : 'Não'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Uso de Cigarro / Tabaco</span>
                    <span className="font-semibold text-slate-700 block">
                      {info.usoCigarro ? `Sim (${info.macosCigarro} maços/dia)` : 'Não'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Uso de Outras Substâncias</span>
                    <span className="font-semibold text-slate-700 block">{info.usoOutraDroga ? 'Sim' : 'Não'}</span>
                  </div>
                  {info.usoOutraDroga && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Descrição das Substâncias</span>
                      <span className="font-semibold text-slate-700 block">{info.outraDrogaDescricao || 'Não informada'}</span>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4">Exames</h3>
                {info.exames ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Exames Realizados</span>
                      <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                        {info.exames.realizados || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Resultados</span>
                      <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                        {info.exames.resultados || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Periodicidade</span>
                      <span className="font-semibold text-slate-700 block mt-1">{info.exames.periodicidade || 'Não informada'}</span>
                    </div>
                    {(info.exames.anexos?.length ?? 0) > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Anexos</span>
                        <ul className="mt-2 space-y-2">
                          {info.exames.anexos.map((uploadId) => (
                            <li key={uploadId}>
                              <button
                                onClick={() => uploadService.download(uploadId)}
                                className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-medium"
                              >
                                <Download size={14} />
                                {uploadId}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 text-sm">Nenhum exame registrado</span>
                )}
              </div>

              <hr className="border-slate-100" />

              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Observações Gerais</span>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100/50 mt-1 whitespace-pre-line text-sm">
                  {info.observacoes || 'Nenhuma observação complementar registrada'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ListaInformacoes;
