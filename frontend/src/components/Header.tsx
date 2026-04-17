import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { authService } from '../services/authService.js';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    clearAuth();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition">
            SISPATNAIST
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-100 transition text-sm">
                  Dashboard
                </Link>
                <Link to="/acidentes" className="hover:text-blue-100 transition text-sm">
                  Acidentes
                </Link>
                <Link to="/trabalhadores" className="hover:text-blue-100 transition text-sm">
                  Trabalhadores
                </Link>
                <Link to="/doencas" className="hover:text-blue-100 transition text-sm">
                  Doenças
                </Link>
                <Link to="/vacinacoes" className="hover:text-blue-100 transition text-sm">
                  Vacinações
                </Link>
                {user.perfil === 'admin' && (
                  <>
                    <Link
                      to="/admin/empresas"
                      className="hover:text-amber-200 transition text-sm font-semibold border-l border-blue-400 pl-4"
                    >
                      Empresas
                    </Link>
                    <Link
                      to="/admin/unidades"
                      className="hover:text-amber-200 transition text-sm font-semibold"
                    >
                      Unidades
                    </Link>
                    <Link
                      to="/admin/usuarios"
                      className="hover:text-amber-200 transition text-sm font-semibold"
                    >
                      Usuários
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-4">
                  <span className="text-sm">{user.nome}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-100 transition">
                  Login
                </Link>
                <Link to="/register" className="hover:text-blue-100 transition">
                  Cadastro
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-blue-700 transition"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <nav className="md:hidden mt-4 pt-4 border-t border-blue-500 space-y-2">
            <Link
              to="/dashboard"
              className="block py-2 hover:text-blue-100 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/acidentes"
              className="block py-2 hover:text-blue-100 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Acidentes
            </Link>
            <Link
              to="/trabalhadores"
              className="block py-2 hover:text-blue-100 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trabalhadores
            </Link>
            <Link
              to="/doencas"
              className="block py-2 hover:text-blue-100 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Doenças
            </Link>
            <Link
              to="/vacinacoes"
              className="block py-2 hover:text-blue-100 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vacinações
            </Link>
            {user.perfil === 'admin' && (
              <>
                <div className="pt-2 border border-blue-500">
                  <Link
                    to="/admin/empresas"
                    className="block py-2 hover:text-amber-200 transition font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Empresas
                  </Link>
                  <Link
                    to="/admin/unidades"
                    className="block py-2 hover:text-amber-200 transition font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Unidades
                  </Link>
                  <Link
                    to="/admin/usuarios"
                    className="block py-2 hover:text-amber-200 transition font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Usuários
                  </Link>
                </div>
              </>
            )}
            <div className="pt-4 border-t border-blue-500">
              <div className="py-2 text-sm">{user.nome}</div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition text-left"
              >
                Sair
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
