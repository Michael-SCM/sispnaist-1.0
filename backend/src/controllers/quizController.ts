import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import Quiz from '../models/Quiz.js';
import { IAuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

export const listarQuizzes = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 20 });
  const { videoAulaId, ativo } = req.query;

  const filtro: any = {};
  if (videoAulaId) filtro.videoAulaId = videoAulaId;
  if (ativo === 'true') filtro.ativo = true;
  else if (ativo === 'false') filtro.ativo = false;

  const [quizzes, total] = await Promise.all([
    Quiz.find(filtro).sort({ ordem: 1 }).skip(skip).limit(limit).lean(),
    Quiz.countDocuments(filtro)
  ]);

  return res.status(200).json({
    data: quizzes,
    total,
    page,
    limit,
    totalPages: getPaginationResult(total, page, limit).pages
  });
});

export const obterQuiz = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  const quiz = await Quiz.findById(id);
  if (!quiz) {
    throw new AppError('Quiz não encontrado', 404);
  }

  return res.status(200).json(quiz);
});

export const obterQuizPorVideo = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { videoAulaId } = req.params;

  const quiz = await Quiz.findOne({ videoAulaId, ativo: true });
  if (!quiz) {
    throw new AppError('Nenhum quiz encontrado para esta video aula', 404);
  }

  return res.status(200).json(quiz);
});

export const criarQuiz = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const quiz = await Quiz.create(req.body);

  await logAction(req, 'CREATE', 'Quiz', quiz._id.toString(), quiz);

  return res.status(201).json(quiz);
});

export const atualizarQuiz = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  const quizAntigo = await Quiz.findById(id);
  if (!quizAntigo) {
    throw new AppError('Quiz não encontrado', 404);
  }

  const quizAtualizado = await Quiz.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!quizAtualizado) {
    throw new AppError('Quiz não encontrado', 404);
  }

  const mudancas = compararDados(quizAntigo, quizAtualizado);
  await logAction(req, 'UPDATE', 'Quiz', id, mudancas);

  return res.status(200).json(quizAtualizado);
});

export const deletarQuiz = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  const quiz = await Quiz.findById(id);
  if (!quiz) {
    throw new AppError('Quiz não encontrado', 404);
  }

  await Quiz.findByIdAndDelete(id);
  await logAction(req, 'DELETE', 'Quiz', id, quiz);

  return res.status(204).send();
});
