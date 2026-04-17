import React from 'react';
import { MainLayout } from '../layouts/MainLayout.js';

export const Home: React.FC = () => {
  return (
    <MainLayout>
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">SISPATNAIST</h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema de Gerenciamento de Segurança e Saúde do Trabalhador
        </p>
        <div className="space-y-4">
          <p className="text-gray-600">
            Bem-vindo ao novo SISPATNAIST. Uma plataforma moderna e eficiente para
            gerenciar a segurança e saúde dos trabalhadores.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
