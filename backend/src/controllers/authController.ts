import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import authService from '../services/AuthService.js';
import { IAuthRequest } from '../middleware/auth.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  const { user, token } = await authService.login(email, senha);

  res.status(200).json({
    status: 'success',
    data: {
      user,
      token,
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
