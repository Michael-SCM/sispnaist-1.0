/**
 * Servico de Email (Placeholder)
 * Atualmente apenas loga o link no console, pois não há um servidor SMTP configurado.
 */

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  console.log('================================================');
  console.log('SIMULAÇÃO DE ENVIO DE EMAIL');
  console.log(`Para: ${email}`);
  console.log('Assunto: Recuperação de Senha - SISPNAIST');
  console.log(`Link: ${resetLink}`);
  console.log('================================================');

  // No futuro, implementar com Nodemailer:
  /*
  const transporter = nodemailer.createTransport({ ... });
  await transporter.sendMail({
    from: '"SISPNAIST" <noreply@sispnaist.com>',
    to: email,
    subject: "Recuperação de Senha",
    html: `<p>Clique no link para redefinir sua senha: <a href="${resetLink}">${resetLink}</a></p>`
  });
  */
};
