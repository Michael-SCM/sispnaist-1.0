import nodemailer from 'nodemailer';
import config from '../config/config.js';

/**
 * Servico de Email (Nodemailer)
 * Envia o link de redefinição de senha para o usuário.
 */

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;
  
  // Se não houver configurações de e-mail, apenas loga no console
  if (!config.email.host || !config.email.user || !config.email.pass) {
    console.log('================================================');
    console.log('AVISO: CONFIGURAÇÕES DE EMAIL AUSENTES NO .ENV');
    console.log('SIMULAÇÃO DE ENVIO DE EMAIL');
    console.log(`Para: ${email}`);
    console.log('Assunto: Recuperação de Senha - SISPNAIST');
    console.log(`Link: ${resetLink}`);
    console.log('================================================');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true para 465, false para outras portas
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: "Recuperação de Senha - SISPNAIST",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Recuperação de Senha</h2>
          <p>Olá,</p>
          <p>Você solicitou a redefinição de sua senha no sistema SISPNAIST.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Redefinir Minha Senha
            </a>
          </div>
          <p>Se você não solicitou isso, pode ignorar este e-mail.</p>
          <p>O link expirará em 1 hora.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Este é um e-mail automático, por favor não responda.</p>
        </div>
      `,
    });
    console.log(`E-mail de recuperação enviado com sucesso para: ${email}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Falha ao enviar e-mail de recuperação.');
  }
};
