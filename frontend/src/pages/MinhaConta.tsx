import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.js';
import { useAuthStore } from '../store/authStore.js';
import { authService } from '../services/authService.js';
import { Loader2, Download, Trash2, CheckCircle, AlertTriangle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { DocumentTitle } from '../hooks/useDocumentTitle.js';

export const MinhaConta: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await authService.exportDataPDF();
      toast.success('Dados exportados com sucesso!');
    } catch {
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const msg = await authService.deleteAccount();
      toast.success(msg);
      clearAuth();
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      toast.error('Erro ao solicitar exclusão');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <MainLayout>
      <DocumentTitle title="Minha Conta" />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Minha Conta</h1>
            <p className="text-slate-500 font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Consentimento LGPD</h2>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-slate-700">Consentimento para tratamento de dados</p>
                <p className="text-xs text-slate-500">
                  {user?.consentimentoLGPD
                    ? `Aceito em ${user.dataAceiteLGPD ? new Date(user.dataAceiteLGPD).toLocaleDateString('pt-BR') : '-'} (v${user.versaoTermo || '1.0'})`
                    : 'Não registrado'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${user?.consentimentoLGPD ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {user?.consentimentoLGPD ? 'Ativo' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <Download size={20} className="text-blue-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Exportar Dados</h2>
          </div>
          <div className="p-8">
            <p className="text-sm text-slate-600 mb-4">
              Baixe todos os seus dados cadastrais em formato PDF. Este arquivo contém todas as informações que o sistema possui sobre você.
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
              {isExporting ? 'Exportando...' : 'Exportar meus dados'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-red-100 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-red-50/50 border-b border-red-100 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Excluir Conta</h2>
          </div>
          <div className="p-8">
            <p className="text-sm text-slate-600 mb-4">
              Solicite a anonimização dos seus dados. Seus dados cadastrais serão removidos permanentemente. Esta ação não pode ser desfeita.
            </p>
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
              >
                <Trash2 size={20} />
                Solicitar exclusão de conta
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-red-50 rounded-2xl border border-red-200">
                <p className="text-sm font-bold text-red-700">Tem certeza? Esta ação irá anonimizar todos os seus dados.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 size={20} className="animate-spin" /> : null}
                    {isDeleting ? 'Processando...' : 'Confirmar exclusão'}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
