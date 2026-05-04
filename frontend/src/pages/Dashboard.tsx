import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAnalyticsStore } from '../store/analyticsStore.js';
import { MainLayout } from '../layouts/MainLayout.js';
import { KPICard } from '../components/KPICard.js';
import { AcidentesPorMes, PieChartComponent, BarChartComponent } from '../components/charts/index.js';
import { format } from 'date-fns';

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

  useEffect(() => {
    // Carregar dados baseado no perfil do usuário
    if (userPerfil === 'admin' || userPerfil === 'gestor') {
      carregarDashboardAdmin();
    } else {
      carregarDashboardTrabalhador();
    }
  }, [userPerfil]);

  const actions = [
    {
      title: 'Acidentes',
      description: 'Registrar ou listar acidentes de trabalho',
      link: '/acidentes',
      newLink: '/acidentes/novo',
      color: 'blue',
      icon: '🚑',
    },
    {
      title: 'Trabalhadores',
      description: 'Gestão de funcionários e seus vínculos',
      link: '/trabalhadores',
      newLink: '/trabalhadores/novo',
      color: 'purple',
      icon: '👥',
    },
    {
      title: 'Doenças',
      description: 'Gerenciar registros de doenças ocupacionais',
      link: '/doencas',
      newLink: '/doencas/novo',
      color: 'red',
      icon: '🩺',
    },
    {
      title: 'Vacinações',
      description: 'Histórico e controle de vacinas',
      link: '/vacinacoes',
      newLink: '/vacinacoes/novo',
      color: 'green',
      icon: '💉',
    },
    {
      title: 'Atos Municipais',
      description: 'Legislação e Atos de Inovação',
      link: '/atos-municipais',
      newLink: '/atos-municipais/novo',
      color: 'indigo',
      icon: '📜',
    },
    {
      title: 'Monitoramento',
      description: 'Inteligência e Alertas Clínicos',
      link: '/monitoramento',
      color: 'amber',
      icon: '📊',
    },
    {
      title: 'Auditoria',
      description: 'Logs e Rastreabilidade',
      link: '/admin/auditoria',
      color: 'slate',
      icon: '🛡️',
      buttonLabel: 'Ver log completo'
    },
  ];

  // Loading state
  if (isLoading && !kpis && !dashboardAdmin && !dashboardTrabalhador) {
    return (
      <MainLayout>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo, <span className="font-semibold">{user?.nome}</span> | Perfil:{' '}
            <span className="font-semibold capitalize">{userPerfil}</span>
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            titulo="Total Acidentes"
            valor={kpis.totalAcidentes}
            icone="🚑"
            cor="blue"
          />
          <KPICard
            titulo="Acidentes Abertos"
            valor={kpis.acidentesAbertos}
            icone="⚠️"
            cor="red"
          />
          <KPICard
            titulo="Taxa de Resolução"
            valor={`${kpis.taxaResolucao}%`}
            icone="✅"
            cor="green"
          />
          <KPICard
            titulo="Trabalhadores Ativos"
            valor={kpis.totalTrabalhadores}
            icone="👥"
            cor="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            titulo="Doenças Ativas"
            valor={kpis.doencasAtivas}
            icone="🩺"
            cor="yellow"
          />
          <KPICard
            titulo="Total Vacinações"
            valor={kpis.totalVacinacoes}
            icone="💉"
            cor="green"
          />
          <KPICard
            titulo="Vacinações Próximas"
            valor={kpis.proximasVacinacoes}
            icone="⏰"
            cor="orange"
            descricao="Próximos 30 dias"
          />
          <KPICard
            titulo="Acidentes em Análise"
            valor={kpis.acidentesEmAnalise}
            icone="🔍"
            cor="blue"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AcidentesPorMes
            dados={graficos.acidentesUltimosMeses}
            titulo="Acidentes - Últimos 6 Meses"
          />
          <PieChartComponent
            dados={graficos.acidentesPorTipo}
            titulo="Acidentes por Tipo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PieChartComponent
            dados={graficos.acidentesPorStatus}
            titulo="Acidentes por Status"
            cores={['#ef4444', '#f59e0b', '#10b981']}
          />
          <BarChartComponent
            dados={graficos.trabalhadoresPorEmpresa}
            titulo="Trabalhadores por Empresa"
          />
        </div>

        {/* Tabelas de Resumo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Últimos Acidentes */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Últimos Acidentes</h3>
              <Link to="/acidentes" className="text-sm text-blue-600 hover:text-blue-700">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {tabelas.ultimosAcidentes.length > 0 ? (
                tabelas.ultimosAcidentes.map((acidente: any) => (
                  <div
                    key={acidente._id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {acidente.trabalhadorId?.nome || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">{acidente.tipoAcidente}</p>
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
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum acidente registrado</p>
              )}
            </div>
          </div>

          {/* Próximas Vacinações */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Vacinações Próximas</h3>
              <Link to="/vacinacoes" className="text-sm text-blue-600 hover:text-blue-700">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-3">
              {tabelas.proximasVacinacoes.length > 0 ? (
                tabelas.proximasVacinacoes.slice(0, 5).map((vac: any) => (
                  <div
                    key={vac._id}
                    className={`p-3 rounded-lg border-l-4 ${
                      vac.status === 'Vencida'
                        ? 'bg-red-50 border-red-500'
                        : vac.status === 'Vence em breve'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{vac.vacina}</p>
                        <p className="text-sm text-gray-600">
                          {vac.trabalhadorId?.nome || 'N/A'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          vac.status === 'Vencida'
                            ? 'bg-red-100 text-red-700'
                            : vac.status === 'Vence em breve'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {vac.diasRestantes < 0
                          ? `Vencida (${Math.abs(vac.diasRestantes)}d)`
                          : vac.diasRestantes === 0
                          ? 'Hoje'
                          : `${vac.diasRestantes}d`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma vacinação próxima</p>
              )}
            </div>
          </div>
        </div>

        {/* Acesso Rápido */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {actions.map((action) => (
              <div
                key={action.title}
                className="card hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-4xl mb-4">{action.icon}</div>
                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                <p className="text-gray-600 mb-6 text-sm">{action.description}</p>
                <div className="flex flex-col gap-2">
                  <Link
                    to={action.link}
                    className={`text-center py-2 px-4 bg-${action.color}-600 text-white rounded hover:bg-${action.color}-700 transition`}
                  >
                    {action.buttonLabel || 'Ver Todos'}
                  </Link>
                  {action.newLink && (
                    <Link
                      to={action.newLink}
                      className={`text-center py-2 px-4 border border-${action.color}-600 text-${action.color}-600 rounded hover:bg-${action.color}-50 transition font-medium`}
                    >
                      + Novo Registro
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
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

        {/* Acesso Rápido */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actions.slice(0, 2).map((action) => (
              <div
                key={action.title}
                className="card hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-4xl mb-4">{action.icon}</div>
                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                <p className="text-gray-600 mb-6 text-sm">{action.description}</p>
                <Link
                  to={action.link}
                  className={`block text-center py-2 px-4 bg-${action.color}-600 text-white rounded hover:bg-${action.color}-700 transition`}
                >
                  {action.buttonLabel || 'Ver Todos'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  // Fallback - Dashboard básico (antes de carregar)
  return (
    <MainLayout>
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

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Acesso Rápido</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action) => (
          <div key={action.title} className="card hover:shadow-md transition-shadow border-gray-100">
            <div className="text-4xl mb-4">{action.icon}</div>
            <h3 className="text-xl font-bold mb-2">{action.title}</h3>
            <p className="text-gray-600 mb-6 text-sm">{action.description}</p>
            <div className="flex flex-col gap-2">
              <Link
                to={action.link}
                className={`text-center py-2 px-4 bg-${action.color}-600 text-white rounded hover:bg-${action.color}-700 transition`}
              >
                {action.buttonLabel || 'Ver Todos'}
              </Link>
              {action.newLink && (
                <Link
                  to={action.newLink}
                  className={`text-center py-2 px-4 border border-${action.color}-600 text-${action.color}-600 rounded hover:bg-${action.color}-50 transition font-medium`}
                >
                  + Novo Registro
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};
