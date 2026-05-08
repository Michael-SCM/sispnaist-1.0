import nodemailer from 'nodemailer';
import config from '../config/config.js';

/**
 * Servico de Email (Nodemailer)
 * Envia o link de redefinição de senha para o usuário.
 */

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;
  
  if (!config.email.host || !config.email.user || !config.email.pass) {
    console.log('AVISO: Configurações de e-mail incompletas. Link:', resetLink);
    return;
  }

  // Configuração otimizada para evitar erros de rede (ENETUNREACH)
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // SSL
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    // Forçar o uso de IPv4 para evitar erros ENETUNREACH no Render
    // @ts-ignore
    family: 4, 
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 20000, // Aumentado para 20s
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
          <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
          <p>Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
          <p>O link expirará em 1 hora.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">Este é um e-mail automático do SISPNAIST, por favor não responda.</p>
        </div>
      `,
    });
    console.log(`E-mail enviado com sucesso para: ${email}`);
  } catch (error) {
    console.error('ERRO NO NODEMAILER:', error);
    throw new Error('Erro ao enviar e-mail. Tente novamente em instantes.');
  }
};
