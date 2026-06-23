import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

import './styles/globals.css';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
}

const Login = React.lazy(() => import('./pages/Login.js').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register.js').then(m => ({ default: m.Register })));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword.js').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword.js').then(m => ({ default: m.ResetPassword })));
const VerifyEmail = React.lazy(() => import('./pages/VerifyEmail.js').then(m => ({ default: m.VerifyEmail })));
const Dashboard = React.lazy(() => import('./pages/Dashboard.js').then(m => ({ default: m.Dashboard })));
const Home = React.lazy(() => import('./pages/Home.js').then(m => ({ default: m.Home })));

const ListaAcidentes = React.lazy(() => import('./pages/Acidentes/ListaAcidentes.js'));
const NovoAcidente = React.lazy(() => import('./pages/Acidentes/NovoAcidente.js'));
const EditarAcidente = React.lazy(() => import('./pages/Acidentes/EditarAcidente.js'));
const DetalhesAcidente = React.lazy(() => import('./pages/Acidentes/DetalhesAcidente.js'));

const ListaMaterialBiologico = React.lazy(() => import('./pages/Acidentes/MaterialBiologico/ListaMaterialBiologico.js').then(m => ({ default: m.ListaMaterialBiologico })));
const NovoMaterialBiologico = React.lazy(() => import('./pages/Acidentes/MaterialBiologico/NovoMaterialBiologico.js').then(m => ({ default: m.NovoMaterialBiologico })));
const VisualizarMaterialBiologico = React.lazy(() => import('./pages/Acidentes/MaterialBiologico/VisualizarMaterialBiologico.js').then(m => ({ default: m.VisualizarMaterialBiologico })));
const EditarMaterialBiologico = React.lazy(() => import('./pages/Acidentes/MaterialBiologico/EditarMaterialBiologico.js').then(m => ({ default: m.EditarMaterialBiologico })));

const ListaDoencas = React.lazy(() => import('./pages/Doencas/ListaDoencas.js'));
const NovaDoenca = React.lazy(() => import('./pages/Doencas/NovaDoenca.js'));
const EditarDoenca = React.lazy(() => import('./pages/Doencas/EditarDoenca.js'));
const DetalhesDoenca = React.lazy(() => import('./pages/Doencas/DetalhesDoenca.js'));

const ListaVacinacoes = React.lazy(() => import('./pages/Vacinacoes/ListaVacinacoes.js'));
const NovaVacinacao = React.lazy(() => import('./pages/Vacinacoes/NovaVacinacao.js'));
const EditarVacinacao = React.lazy(() => import('./pages/Vacinacoes/EditarVacinacao.js'));
const DetalhesVacinacao = React.lazy(() => import('./pages/Vacinacoes/DetalhesVacinacao.js'));

const ListaVideoAulas = React.lazy(() => import('./pages/VideoAulas/ListaVideoAulas.js'));
const FormVideoAula = React.lazy(() => import('./pages/VideoAulas/FormVideoAula.js'));
const VideoPlayer = React.lazy(() => import('./pages/VideoAulas/VideoPlayer.js'));

const ListaTrabalhadores = React.lazy(() => import('./pages/Trabalhadores/ListaTrabalhadores.js'));
const NovoTrabalhador = React.lazy(() => import('./pages/Trabalhadores/NovoTrabalhador.js'));
const EditarTrabalhador = React.lazy(() => import('./pages/Trabalhadores/EditarTrabalhador.js'));
const DetalhesTrabalhador = React.lazy(() => import('./pages/Trabalhadores/DetalhesTrabalhador.js'));

const ListaAfastamentos = React.lazy(() => import('./pages/Trabalhadores/Afastamentos/ListaAfastamentos.js'));
const FormAfastamento = React.lazy(() => import('./pages/Trabalhadores/Afastamentos/FormAfastamento.js'));
const ListaDependentes = React.lazy(() => import('./pages/Trabalhadores/Dependentes/ListaDependentes.js'));
const FormDependente = React.lazy(() => import('./pages/Trabalhadores/Dependentes/FormDependente.js'));
const ListaVinculos = React.lazy(() => import('./pages/Trabalhadores/Vinculos/ListaVinculos.js'));
const DetalhesVinculo = React.lazy(() => import('./pages/Trabalhadores/Vinculos/DetalhesVinculo.js'));
const FormVinculo = React.lazy(() => import('./pages/Trabalhadores/Vinculos/FormVinculo.js'));
const ListaOcorrenciasViolencia = React.lazy(() => import('./pages/Trabalhadores/OcorrenciasViolencia/ListaOcorrenciasViolencia.js'));
const FormOcorrenciaViolencia = React.lazy(() => import('./pages/Trabalhadores/OcorrenciasViolencia/FormOcorrenciaViolencia.js'));
const ListaReadaptacoes = React.lazy(() => import('./pages/Trabalhadores/Readaptacoes/ListaReadaptacoes.js'));
const FormReadaptacao = React.lazy(() => import('./pages/Trabalhadores/Readaptacoes/FormReadaptacao.js'));
const ListaProcessosTrabalho = React.lazy(() => import('./pages/Trabalhadores/ProcessosTrabalho/ListaProcessosTrabalho.js'));
const FormProcessoTrabalho = React.lazy(() => import('./pages/Trabalhadores/ProcessosTrabalho/FormProcessoTrabalho.js'));
const ListaInformacoes = React.lazy(() => import('./pages/Trabalhadores/Informacoes/ListaInformacoes.js'));
const FormInformacoes = React.lazy(() => import('./pages/Trabalhadores/Informacoes/FormInformacoes.js'));
const ListaHistoricoPPP = React.lazy(() => import('./pages/Trabalhadores/HistoricoPPP/ListaHistoricoPPP.js'));
const FormHistoricoPPP = React.lazy(() => import('./pages/Trabalhadores/HistoricoPPP/FormHistoricoPPP.js'));

const ListaAtos = React.lazy(() => import('./pages/AtosMunicipais/ListaAtos.js'));
const FormAto = React.lazy(() => import('./pages/AtosMunicipais/FormAto.js'));
const Monitoramento = React.lazy(() => import('./pages/Monitoramento.js'));

const ListaEmpresas = React.lazy(() => import('./pages/Admin/Empresas/ListaEmpresas.js'));
const FormEmpresa = React.lazy(() => import('./pages/Admin/Empresas/FormEmpresa.js'));
const ListaUnidades = React.lazy(() => import('./pages/Admin/Unidades/ListaUnidades.js'));
const FormUnidade = React.lazy(() => import('./pages/Admin/Unidades/FormUnidade.js'));
const ListaUsuarios = React.lazy(() => import('./pages/Admin/Usuarios/ListaUsuarios.js'));
const EditarUsuario = React.lazy(() => import('./pages/Admin/Usuarios/EditarUsuario.js'));
const ListaCatalogos = React.lazy(() => import('./pages/Admin/Catalogos/ListaCatalogos.js'));
const ItensCatalogo = React.lazy(() => import('./pages/Admin/Catalogos/ItensCatalogo.js'));
const Auditoria = React.lazy(() => import('./pages/Admin/Auditoria.js'));

const App: React.FC = () => {
  const [appReady, setAppReady] = React.useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  React.useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setAppReady(true);
    };
    init();
  }, [initializeAuth]);

  if (!appReady) {
    return <LoadingFallback />;
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        
        {/* Acidentes Routes */}
        <Route
          path="/acidentes"
          element={
            <ProtectedRoute>
              <ListaAcidentes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acidentes/novo"
          element={
            <ProtectedRoute>
              <NovoAcidente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acidentes/:id/editar"
          element={
            <ProtectedRoute>
              <EditarAcidente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acidentes/:id"
          element={
            <ProtectedRoute>
              <DetalhesAcidente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acidentes/material-biologico"
          element={
            <ProtectedRoute>
              <ListaMaterialBiologico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acidentes/material-biologico/novo"
          element={
            <ProtectedRoute>
              <NovoMaterialBiologico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acidentes/material-biologico/:id"
          element={
            <ProtectedRoute>
              <VisualizarMaterialBiologico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acidentes/material-biologico/:id/editar"
          element={
            <ProtectedRoute>
              <EditarMaterialBiologico />
            </ProtectedRoute>
          }
        />

        {/* Doencas Routes */}
        <Route
          path="/doencas"
          element={
            <ProtectedRoute>
              <ListaDoencas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doencas/novo"
          element={
            <ProtectedRoute>
              <NovaDoenca />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doencas/:id/editar"
          element={
            <ProtectedRoute>
              <EditarDoenca />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doencas/:id"
          element={
            <ProtectedRoute>
              <DetalhesDoenca />
            </ProtectedRoute>
          }
        />

        {/* Vacinacoes Routes */}
        <Route
          path="/vacinacoes"
          element={
            <ProtectedRoute>
              <ListaVacinacoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vacinacoes/novo"
          element={
            <ProtectedRoute>
              <NovaVacinacao />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vacinacoes/:id/editar"
          element={
            <ProtectedRoute>
              <EditarVacinacao />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vacinacoes/:id"
          element={
            <ProtectedRoute>
              <DetalhesVacinacao />
            </ProtectedRoute>
          }
        />

        {/* Video Aulas Routes */}
        <Route
          path="/video-aulas"
          element={
            <ProtectedRoute>
              <ListaVideoAulas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-aulas/novo"
          element={
            <ProtectedRoute authorize={['admin', 'gestor']}>
              <FormVideoAula />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-aulas/:id/editar"
          element={
            <ProtectedRoute authorize={['admin', 'gestor']}>
              <FormVideoAula />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-aulas/:id"
          element={
            <ProtectedRoute>
              <VideoPlayer />
            </ProtectedRoute>
          }
        />

        
        {/* Trabalhadores Routes */}
        <Route
          path="/trabalhadores"
          element={
            <ProtectedRoute>
              <ListaTrabalhadores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/novo"
          element={
            <ProtectedRoute>
              <NovoTrabalhador />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id"
          element={
            <ProtectedRoute>
              <DetalhesTrabalhador />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/editar"
          element={
            <ProtectedRoute>
              <EditarTrabalhador />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/afastamentos"
          element={
            <ProtectedRoute>
              <ListaAfastamentos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/afastamentos/novo"
          element={
            <ProtectedRoute>
              <FormAfastamento />
            </ProtectedRoute>
          }
        />
<Route
          path="/trabalhadores/:id/afastamentos/:afastamentoId/editar"
          element={
            <ProtectedRoute>
              <FormAfastamento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/dependentes"
          element={
            <ProtectedRoute>
              <ListaDependentes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/dependentes/novo"
          element={
            <ProtectedRoute>
              <FormDependente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/dependentes/:dependenteId/editar"
          element={
            <ProtectedRoute>
              <FormDependente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/vinculos"
          element={
            <ProtectedRoute>
              <ListaVinculos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/vinculos/novo"
          element={
            <ProtectedRoute>
              <FormVinculo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/vinculos/:vinculoId"
          element={
            <ProtectedRoute>
              <DetalhesVinculo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/vinculos/:vinculoId/editar"
          element={
            <ProtectedRoute>
              <FormVinculo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/ocorrencias-violencia"
          element={
            <ProtectedRoute>
              <ListaOcorrenciasViolencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/ocorrencias-violencia/novo"
          element={
            <ProtectedRoute>
              <FormOcorrenciaViolencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/ocorrencias-violencia/:ocorrenciaId/editar"
          element={
            <ProtectedRoute>
              <FormOcorrenciaViolencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/readaptacoes"
          element={
            <ProtectedRoute>
              <ListaReadaptacoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/readaptacoes/novo"
          element={
            <ProtectedRoute>
              <FormReadaptacao />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/readaptacoes/:readaptacaoId/editar"
          element={
            <ProtectedRoute>
              <FormReadaptacao />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/processos-trabalho"
          element={
            <ProtectedRoute>
              <ListaProcessosTrabalho />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/processos-trabalho/novo"
          element={
            <ProtectedRoute>
              <FormProcessoTrabalho />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/processos-trabalho/:processoId/editar"
          element={
            <ProtectedRoute>
              <FormProcessoTrabalho />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/informacoes"
          element={
            <ProtectedRoute>
              <ListaInformacoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/informacoes/novo"
          element={
            <ProtectedRoute>
              <FormInformacoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/informacoes/:infoId/editar"
          element={
            <ProtectedRoute>
              <FormInformacoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/historico-ppp"
          element={
            <ProtectedRoute>
              <ListaHistoricoPPP />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/historico-ppp/novo"
          element={
            <ProtectedRoute>
              <FormHistoricoPPP />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabalhadores/:id/historico-ppp/:pppId/editar"
          element={
            <ProtectedRoute>
              <FormHistoricoPPP />
            </ProtectedRoute>
          }
        />

        {/* Atos Municipais Routes */}
        <Route
          path="/atos-municipais"
          element={
            <ProtectedRoute>
              <ListaAtos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/atos-municipais/novo"
          element={
            <ProtectedRoute>
              <FormAto />
            </ProtectedRoute>
          }
        />
        <Route
          path="/atos-municipais/editar/:id"
          element={
            <ProtectedRoute>
              <FormAto />
            </ProtectedRoute>
          }
        />

        <Route
          path="/monitoramento"
          element={
            <ProtectedRoute authorize={['admin', 'gestor']}>
              <Monitoramento />
            </ProtectedRoute>
          }
        />

        {/* Admin - Empresas */}
        <Route
          path="/admin/empresas"
          element={
            <ProtectedRoute adminOnly>
              <ListaEmpresas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/empresas/nova"
          element={
            <ProtectedRoute adminOnly>
              <FormEmpresa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/empresas/editar/:id"
          element={
            <ProtectedRoute adminOnly>
              <FormEmpresa />
            </ProtectedRoute>
          }
        />

        {/* Admin - Unidades */}
        <Route
          path="/admin/unidades"
          element={
            <ProtectedRoute adminOnly>
              <ListaUnidades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/unidades/nova"
          element={
            <ProtectedRoute adminOnly>
              <FormUnidade />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/unidades/editar/:id"
          element={
            <ProtectedRoute adminOnly>
              <FormUnidade />
            </ProtectedRoute>
          }
        />

        {/* Admin - Usuários */}
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute adminOnly>
              <ListaUsuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios/editar/:id"
          element={
            <ProtectedRoute adminOnly>
              <EditarUsuario />
            </ProtectedRoute>
          }
        />
        
        {/* Admin - Catálogos */}
        <Route
          path="/admin/catalogos"
          element={
            <ProtectedRoute adminOnly>
              <ListaCatalogos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/catalogos/:entidade"
          element={
            <ProtectedRoute adminOnly>
              <ItensCatalogo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/auditoria"
          element={
            <ProtectedRoute adminOnly>
              <Auditoria />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
