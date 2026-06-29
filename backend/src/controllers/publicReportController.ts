import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import publicReportService from '../services/PublicReportService.js';

export const obterRelatorioConformidade = asyncHandler(async (_req: Request, res: Response) => {
  const relatorio = await publicReportService.obterRelatorioConformidade();

  res.json({
    status: 'success',
    data: relatorio,
  });
});
