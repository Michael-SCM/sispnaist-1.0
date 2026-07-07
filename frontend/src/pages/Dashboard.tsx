import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAnalyticsStore } from '../store/analyticsStore.js';
import { MainLayout } from '../layouts/MainLayout.js';
import { KPICard } from '../components/KPICard.js';
import { AlertaOrientacaoMobile } from '../components/AlertaOrientacaoMobile.js';
import { DocumentTitle } from '../hooks/useDocumentTitle.js';
import { format } from 'date-fns';
import { indicadorService } from '../services/indicadorService.js';
import type { IIndicador } from '../types/indicadores.js';

const AcidentesPorMes = lazy(() => import('../components/charts/AcidentesPorMes.js').then(m => ({ default: m.AcidentesPorMes })));
const PieChartComponent = lazy(() => import('../components/charts/PieChartComponent.js').then(m => ({ default: m.PieChartComponent })));
const BarChartComponent = lazy(() => import('../components/charts/BarChartComponent.js').then(m => ({ default: m.BarChartComponent })));

const ChartFallback = () => (
  <div className="flex items-center justify-center h-64 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const userPerfil = user?.perfil || 'trabalhador';

const {
    kpis,
    dashboardAdmin,
    dashboardTrabalhador,
    isLoading,
    carregarDadosAcidentes,
    carregarDashboardAdmin,
    carregarDashboardTrabalhador,
  } = useAnalyticsStore();

  const [customIndicadores, setCustomIndicadores] = useState<IIndicador[]>([]);
  const [loadingIndicadores, setLoadingIndicadores] = useState(false);

  useEffect(() => {
    if (userPerfil === 'admin' || userPerfil === 'gestor') {
      carregarDashboardAdmin();
      setLoadingIndicadores(true);
      indicadorService.calcularTodos()
        .then(res => setCustomIndicadores(res.data))
        .catch(() => {})
        .finally(() => setLoadingIndicadores(false));
    } else {
      carregarDashboardTrabalhador();
    }
  }, [userPerfil]);



  // Loading state
  if (isLoading && !kpis && !dashboardAdmin && !dashboardTrabalhador) {
    return (
      <MainLayout>
        <AlertaOrientacaoMobile />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Dashboard Admin/Gestor
  if ((userPerfil === 'admin' || userPerfil === 'gestor') && dashboardAdmin) {
    const { kpis, graficos, tabelas } = dashboardAdmin;

    return (
      <MainLayout>
        <AlertaOrientacaoMobile />
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo, <span className="font-semibold">{user?.nome}</span> | Perfil:{' '}
            <span className="font-semibold capitalize">{userPerfil}</span>
          </p>
        </div>

        {/* ==================== ÁREA: ACIDENTES ==================== */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-50 rounded-2xl">
              <span className="text-2xl">🚑</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Acidentes</h2>
              <p className="text-sm text-gray-500">Indicadores e análises de acidentes de trabalho</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard titulo="Total Acidentes" valor={kpis.totalAcidentes} icone="🚑" cor="blue" />
            <KPICard titulo="Acidentes Abertos" valor={kpis.acidentesAbertos} icone="⚠️" cor="red" />
            <KPICard titulo="Acidentes em Análise" valor={kpis.acidentesEmAnalise} icone="🔍" cor="yellow" />
            <KPICard titulo="Taxa de Resolução" valor={`${kpis.taxaResolucao}%`} icone="✅" cor="green" />
          </div>

          <Suspense fallback={<ChartFallback />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AcidentesPorMes dados={graficos.acidentesUltimosMeses} titulo="Acidentes - Últimos 6 Meses" />
              <PieChartComponent dados={graficos.acidentesPorTipo} titulo="Acidentes por Tipo" />
            </div>
          </Suspense>

          <Suspense fallback={<ChartFallback />}>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
              <PieChartComponent dados={graficos.acidentesPorStatus} titulo="Acidentes por Status" cores={['#ef4444', '#f59e0b', '#10b981']} />
            </div>
          </Suspense>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Últimos Acidentes</h3>
              <Link to="/acidentes" className="text-sm text-blue-600 hover:text-blue-700">Ver todos →</Link>
            </div>
            <div className="space-y-3">
              {tabelas.ultimosAcidentes.length > 0 ? (
                tabelas.ultimosAcidentes.map((acidente: any) => (
                  <div key={acidente._id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{acidente.trabalhadorId?.nome || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{acidente.tipoAcidente}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${acidente.status === 'Aberto' ? 'bg-red-100 text-red-700' : acidente.status === 'Em Análise' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {acidente.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{format(new Date(acidente.dataAcidente), 'dd/MM/yyyy')}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum acidente registrado</p>
              )}
            </div>
          </div>
        </div>

        {/* ==================== ÁREA: SAÚDE ==================== */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-50 rounded-2xl">
              <span className="text-2xl">🩺</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Saúde</h2>
              <p className="text-sm text-gray-500">Indicadores de saúde ocupacional, vacinação e deficiência</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard titulo="Doenças Ativas" valor={kpis.doencasAtivas} icone="🩺" cor="yellow" />
            <KPICard titulo="Total Vacinações" valor={kpis.totalVacinacoes} icone="💉" cor="green" />
            <KPICard titulo="Vacinações Próximas" valor={kpis.proximasVacinacoes} icone="⏰" cor="orange" descricao="Próximos 30 dias" />
            <KPICard titulo="Trab. c/ Deficiência" valor={`${kpis.percentualDeficiencia}%`} icone="♿" cor="purple" descricao={`${kpis.totalTrabalhadoresComDeficiencia} trabalhadores`} />
          </div>

          <Suspense fallback={<ChartFallback />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <PieChartComponent dados={graficos.deficienciaPorTipo} titulo="Deficiência por Tipo" cores={['#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6', '#f43f5e']} />
            </div>
          </Suspense>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Vacinações Próximas</h3>
              <Link to="/vacinacoes" className="text-sm text-blue-600 hover:text-blue-700">Ver todas →</Link>
            </div>
            <div className="space-y-3">
              {tabelas.proximasVacinacoes.length > 0 ? (
                tabelas.proximasVacinacoes.slice(0, 5).map((vac: any) => (
                  <div key={vac._id} className={`p-3 rounded-lg border-l-4 ${vac.status === 'Vencida' ? 'bg-red-50 border-red-500' : vac.status === 'Vence em breve' ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{vac.vacina}</p>
                        <p className="text-sm text-gray-600">{vac.trabalhadorId?.nome || 'N/A'}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${vac.status === 'Vencida' ? 'bg-red-100 text-red-700' : vac.status === 'Vence em breve' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {vac.diasRestantes < 0 ? `Vencida (${Math.abs(vac.diasRestantes)}d)` : vac.diasRestantes === 0 ? 'Hoje' : `${vac.diasRestantes}d`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma vacinação próxima</p>
              )}
            </div>
          </div>

          {/* Indicadores Customizáveis */}
          {customIndicadores.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Indicadores Customizáveis</h3>
                <Link to="/admin/indicadores" className="text-sm text-purple-600 font-bold hover:underline">Gerenciar</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {customIndicadores.filter(ind => ind.ativo).slice(0, 8).map(ind => (
                  <KPICard key={ind._id} titulo={ind.nome} valor={ind.tipo === 'percentual' ? `${ind.valorCalculado ?? 0}%` : (ind.valorCalculado ?? 0)} icone={ind.icone || '📊'} cor={(ind.cor as any) || 'blue'} descricao={ind.meta != null ? `Meta: ${ind.meta}` : undefined} />
                ))}
              </div>
            </div>
          )}
          {loadingIndicadores && (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* ==================== ÁREA: EMPRESAS ==================== */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Empresas e Trabalhadores</h2>
              <p className="text-sm text-gray-500">Distribuição de trabalhadores e vínculos empregatícios</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard titulo="Trabalhadores Ativos" valor={kpis.totalTrabalhadores} icone="👥" cor="purple" />
          </div>

          <Suspense fallback={<ChartFallback />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChartComponent dados={graficos.trabalhadoresPorEmpresa} titulo="Trabalhadores ativos por Empresa" />
              <BarChartComponent dados={graficos.trabalhadoresMultiplosVinculos} titulo="Trabalhadores com mais de 1 Vínculo" cor="#8b5cf6" dataKey="percentual" unidade="% dos trabalhadores" />
            </div>
          </Suspense>
        </div>

      </MainLayout>
    );
  }

  // Dashboard Trabalhador
  if (dashboardTrabalhador) {
    const { resumo, proximaVacinacao, vacinacaoVencida, ultimosAcidentes } =
      dashboardTrabalhador;

    return (
      <MainLayout>
        <AlertaOrientacaoMobile />
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Painel</h1>
          <p className="text-gray-600 mt-2">
            Olá, <span className="font-semibold">{user?.nome}</span> | Bem-vindo ao seu painel
            pessoal
          </p>
        </div>

        {/* Alertas */}
        {vacinacaoVencida && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">Vacinação Vencida!</h3>
                <p className="text-sm text-red-700 mt-1">
                  {vacinacaoVencida.vacina} - Procure a unidade de saúde para atualização
                </p>
              </div>
            </div>
          </div>
        )}

        {proximaVacinacao && proximaVacinacao.diasRestantes <= 7 && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⏰</span>
              <div>
                <h3 className="font-semibold text-yellow-800">Vacinação Próxima</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {proximaVacinacao.vacina} -{' '}
                  {proximaVacinacao.diasRestantes === 0
                    ? 'Hoje'
                    : `Em ${proximaVacinacao.diasRestantes} dias`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPIs Pessoais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            titulo="Meus Acidentes"
            valor={resumo.acidentes}
            icone="🚑"
            cor="blue"
          />
          <KPICard
            titulo="Doenças Ativas"
            valor={resumo.doencasAtivas}
            icone="🩺"
            cor="yellow"
          />
          <KPICard
            titulo="Minha Vacinações"
            valor={resumo.totalVacinacoes}
            icone="💉"
            cor="green"
          />
        </div>

        {/* Últimos Acidentes Pessoais */}
        {ultimosAcidentes.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Meus Últimos Acidentes</h3>
            <div className="space-y-3">
              {ultimosAcidentes.map((acidente: any) => (
                <div
                  key={acidente._id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{acidente.tipoAcidente}</p>
                      <p className="text-sm text-gray-600">{acidente.descricao}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        acidente.status === 'Aberto'
                          ? 'bg-red-100 text-red-700'
                          : acidente.status === 'Em Análise'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {acidente.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(acidente.dataAcidente), 'dd/MM/yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </MainLayout>
    );
  }

  // Fallback - Dashboard básico (antes de carregar)
  return (
    <MainLayout>
      <DocumentTitle title="Dashboard" />
      <AlertaOrientacaoMobile />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-blue-50 border-blue-100">
          <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
            <span>👋</span> Bem-vindo!
          </h3>
          <p className="text-gray-600 mt-2">
            Olá, <span className="font-bold">{user?.nome}</span>! Você está no painel do{' '}
            <span className="text-blue-600 font-bold">SISPNAIST</span>.
          </p>
        </div>

        <div className="card bg-green-50 border-green-100">
          <h3 className="text-lg font-semibold text-green-600 flex items-center gap-2">
            <span>🏢</span> Sua Empresa
          </h3>
          <p className="text-gray-600 mt-2">
            {user?.empresa ? `Empresa: ${user.empresa}` : 'Nenhuma empresa associada'}
          </p>
        </div>

        <div className="card bg-purple-50 border-purple-100">
          <h3 className="text-lg font-semibold text-purple-600 flex items-center gap-2">
            <span>👤</span> Seu Perfil
          </h3>
          <p className="text-gray-600 mt-2 capitalize font-medium">
            {user?.perfil || 'trabalhador'}
          </p>
        </div>
      </div>

    </MainLayout>
  );
};
