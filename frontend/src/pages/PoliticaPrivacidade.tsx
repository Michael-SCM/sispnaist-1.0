import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentTitle } from '../hooks/useDocumentTitle.js';

export const PoliticaPrivacidade: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <DocumentTitle title="Política de Privacidade" />
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <Link to="/register" className="text-blue-600 hover:text-blue-700 text-sm font-medium">&larr; Voltar</Link>
        <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-6">Política de Privacidade</h1>

        <div className="prose prose-slate max-w-none space-y-4 text-sm text-slate-600">
          <p><strong>Última atualização:</strong> Junho de 2026 | <strong>Versão:</strong> 1.0</p>

          <h2 className="text-lg font-bold text-slate-800 mt-6">1. Dados Coletados</h2>
          <p>Coletamos os seguintes dados pessoais:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Dados cadastrais:</strong> nome, CPF, e-mail, data de nascimento, telefone</li>
            <li><strong>Dados funcionais:</strong> matrícula, cargo, função, lotação, vínculo empregatício</li>
            <li><strong>Dados de saúde:</strong> acidentes de trabalho, doenças ocupacionais, vacinações, exposições a riscos</li>
            <li><strong>Dados de violência:</strong> ocorrências de violência no ambiente de trabalho</li>
            <li><strong>Dados de autenticação:</strong> hash de senha, tokens de sessão, logs de acesso</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-800 mt-6">2. Finalidade do Tratamento</h2>
          <p>Seus dados são tratados para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gestão de saúde ocupacional e segurança do trabalho</li>
            <li>Cumprimento de obrigações legais e regulatórias</li>
            <li>Geração de relatórios e indicadores de saúde do trabalhador</li>
            <li>Notificação de agravos ao SINAN (Sistema de Informação de Agravos de Notificação)</li>
            <li>Auditoria e rastreabilidade de ações no sistema</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-800 mt-6">3. Compartilhamento de Dados</h2>
          <p>Seus dados podem ser compartilhados com:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Órgãos de saúde pública:</strong> para cumprimento de notificação compulsória</li>
            <li><strong>Gestores municipais/estaduais:</strong> para administração do quadro funcional</li>
            <li><strong>Auditorias internas e externas:</strong> para conformidade legal</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-800 mt-6">4. Retenção de Dados</h2>
          <p>Seus dados são mantidos:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Dados ativos:</strong> enquanto durar o vínculo com a organização</li>
            <li><strong>Dados de ex-funcionários:</strong> anonimizados após 5 anos do desligamento</li>
            <li><strong>Logs de auditoria:</strong> retidos por 10 anos conforme legislação</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-800 mt-6">5. Segurança</h2>
          <p>Adotamos as seguintes medidas de segurança:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Criptografia de senhas com bcrypt</li>
            <li>Tokens JWT com expiração curta</li>
            <li>Proteção CSRF</li>
            <li>Rate limiting contra ataques de força bruta</li>
            <li>Headers de segurança (Helmet)</li>
            <li>Todas as conexões via HTTPS</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-800 mt-6">6. Encarregado (DPO)</h2>
          <p>Para exercer seus direitos como titular, entre em contato pelo e-mail: <a href="mailto:dpo@sispnaist.gov.br" className="text-blue-600 underline">dpo@sispnaist.gov.br</a></p>

          <h2 className="text-lg font-bold text-slate-800 mt-6">7. Seus Direitos</h2>
          <p>Você pode a qualquer momento:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Solicitar a exportação de seus dados na página <strong>Minha Conta</strong></li>
            <li>Solicitar a exclusão/anonymização de sua conta</li>
            <li>Revogar seu consentimento</li>
          </ul>
        </div>
      </div>
    </main>
  );
};
