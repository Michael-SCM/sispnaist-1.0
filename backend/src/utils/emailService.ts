import nodemailer from 'nodemailer';
import config from '../config/config.js';

/**
 * Servico de Email (Nodemailer)
 * Envia o link de redefinição de senha para o usuário.
 */

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;
  
  if (!config.email.user || !config.email.pass) {
    console.log('AVISO: Configurações de e-mail incompletas no .env');
    return;
  }

  // Tentativa usando o modo 'service' que é mais resiliente em alguns servidores
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
      html: `
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
      `,
    });
    console.log(`E-mail enviado via Gmail Service para: ${email}`);
  } catch (error) {
    console.error('ERRO NO NODEMAILER (MODO SERVICE):', error);
    // Se falhar, vamos tentar o método manual com porta 2525 (que às vezes é aberta)
    throw new Error('O servidor de hospedagem bloqueou o envio de e-mail. Recomenda-se usar SendGrid ou similar.');
  }
};
