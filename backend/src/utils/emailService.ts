import nodemailer from 'nodemailer';
import dns from 'node:dns';
import axios from 'axios';
import config from '../config/config.js';

// Garantir prioridade de IPv4 para evitar ENETUNREACH no Render
dns.setDefaultResultOrder('ipv4first');

import { promisify } from 'util';
const resolveMx = promisify(dns.resolveMx);

// Transporter reutilizável (criado uma vez, usado em todas as chamadas)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user || '',
    pass: config.email.pass || '',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Valida em tempo real via DNS se o domínio do e-mail possui registros MX configurados
 * e está apto a receber mensagens.
 */
export const validateEmailDomain = async (email: string): Promise<boolean> => {
  const domain = email.split('@')[1];
  if (!domain) return false;

  try {
    const records = await resolveMx(domain);
    return records && records.length > 0;
  } catch (error: any) {
    // Se o erro for de domínio não encontrado (ENOTFOUND) ou sem registros de e-mail (ENODATA)
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return false;
    }
    // Em caso de timeout ou problemas de rede local no dev, permite prosseguir para não travar testes offline
    return true;
  }
};


/**
 * Servico de Email (Híbrido de Alta Compatibilidade)
 * Envia o link de redefinição de senha para o usuário.
 * Suporta:
 * 1. Brevo HTTP API (Ideal para Render: envia para qualquer e-mail do mundo sem domínio próprio)
 * 2. Resend HTTP API (Excelente para Render se possuir domínio próprio)
 * 3. Gmail SMTP (Nodemailer, ideal para Localhost)
 */
export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;
  
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Recuperação de Senha</h2>
      <p>Olá,</p>
      <p>Você solicitou a redefinição de sua senha no sistema <strong>SISPNAIST</strong>.</p>
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Redefinir Minha Senha
        </a>
      </div>
      <p>Se você não solicitou isso, pode ignorar este e-mail.</p>
      <p>O link expirará em 1 hora.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Este é um e-mail automático, por favor não responda.</p>
    </div>
  `;

  // 1. Usar Brevo HTTP API se a chave estiver configurada (Garante funcionamento no Render para qualquer e-mail sem domínio)
  if (process.env.BREVO_API_KEY) {
    console.log('Tentando enviar e-mail via API da Brevo (Porta 443 HTTPS)...');
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: {
          name: 'SISPNAIST',
          email: config.email.user || 'sispnaist@gmail.com'
        },
        to: [
          {
            email: email
          }
        ],
        subject: "Recuperação de Senha - SISPNAIST",
        htmlContent: htmlContent
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log(`E-mail de redefinição enviado com sucesso via Brevo HTTP API para: ${email}`);
      }
      return;
    } catch (brevoError: any) {
      const errorMsg = brevoError.response?.data || brevoError.message;
      console.error('ERRO NO BREVO HTTP API:', errorMsg);
      throw new Error(`Falha ao enviar e-mail via Brevo API: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 2. Usar Resend HTTP API se a chave estiver configurada
  if (process.env.RESEND_API_KEY) {
    console.log('Tentando enviar e-mail via API do Resend (Porta 443 HTTPS)...');
    
    const fromEmail = config.email.from && config.email.from.includes('gmail')
      ? 'SISPNAIST <onboarding@resend.dev>'
      : config.email.from || 'SISPNAIST <onboarding@resend.dev>';

    try {
      await axios.post('https://api.resend.com/emails', {
        from: fromEmail,
        to: email,
        subject: "Recuperação de Senha - SISPNAIST",
        html: htmlContent
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log(`E-mail de redefinição enviado com sucesso via Resend HTTP API para: ${email}`);
      }
      return;
    } catch (resendError: any) {
      const errorMsg = resendError.response?.data || resendError.message;
      console.error('ERRO NO RESEND HTTP API:', errorMsg);
      throw new Error(`Falha ao enviar e-mail via Resend API: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 3. Fallback para Gmail SMTP se nenhuma API Key estiver configurada (Ideal para Local)
  if (!config.email.user || !config.email.pass) {
    console.log('AVISO: Nenhuma chave de API (Brevo/Resend) configurada e credenciais SMTP locais incompletas.');
    return;
  }

  console.log('Tentando enviar e-mail via Gmail SMTP (Nodemailer)...');

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: "Recuperação de Senha - SISPNAIST",
      html: htmlContent
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`E-mail de redefinição enviado com sucesso via Gmail SMTP para: ${email}`);
    }
  } catch (smtpError: any) {
    console.error(`ERRO NO GMAIL SMTP (Nodemailer) para ${email}:`, smtpError);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Falha ao enviar e-mail de redefinição via Gmail SMTP: ${smtpError?.message || 'erro desconhecido'}`);
    }
  }
};

/**
 * Envia o link de verificação de e-mail ao criar conta.
 * Suporta as mesmas APIs: Brevo, Resend e Gmail SMTP.
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${config.frontendUrl}/verify-email?token=${token}`;
  
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Confirmação de E-mail</h2>
      <p>Olá,</p>
      <p>Seja bem-vindo ao sistema <strong>SISPNAIST</strong>!</p>
      <p>Para concluir a criação de sua conta e começar a utilizar o sistema, clique no botão abaixo para verificar seu endereço de e-mail:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" 
           style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Confirmar Meu E-mail
        </a>
      </div>
      <p>Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:</p>
      <p style="word-break: break-all; color: #2563eb;">${verificationLink}</p>
      <p>Este link expirará em 24 horas.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Este é um e-mail automático, por favor não responda.</p>
    </div>
  `;

  // 1. Usar Brevo HTTP API se a chave estiver configurada
  if (process.env.BREVO_API_KEY) {
    console.log('Tentando enviar e-mail de verificação via API da Brevo (Porta 443 HTTPS)...');
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: {
          name: 'SISPNAIST',
          email: config.email.user || 'sispnaist@gmail.com'
        },
        to: [
          {
            email: email
          }
        ],
        subject: "Confirmação de E-mail - SISPNAIST",
        htmlContent: htmlContent
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log(`E-mail de verificação enviado com sucesso via Brevo HTTP API para: ${email}`);
      }
      return;
    } catch (brevoError: any) {
      const errorMsg = brevoError.response?.data || brevoError.message;
      console.error('ERRO NO BREVO HTTP API:', errorMsg);
      throw new Error(`Falha ao enviar e-mail de verificação via Brevo API: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 2. Usar Resend HTTP API se a chave estiver configurada
  if (process.env.RESEND_API_KEY) {
    console.log('Tentando enviar e-mail de verificação via API do Resend (Porta 443 HTTPS)...');
    
    const fromEmail = config.email.from && config.email.from.includes('gmail')
      ? 'SISPNAIST <onboarding@resend.dev>'
      : config.email.from || 'SISPNAIST <onboarding@resend.dev>';

    try {
      await axios.post('https://api.resend.com/emails', {
        from: fromEmail,
        to: email,
        subject: "Confirmação de E-mail - SISPNAIST",
        html: htmlContent
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log(`E-mail de verificação enviado com sucesso via Resend HTTP API para: ${email}`);
      }
      return;
    } catch (resendError: any) {
      const errorMsg = resendError.response?.data || resendError.message;
      console.error('ERRO NO RESEND HTTP API:', errorMsg);
      throw new Error(`Falha ao enviar e-mail de verificação via Resend API: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 3. Fallback para Gmail SMTP se nenhuma API Key estiver configurada (Ideal para Local)
  if (!config.email.user || !config.email.pass) {
    console.log('AVISO: Nenhuma chave de API (Brevo/Resend) configurada e credenciais SMTP locais incompletas.');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Nenhum serviço de envio de e-mail (Brevo/Resend/SMTP) foi configurado nas variáveis de ambiente do servidor.');
    }
    return;
  }

  console.log('Tentando enviar e-mail de verificação via Gmail SMTP (Nodemailer)...');

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: "Confirmação de E-mail - SISPNAIST",
      html: htmlContent
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`E-mail de verificação enviado com sucesso via Gmail SMTP para: ${email}`);
    }
  } catch (smtpError: any) {
    console.error(`ERRO NO GMAIL SMTP (Nodemailer) para ${email}:`, smtpError);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Falha ao enviar e-mail de verificação via Gmail SMTP: ${smtpError?.message || 'erro desconhecido'}`);
    }
  }
};

/**
 * Envia o código de autenticação de dois fatores (OTP de 6 dígitos) por e-mail.
 * Segue a mesma estratégia híbrida: Brevo HTTP API -> Resend HTTP API -> Gmail SMTP.
 */
export const send2FACodigoEmail = async (email: string, codigo: string) => {
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Código de Verificação</h2>
      <p>Olá,</p>
      <p>Use o código abaixo para concluir sua solicitação no sistema <strong>SISPNAIST</strong>:</p>
      <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a;">${codigo}</span>
      </div>
      <p>Este código expira em <strong>5 minutos</strong>.</p>
      <p>Se você não realizou esta solicitação, ignore este e-mail e considere alterar sua senha.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Este é um e-mail automático, por favor não responda.</p>
    </div>
  `;

  // 1. Usar Brevo HTTP API se a chave estiver configurada
  if (process.env.BREVO_API_KEY) {
    console.log('Tentando enviar código 2FA via API da Brevo (Porta 443 HTTPS)...');
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: {
          name: 'SISPNAIST',
          email: config.email.user || 'sispnaist@gmail.com'
        },
        to: [
          {
            email: email
          }
        ],
        subject: "Seu código de verificação - SISPNAIST",
        htmlContent: htmlContent
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }).then((r) => {
        const msgId = r?.data?.messageId || 'n/a';
        const parts = msgId ? String(msgId).split('@') : [];
        console.log(`Brevo aceitou o código 2FA para ${email} — messageId: ${parts[0] || msgId}`);
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Código 2FA enviado com sucesso via Brevo HTTP API para: ${email}`);
      }
      return;
    } catch (brevoError: any) {
      const errorMsg = brevoError.response?.data || brevoError.message;
      console.error('ERRO NO BREVO HTTP API:', errorMsg);
      throw new Error(`Falha ao enviar código 2FA via Brevo API: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 2. Usar Resend HTTP API se a chave estiver configurada
  if (process.env.RESEND_API_KEY) {
    console.log('Tentando enviar código 2FA via API do Resend (Porta 443 HTTPS)...');

    const fromEmail = config.email.from && config.email.from.includes('gmail')
      ? 'SISPNAIST <onboarding@resend.dev>'
      : config.email.from || 'SISPNAIST <onboarding@resend.dev>';

    try {
      await axios.post('https://api.resend.com/emails', {
        from: fromEmail,
        to: email,
        subject: "Seu código de verificação - SISPNAIST",
        html: htmlContent
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Código 2FA enviado com sucesso via Resend HTTP API para: ${email}`);
      }
      return;
    } catch (resendError: any) {
      const errorMsg = resendError.response?.data || resendError.message;
      console.error('ERRO NO RESEND HTTP API:', errorMsg);
      throw new Error(`Falha ao enviar código 2FA via Resend API: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 3. Fallback para Gmail SMTP se nenhuma API Key estiver configurada
  if (!config.email.user || !config.email.pass) {
    console.log('AVISO: Nenhuma chave de API (Brevo/Resend) configurada e credenciais SMTP locais incompletas.');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Nenhum serviço de envio de e-mail (Brevo/Resend/SMTP) foi configurado nas variáveis de ambiente do servidor.');
    }
    return;
  }

  console.log('Tentando enviar código 2FA via Gmail SMTP (Nodemailer)...');

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: "Seu código de verificação - SISPNAIST",
      html: htmlContent
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Código 2FA enviado com sucesso via Gmail SMTP para: ${email}`);
    }
  } catch (smtpError: any) {
    console.error(`ERRO NO GMAIL SMTP (Nodemailer) para ${email}:`, smtpError);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Falha ao enviar código 2FA via Gmail SMTP: ${smtpError?.message || 'erro desconhecido'}`);
    }
  }
};

/**
 * Envia um e-mail de alerta/notificação para um destinatário.
 * Segue a mesma estratégia híbrida: Brevo HTTP API -> Resend HTTP API -> Gmail SMTP.
 */
export const sendAlertaEmail = async (
  to: string,
  dados: {
    titulo: string;
    descricao: string;
    nivel: string;
    tipo: string;
    link?: string;
    data?: string;
  }
): Promise<void> => {
  const nivelCor = dados.nivel === 'alto' ? '#dc2626' : dados.nivel === 'medio' ? '#d97706' : '#2563eb';
  const nivelLabel = dados.nivel.charAt(0).toUpperCase() + dados.nivel.slice(1);
  const link = dados.link || `${config.frontendUrl}/alertas`;
  const dataHora = dados.data || new Date().toLocaleString('pt-BR');

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="background-color: ${nivelCor}; color: #fff; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
        <strong>${nivelLabel.toUpperCase()} - Alerta do SISPNAIST</strong>
      </div>
      <h2 style="color: #111; margin: 0 0 8px;">${dados.titulo}</h2>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">
        Tipo: ${dados.tipo} &nbsp;•&nbsp; Nível: ${nivelLabel} &nbsp;•&nbsp; ${dataHora}
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-line;">${dados.descricao}</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${link}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Ver Alertas
        </a>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Este é um e-mail automático gerado pelo sistema de alertas do SISPNAIST. Por favor, não responda.</p>
    </div>
  `;

  // 1. Brevo HTTP API
  if (process.env.BREVO_API_KEY) {
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: 'SISPNAIST', email: config.email.user || 'sispnaist@gmail.com' },
        to: [{ email: to }],
        subject: `[Alerta] ${dados.titulo}`,
        htmlContent,
      }, {
        headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
      });
      return;
    } catch (brevoError: any) {
      const errorMsg = brevoError.response?.data || brevoError.message;
      console.error('ERRO BREVO:', errorMsg);
      throw new Error(`Falha ao enviar alerta via Brevo: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 2. Resend HTTP API
  if (process.env.RESEND_API_KEY) {
    const fromEmail =
      config.email.from && config.email.from.includes('gmail')
        ? 'SISPNAIST <onboarding@resend.dev>'
        : config.email.from || 'SISPNAIST <onboarding@resend.dev>';
    try {
      await axios.post('https://api.resend.com/emails', {
        from: fromEmail,
        to,
        subject: `Alerta — ${dados.titulo}`,
        html: htmlContent,
      }, {
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      });
      return;
    } catch (resendError: any) {
      const errorMsg = resendError.response?.data || resendError.message;
      console.error('Erro RESEND:', errorMsg);
      throw new Error(`Falha ao enviar alerta via Resend: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 3. Fallback Gmail SMTP
  if (!config.email.user || !config.email.pass) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Nenhum serviço de envio de e-mail (Brevo/Resend/SMTP) configurado para o sistema de alertas.');
    }
    return;
  }

  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject: `Alerta — ${dados.titulo}`,
      html: htmlContent,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Alerta enviado via Gmail SMTP para: ${to}`);
    }
  } catch (smtpError: any) {
    console.error(`ERRO NO GMAIL SMTP (Nodemailer) para ${to}:`, smtpError);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Falha ao enviar alerta via Gmail SMTP: ${smtpError?.message || 'erro desconhecido'}`);
    }
  }
};

const labelTipoAlerta = (tipo: string): string =>
  ({
    PICO_ACIDENTES: 'Pico de Acidentes',
    VACINA_VENCENDO: 'Vacina Vencendo',
    NAO_CONFORMIDADE: 'Não Conformidade',
    MONITORAMENTO_CRITICO: 'Monitoramento Crítico',
  }[tipo] || tipo);

/**
 * Gera o HTML de um resumo diário de alertas (lista de itens agregados).
 */
export const gerarHtmlResumoAlertas = (
  itens: {
    titulo: string;
    descricao: string;
    nivel: string;
    tipo: string;
    data?: string;
  }[],
  link?: string
): string => {
  const linhas = itens
    .map((item) => {
      const nivelLabel = item.nivel.charAt(0).toUpperCase() + item.nivel.slice(1);
      const dataHora = item.data || new Date().toLocaleString('pt-BR');
      return `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #eee; vertical-align: top;">
            <div style="font-weight: bold; color: #111; margin-bottom: 4px;">${item.titulo}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 6px;">
              Tipo: ${labelTipoAlerta(item.tipo)} &nbsp;•&nbsp; Nível: <strong>${nivelLabel}</strong> &nbsp;•&nbsp; ${dataHora}
            </div>
            <div style="color: #374151; font-size: 14px; line-height: 1.5; white-space: pre-line;">${item.descricao}</div>
          </td>
        </tr>`;
    })
    .join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="background-color: #dc2626; color: #fff; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
        <strong>RESUMO DIÁRIO DE ALERTAS - SISPNAIST</strong>
      </div>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Olá, abaixo estão os <strong>${itens.length}</strong> alerta(s) novos que requerem sua atenção:
      </p>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        ${linhas}
      </table>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${link || `${config.frontendUrl}/alertas`}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Ver Alertas
        </a>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Este é um e-mail automático gerado pelo sistema de alertas do SISPNAIST. Por favor, não responda.</p>
    </div>
  `;
};

/**
 * Envia o resumo diário de alertas para um destinatário.
 * Segue a mesma estratégia híbrida: Brevo HTTP API -> Resend HTTP API -> Gmail SMTP.
 */
export const sendAlertaResumoEmail = async (
  to: string,
  itens: {
    titulo: string;
    descricao: string;
    nivel: string;
    tipo: string;
    data?: string;
  }[],
  link?: string
): Promise<void> => {
  const htmlContent = gerarHtmlResumoAlertas(itens, link);
  const qtd = itens.length;
  const subject = `Resumo diário de alertas (${qtd} novo${qtd > 1 ? 's' : ''}) - SISPNAIST`;

  // 1. Brevo HTTP API
  if (process.env.BREVO_API_KEY) {
    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'SISPNAIST', email: config.email.user || 'sispnaist@gmail.com' },
          to: [{ email: to }],
          subject,
          htmlContent,
        },
        { headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' } }
      );
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Resumo diário de alertas enviado via Brevo para: ${to} (${qtd} item(ns))`);
      }
      return;
    } catch (brevoError: any) {
      const errorMsg = brevoError.response?.data || brevoError.message;
      console.error('ERRO BREVO no resumo diário:', errorMsg);
      throw new Error(`Falha ao enviar resumo diário via Brevo: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 2. Resend HTTP API
  if (process.env.RESEND_API_KEY) {
    const fromEmail =
      config.email.from && config.email.from.includes('gmail')
        ? 'SISPNAIST <onboarding@resend.dev>'
        : config.email.from || 'SISPNAIST <onboarding@resend.dev>';
    try {
      await axios.post(
        'https://api.resend.com/emails',
        { from: fromEmail, to, subject, html: htmlContent },
        { headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' } }
      );
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Resumo diário de alertas enviado via Resend para: ${to} (${qtd} item(ns))`);
      }
      return;
    } catch (resendError: any) {
      const errorMsg = resendError.response?.data || resendError.message;
      console.error('Erro RESEND no resumo diário:', errorMsg);
      throw new Error(`Falha ao enviar resumo diário via Resend: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 3. Fallback Gmail SMTP
  if (!config.email.user || !config.email.pass) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Nenhum serviço de envio de e-mail (Brevo/Resend/SMTP) configurado para o resumo diário.');
    }
    return;
  }

  try {
    await transporter.sendMail({ from: config.email.from, to, subject, html: htmlContent });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Resumo diário de alertas enviado via Gmail SMTP para: ${to} (${qtd} item(ns))`);
    }
  } catch (smtpError: any) {
    console.error(`ERRO NO GMAIL SMTP (Nodemailer) no resumo diário para ${to}:`, smtpError);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Falha ao enviar resumo diário via Gmail SMTP: ${smtpError?.message || 'erro desconhecido'}`);
    }
  }
};
