import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { Dashboard } from './pages/Dashboard.js';
import { Home } from './pages/Home.js';
import { ListaAcidentes, NovoAcidente, EditarAcidente, DetalhesAcidente } from './pages/Acidentes/index.js';
import { ListaDoencas, NovaDoenca, EditarDoenca } from './pages/Doencas/index.js';
import { ListaVacinacoes, NovaVacinacao, EditarVacinacao } from './pages/Vacinacoes/index.js';
import { ListaTrabalhadores, NovoTrabalhador, EditarTrabalhador, DetalhesTrabalhador, ListaAfastamentos, FormAfastamento, ListaDependentes, FormDependente } from './pages/Trabalhadores/index.js';
import ListaEmpresas from './pages/Admin/Empresas/ListaEmpresas.js';
import FormEmpresa from './pages/Admin/Empresas/FormEmpresa.js';
import ListaUnidades from './pages/Admin/Unidades/ListaUnidades.js';
import FormUnidade from './pages/Admin/Unidades/FormUnidade.js';
import ListaUsuarios from './pages/Admin/Usuarios/ListaUsuarios.js';
import EditarUsuario from './pages/Admin/Usuarios/EditarUsuario.js';

import './styles/globals.css';

const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
