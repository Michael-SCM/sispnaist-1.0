# Exemplos de Implementação - Como Estender o Sistema

Este guia mostra como implementar novos endpoints e funcionalidades seguindo os padrões já estabelecidos.

## 📌 Exemplo 1: API de Acidentes (CRUD Completo)

### Passo 1: Verificar o Model (Já Criado)

O model `Acidente.ts` já existe em `backend/src/models/Acidente.ts`

### Passo 2: Criar o Service

Crie `backend/src/services/AcidenteService.ts`:

```typescript
import Acidente, { IAcidenteDocument } from '../models/Acidente.js';
import { AppError } from '../middleware/errorHandler.js';
import { IAcidente, IPaginatedResponse, IPaginationOptions } from '../types/index.js';

export class AcidenteService {
  async criar(data: IAcidente): Promise<IAcidente> {
    const acidente = new Acidente(data);
    await acidente.save();
    return acidente.toObject() as IAcidente;
  }

  async obter(id: string): Promise<IAcidente> {
    const acidente = await Acidente.findById(id)
      .populate('trabalhadorId', 'nome email cpf');
    
    if (!acidente) {
      throw new AppError('Acidente não encontrado', 404);
    }
    
    return acidente.toObject() as IAcidente;
  }

  async listar(
    filtros?: {
      trabalhadorId?: string;
      status?: string;
      dataInicio?: Date;
      dataFim?: Date;
    },
    opcoes?: IPaginationOptions
  ): Promise<IPaginatedResponse<IAcidente>> {
    const page = opcoes?.page || 1;
    const limit = opcoes?.limit || 10;
    const skip = (page - 1) * limit;

    let query: any = {};
    
    if (filtros?.trabalhadorId) query.trabalhadorId = filtros.trabalhadorId;
    if (filtros?.status) query.status = filtros.status;
    if (filtros?.dataInicio || filtros?.dataFim) {
      query.dataAcidente = {};
      if (filtros?.dataInicio) query.dataAcidente.$gte = filtros.dataInicio;
      if (filtros?.dataFim) query.dataAcidente.$lte = filtros.dataFim;
    }

    const total = await Acidente.countDocuments(query);
    const dados = await Acidente.find(query)
      .populate('trabalhadorId', 'nome email')
      .sort({ dataAcidente: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: dados.map(d => d.toObject() as IAcidente),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async atualizar(id: string, data: Partial<IAcidente>): Promise<IAcidente> {
    const acidente = await Acidente.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!acidente) {
      throw new AppError('Acidente não encontrado', 404);
    }

    return acidente.toObject() as IAcidente;
  }

  async deletar(id: string): Promise<void> {
    const acidente = await Acidente.findByIdAndDelete(id);
    
    if (!acidente) {
      throw new AppError('Acidente não encontrado', 404);
    }
  }

  async obterPorTrabalhador(trabalhadorId: string): Promise<IAcidente[]> {
    const acidentes = await Acidente.find({ trabalhadorId })
      .sort({ dataAcidente: -1 });
    
    return acidentes.map(a => a.toObject() as IAcidente);
  }
}

export default new AcidenteService();
```

### Passo 3: Criar o Controller

Crie `backend/src/controllers/acidenteController.ts`:

```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import acidenteService from '../services/AcidenteService.js';
import { IAuthRequest } from '../middleware/auth.js';

export const criar = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const dados = {
    ...req.body,
    trabalhadorId: req.body.trabalhadorId || req.user?.id,
  };

  const acidente = await acidenteService.criar(dados);

  res.status(201).json({
    status: 'success',
    data: { acidente },
  });
});

export const obter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const acidente = await acidenteService.obter(id);

  res.status(200).json({
    status: 'success',
    data: { acidente },
  });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const { trabalhadorId, status, dataInicio, dataFim, page, limit } = req.query;

  const filtros = {
    trabalhadorId: trabalhadorId as string,
    status: status as string,
    dataInicio: dataInicio ? new Date(dataInicio as string) : undefined,
    dataFim: dataFim ? new Date(dataFim as string) : undefined,
  };

  const opcoes = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 10,
  };

  const resultado = await acidenteService.listar(filtros, opcoes);

  res.status(200).json({
    status: 'success',
    data: resultado,
  });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const acidente = await acidenteService.atualizar(id, req.body);

  res.status(200).json({
    status: 'success',
    data: { acidente },
  });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await acidenteService.deletar(id);

  res.status(204).send();
});

export const obterPorTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { trabalhadorId } = req.params;
  const acidentes = await acidenteService.obterPorTrabalhador(trabalhadorId);

  res.status(200).json({
    status: 'success',
    data: { acidentes },
  });
});
```

### Passo 4: Criar as Rotas

Crie `backend/src/routes/acidentes.ts`:

```typescript
import express from 'express';
import * as acidenteController from '../controllers/acidenteController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { validateRequest, validateQuery } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Validações
const acidenteSchema = Joi.object({
  dataAcidente: Joi.date().required(),
  horario: Joi.string().optional(),
  trabalhadorId: Joi.string().optional(),
  tipoAcidente: Joi.string().required(),
  descricao: Joi.string().required(),
  local: Joi.string().optional(),
  lesoes: Joi.array().items(Joi.string()).optional(),
  feriado: Joi.boolean().optional(),
  comunicado: Joi.boolean().optional(),
  status: Joi.string().valid('Aberto', 'Em Análise', 'Fechado').optional(),
});

const listarSchema = Joi.object({
  trabalhadorId: Joi.string().optional(),
  status: Joi.string().optional(),
  dataInicio: Joi.date().optional(),
  dataFim: Joi.date().optional(),
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
});

// Routes
router.post(
  '/',
  authMiddleware,
  validateRequest(acidenteSchema),
  acidenteController.criar
);

router.get(
  '/',
  authMiddleware,
  validateQuery(listarSchema),
  acidenteController.listar
);

router.get('/:id', authMiddleware, acidenteController.obter);

router.get(
  '/trabalhador/:trabalhadorId',
  authMiddleware,
  acidenteController.obterPorTrabalhador
);

router.put(
  '/:id',
  authMiddleware,
  validateRequest(acidenteSchema.min(1)),
  acidenteController.atualizar
);

router.delete('/:id', authMiddleware, authorize('admin', 'gestor'), acidenteController.deletar);

export default router;
```

### Passo 5: Registrar as Rotas no App

Em `backend/src/app.ts`, adicione:

```typescript
import acidenteRoutes from './routes/acidentes.js';

// ... após outras rotas
app.use('/api/acidentes', acidenteRoutes);
```

### Passo 6: API Client no Frontend

Crie `frontend/src/services/acidenteService.ts`:

```typescript
import api from './api.js';
import { IAcidente } from '../types/index.js';

export const acidenteService = {
  criar: async (data: IAcidente): Promise<IAcidente> => {
    const response = await api.post<{ data: { acidente: IAcidente } }>('/acidentes', data);
    return response.data.data.acidente;
  },

  obter: async (id: string): Promise<IAcidente> => {
    const response = await api.get<{ data: { acidente: IAcidente } }>(`/acidentes/${id}`);
    return response.data.data.acidente;
  },

  listar: async (filtros?: any): Promise<any> => {
    const response = await api.get('/acidentes', { params: filtros });
    return response.data.data;
  },

  atualizar: async (id: string, data: Partial<IAcidente>): Promise<IAcidente> => {
    const response = await api.put<{ data: { acidente: IAcidente } }>(`/acidentes/${id}`, data);
    return response.data.data.acidente;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/acidentes/${id}`);
  },

  obterPorTrabalhador: async (trabalhadorId: string): Promise<IAcidente[]> => {
    const response = await api.get<{ data: { acidentes: IAcidente[] } }>(`/acidentes/trabalhador/${trabalhadorId}`);
    return response.data.data.acidentes;
  },
};
```

### Passo 7: Usar no React

Crie `frontend/src/pages/Acidentes.tsx`:

```typescript
import React from 'react';
import { useAsync } from '../hooks/useAsync.js';
import { acidenteService } from '../services/acidenteService.js';
import { MainLayout } from '../layouts/MainLayout.js';
import toast from 'react-hot-toast';

export const Acidentes: React.FC = () => {
  const { data, isLoading, error } = useAsync(
    () => acidenteService.listar({ page: 1, limit: 10 }),
    true
  );

  const handleNovoAcidente = async () => {
    try {
      await acidenteService.criar({
        dataAcidente: new Date(),
        tipoAcidente: 'Típico',
        descricao: 'Teste',
        trabalhadorId: 'seu-id',
      });
      toast.success('Acidente registrado!');
    } catch (error) {
      toast.error('Erro ao registrar acidente');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Acidentes</h1>
          <button onClick={handleNovoAcidente} className="btn-primary">
            + Novo Acidente
          </button>
        </div>

        {isLoading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {data?.data && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Data</th>
                <th className="border p-2">Tipo</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((acidente: any) => (
                <tr key={acidente._id} className="border">
                  <td className="border p-2">{new Date(acidente.dataAcidente).toLocaleDateString()}</td>
                  <td className="border p-2">{acidente.tipoAcidente}</td>
                  <td className="border p-2">{acidente.status}</td>
                  <td className="border p-2">
                    <button className="text-blue-500 mr-2">Editar</button>
                    <button className="text-red-500">Deletar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};
```

### Passo 8: Adicionar Rota no App

Em `frontend/src/App.tsx`:

```typescript
import { Acidentes } from './pages/Acidentes.js';

// ... dentro de <Routes>
<Route
  path="/acidentes"
  element={
    <ProtectedRoute>
      <Acidentes />
    </ProtectedRoute>
  }
/>
```

## 📌 Exemplo 2: Adicionar Validação Customizada

No `backend/src/utils/validations.ts`, adicione:

```typescript
export const criarAcidenteSchema = Joi.object({
  dataAcidente: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.max': 'A data não pode ser no futuro',
    }),
  tipoAcidente: Joi.string()
    .valid('Típico', 'Trajeto', 'Doença Ocupacional', 'Material Biológico', 'Violência')
    .required(),
  descricao: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'Descrição deve ter pelo menos 10 caracteres',
    }),
});
```

## 📌 Exemplo 3: Adicionar Middleware Customizado

Crie `backend/src/middleware/logging.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
```

No `app.ts`:
```typescript
import { loggingMiddleware } from './middleware/logging.js';
app.use(loggingMiddleware);
```

## 🎯 Checklist para Novos Endpoints

- [ ] Model criado em `backend/src/models/`
- [ ] Service criado em `backend/src/services/`
- [ ] Controller criado em `backend/src/controllers/`
- [ ] Routes criadas em `backend/src/routes/`
- [ ] Routes registradas em `app.ts`
- [ ] Validações em `utils/validations.ts`
- [ ] API Client em `frontend/src/services/`
- [ ] Página React criada em `frontend/src/pages/`
- [ ] Rota adicionada em `frontend/src/App.tsx`
- [ ] Testado manualmente (Postman/Thunder Client)

## 🧪 Testar com Postman

1. Import esta collection:
```json
{
  "info": {
    "name": "SISPATNAIST API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:3001/api/auth/register",
            "body": {
              "cpf": "123.456.789-00",
              "nome": "Teste",
              "email": "teste@teste.com",
              "senha": "123456"
            }
          }
        }
      ]
    }
  ]
}
```

---

Siga estes exemplos para implementar novos endpoints e funcionalidades!
