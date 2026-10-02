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
  // GET /api/uploads - Listar uploads filtrados por empresa (fail-closed)
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 20 });
      const { entidade, entidadeId } = req.query;

      // Filtro de escopo por empresa (fail-closed para gestor/saude sem empresa)
      const scope = await buildUserScope((req as IAuthRequest).user!);

      const filtro: any = {};
      if (entidade) filtro.entidade = entidade;
      if (entidadeId) filtro.entidadeId = entidadeId;

      if (scope.perfil === 'admin') {
        // Admin: sem restrição de empresa
      } else if (scope.empresaScope) {
        // gestor/saude: só uploads da própria empresa
        filtro.empresa = scope.empresaScope;
      } else {
        // gestor/saude sem empresa válida: filtro impossível (fail-closed)
        filtro._id = null;
      }

      const [uploads, total] = await Promise.all([
        ArquivoUpload.find(filtro)
          .select('-data -caminhoArquivo')
          .sort({ dataCriacao: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ArquivoUpload.countDocuments(filtro),
      ]);

      // Auditoria de LISTAGEM de metadados (distinta do audit de download de arquivo)
      await logAction(req, 'READ', 'ArquivoUpload', 'listagem', {
        total,
        page,
        limit,
        filtros: Object.fromEntries(
          Object.entries(filtro).map(([k, v]) => [k, String(v)])
        ),
      });

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

      const upload = await ArquivoUpload.findById(id).select('-data -caminhoArquivo');

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

      // Sanitizar nome original para apresentação segura (sem caminhos ou caracteres de injeção)
      const nomeOriginalSeguro = path.basename(file.originalname).replace(/[\r\n"']/g, '');

      // 8. Persistência em storage privado isolado
      const caminhoArquivo = await storageService.persistFile(tempPath, nomeArmazenado, {
        mimeType: verifiedMime,
        nomeOriginalSeguro,
        empresaId: scope.empresaScope,
      });

      // 9. Criação do documento no banco — inclui campo empresa para filtro fail-closed
      const upload = await ArquivoUpload.create({
        entidade,
        entidadeId,
        empresa: scope.empresaScope,
        nomeOriginal: nomeOriginalSeguro,
        nomeArmazenado,
        caminhoArquivo,
        storageBackend: process.env.STORAGE_BACKEND || 'disk',
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
        await storageService.removeFile(
          upload.caminhoArquivo || upload.nomeArmazenado,
          upload.storageBackend,
        );
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

      const upload = await ArquivoUpload.findById(id).select('-data -caminhoArquivo').lean();

      if (!upload) {
        throw new AppError('Upload não encontrado ou acesso negado', 404);
      }

      // Verificação de escopo
      await assertCanReadUpload(scope, { entidade: upload.entidade, entidadeId: upload.entidadeId.toString() });

      const expiresInMinutes = 15;
      // Se backend S3, gera URL pré-assinada nativa (offload de banda)
      // Se backend disco, gera token HMAC interno
      const s3Key = upload.storageBackend === 's3' ? (upload.caminhoArquivo ?? undefined) : undefined;
      const downloadToken = await storageService.generatePresignedUrl(
        id, user.id, expiresInMinutes, s3Key
      );

      // Auditoria: emissão de link temporário (eventodistinto do download efetivo)
      await logAction(req, 'READ', 'ArquivoUpload', id, {
        evento: 'gerar-url-assinada',
        entidade: upload.entidade,
        entidadeId: upload.entidadeId,
        validadeSegundos: expiresInMinutes * 60,
        storageBackend: upload.storageBackend || 'disk',
      });

      // Para S3: downloadToken já é a URL completa; para disco: montar rota interna
      const isS3Url = downloadToken.startsWith('http');
      const downloadUrl = isS3Url
        ? downloadToken
        : `/api/uploads/download-signed?token=${downloadToken}`;

      return res.status(200).json({
        status: 'success',
        data: {
          downloadUrl,
          expiresInSeconds: expiresInMinutes * 60,
          nomeOriginal: upload.nomeOriginal,
          storageBackend: upload.storageBackend || 'disk',
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

      const { fileId, userId } = storageService.verifySignedDownloadToken(token);

      const upload = await ArquivoUpload.findById(fileId);
      if (!upload) {
        throw new AppError('Arquivo não encontrado', 404);
      }

      // Auditoria do download por link assinado (sem sessão JWT, identidade vem do token)
      await logAction(
        { user: { id: userId }, ip: req.ip, get: (h: string) => req.get(h) },
        'READ',
        'ArquivoUpload',
        fileId,
        {
          evento: 'download-url-assinada',
          entidade: upload.entidade,
          entidadeId: upload.entidadeId,
          nomeOriginal: upload.nomeOriginal,
        }
      );

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

      // Auditoria de download do arquivo (distinta da listagem de metadados)
      await logAction(req, 'READ', 'ArquivoUpload', id, {
        evento: 'download',
        entidade: upload.entidade,
        entidadeId: upload.entidadeId,
        nomeOriginal: upload.nomeOriginal,
        mimeType: upload.mimeType,
        tamanho: upload.tamanho,
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

      // Auditoria de visualização inline (entrega de conteúdo, auditada por conta própria)
      await logAction(req, 'READ', 'ArquivoUpload', id, {
        evento: 'visualizar-inline',
        entidade: upload.entidade,
        entidadeId: upload.entidadeId,
        nomeOriginal: upload.nomeOriginal,
        mimeType: upload.mimeType,
      });

      this.enviarArquivoResposta(res, upload, 'inline');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envia o arquivo por streaming a partir do storage privado com cabeçalhos de segurança estritos.
   * Suporta backends 'disk' e 's3'.
   */
  private async enviarArquivoResposta(res: Response, upload: any, disposition: 'attachment' | 'inline') {
    const nomeSeguro = upload.nomeOriginal.replace(/[\r\n"']/g, '');

    // Headers de proteção contra ataques baseados em downloads e MIME sniffing
    res.setHeader('Content-Type', upload.mimeType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(nomeSeguro)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('Cache-Control', 'private, max-age=300');

    try {
      // Streaming via StorageService (suporta disco e S3)
      const fileStream = await storageService.getFileStream(upload);
      fileStream.pipe(res);
    } catch (err: any) {
      // Compatibilidade com arquivos legados gravados em memória/banco
      if (upload.data && upload.data.length > 0) {
        res.send(upload.data);
        return;
      }
      throw err;
    }
  }
}

export default new UploadController();
