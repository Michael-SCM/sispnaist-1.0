import nodemailer from 'nodemailer';
import dns from 'node:dns';
import axios from 'axios';
import config from '../config/config.js';
// Garantir prioridade de IPv4 para evitar ENETUNREACH no Render
dns.setDefaultResultOrder('ipv4first');
import { promisify } from 'util';
const resolveMx = promisify(dns.resolveMx);
/**
 * Valida em tempo real via DNS se o domínio do e-mail possui registros MX configurados
 * e está apto a receber mensagens.
 */
export const validateEmailDomain = async (email) => {
    const domain = email.split('@')[1];
    if (!domain)
        return false;
    try {
        const records = await resolveMx(domain);
        return records && records.length > 0;
    }
    catch (error) {
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
export const sendResetPasswordEmail = async (email, token) => {
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
            console.log(`E-mail de redefinição enviado com sucesso via Brevo HTTP API para: ${email}`);
            return;
        }
        catch (brevoError) {
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
            console.log(`E-mail de redefinição enviado com sucesso via Resend HTTP API para: ${email}`);
            return;
        }
        catch (resendError) {
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
    }
    catch (smtpError) {
        console.error('ERRO NO GMAIL SMTP (Nodemailer):', smtpError);
        throw new Error('O servidor de hospedagem bloqueou o envio SMTP. Configure BREVO_API_KEY para enviar sem restrições no Render.');
    }
};
/**
 * Envia o link de verificação de e-mail ao criar conta.
 * Suporta as mesmas APIs: Brevo, Resend e Gmail SMTP.
 */
export const sendVerificationEmail = async (email, token) => {
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
            console.log(`E-mail de verificação enviado com sucesso via Brevo HTTP API para: ${email}`);
            return;
        }
        catch (brevoError) {
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
            console.log(`E-mail de verificação enviado com sucesso via Resend HTTP API para: ${email}`);
            return;
        }
        catch (resendError) {
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
            subject: "Confirmação de E-mail - SISPNAIST",
            html: htmlContent
        });
        console.log(`E-mail de verificação enviado com sucesso via Gmail SMTP para: ${email}`);
    }
    catch (smtpError) {
        console.error('ERRO NO GMAIL SMTP (Nodemailer):', smtpError);
        throw new Error('O servidor de hospedagem bloqueou o envio SMTP. Configure BREVO_API_KEY para enviar sem restrições no Render.');
    }
};
