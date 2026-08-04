import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.js';
import { useAuthStore } from '../store/authStore.js';
import { authService } from '../services/authService.js';
import {
  Loader2, Download, Trash2, CheckCircle, AlertTriangle, User,
  ShieldCheck, KeyRound, Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DocumentTitle } from '../hooks/useDocumentTitle.js';

const PERFIS_COM_2FA_OBRIGATORIO = ['admin', 'gestor'];

export const MinhaConta: React.FC = () => {
  const { user, clearAuth, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Troca de senha
  const [pw, setPw] = useState({ senhaAtual: '', novaSenha: '', confirmarSenha: '', codigo: '' });
  const [isSendingPwCode, setIsSendingPwCode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA
  const doisFatores = user?.doisFatoresHabilitado === true;
  const perfilObrigatorio = PERFIS_COM_2FA_OBRIGATORIO.includes(user?.perfil || '');
  const [acao2FA, setAcao2FA] = useState<'enable' | 'disable' | null>(null);
  const [codigo2FA, setCodigo2FA] = useState('');
  const [senhaAtualDisable, setSenhaAtualDisable] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);

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

  const handleSendPasswordCode = async () => {
    setIsSendingPwCode(true);
    try {
      const msg = await authService.habilitar2FA();
      toast.success(msg);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao enviar o código de confirmação.');
    } finally {
      setIsSendingPwCode(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.novaSenha !== pw.confirmarSenha) {
      toast.error('As senhas não conferem.');
      return;
    }
    if (pw.novaSenha.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!/^\d{6}$/.test(pw.codigo)) {
      toast.error('Informe o código de confirmação de 6 dígitos enviado por e-mail.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const msg = await authService.changePassword(pw.senhaAtual, pw.novaSenha, pw.confirmarSenha, pw.codigo);
      toast.success(msg);
      clearAuth();
      setPw({ senhaAtual: '', novaSenha: '', confirmarSenha: '', codigo: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar a senha.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    setIs2FALoading(true);
    try {
      const msg = await authService.habilitar2FA();
      setAcao2FA('enable');
      setCodigo2FA('');
      toast.success(msg);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao solicitar a habilitação da autenticação de dois fatores.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleStartDisable2FA = () => {
    setAcao2FA('disable');
    setCodigo2FA('');
    setSenhaAtualDisable('');
  };

  const handleConfirm2FA = async () => {
    if (!/^\d{6}$/.test(codigo2FA)) {
      toast.error('Informe o código de 6 dígitos enviado por e-mail.');
      return;
    }

    setIs2FALoading(true);
    try {
      if (acao2FA === 'enable') {
        const msg = await authService.confirmar2FA(codigo2FA);
        if (user) setUser({ ...user, doisFatoresHabilitado: true });
        toast.success(msg);
      } else {
        if (!senhaAtualDisable) {
          toast.error('Informe sua senha atual.');
          setIs2FALoading(false);
          return;
        }
        const msg = await authService.desabilitar2FA(senhaAtualDisable, codigo2FA);
        if (user) setUser({ ...user, doisFatoresHabilitado: false });
        toast.success(msg);
      }
      setAcao2FA(null);
      setCodigo2FA('');
      setSenhaAtualDisable('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao confirmar a operação.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleCancel2FA = () => {
    setAcao2FA(null);
    setCodigo2FA('');
    setSenhaAtualDisable('');
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

        {/* Segurança e Senha */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-600" />
            <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Segurança e Senha</h2>
          </div>
          <div className="p-8 space-y-6">
            {/* Autenticação de dois fatores */}
            <div className="rounded-2xl border border-slate-100 p-5 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Autenticação de dois fatores (e-mail)</p>
                    <p className="text-xs text-slate-500">
                      Ao ativar, você precisará de um código enviado por e-mail para concluir o login.
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${doisFatores ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {doisFatores ? 'Ativado' : 'Desativado'}
                </span>
              </div>

              {perfilObrigatorio ? (
                <p className="text-xs text-slate-500 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  A autenticação de dois fatores é obrigatória para o seu perfil e permanece ativada no login.
                </p>
              ) : (
                <div className="space-y-3">
                  {!doisFatores && !acao2FA && (
                    <button
                      onClick={handleEnable2FA}
                      disabled={is2FALoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      {is2FALoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                      Ativar autenticação de dois fatores
                    </button>
                  )}

                  {doisFatores && !acao2FA && (
                    <button
                      onClick={handleStartDisable2FA}
                      disabled={is2FALoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                      Desativar autenticação de dois fatores
                    </button>
                  )}

                  {acao2FA && (
                    <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-700">
                        {acao2FA === 'enable' ? 'Confirmar ativação' : 'Confirmar desativação'}
                      </p>
                      {acao2FA === 'disable' && (
                        <input
                          type="password"
                          value={senhaAtualDisable}
                          onChange={(e) => setSenhaAtualDisable(e.target.value)}
                          placeholder="Senha atual"
                          className="input"
                          aria-label="Senha atual"
                        />
                      )}
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={codigo2FA}
                        onChange={(e) => setCodigo2FA(e.target.value.replace(/\D/g, ''))}
                        placeholder="Código de 6 dígitos enviado por e-mail"
                        className="input"
                        aria-label="Código de confirmação"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleConfirm2FA}
                          disabled={is2FALoading}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                          {is2FALoading && <Loader2 size={18} className="animate-spin" />}
                          Confirmar
                        </button>
                        <button
                          onClick={handleCancel2FA}
                          disabled={is2FALoading}
                          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Troca de senha */}
            <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-100 p-5 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                  <KeyRound size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Alterar senha</p>
                  <p className="text-xs text-slate-500">
                    Para alterar sua senha, primeiro receba um código de confirmação por e-mail.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSendPasswordCode}
                  disabled={isSendingPwCode}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                >
                  {isSendingPwCode ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  {isSendingPwCode ? 'Enviando...' : 'Enviar código por e-mail'}
                </button>
              </div>

              <input
                type="password"
                placeholder="Senha atual"
                value={pw.senhaAtual}
                onChange={(e) => setPw({ ...pw, senhaAtual: e.target.value })}
                className="input"
                aria-label="Senha atual"
                autoComplete="current-password"
                required
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={pw.novaSenha}
                onChange={(e) => setPw({ ...pw, novaSenha: e.target.value })}
                className="input"
                aria-label="Nova senha"
                autoComplete="new-password"
                required
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={pw.confirmarSenha}
                onChange={(e) => setPw({ ...pw, confirmarSenha: e.target.value })}
                className="input"
                aria-label="Confirmar nova senha"
                autoComplete="new-password"
                required
              />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Código de confirmação (enviado por e-mail)"
                value={pw.codigo}
                onChange={(e) => setPw({ ...pw, codigo: e.target.value.replace(/\D/g, '') })}
                className="input"
                aria-label="Código de confirmação"
                required
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isChangingPassword ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                  {isChangingPassword ? 'Salvando...' : 'Alterar senha'}
                </button>
              </div>
            </form>
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