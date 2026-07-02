import React, { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout.js';
import { DocumentTitle } from '../hooks/useDocumentTitle.js';
import { treinamentoService } from '../services/treinamentoService.js';
import { ICertificado } from '../types/index.js';
import { CertificadoCard } from '../components/CertificadoCard.js';
import { Award, ExternalLink, X, FileText, Download, Hash, User, Calendar, Target, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const MeusCertificados: React.FC = () => {
  const [certificados, setCertificados] = useState<ICertificado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [certificadoSelecionado, setCertificadoSelecionado] = useState<ICertificado | null>(null);
  const [baixandoPDF, setBaixandoPDF] = useState(false);

  useEffect(() => {
    carregarCertificados();
  }, []);

  const carregarCertificados = async () => {
    try {
      setIsLoading(true);
      const data = await treinamentoService.listarCertificados();
      setCertificados(data);
    } catch (error) {
      toast.error('Erro ao carregar certificados');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisualizar = (certificado: ICertificado) => {
    setCertificadoSelecionado(certificado);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!certificadoSelecionado?._id) return;
    try {
      setBaixandoPDF(true);
      await treinamentoService.downloadCertificadoPdf(certificadoSelecionado._id);
      toast.success('Certificado baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar certificado');
    } finally {
      setBaixandoPDF(false);
    }
  };

  return (
    <MainLayout>
      <DocumentTitle title="Meus Certificados" />
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-600 to-orange-700 p-8 rounded-3xl shadow-xl text-white">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
              <Award size={36} className="text-amber-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Meus Certificados</h1>
              <p className="text-amber-200 font-medium opacity-90">
                {certificados.length} certificado{certificados.length !== 1 ? 's' : ''} emitido{certificados.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl p-4 shadow-sm border border-slate-100 h-64">
                <div className="w-full h-24 bg-slate-100 rounded-2xl mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : certificados.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
            <Award className="mx-auto h-16 w-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhum certificado ainda</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Complete as videoaulas e seja aprovado nos quizzes para emitir seus certificados de capacitação.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificados.map((certificado) => (
              <CertificadoCard
                key={certificado._id}
                certificado={certificado}
                onVisualizar={handleVisualizar}
              />
            ))}
          </div>
        )}

        {/* Certificate Detail Modal */}
        {certificadoSelecionado && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-8 md:pt-12 overflow-y-auto print:bg-white print:backdrop-blur-none print:!p-0 print:!m-0 print:!items-center print:!overflow-visible"
            onClick={() => setCertificadoSelecionado(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Detalhes do certificado"
          >
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-300 print:shadow-none print:rounded-none print:max-w-full print:my-0 print:border-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Certificate Visual */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-10 border-4 border-amber-200 m-3 md:m-5 rounded-2xl print:border-2 print:m-0 print:rounded-none print:p-8 print:min-h-[90vh] print:flex print:items-center">
                <div className="text-center space-y-3 md:space-y-4 print:space-y-5 w-full">
                  <Award size={48} className="mx-auto text-amber-500 print:hidden" />
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800">Certificado</h2>
                  <p className="text-slate-500 font-medium">de Capacitação e Treinamento</p>

                  <div className="w-20 h-0.5 bg-amber-400 mx-auto rounded-full" />

                  <p className="text-base md:text-lg font-bold text-slate-700">Conferimos a</p>
                  <p className="text-xl md:text-2xl font-black text-slate-900 break-words">{certificadoSelecionado.nomeUsuario}</p>
                  <p className="text-slate-500">CPF: {certificadoSelecionado.cpfUsuario}</p>

                  <div className="w-20 h-0.5 bg-amber-400 mx-auto rounded-full" />

                  <p className="text-slate-600">por ter concluído o treinamento</p>
                  <p className="text-lg md:text-xl font-black text-amber-700 break-words">{certificadoSelecionado.tituloTreinamento}</p>

                  {certificadoSelecionado.descricaoTreinamento && (
                    <p className="text-sm text-slate-500 italic break-words">"{certificadoSelecionado.descricaoTreinamento}"</p>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-slate-500 pt-4">
                    <div className="flex items-center gap-1.5">
                      <Target size={14} className="text-amber-500 shrink-0" />
                      <span>Pontuação: {certificadoSelecionado.pontuacaoQuiz}%</span>
                    </div>
                    {certificadoSelecionado.cargaHoraria && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-amber-500 shrink-0" />
                        <span>Duração: {certificadoSelecionado.cargaHoraria}</span>
                      </div>
                    )}
                  </div>

                  <div className="w-20 h-0.5 bg-amber-400 mx-auto rounded-full" />

                  <p className="text-xs text-slate-400">
                    Emitido em {new Date(certificadoSelecionado.dataEmissao).toLocaleDateString('pt-BR')}
                  </p>

                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400 pt-2">
                    <Hash size={12} />
                    <span className="break-all">Código: {certificadoSelecionado.codigoCertificado}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3 print:hidden">
                <button
                  onClick={() => setCertificadoSelecionado(null)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-slate-500 font-bold hover:bg-slate-200/50 rounded-xl transition-all"
                >
                  <X size={18} />
                  Fechar
                </button>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={baixandoPDF}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    {baixandoPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {baixandoPDF ? 'Baixando...' : 'Baixar PDF'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    <FileText size={18} />
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MeusCertificados;
