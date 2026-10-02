import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../config/config.js';
import { AppError } from '../middleware/errorHandler.js';
import ArquivoUpload from '../models/ArquivoUpload.js';
import {
  isEncryptionEnabled,
  encryptBuffer,
  createDecryptedReadStream,
} from './encryptionAtRest.js';

// ---------------------------------------------------------------------------
// Backend de armazenamento: 'disk' (padrão, ephemeral no Render free) ou 's3'
// ---------------------------------------------------------------------------
//
// AVISO: O plano gratuito do Render usa filesystem efêmero.
// Arquivos salvos localmente SERÃO PERDIDOS em deploys/reinicializações.
// Para persistência durável, configure STORAGE_BACKEND=s3 e as variáveis S3:
//   STORAGE_S3_BUCKET, STORAGE_S3_REGION, STORAGE_S3_ENDPOINT (para R2/B2),
//   STORAGE_S3_ACCESS_KEY_ID, STORAGE_S3_SECRET_ACCESS_KEY
//
export const STORAGE_BACKEND = (process.env.STORAGE_BACKEND || 'disk') as 'disk' | 's3';

// Diretório privado de armazenamento em disco
const PRIVATE_STORAGE_DIR = path.resolve(process.cwd(), config.uploadDir || './uploads', 'private');

if (STORAGE_BACKEND === 'disk' && !fs.existsSync(PRIVATE_STORAGE_DIR)) {
  fs.mkdirSync(PRIVATE_STORAGE_DIR, { recursive: true, mode: 0o700 });
}

// Limite de arquivos por entidade para prevenir exaustão de armazenamento (DoS)
export const MAX_FILES_PER_ENTITY = 10;

export interface SignedUrlPayload {
  fileId: string;
  userId: string;
  expiresAt: number; // unix timestamp em ms
}

export class StorageService {
  /**
   * Retorna o diretório base privado do storage em disco.
   */
  getPrivateStorageDir(): string {
    return PRIVATE_STORAGE_DIR;
  }

  /**
   * Resolve o caminho completo e seguro para um arquivo armazenado em disco.
   */
  resolveFilePath(nomeArmazenado: string): string {
    const safeName = path.basename(nomeArmazenado);
    return path.join(PRIVATE_STORAGE_DIR, safeName);
  }

  /**
   * Persiste o arquivo.
   * - Backend 'disk': renomeia o arquivo temporário para o diretório privado.
   * - Backend 's3': faz upload para S3; requer mimeType e nomeOriginalSeguro.
   *
   * Retorna: caminho em disco (backend disk) ou key S3 (backend s3).
   */
  async persistFile(
    tempPath: string,
    nomeArmazenado: string,
    opts?: { mimeType?: string; nomeOriginalSeguro?: string; empresaId?: string | null }
  ): Promise<string> {
    if (STORAGE_BACKEND === 's3') {
      const { default: s3Service } = await import('./S3StorageService.js');
      return s3Service.persistFile(
        tempPath,
        nomeArmazenado,
        opts?.mimeType ?? 'application/octet-stream',
        opts?.nomeOriginalSeguro ?? nomeArmazenado,
        opts?.empresaId ?? null,
      );
    }

    // Backend disco
    const destPath = this.resolveFilePath(nomeArmazenado);

    if (isEncryptionEnabled()) {
      // Cifra em repouso (AES-256-GCM) antes de gravar no diretorio privado
      const plain = await fs.promises.readFile(tempPath);
      await fs.promises.writeFile(destPath, encryptBuffer(plain), { mode: 0o600 });
      await fs.promises.unlink(tempPath).catch(() => {});
      return destPath;
    }

    await fs.promises.rename(tempPath, destPath).catch(async () => {
      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(tempPath);
        const writeStream = fs.createWriteStream(destPath);
        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', () => resolve());
        readStream.pipe(writeStream);
      });
      await fs.promises.unlink(tempPath).catch(() => {});
    });

    return destPath;
  }

  /**
   * Remove arquivo do storage (disco ou S3).
   * No backend S3, nomeArmazenado deve ser a key S3 (caminhoArquivo no documento).
   */
  async removeFile(nomeArmazenadoOuKey: string, storageBackendDoc?: string): Promise<void> {
    const backend = storageBackendDoc ?? STORAGE_BACKEND;

    if (backend === 's3') {
      const { default: s3Service } = await import('./S3StorageService.js');
      await s3Service.removeFile(nomeArmazenadoOuKey);
      return;
    }

    try {
      const filePath = this.resolveFilePath(nomeArmazenadoOuKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (err) {
      console.error(`Erro ao remover arquivo físico: ${nomeArmazenadoOuKey}`, err);
    }
  }

  /**
   * Retorna um ReadableStream do arquivo para streaming à response.
   * Backend disco: fs.createReadStream.
   * Backend S3: stream do objeto S3.
   */
  async getFileStream(
    upload: { caminhoArquivo?: string; nomeArmazenado: string; storageBackend?: string }
  ): Promise<NodeJS.ReadableStream> {
    const backend = upload.storageBackend ?? STORAGE_BACKEND;

    if (backend === 's3') {
      const { default: s3Service } = await import('./S3StorageService.js');
      const key = upload.caminhoArquivo ?? upload.nomeArmazenado;
      return s3Service.getFileStream(key);
    }

    // Backend disco: prioriza o caminho derivado do nome aleatorio (independente
    // de host/cwd) e usa o caminho absoluto gravado no banco apenas como fallback,
    // pois ele fica obsoleto se o diretorio de trabalho ou a instancia mudarem.
    const primaryPath = this.resolveFilePath(upload.nomeArmazenado);
    const legacyPath =
      upload.caminhoArquivo && path.isAbsolute(upload.caminhoArquivo)
        ? upload.caminhoArquivo
        : null;

    const filePath = fs.existsSync(primaryPath)
      ? primaryPath
      : legacyPath && fs.existsSync(legacyPath)
        ? legacyPath
        : primaryPath;

    if (!fs.existsSync(filePath)) {
      throw new AppError('Arquivo físico não encontrado no armazenamento local', 404);
    }
    if (isEncryptionEnabled()) {
      return createDecryptedReadStream(filePath);
    }
    return fs.createReadStream(filePath);
  }

  /**
   * Gera URL de download:
   * - Backend S3: URL pré-assinada nativa (offload de banda, expiração garantida no storage).
   * - Backend disco: URL interna assinada com HMAC-SHA256 (roteada pelo servidor Node).
   */
  async generatePresignedUrl(
    fileId: string,
    userId: string,
    expiresInMinutes: number,
    s3Key?: string,
  ): Promise<string> {
    if (STORAGE_BACKEND === 's3' && s3Key) {
      const { default: s3Service } = await import('./S3StorageService.js');
      return s3Service.generatePresignedUrl(s3Key, expiresInMinutes * 60);
    }

    // Fallback: token HMAC interno
    return this.generateSignedDownloadToken(fileId, userId, expiresInMinutes);
  }

  /**
   * Verifica o limite de uploads permitidos para uma determinada entidade.
   */
  async assertEntityUploadLimit(entidade: string, entidadeId: string): Promise<void> {
    const count = await ArquivoUpload.countDocuments({ entidade, entidadeId });
    if (count >= MAX_FILES_PER_ENTITY) {
      throw new AppError(
        `Limite máximo de ${MAX_FILES_PER_ENTITY} arquivos para esta entidade atingido.`,
        400
      );
    }
  }

  /**
   * Gera uma URL/Token assinado temporário com HMAC-SHA256 (duração de 15 minutos).
   * Usado no backend disco; no S3 prefira generatePresignedUrl.
   */
  generateSignedDownloadToken(fileId: string, userId: string, expiresInMinutes: number = 15): string {
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
    const data = `${fileId}:${userId}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', config.jwtSecret)
      .update(data)
      .digest('hex');

    const tokenPayload = Buffer.from(JSON.stringify({ fileId, userId, expiresAt, sig: signature })).toString('base64url');
    return tokenPayload;
  }

  /**
   * Valida o token assinado de download e verifica se não expirou.
   */
  verifySignedDownloadToken(token: string): { fileId: string; userId: string } {
    try {
      const decodedStr = Buffer.from(token, 'base64url').toString('utf-8');
      const parsed = JSON.parse(decodedStr);

      const { fileId, userId, expiresAt, sig } = parsed;

      if (!fileId || !userId || !expiresAt || !sig) {
        throw new AppError('Link assinado inválido', 400);
      }

      if (Date.now() > expiresAt) {
        throw new AppError('O link de download expirou. Solicite um novo link.', 410);
      }

      const expectedData = `${fileId}:${userId}:${expiresAt}`;
      const expectedSignature = crypto
        .createHmac('sha256', config.jwtSecret)
        .update(expectedData)
        .digest('hex');

      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(sig, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      if (!isSignatureValid) {
        throw new AppError('Assinatura do link inválida ou adulterada', 403);
      }

      return { fileId, userId };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError('Link assinado inválido ou corrompido', 400);
    }
  }
}

export default new StorageService();
