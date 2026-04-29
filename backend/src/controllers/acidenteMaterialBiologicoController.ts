import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import AcidenteMaterialBiologicoService from '../services/AcidenteMaterialBiologicoService.js';

const service = AcidenteMaterialBiologicoService;

export const criarAcidenteMaterialBiologico = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await service.criar(req.body);
  res.status(201).json(resultado);
});

export const listarAcidentesMaterialBiologico = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, trabalhadorId, acidenteId } = req.query;
  const filtros = { trabalhadorId: trabalhadorId as string, acidenteId: acidenteId as string };
  const acidentes = await service.listar(filtros);
  res.json(acidentes);
});

export const obterAcidenteMaterialBiologico = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await service.obterPorId(req.params.id);
  if (!resultado) return res.status(404).json({ message: 'Não encontrado' });
  res.json(resultado);
});

export const atualizarAcidenteMaterialBiologico = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await service.atualizar(req.params.id, req.body);
  if (!resultado) return res.status(404).json({ message: 'Não encontrado' });
  res.json(resultado);
});

export const deletarAcidenteMaterialBiologico = asyncHandler(async (req: Request, res: Response) => {
  await service.deletar(req.params.id);
  res.json({ message: 'Deletado com sucesso' });
});

// Sorologia
export const criarSorologiaPaciente = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await service.criarSorologiaPaciente(req.body);
  res.status(201).json(resultado);
});

export const obterSorologiaPaciente = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await service.obterSorologiaPaciente(req.params.id);
  if (!resultado) return res.status(404).json({ message: 'Não encontrado' });
  res.json(resultado);
});

export const criarSorologiaAcidentado = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await service.criarSorologiaAcidentado(req.body);
  res.status(201).json(resultado);
});

export const obterSorologiaAcidentado = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await service.obterSorologiaAcidentado(req.params.id);
  if (!resultado) return res.status(404).json({ message: 'Não encontrado' });
  res.json(resultado);
});

