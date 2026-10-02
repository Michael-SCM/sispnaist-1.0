import mongoose from 'mongoose';
import {
  assertCanReadWorker,
  assertCanManageWorker,
  assertCanWriteHealthRecord,
  assertCanReadHealthRecord,
  assertCanManageHealthRecord,
  assertCanReadCompany,
  assertCanManageCompany,
  assertCanReadUnit,
  assertCanReadUpload,
} from '../services/AuthorizationService.js';
import Trabalhador from '../models/Trabalhador.js';
import Empresa from '../models/Empresa.js';
import Unidade from '../models/Unidade.js';
import Acidente from '../models/Acidente.js';
import { UserScope } from '../utils/scope.js';
import { AppError } from '../middleware/errorHandler.js';

jest.mock('../models/Trabalhador.js');
jest.mock('../models/Empresa.js');
jest.mock('../models/Unidade.js');
jest.mock('../models/Acidente.js');

const EMPRESA_1 = new mongoose.Types.ObjectId().toString();
const EMPRESA_2 = new mongoose.Types.ObjectId().toString();
const UNIDADE_1 = new mongoose.Types.ObjectId().toString();
const UNIDADE_2 = new mongoose.Types.ObjectId().toString();
const WORKER_1 = new mongoose.Types.ObjectId().toString();
const WORKER_2 = new mongoose.Types.ObjectId().toString();

function makeScope(overrides: Partial<UserScope>): UserScope {
  return {
    perfil: 'admin',
    empresaScope: null,
    unidadeScope: null,
    empresaDoc: null,
    unidadeDoc: null,
    trabalhadorIds: [],
    ...overrides,
  };
}

describe('AuthorizationService — IDOR & Scope Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assertCanReadWorker', () => {
    it('deve falhar com 404 se o ID for inválido', async () => {
      const scope = makeScope({ perfil: 'admin' });
      await expect(assertCanReadWorker(scope, 'invalid-id')).rejects.toThrow(AppError);
      await expect(assertCanReadWorker(scope, 'invalid-id')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('admin: deve permitir leitura se trabalhador existe no banco', async () => {
      (Trabalhador.exists as jest.Mock).mockResolvedValue(true);
      const scope = makeScope({ perfil: 'admin' });
      await expect(assertCanReadWorker(scope, WORKER_1)).resolves.toBeUndefined();
    });

    it('admin: deve lançar 404 se trabalhador não existe no banco', async () => {
      (Trabalhador.exists as jest.Mock).mockResolvedValue(false);
      const scope = makeScope({ perfil: 'admin' });
      await expect(assertCanReadWorker(scope, WORKER_1)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('trabalhador: permite leitura do próprio ID se existir', async () => {
      (Trabalhador.exists as jest.Mock).mockResolvedValue(true);
      const scope = makeScope({ perfil: 'trabalhador', trabalhadorIds: [WORKER_1] });
      await expect(assertCanReadWorker(scope, WORKER_1)).resolves.toBeUndefined();
    });

    it('trabalhador: lança 404 para ID de outro trabalhador sem revelar existência', async () => {
      const scope = makeScope({ perfil: 'trabalhador', trabalhadorIds: [WORKER_1] });
      await expect(assertCanReadWorker(scope, WORKER_2)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('gestor: permite leitura de trabalhador da mesma empresa', async () => {
      (Trabalhador.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: WORKER_1, empresa: EMPRESA_1 }),
        }),
      });
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1 });
      await expect(assertCanReadWorker(scope, WORKER_1)).resolves.toBeUndefined();
    });

    it('gestor: lança 404 se trabalhador for de outra empresa (sem vazar se existe)', async () => {
      (Trabalhador.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: WORKER_2, empresa: EMPRESA_2 }),
        }),
      });
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1 });
      await expect(assertCanReadWorker(scope, WORKER_2)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('assertCanManageWorker', () => {
    it('trabalhador/saude: lança 403 ao tentar gerenciar trabalhador', async () => {
      const scope = makeScope({ perfil: 'trabalhador', trabalhadorIds: [WORKER_1] });
      await expect(assertCanManageWorker(scope, WORKER_1)).rejects.toMatchObject({ statusCode: 403 });
    });

    it('gestor: permite gerenciar se for da mesma empresa', async () => {
      (Trabalhador.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: WORKER_1, empresa: EMPRESA_1 }),
        }),
      });
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1 });
      await expect(assertCanManageWorker(scope, WORKER_1)).resolves.toBeUndefined();
    });
  });

  describe('assertCanReadHealthRecord / assertCanManageHealthRecord', () => {
    it('deve delegar checagem ao trabalhadorId do registro', async () => {
      (Trabalhador.exists as jest.Mock).mockResolvedValue(true);
      const scope = makeScope({ perfil: 'admin' });
      await expect(
        assertCanReadHealthRecord(scope, { trabalhadorId: WORKER_1 }, 'Acidente')
      ).resolves.toBeUndefined();
    });

    it('trabalhador: lança 403 ao tentar gerenciar registro de saúde', async () => {
      const scope = makeScope({ perfil: 'trabalhador', trabalhadorIds: [WORKER_1] });
      await expect(
        assertCanManageHealthRecord(scope, { trabalhadorId: WORKER_1 }, 'Acidente')
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('assertCanWriteHealthRecord — Escritas de Registros de Saúde & Multiempresa', () => {
    it('trabalhador: lança 403 com mensagem explícita ao tentar escrever registro', async () => {
      const scope = makeScope({ perfil: 'trabalhador', trabalhadorIds: [WORKER_1] });
      await expect(assertCanWriteHealthRecord(scope, WORKER_1, 'Acidente')).rejects.toMatchObject({
        statusCode: 403,
        message: 'A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita',
      });
    });

    it('gestor: permite registrar para trabalhador da mesma empresa', async () => {
      (Trabalhador.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: WORKER_1, empresa: EMPRESA_1 }),
        }),
      });
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1 });
      await expect(assertCanWriteHealthRecord(scope, WORKER_1, 'Acidente')).resolves.toBeUndefined();
    });

    it('gestor: lança 404 ao tentar registrar para trabalhador de outra empresa (anti-IDOR)', async () => {
      (Trabalhador.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: WORKER_2, empresa: EMPRESA_2 }),
        }),
      });
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1 });
      await expect(assertCanWriteHealthRecord(scope, WORKER_2, 'Acidente')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('gestor: lança 403 se não tiver empresaScope (fail-closed)', async () => {
      const scope = makeScope({ perfil: 'gestor', empresaScope: null });
      await expect(assertCanWriteHealthRecord(scope, WORKER_1, 'Acidente')).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('gestor com unidadeScope: lança 404 se trabalhador for de outra unidade', async () => {
      (Trabalhador.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: WORKER_1, empresa: EMPRESA_1, unidade: UNIDADE_2 }),
        }),
      });
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1, unidadeScope: UNIDADE_1 });
      await expect(assertCanWriteHealthRecord(scope, WORKER_1, 'Acidente')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('saude: permite registrar para trabalhador da mesma empresa do escopo', async () => {
      (Trabalhador.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: WORKER_1, empresa: EMPRESA_1 }),
        }),
      });
      const scope = makeScope({ perfil: 'saude', empresaScope: EMPRESA_1 });
      await expect(assertCanWriteHealthRecord(scope, WORKER_1, 'Acidente')).resolves.toBeUndefined();
    });

    it('saude: lança 404 ao tentar registrar para trabalhador fora da empresa do escopo', async () => {
      (Trabalhador.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: WORKER_2, empresa: EMPRESA_2 }),
        }),
      });
      const scope = makeScope({ perfil: 'saude', empresaScope: EMPRESA_1 });
      await expect(assertCanWriteHealthRecord(scope, WORKER_2, 'Acidente')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('saude: lança 403 se não tiver empresa vinculada (não pode ignorar escopo)', async () => {
      const scope = makeScope({ perfil: 'saude', empresaScope: null });
      await expect(assertCanWriteHealthRecord(scope, WORKER_1, 'Acidente')).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('admin: permite registrar se trabalhador existe', async () => {
      (Trabalhador.exists as jest.Mock).mockResolvedValue(true);
      const scope = makeScope({ perfil: 'admin' });
      await expect(assertCanWriteHealthRecord(scope, WORKER_1, 'Acidente')).resolves.toBeUndefined();
    });
  });

  describe('assertCanReadCompany', () => {
    it('admin: permite leitura se empresa existe no banco', async () => {
      (Empresa.exists as jest.Mock).mockResolvedValue(true);
      const scope = makeScope({ perfil: 'admin' });
      await expect(assertCanReadCompany(scope, EMPRESA_1)).resolves.toBeUndefined();
    });

    it('gestor: permite leitura da própria empresa se existe no banco', async () => {
      (Empresa.exists as jest.Mock).mockResolvedValue(true);
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1 });
      await expect(assertCanReadCompany(scope, EMPRESA_1)).resolves.toBeUndefined();
    });

    it('gestor: lança 404 para empresa de terceiros', async () => {
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1 });
      await expect(assertCanReadCompany(scope, EMPRESA_2)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('trabalhador: lança 404 para qualquer empresa', async () => {
      const scope = makeScope({ perfil: 'trabalhador' });
      await expect(assertCanReadCompany(scope, EMPRESA_1)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('assertCanManageCompany', () => {
    it('não-admin: lança 403', async () => {
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1 });
      await expect(assertCanManageCompany(scope)).rejects.toMatchObject({ statusCode: 403 });
    });

    it('admin: permite criação (sem ID)', async () => {
      const scope = makeScope({ perfil: 'admin' });
      await expect(assertCanManageCompany(scope)).resolves.toBeUndefined();
    });

    it('admin: valida existência ao gerenciar por ID', async () => {
      (Empresa.exists as jest.Mock).mockResolvedValue(true);
      const scope = makeScope({ perfil: 'admin' });
      await expect(assertCanManageCompany(scope, EMPRESA_1)).resolves.toBeUndefined();
    });
  });

  describe('assertCanReadUnit', () => {
    it('admin: permite leitura de unidade existente', async () => {
      (Unidade.exists as jest.Mock).mockResolvedValue(true);
      const scope = makeScope({ perfil: 'admin' });
      await expect(assertCanReadUnit(scope, UNIDADE_1)).resolves.toBeUndefined();
    });

    it('gestor: permite unidade da sua empresa', async () => {
      (Unidade.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: UNIDADE_1, empresa: EMPRESA_1 }),
        }),
      });
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1 });
      await expect(assertCanReadUnit(scope, UNIDADE_1)).resolves.toBeUndefined();
    });

    it('gestor: lança 404 para unidade de outra empresa', async () => {
      (Unidade.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: UNIDADE_2, empresa: EMPRESA_2 }),
        }),
      });
      const scope = makeScope({ perfil: 'gestor', empresaScope: EMPRESA_1 });
      await expect(assertCanReadUnit(scope, UNIDADE_2)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('assertCanReadUpload', () => {
    it('trabalhador: permite upload pertencente ao seu trabalhadorId', async () => {
      (Trabalhador.exists as jest.Mock).mockResolvedValue(true);
      const scope = makeScope({ perfil: 'trabalhador', trabalhadorIds: [WORKER_1] });
      await expect(
        assertCanReadUpload(scope, { entidade: 'trabalhador', entidadeId: WORKER_1 })
      ).resolves.toBeUndefined();
    });

    it('trabalhador: lança 404 para upload de outro trabalhador', async () => {
      const scope = makeScope({ perfil: 'trabalhador', trabalhadorIds: [WORKER_1] });
      await expect(
        assertCanReadUpload(scope, { entidade: 'trabalhador', entidadeId: WORKER_2 })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('resolve registros de saúde como acidente e checa trabalhadorId', async () => {
      (Acidente.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: 'acc1', trabalhadorId: WORKER_1 }),
        }),
      });
      (Trabalhador.exists as jest.Mock).mockResolvedValue(true);
      const scope = makeScope({ perfil: 'trabalhador', trabalhadorIds: [WORKER_1] });
      await expect(
        assertCanReadUpload(scope, { entidade: 'acidente', entidadeId: new mongoose.Types.ObjectId().toString() })
      ).resolves.toBeUndefined();
    });
  });
});
