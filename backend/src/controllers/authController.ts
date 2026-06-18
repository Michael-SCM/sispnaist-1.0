import crypto from 'crypto';
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import authService from '../services/AuthService.js';
import { IAuthRequest } from '../middleware/auth.js';
import config from '../config/config.js';

const setAuthCookies = (res: Response, token: string, refreshToken?: string) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  res.cookie('token', token, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 min
  });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });
  }
};

const setCsrfCookie = (res: Response): string => {
  const token = crypto.randomBytes(32).toString('hex');
  const isProduction = config.nodeEnv === 'production';
  res.cookie('csrf-token', token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
};

const clearAuthCookies = (res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
  res.clearCookie('token', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, verificationLink } = await authService.register(req.body);

  const response: any = {
    status: 'success',
    message: 'Cadastro realizado com sucesso! Por favor, verifique seu e-mail para ativar sua conta.',
    data: { user },
  };

  if (verificationLink) {
    response.data.verificationLink = verificationLink;
  }

  res.status(201).json(response);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, senha);

  setAuthCookies(res, accessToken, refreshToken);
  const csrfToken = setCsrfCookie(res);

  res.status(200).json({
    status: 'success',
    data: {
      user,
      accessToken,
      refreshToken,
      csrfToken,
    },
  });
});

export const me = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Não autenticado' });
    return;
  }

  const user = await authService.me(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Não autenticado' });
    return;
  }

  const user = await authService.updateProfile(req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, dataNascimento } = req.body;
  const resetToken = await authService.forgotPassword(email, dataNascimento);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n=== LINK DE RECUPERAÇÃO DE SENHA (DESENVOLVIMENTO) ===`);
    console.log(`http://localhost:5173/reset-password?token=${resetToken}`);
    console.log(`======================================================\n`);
  }

  res.status(200).json({
    status: 'success',
    message: 'Solicitação de redefinição de senha enviada com sucesso! Verifique sua caixa de e-mail.',
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, novaSenha } = req.body;
  await authService.resetPassword(token, novaSenha);

  res.status(200).json({
    status: 'success',
    message: 'Senha atualizada com sucesso!',
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) {
    res.status(400).json({ status: 'error', message: 'Refresh token é obrigatório' });
    return;
  }

  const tokens = await authService.refreshToken(token);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'Token renovado com sucesso',
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

export const logout = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (req.user) {
    await authService.logout(req.user.id);
  }

  clearAuthCookies(res);

  res.status(200).json({
    status: 'success',
    message: 'Logout realizado com sucesso',
  });
});

export const changePassword = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Não autenticado' });
    return;
  }

  const { senhaAtual, novaSenha } = req.body;
  await authService.changePassword(req.user.id, senhaAtual, novaSenha);

  clearAuthCookies(res);

  res.status(200).json({
    status: 'success',
    message: 'Senha alterada com sucesso. Faça login novamente.',
  });
});

export const revokeAllSessions = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Não autenticado' });
    return;
  }

  await authService.revokeAllSessions(req.user.id);
  clearAuthCookies(res);

  res.status(200).json({
    status: 'success',
    message: 'Todas as sessões foram revogadas. Faça login novamente.',
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  await authService.verifyEmail(token);

  res.status(200).json({
    status: 'success',
    message: 'E-mail verificado e conta ativada com sucesso! Você já pode fazer login.',
  });
});
