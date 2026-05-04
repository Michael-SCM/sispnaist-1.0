import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useTrabalhadorStore } from '../../store/trabalhadorStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import { ITrabalhador } from '../../types/index.js';
import { 
  Users, 
  ArrowLeft, 
  Edit, 
  User, 
  MapPin, 
  Briefcase, 
  Info,
  Mail,
  Fingerprint,
  Building,
  Calendar,
  CheckCircle2,
  Heart,
  Loader2,
  Phone,
  GraduationCap,
  Scale,
  Users2,
  Stethoscope,
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DetalhesTrabalhador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentTrabalhador } = useTrabalhadorStore();
  const [trabalhador, setTrabalhador] = useState<ITrabalhador | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarTrabalhador = async () => {
      if (!id) return;
      try {
        const t = await trabalhadorService.obterPorId(id);
        setTrabalhador(t);
        setCurrentTrabalhador(t);
      } catch (error) {
        toast.error('Erro ao carregar trabalhador');
        navigate('/trabalhadores');
      } finally {
        setIsLoading(false);
      }
    };
    carregarTrabalhador();
  }, [id, navigate, setCurrentTrabalhador]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Carregando detalhes do trabalhador...</p>
        </div>
      </MainLayout>
    );
  }

  if (!trabalhador) return null;

  const InfoCard = ({ label, value, icon: Icon, color }: { label: string, value?: string | number | null, icon: any, color: string }) => (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
      <div className={`p-2 ${color} bg-white rounded-xl shadow-sm`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/trabalhadores')}
              className="p-3 hover:bg-blue-50 rounded-2xl transition-all text-blue-600 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{trabalhador.nome}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  trabalhador.vinculo?.situacao === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {trabalhador.vinculo?.situacao || 'Desconhecido'}
                </span>
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <Fingerprint size={14} /> 
                <span className="font-mono">{trabalhador.cpf}</span>
              </p>
            </div>
          </div>
          <Link
            to={`/trabalhadores/${trabalhador._id}/editar`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Edit size={20} />
            Editar Funcionário
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Cadastrais */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados Cadastrais</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Nome da Mãe" value={trabalhador.nomeMae} icon={Users2} color="text-pink-500" />
                <InfoCard label="Nascimento" value={trabalhador.dataNascimento ? new Date(trabalhador.dataNascimento).toLocaleDateString('pt-BR') : '-'} icon={Calendar} color="text-blue-500" />
                <InfoCard label="Matrícula" value={trabalhador.matricula} icon={ClipboardList} color="text-amber-500" />
                <InfoCard label="Cartão SUS" value={trabalhador.cartaoSus} icon={Heart} color="text-rose-500" />
                <InfoCard label="Escolaridade" value={trabalhador.escolaridade} icon={GraduationCap} color="text-indigo-500" />
                <InfoCard label="Estado Civil" value={trabalhador.estadoCivil} icon={Scale} color="text-slate-500" />
              </div>
            </div>

            {/* Trabalho e Vínculo */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Trabalho & Vínculo</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Cargo" value={trabalhador.trabalho?.cargo} icon={Briefcase} color="text-blue-600" />
                <InfoCard label="Setor" value={trabalhador.trabalho?.setor} icon={Building} color="text-slate-600" />
                <InfoCard label="Data de Entrada" value={trabalhador.trabalho?.dataEntrada ? new Date(trabalhador.trabalho.dataEntrada).toLocaleDateString('pt-BR') : '-'} icon={Calendar} color="text-emerald-600" />
                <InfoCard label="Tipo de Vínculo" value={trabalhador.vinculo?.tipo} icon={ClipboardList} color="text-amber-600" />
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Localização</h2>
              </div>
              <div className="p-8">
                <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-700">
                      {trabalhador.endereco?.logradouro}, {trabalhador.endereco?.numero}
                    </p>
                    <p className="text-slate-500 font-medium">
                      {trabalhador.endereco?.bairro} • {trabalhador.endereco?.cidade} - {trabalhador.endereco?.estado}
                    </p>
                    <p className="mt-2 text-xs font-black uppercase tracking-widest text-blue-600">CEP: {trabalhador.endereco?.cep || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contatos */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Contatos</h2>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-slate-400">Email</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{trabalhador.email || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Celular</p>
                    <p className="text-sm font-bold text-slate-700">{trabalhador.celular || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submódulos Navigation */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl shadow-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList size={18} className="text-blue-400" />
                <span className="text-xs font-black uppercase tracking-wider">Gestão Relacionada</span>
              </div>
              
              <div className="space-y-2">
                {[
                  { label: 'Afastamentos', icon: Stethoscope, path: 'afastamentos', color: 'text-amber-400' },
                  { label: 'Dependentes', icon: Users2, path: 'dependentes', color: 'text-rose-400' },
                  { label: 'Vínculos', icon: ClipboardList, path: 'vinculos', color: 'text-blue-400' }
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={`/trabalhadores/${trabalhador._id}/${item.path}`}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={item.color} />
                      <span className="font-bold text-slate-200">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Health Info Quick View */}
            <div className="bg-rose-600 rounded-3xl p-8 text-white shadow-xl shadow-rose-100">
              <div className="flex items-center gap-3 mb-4">
                <Heart size={24} className="fill-white" />
                <h3 className="font-black uppercase text-xs tracking-widest">Informações de Saúde</h3>
              </div>
              <p className="text-xs text-rose-100 font-medium mb-1">Tipo Sanguíneo</p>
              <p className="text-4xl font-black">{trabalhador.tipoSanguineo || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesTrabalhador;
