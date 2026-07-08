import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import unidadeService from '../../../services/unidadeService.js';
import empresaService from '../../../services/empresaService.js';
import { IUnidade, IEmpresa } from '../../../types/index.js';
import {
  Home,
  ArrowLeft,
  Edit,
  MapPin,
  Building2,
  Info,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  User
} from 'lucide-react';

export const DetalhesUnidade: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unidade, setUnidade] = useState<IUnidade | null>(null);
  const [empresa, setEmpresa] = useState<IEmpresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await unidadeService.obter(id);
        const u = data.data?.unidade || data;
        setUnidade(u);

        if (u.empresaId) {
          const empId = typeof u.empresaId === 'object' && u.empresaId !== null ? u.empresaId._id : u.empresaId;
          try {
            const empData = await empresaService.obter(empId);
            setEmpresa(empData.data?.empresa || empData);
          } catch {}
        }
      } catch (error) {
        navigate('/admin/unidades');
      } finally {
        setIsLoading(false);
      }
    };
    carregar();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <DocumentTitle title="Detalhes da Unidade" />
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando detalhes da unidade...</p>
        </div>
      </MainLayout>
    );
  }

  if (!unidade) return null;

  const empresaNome = empresa?.razaoSocial
    || (typeof unidade.empresaId === 'object' && unidade.empresaId !== null ? (unidade.empresaId as any).razaoSocial : null)
    || 'Não informada';

  return (
    <MainLayout>
      <DocumentTitle title={`Detalhes - ${unidade.nome}`} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/unidades')}
              className="p-3 hover:bg-indigo-50 rounded-2xl transition-all text-indigo-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{unidade.nome}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${unidade.ativa ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {unidade.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <Building2 size={14} />
                <span>{empresaNome}</span>
              </p>
            </div>
          </div>
          <Link
            to={`/admin/unidades/editar/${unidade._id}`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Edit size={20} />
            Editar Unidade
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Home size={20} className="text-indigo-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados da Unidade</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</span>
                  <p className="font-bold text-slate-700 text-lg">{unidade.nome}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Empresa</span>
                  <p className="font-bold text-slate-700">{empresaNome}</p>
                </div>
                {(unidade as any).gestor && (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gestor</span>
                    <p className="font-bold text-slate-700 flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      {(unidade as any).gestor}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <MapPin size={20} className="text-indigo-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Localização</h2>
              </div>
              <div className="p-8">
                {unidade.endereco ? (
                  <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-700">
                        {unidade.endereco.logradouro}, {unidade.endereco.numero}
                      </p>
                      {unidade.endereco.complemento && (
                        <p className="text-slate-500 font-medium">{unidade.endereco.complemento}</p>
                      )}
                      <p className="text-slate-500 font-medium">
                        {unidade.endereco.bairro} &bull; {unidade.endereco.cidade} - {unidade.endereco.estado}
                      </p>
                      <p className="mt-2 text-xs font-black uppercase tracking-widest text-indigo-600">CEP: {unidade.endereco.cep || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 font-medium text-center py-6">Endereço não cadastrado</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Info size={20} className="text-indigo-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Status</h2>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3">
                  {unidade.ativa ? (
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  ) : (
                    <XCircle size={24} className="text-slate-400" />
                  )}
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${unidade.ativa ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {unidade.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {unidade.possuiPgr ? (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={20} />
                      <span className="font-bold text-sm">Possui Programa de Gerenciamento de Riscos</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <XCircle size={20} />
                      <span className="font-bold text-sm">Não possui PGR</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Esfera Administrativa</span>
                  <p className="font-bold text-sm text-slate-700 mt-1 capitalize">
                    {{
                      municipal: 'Municipal (SUS)',
                      estadual: 'Estadual (SUS)',
                      federal: 'Federal (SUS)',
                      privado: 'Privado',
                      terceiro_setor: 'Terceiro Setor',
                    }[unidade.esferaAdministrativa || 'municipal'] || unidade.esferaAdministrativa}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-slate-400 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-white">
                <Calendar size={16} />
                <span className="text-xs font-black uppercase tracking-wider">Datas do Registro</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Criação</p>
                  <p className="text-xs font-medium text-slate-200">{unidade.dataCriacao ? new Date(unidade.dataCriacao).toLocaleString('pt-BR') : 'Não disponível'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Última Atualização</p>
                  <p className="text-xs font-medium text-slate-200">{unidade.dataAtualizacao ? new Date(unidade.dataAtualizacao).toLocaleString('pt-BR') : 'Não disponível'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesUnidade;
