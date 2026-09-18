import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../config/config.js';
import { AppError } from '../middleware/errorHandler.js';
import ArquivoUpload from '../models/ArquivoUpload.js';

// Diretório privado de armazenamento, fora de qualquer diretório estático público
const PRIVATE_STORAGE_DIR = path.resolve(process.cwd(), config.uploadDir || './uploads', 'private');

// Garantir que o diretório privado existe
if (!fs.existsSync(PRIVATE_STORAGE_DIR)) {
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
   * Retorna o diretório base privado do storage.
   */
  getPrivateStorageDir(): string {
    return PRIVATE_STORAGE_DIR;
  }

  /**
   * Resolve o caminho completo e seguro para um arquivo armazenado.
   */
  resolveFilePath(nomeArmazenado: string): string {
    const safeName = path.basename(nomeArmazenado);
    return path.join(PRIVATE_STORAGE_DIR, safeName);
  }

  /**
   * Salva o arquivo a partir do arquivo temporário do multer usando stream/rename,
   * evitando manter o buffer completo em memória RAM.
   */
  async persistFile(tempPath: string, nomeArmazenado: string): Promise<string> {
    const destPath = this.resolveFilePath(nomeArmazenado);

    await fs.promises.rename(tempPath, destPath).catch(async () => {
      // Se estiver em partições/discos diferentes, faz cópia via stream e deleta temp
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
   * Deleta arquivo do disco de forma segura.
   */
  async removeFile(nomeArmazenado: string): Promise<void> {
    try {
      const filePath = this.resolveFilePath(nomeArmazenado);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (err) {
      console.error(`Erro ao remover arquivo físico: ${nomeArmazenado}`, err);
    }
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
