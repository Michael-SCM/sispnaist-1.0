import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { authService } from '../services/authService.js';

export const Header: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registrosOpen, setRegistrosOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const registrosRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (registrosRef.current && !registrosRef.current.contains(e.target as Node)) {
        setRegistrosOpen(false);
      }
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
        setOrgOpen(false);
      }
      if (configRef.current && !configRef.current.contains(e.target as Node)) {
        setConfigOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileButtonRef.current?.focus();
      }
      if (e.key === 'Escape' && registrosOpen) {
        setRegistrosOpen(false);
      }
      if (e.key === 'Escape' && orgOpen) {
        setOrgOpen(false);
      }
      if (e.key === 'Escape' && configOpen) {
        setConfigOpen(false);
      }
      if (e.key === 'Escape' && userMenuOpen) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen, registrosOpen, orgOpen, configOpen, userMenuOpen]);

  const handleLogout = () => {
    authService.logout();
    clearAuth();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="bg-blue-600 text-white shadow-lg w-full">
      <div className="px-4 py-4 w-full max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center w-full">
          <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition" aria-label="SISPNAIST - Página inicial">
            SISPNAIST
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-6 justify-end" aria-label="Navegação principal">
            {user ? (
              <>
                {(user?.perfil === 'admin' || user?.perfil === 'gestor') && (
                  <Link
                    to="/dashboard"
                    className="hover:text-blue-100 transition text-sm"
                    aria-current={isActive('/dashboard') ? 'page' : undefined}
                  >
                    Dashboard
                  </Link>
                )}

                <div className="relative" ref={registrosRef}>
                  <button
                    onClick={() => setRegistrosOpen(!registrosOpen)}
                    className="flex items-center gap-1 hover:text-blue-100 transition text-sm"
                    aria-expanded={registrosOpen}
                    aria-haspopup="menu"
                    aria-label="Registros"
                  >
                    Registros
                    <svg
                      className={`w-3 h-3 transition-transform ${registrosOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {registrosOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      role="menu"
                      aria-label="Submenu de Registros"
                    >
                      <Link
                        to="/trabalhadores"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setRegistrosOpen(false)}
                        role="menuitem"
                        aria-current={isActive('/trabalhadores') ? 'page' : undefined}
                      >
                        Trabalhadores
                      </Link>
                      <Link
                        to="/acidentes"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setRegistrosOpen(false)}
                        role="menuitem"
                        aria-current={isActive('/acidentes') ? 'page' : undefined}
                      >
                        Acidentes
                      </Link>
                      <Link
                        to="/doencas"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setRegistrosOpen(false)}
                        role="menuitem"
                        aria-current={isActive('/doencas') ? 'page' : undefined}
                      >
                        Doenças
                      </Link>
                      <Link
                        to="/vacinacoes"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setRegistrosOpen(false)}
                        role="menuitem"
                        aria-current={isActive('/vacinacoes') ? 'page' : undefined}
                      >
                        Vacinações
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/transparencia"
                  className="hover:text-blue-100 transition text-sm"
                  aria-current={isActive('/transparencia') ? 'page' : undefined}
                >
                  Transparência
                </Link>
                <Link
                  to="/video-aulas"
                  className="hover:text-blue-100 transition text-sm"
                  aria-current={isActive('/video-aulas') ? 'page' : undefined}
                >
                  Treinamentos
                </Link>
                <Link
                  to="/meus-certificados"
                  className="hover:text-amber-200 transition text-sm"
                  aria-current={isActive('/meus-certificados') ? 'page' : undefined}
                >
                  Certificados
                </Link>

                {user?.perfil === 'admin' && (
                  <>
                  <div className="relative" ref={orgRef}>
                    <button
                      onClick={() => setOrgOpen(!orgOpen)}
                      className="flex items-center gap-1 hover:text-amber-200 transition text-sm font-semibold border-l border-blue-400 pl-4"
                      aria-expanded={orgOpen}
                      aria-haspopup="menu"
                    >
                      Organizações
                      <svg
                        className={`w-3 h-3 transition-transform ${orgOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {orgOpen && (
                      <div
                        className="absolute top-full left-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                        role="menu"
                      >
                        <Link
                          to="/admin/empresas"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                          onClick={() => setOrgOpen(false)}
                          role="menuitem"
                        >
                          Empresas
                        </Link>
                        <Link
                          to="/admin/unidades"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                          onClick={() => setOrgOpen(false)}
                          role="menuitem"
                        >
                          Unidades
                        </Link>
                      </div>
                    )}
                  </div>
                  <Link
                    to="/admin/usuarios"
                    className="hover:text-amber-200 transition text-sm font-semibold"
                    aria-current={isActive('/admin/usuarios') ? 'page' : undefined}
                  >
                    Usuários
                  </Link>
                    <div className="relative" ref={configRef}>
                      <button
                        onClick={() => setConfigOpen(!configOpen)}
                        className="flex items-center gap-1 hover:text-amber-200 transition text-sm font-semibold"
                        aria-expanded={configOpen}
                        aria-haspopup="menu"
                      >
                        Configurações
                        <svg
                          className={`w-3 h-3 transition-transform ${configOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {configOpen && (
                        <div
                          className="absolute top-full left-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                          role="menu"
                        >
                          <Link
                            to="/admin/parametros-uf"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                            onClick={() => setConfigOpen(false)}
                            role="menuitem"
                          >
                            Parâmetros por UF
                          </Link>
                          <Link
                            to="/admin/regras-validacao"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                            onClick={() => setConfigOpen(false)}
                            role="menuitem"
                          >
                            Regras de Validação
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className="relative flex items-center" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:text-blue-100 transition text-sm border-l border-blue-400 pl-4"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    aria-label={`Usuário: ${user?.nome ?? ''}`}
                  >
                    <span className="hidden sm:inline max-w-[120px] truncate">{user?.nome ?? ''}</span>
                    <svg
                      className={`w-3 h-3 flex-none transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div
                      className="absolute top-full right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      role="menu"
                    >
                      <Link
                        to="/minha-conta"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setUserMenuOpen(false)}
                        role="menuitem"
                      >
                        Minha Conta
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        role="menuitem"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/transparencia" className="hover:text-blue-100 transition text-sm">
                  Transparência
                </Link>
                <Link to="/login" className="hover:text-blue-100 transition" aria-current={isActive('/login') ? 'page' : undefined}>
                  Login
                </Link>
                <Link to="/register" className="hover:text-blue-100 transition" aria-current={isActive('/register') ? 'page' : undefined}>
                  Cadastro
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            ref={mobileButtonRef}
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-700 transition"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav
            ref={mobileMenuRef}
            className="lg:hidden mt-4 pt-4 border-t border-blue-500 space-y-2 w-full max-w-full overflow-x-hidden"
            aria-label="Navegação mobile"
          >
            <Link
              to="/video-aulas"
              className="block w-full max-w-full py-2 hover:text-blue-100 transition overflow-hidden text-ellipsis whitespace-nowrap"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/video-aulas') ? 'page' : undefined}
            >
              Treinamentos
            </Link>
            <Link
              to="/transparencia"
              className="block w-full max-w-full py-2 hover:text-blue-100 transition overflow-hidden text-ellipsis whitespace-nowrap"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/transparencia') ? 'page' : undefined}
            >
              Transparência
            </Link>
            <Link
              to="/meus-certificados"
              className="block w-full max-w-full py-2 hover:text-amber-200 transition overflow-hidden text-ellipsis whitespace-nowrap"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/meus-certificados') ? 'page' : undefined}
            >
              Certificados
            </Link>
            {(user?.perfil === 'admin' || user?.perfil === 'gestor') && (
              <Link
                to="/dashboard"
                className="block w-full max-w-full py-2 hover:text-blue-100 transition overflow-hidden text-ellipsis whitespace-nowrap"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/dashboard') ? 'page' : undefined}
              >
                Dashboard
              </Link>
            )}
            <div className="pt-2 border-t border-blue-500">
              <p className="text-xs text-blue-300 uppercase tracking-wider px-1 pb-1 font-semibold" id="mobile-registros-heading">Registros</p>
              <Link
                to="/trabalhadores"
                className="block w-full max-w-full py-2 hover:text-blue-100 transition overflow-hidden text-ellipsis whitespace-nowrap"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/trabalhadores') ? 'page' : undefined}
              >
                Trabalhadores
              </Link>
              <Link
                to="/acidentes"
                className="block w-full max-w-full py-2 hover:text-blue-100 transition overflow-hidden text-ellipsis whitespace-nowrap"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/acidentes') ? 'page' : undefined}
              >
                Acidentes
              </Link>
              <Link
                to="/doencas"
                className="block w-full max-w-full py-2 hover:text-blue-100 transition overflow-hidden text-ellipsis whitespace-nowrap"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/doencas') ? 'page' : undefined}
              >
                Doenças
              </Link>
              <Link
                to="/vacinacoes"
                className="block w-full max-w-full py-2 hover:text-blue-100 transition overflow-hidden text-ellipsis whitespace-nowrap"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/vacinacoes') ? 'page' : undefined}
              >
                Vacinações
              </Link>
            </div>

            <Link
              to="/minha-conta"
              className="block w-full max-w-full py-2 hover:text-blue-100 transition overflow-hidden text-ellipsis whitespace-nowrap"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/minha-conta') ? 'page' : undefined}
            >
              Minha Conta
            </Link>

            {user?.perfil === 'admin' && (
              <>
                  <div className="pt-2 border-t border-blue-500">
                    <p className="text-xs text-amber-300 uppercase tracking-wider px-1 pb-1 font-semibold">Organizações</p>
                    <Link
                      to="/admin/empresas"
                      className="block w-full max-w-full py-2 hover:text-amber-200 transition font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive('/admin/empresas') ? 'page' : undefined}
                    >
                      Empresas
                    </Link>
                    <Link
                      to="/admin/unidades"
                      className="block w-full max-w-full py-2 hover:text-amber-200 transition font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive('/admin/unidades') ? 'page' : undefined}
                    >
                      Unidades
                    </Link>
                  </div>
                  <div className="pt-2">
                    <Link
                      to="/admin/usuarios"
                      className="block w-full max-w-full py-2 hover:text-amber-200 transition font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive('/admin/usuarios') ? 'page' : undefined}
                    >
                      Usuários
                    </Link>
                  </div>
                <div className="pt-2">
                  <p className="text-xs text-amber-300 uppercase tracking-wider px-1 pb-1 font-semibold">Configurações</p>
                  <Link
                    to="/admin/parametros-uf"
                    className="block w-full max-w-full py-2 hover:text-amber-200 transition font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive('/admin/parametros-uf') ? 'page' : undefined}
                  >
                    Parâmetros por UF
                  </Link>
                  <Link
                    to="/admin/regras-validacao"
                    className="block w-full max-w-full py-2 hover:text-amber-200 transition font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive('/admin/regras-validacao') ? 'page' : undefined}
                  >
                    Regras de Validação
                  </Link>
                </div>
              </>
            )}
            <div className="pt-4 border-t border-blue-500">
              <div className="py-2 text-sm" aria-label={`Usuário: ${user?.nome ?? ''}`}>{user?.nome ?? ''}</div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition text-left"
                aria-label="Sair do sistema"
              >
                Sair
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
});
