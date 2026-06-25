import React from 'react';
import { Link } from 'react-router-dom';

export const TermosDeUso: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <Link to="/register" className="text-blue-600 hover:text-blue-700 text-sm font-medium">&larr; Voltar</Link>
        <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-6">Termos de Uso</h1>

        <div className="prose prose-slate max-w-none space-y-4 text-sm text-slate-600">
          <p><strong>Última atualização:</strong> Junho de 2026 | <strong>Versão:</strong> 1.0</p>

          <h2 className="text-lg font-bold text-slate-800 mt-6">1. Aceitação dos Termos</h2>
          <p>Ao acessar e utilizar o SISPNAIST, você declara ter lido, compreendido e aceitado todos os termos e condições descritos neste documento.</p>

          <h2 className="text-lg font-bold text-slate-800 mt-6">2. Definições</h2>
          <p>O SISPNAIST é um sistema de gerenciamento de segurança do trabalhador que coleta, armazena e processa dados pessoais e funcionais dos usuários para fins de gestão de saúde ocupacional, segurança do trabalho e cumprimento de obrigações legais.</p>

          <h2 className="text-lg font-bold text-slate-800 mt-6">3. Obrigações do Usuário</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fornecer dados verdadeiros, precisos e atualizados</li>
            <li>Manter a confidencialidade de suas credenciais de acesso</li>
            <li>Utilizar o sistema em conformidade com a legislação vigente</li>
            <li>Não compartilhar sua conta com terceiros</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-800 mt-6">4. Direitos do Titular (LGPD)</h2>
          <p>Nos termos da Lei nº 13.709/2018 (LGPD), você possui os seguintes direitos:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Confirmação e acesso:</strong> solicitar a confirmação da existência de tratamento de seus dados</li>
            <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados</li>
            <li><strong>Anonimização:</strong> solicitar a anonimização de dados desnecessários</li>
            <li><strong>Portabilidade:</strong> solicitar a exportação de seus dados</li>
            <li><strong>Exclusão:</strong> solicitar a exclusão/anonymização de seus dados pessoais</li>
            <li><strong>Revogação do consentimento:</strong> revogar o consentimento a qualquer momento</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-800 mt-6">5. Disposições Gerais</h2>
          <p>Estes termos podem ser atualizados a qualquer momento. O usuário será notificado sobre mudanças significativas. O uso continuado após alterações constitui aceitação dos novos termos.</p>
        </div>
      </div>
    </main>
  );
};
