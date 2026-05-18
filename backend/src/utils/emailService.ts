import nodemailer from 'nodemailer';
import dns from 'node:dns';
import axios from 'axios';
import config from '../config/config.js';

// Garantir prioridade de IPv4 para evitar ENETUNREACH no Render
dns.setDefaultResultOrder('ipv4first');

/**
 * Servico de Email (Híbrido)
 * Envia o link de redefinição de senha para o usuário.
 * Suporta Resend HTTP API (ideal para Produção no Render) e Gmail SMTP (ideal para Localhost).
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

  // 1. Usar Resend HTTP API se a chave estiver configurada (Garante funcionamento no Render)
  if (process.env.RESEND_API_KEY) {
    console.log('Tentando enviar e-mail via API do Resend (Porta 443 HTTPS)...');
    
    // Simplificar remetente caso use o domínio padrão de testes da Resend
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
      console.log(`E-mail de redefinição enviado com sucesso via Resend HTTP API para: ${email}`);
      return;
    } catch (resendError: any) {
      const errorMsg = resendError.response?.data || resendError.message;
      console.error('ERRO NO RESEND HTTP API:', errorMsg);
      throw new Error(`Falha ao enviar e-mail via Resend API: ${JSON.stringify(errorMsg)}`);
    }
  }

  // 2. Fallback para Gmail SMTP se nenhuma API Key do Resend estiver configurada (Ideal para Local)
  if (!config.email.user || !config.email.pass) {
    console.log('AVISO: Nenhuma chave RESEND_API_KEY foi definida e as configurações SMTP locais estão incompletas.');
    return;
  }

  console.log('Tentando enviar e-mail via Gmail SMTP (Nodemailer)...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: "Recuperação de Senha - SISPNAIST",
      html: htmlContent
    });
    console.log(`E-mail de redefinição enviado com sucesso via Gmail SMTP para: ${email}`);
  } catch (smtpError: any) {
    console.error('ERRO NO GMAIL SMTP (Nodemailer):', smtpError);
    throw new Error('O servidor de hospedagem bloqueou o envio SMTP. Recomenda-se adicionar a variável RESEND_API_KEY no painel da Render.');
  }
};
