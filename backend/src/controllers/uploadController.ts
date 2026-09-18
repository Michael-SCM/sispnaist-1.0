import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import ArquivoUpload from '../models/ArquivoUpload.js';
import { AppError } from '../middleware/errorHandler.js';
import { IAuthRequest } from '../middleware/auth.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';
import { buildUserScope } from '../utils/scope.js';
import { assertCanReadUpload } from '../services/AuthorizationService.js';
import storageService from '../services/StorageService.js';
import {
  validateMagicBytes,
  sanitizeAndValidateExtension,
  generateSecureFilename,
  scanFileForMalware,
} from '../utils/fileValidation.js';
import { logAction } from '../utils/auditLogger.js';

class UploadController {
  // GET /api/uploads - Listar uploads
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 20 });
      const { entidade, entidadeId } = req.query;

      const filtro: any = {};
      if (entidade) filtro.entidade = entidade;
      if (entidadeId) filtro.entidadeId = entidadeId;

      const [uploads, total] = await Promise.all([
        ArquivoUpload.find(filtro).select('-data').sort({ dataCriacao: -1 }).skip(skip).limit(limit).lean(),
        ArquivoUpload.countDocuments(filtro),
      ]);

      return res.status(200).json({
        data: uploads,
        total,
        page,
        limit,
        totalPages: getPaginationResult(total, page, limit).pages,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/uploads/:id - Obter upload específico
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      const upload = await ArquivoUpload.findById(id).select('-data');

      if (!upload) {
        throw new AppError('Upload não encontrado ou acesso negado', 404);
      }

      // Verificação centralizada de escopo anti-IDOR
      await assertCanReadUpload(scope, { entidade: upload.entidade, entidadeId: upload.entidadeId.toString() });

      return res.status(200).json(upload);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/uploads - Registrar upload (armazenamento privado em disco via stream)
  async criar(req: IAuthRequest, res: Response, next: NextFunction) {
    const file = (req as any).file;

    try {
      const { entidade, entidadeId, descricao } = req.body;

      if (!file) {
        throw new AppError('Nenhum arquivo enviado', 400);
      }

      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (!entidade || !entidadeId) {
        throw new AppError('Entidade e identificador da entidade são obrigatórios', 400);
      }

      // 1. Verificar escopo da entidade associada antes de processar
      const scope = await buildUserScope(req.user);
      await assertCanReadUpload(scope, { entidade, entidadeId });

      // 2. Limite de cota por entidade (prevenção de DoS de armazenamento)
      await storageService.assertEntityUploadLimit(entidade, entidadeId);

      // 3. Validação estrita da extensão declarada
      const declaredExt = sanitizeAndValidateExtension(file.originalname);

      // 4. Ler cabeçalho do arquivo em disco para validação de Magic Bytes
      const tempPath = file.path;
      const buffer = await fs.promises.readFile(tempPath);
      const { mime: verifiedMime, extension: verifiedExt } = validateMagicBytes(buffer);

      // Confirmar que extensão bate com o conteúdo real
      if (declaredExt !== verifiedExt && !(declaredExt === 'jpeg' && verifiedExt === 'jpg')) {
        throw new AppError(
          `Extensão do arquivo (.${declaredExt}) não coincide com o conteúdo detectado (.${verifiedExt})`,
          400
        );
      }

      // 5. Escaneamento antivírus / malware
      const malwareScan = await scanFileForMalware(buffer);
      if (!malwareScan.clean) {
        throw new AppError(`Upload bloqueado pelo filtro de segurança: ${malwareScan.reason}`, 400);
      }

      // 6. Geração de nome aleatório criptográfico seguro (NUNCA usar o nome enviado pelo cliente no disco)
      const nomeArmazenado = generateSecureFilename(verifiedExt);

      // 7. Cálculo de checksum SHA-256 para integridade
      const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');

      // 8. Persistência em storage privado isolado (sem manter no MongoDB)
      const caminhoArquivo = await storageService.persistFile(tempPath, nomeArmazenado);

      // Sanitizar nome original para apresentação segura (sem caminhos ou caracteres de injeção)
      const nomeOriginalSeguro = path.basename(file.originalname).replace(/[\r\n"']/g, '');

      // 9. Criação do documento no banco
      const upload = await ArquivoUpload.create({
        entidade,
        entidadeId,
        nomeOriginal: nomeOriginalSeguro,
        nomeArmazenado,
        caminhoArquivo,
        checksumSha256,
        mimeType: verifiedMime,
        tamanho: file.size,
        descricao,
        enviadoPor: req.user.id,
      });

      // 10. Registro de auditoria
      await logAction(req as Request, 'CREATE', 'ArquivoUpload', upload._id.toString(), {
        entidade,
        entidadeId,
        nomeArmazenado,
        tamanho: file.size,
        mimeType: verifiedMime,
        checksumSha256,
      });

      const responsePayload = upload.toObject();
      delete responsePayload.data;

      return res.status(201).json(responsePayload);
    } catch (error) {
      // Se houver erro, certificar-se de limpar arquivo temporário do disco
      if (file?.path && fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
      next(error);
    }
  }

  // DELETE /api/uploads/:id - Deletar upload
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      const upload = await ArquivoUpload.findById(id);

      if (!upload) {
        throw new AppError('Upload não encontrado ou acesso negado', 404);
      }

      // Verificação centralizada de escopo anti-IDOR
      await assertCanReadUpload(scope, { entidade: upload.entidade, entidadeId: upload.entidadeId.toString() });

      // Remoção do arquivo físico no storage privado
      if (upload.nomeArmazenado) {
        await storageService.removeFile(upload.nomeArmazenado);
      }

      await upload.deleteOne();

      // Registro de auditoria
      await logAction(req, 'DELETE', 'ArquivoUpload', id, {
        entidade: upload.entidade,
        entidadeId: upload.entidadeId,
        nomeArmazenado: upload.nomeArmazenado,
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // GET /api/uploads/:id/signed-url - Gerar URL assinada curta temporária (15 minutos)
  async gerarUrlAssinada(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as IAuthRequest).user!;
      const scope = await buildUserScope(user);

      const upload = await ArquivoUpload.findById(id).select('-data');

      if (!upload) {
        throw new AppError('Upload não encontrado ou acesso negado', 404);
      }

      // Verificação de escopo
      await assertCanReadUpload(scope, { entidade: upload.entidade, entidadeId: upload.entidadeId.toString() });

      const token = storageService.generateSignedDownloadToken(id, user.id, 15);
      const downloadUrl = `/api/uploads/download-signed?token=${token}`;

      return res.status(200).json({
        status: 'success',
        data: {
          downloadUrl,
          expiresInSeconds: 15 * 60,
          nomeOriginal: upload.nomeOriginal,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/uploads/download-signed - Download por URL assinada temporária
  async downloadAssinado(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        throw new AppError('Token de download assinado obrigatório', 400);
      }

      const { fileId } = storageService.verifySignedDownloadToken(token);

      const upload = await ArquivoUpload.findById(fileId);
      if (!upload) {
        throw new AppError('Arquivo não encontrado', 404);
      }

      this.enviarArquivoResposta(res, upload, 'attachment');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/uploads/:id/download - Download direto autenticado
  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      const upload = await ArquivoUpload.findById(id);

      if (!upload) {
        throw new AppError('Upload não encontrado ou acesso negado', 404);
      }

      // Verificação centralizada de escopo anti-IDOR
      await assertCanReadUpload(scope, { entidade: upload.entidade, entidadeId: upload.entidadeId.toString() });

      // Registro de auditoria
      await logAction(req, 'READ', 'ArquivoUpload', id, {
        entidade: upload.entidade,
        nomeOriginal: upload.nomeOriginal,
      });

      this.enviarArquivoResposta(res, upload, 'attachment');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/uploads/:id/view - Visualizar arquivo inline autenticado
  async visualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      const upload = await ArquivoUpload.findById(id);

      if (!upload) {
        throw new AppError('Upload não encontrado ou acesso negado', 404);
      }

      // Verificação centralizada de escopo anti-IDOR
      await assertCanReadUpload(scope, { entidade: upload.entidade, entidadeId: upload.entidadeId.toString() });

      this.enviarArquivoResposta(res, upload, 'inline');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envia o arquivo por streaming a partir do storage privado com cabeçalhos de segurança estritos.
   */
  private enviarArquivoResposta(res: Response, upload: any, disposition: 'attachment' | 'inline') {
    const nomeSeguro = upload.nomeOriginal.replace(/[\r\n"']/g, '');

    // Headers de proteção contra ataques baseados em downloads e MIME sniffing
    res.setHeader('Content-Type', upload.mimeType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(nomeSeguro)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('Cache-Control', 'private, max-age=300');

    // 1. Tentar servir via stream do storage privado
    const filePath = upload.caminhoArquivo || storageService.resolveFilePath(upload.nomeArmazenado);
    if (filePath && fs.existsSync(filePath)) {
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
      return;
    }

    // 2. Compatibilidade com arquivos legados gravados em memória/banco
    if (upload.data && upload.data.length > 0) {
      res.send(upload.data);
      return;
    }

    throw new AppError('Arquivo físico não encontrado no armazenamento seguro', 404);
  }
}

export default new UploadController();
