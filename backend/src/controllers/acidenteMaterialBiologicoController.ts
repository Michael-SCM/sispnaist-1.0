import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import acidenteMaterialBiologicoService from '../services/AcidenteMaterialBiologicoService.js';
import { IAcidenteMaterialBiologico } from '../types/index.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  const registro = await acidenteMaterialBiologicoService.criar(req.body);

  res.status(201).json({
    status: 'success',
    data: { registro },
  });
});

export const obter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const registro = await acidenteMaterialBiologicoService.obter(id);

  res.status(200).json({
    status: 'success',
    data: { registro },
  });
});

export const obterPorAcidente = asyncHandler(async (req: Request, res: Response) => {
  const { acidenteId } = req.params;
  const registro = await acidenteMaterialBiologicoService.obterPorAcidente(acidenteId);

  res.status(200).json({
    status: 'success',
    data: { registro },
  });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {\n  const page = parseInt(req.query.page as string) || 1;\n  const limit = parseInt(req.query.limit as string) || 10;\n\n  const filtros = {\n    acidenteId: req.query.acidenteId as string | undefined,\n    tipoExposicao: req.query.tipoExposicao as string | undefined,\n    agente: req.query.agente as string | undefined,\n  };\n\n  const { registros, total, pages } = await acidenteMaterialBiologicoService.listar(\n    page,\n    limit,\n    filtros\n  );\n\n  res.status(200).json({\n    status: 'success',\n    data: {\n      registros,\n      paginacao: {\n        page,\n        limit,\n        total,\n        pages,\n      },\n    },\n  });\n});\n\nexport const seedData = asyncHandler(async (req: Request, res: Response) => {\n  const seedData = [\n    {\n      acidenteId: '69f118874e944b9a76c225ae', // ID do acidente que está tentando acessar\n      tipoExposicao: 'percutaneous',\n      materialOrganico: 'Sangue',\n      agente: 'HIV/HCV/HBV',\n      equipamentoProtecao: 'Luvas perfuradas',\n      sorologiaPaciente: 'Negativo',\n      sorologiaAcidentado: 'Negativo',\n      conduta: 'Profilaxia pós-exposição',\n      usoEpi: false,\n      sorologiaFonte: true,\n      acompanhamentoPrep: true,\n      descricaoAcompanhamentoPrep: 'Iniciado PEP dia 01/04/2026',\n      dataReavaliacao: new Date('2026-04-15'),\n      efeitoColateralPermanece: false,\n      ativo: true\n    }\n  ];\n\n  for (const data of seedData) {\n    await acidenteMaterialBiologicoService.criar(data);\n  }\n\n  res.status(201).json({\n    status: 'success',\n    message: 'Dados de teste criados com sucesso!',\n    count: seedData.length\n  });\n});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const registro = await acidenteMaterialBiologicoService.atualizar(id, req.body);

  res.status(200).json({
    status: 'success',
    data: { registro },
  });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await acidenteMaterialBiologicoService.deletar(id);

  res.status(204).send();
});
