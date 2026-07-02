import React from 'react';
import { Award, Download, Calendar, User, Hash, ExternalLink } from 'lucide-react';
import { ICertificado } from '../types';

interface CertificadoCardProps {
  certificado: ICertificado;
  onVisualizar: (certificado: ICertificado) => void;
}

export const CertificadoCard: React.FC<CertificadoCardProps> = React.memo(({ certificado, onVisualizar }) => {
  const dataEmissao = certificado.dataEmissao
    ? new Date(certificado.dataEmissao).toLocaleDateString('pt-BR')
    : '-';

  return (
    <div
      onClick={() => onVisualizar(certificado)}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 group cursor-pointer"
    >
      {/* Certificate Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
            <Award size={32} className="text-white" />
          </div>
          <div className="text-white">
            <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Certificado</p>
            <h3 className="font-bold text-lg leading-tight mt-0.5 line-clamp-2">{certificado.tituloTreinamento}</h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User size={14} className="text-amber-500 shrink-0" />
            <span className="font-medium truncate">{certificado.nomeUsuario}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={14} className="text-amber-500 shrink-0" />
            <span>Emitido em {dataEmissao}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Hash size={14} className="text-amber-500 shrink-0" />
            <span className="font-mono text-xs">{certificado.codigoCertificado}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Award size={14} className="text-emerald-500" />
            <span>{certificado.pontuacaoQuiz}%</span>
          </div>
          {certificado.categoriaTreinamento && (
            <div className="ml-auto px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
              {certificado.categoriaTreinamento}
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl">
          <div className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-lg">
            <ExternalLink size={18} />
            Visualizar Certificado
          </div>
        </div>
      </div>
    </div>
  );
});
