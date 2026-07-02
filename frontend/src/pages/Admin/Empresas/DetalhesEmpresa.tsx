import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { DocumentTitle } from '../../../hooks/useDocumentTitle.js';
import empresaService from '../../../services/empresaService.js';
import { IEmpresa } from '../../../types/index.js';
import {
  Building2,
  ArrowLeft,
  Edit,
  MapPin,
  Mail,
  Phone,
  Info,
  Fingerprint,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

export const DetalhesEmpresa: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<IEmpresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await empresaService.obter(id);
        setEmpresa(data.data?.empresa || data);
      } catch (error) {
        navigate('/admin/empresas');
      } finally {
        setIsLoading(false);
      }
    };
    carregar();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <DocumentTitle title="Detalhes da Empresa" />
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando detalhes da empresa...</p>
        </div>
      </MainLayout>
    );
  }

  if (!empresa) return null;

  return (
    <MainLayout>
      <DocumentTitle title={`Detalhes - ${empresa.razaoSocial}`} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/empresas')}
              className="p-3 hover:bg-blue-50 rounded-2xl transition-all text-blue-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{empresa.razaoSocial}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${empresa.ativa ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {empresa.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <Fingerprint size={14} />
                <span className="font-mono">{empresa.cnpj}</span>
              </p>
            </div>
          </div>
          <Link
            to={`/admin/empresas/editar/${empresa._id}`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Edit size={20} />
            Editar Empresa
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados da Empresa</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Razão Social</span>
                  <p className="font-bold text-slate-700 text-lg">{empresa.razaoSocial}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Fantasia</span>
                  <p className="font-bold text-slate-700">{empresa.nomeFantasia || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">CNPJ</span>
                  <p className="font-bold text-slate-700 font-mono">{empresa.cnpj}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone</span>
                  <p className="font-bold text-slate-700">{empresa.telefone || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Localização</h2>
              </div>
              <div className="p-8">
                {empresa.endereco ? (
                  <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-700">
                        {empresa.endereco.logradouro}, {empresa.endereco.numero}
                      </p>
                      {empresa.endereco.complemento && (
                        <p className="text-slate-500 font-medium">{empresa.endereco.complemento}</p>
                      )}
                      <p className="text-slate-500 font-medium">
                        {empresa.endereco.bairro} &bull; {empresa.endereco.cidade} - {empresa.endereco.estado}
                      </p>
                      <p className="mt-2 text-xs font-black uppercase tracking-widest text-blue-600">CEP: {empresa.endereco.cep || '-'}</p>
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
                <Info size={20} className="text-blue-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Contato</h2>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-slate-400">E-mail</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{empresa.email || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Telefone</p>
                    <p className="text-sm font-bold text-slate-700">{empresa.telefone || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Status</h2>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3">
                  {empresa.ativa ? (
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  ) : (
                    <XCircle size={24} className="text-slate-400" />
                  )}
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${empresa.ativa ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {empresa.ativa ? 'Ativa' : 'Inativa'}
                  </span>
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
                  <p className="text-xs font-medium text-slate-200">{empresa.dataCriacao ? new Date(empresa.dataCriacao).toLocaleString('pt-BR') : 'Não disponível'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Última Atualização</p>
                  <p className="text-xs font-medium text-slate-200">{empresa.dataAtualizacao ? new Date(empresa.dataAtualizacao).toLocaleString('pt-BR') : 'Não disponível'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesEmpresa;
