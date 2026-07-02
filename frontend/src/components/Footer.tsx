import React from 'react';

export const Footer: React.FC = React.memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 text-center py-6 mt-12" role="contentinfo">
      <div className="container mx-auto px-4">
        <p>&copy; {currentYear} SISPNAIST. Todos os direitos reservados.</p>
        <p className="text-sm mt-2">
          Sistema de Gerenciamento de Segurança do Trabalhador
        </p>
        <nav className="flex justify-center gap-4 mt-3 text-sm" aria-label="Links do rodapé">
          <a href="/termos" className="hover:text-white transition-colors" aria-label="Termos de Uso">Termos de Uso</a>
          <a href="/privacidade" className="hover:text-white transition-colors" aria-label="Política de Privacidade">Privacidade</a>
          <a href="/transparencia" className="hover:text-white transition-colors" aria-label="Transparência">Transparência</a>
        </nav>
      </div>
    </footer>
  );
});
