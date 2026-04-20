import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 text-center py-6 mt-12">
      <div className="container mx-auto px-4">
        <p>&copy; 2024 SISPNAIST. Todos os direitos reservados.</p>
        <p className="text-sm mt-2">
          Sistema de Gerenciamento de Segurança do Trabalhador
        </p>
      </div>
    </footer>
  );
};
