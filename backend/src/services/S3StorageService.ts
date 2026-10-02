/**
 * S3StorageService -- Adapter de armazenamento S3-compatível para SISPNAIST.
 *
 * Suporta qualquer endpoint S3-compatible:
 *   - AWS S3
 *   - Cloudflare R2 (STORAGE_S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com)
 *   - Backblaze B2
 *   - MinIO (self-hosted)
 *
 * Configuração mínima via variáveis de ambiente:
 *   STORAGE_BACKEND=s3
 *   STORAGE_S3_BUCKET=sispnaist-uploads
 *   STORAGE_S3_REGION=auto          (ou us-east-1 para AWS)
 *   STORAGE_S3_ENDPOINT=https://... (obrigatório para R2/B2/MinIO; omitir para AWS)
 *   STORAGE_S3_ACCESS_KEY_ID=...
 *   STORAGE_S3_SECRET_ACCESS_KEY=...
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import { AppError } from '../middleware/errorHandler.js';

function createS3Client(): S3Client {
  const region = process.env.STORAGE_S3_REGION || 'auto';
  const endpoint = process.env.STORAGE_S3_ENDPOINT;

  const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
    region,
    credentials: {
      accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY || '',
    },
  };

  if (endpoint) {
    clientConfig.endpoint = endpoint;
    clientConfig.forcePathStyle = false;
  }

  return new S3Client(clientConfig);
}

export class S3StorageService {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = createS3Client();
    this.bucket = process.env.STORAGE_S3_BUCKET || 'sispnaist-uploads';
  }

  buildKey(nomeArmazenado: string, empresaId?: string | null): string {
    const safeNome = nomeArmazenado.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const prefix = empresaId ? `uploads/${empresaId}` : 'uploads/_shared';
    return `${prefix}/${safeNome}`;
  }

  async persistFile(
    tempPath: string,
    nomeArmazenado: string,
    mimeType: string,
    nomeOriginalSeguro: string,
    empresaId?: string | null,
  ): Promise<string> {
    const key = this.buildKey(nomeArmazenado, empresaId);
    const fileStream = fs.createReadStream(tempPath);
    const stats = await fs.promises.stat(tempPath);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: fileStream,
          ContentType: mimeType,
          ContentLength: stats.size,
          ContentDisposition: `attachment; filename="${nomeOriginalSeguro}"`,
          ServerSideEncryption: 'AES256',
          Metadata: {
            'original-name': encodeURIComponent(nomeOriginalSeguro),
            'empresa-id': empresaId ?? 'shared',
          },
        }),
      );
    } finally {
      await fs.promises.unlink(tempPath).catch(() => {});
    }

    return key;
  }

  async generatePresignedUrl(key: string, expiresIn: number = 900): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );

    if (!response.Body) {
      throw new AppError('Arquivo não encontrado no armazenamento S3', 404);
    }

    return response.Body as unknown as NodeJS.ReadableStream;
  }

  async removeFile(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (err) {
      console.error('[S3StorageService] Erro ao remover objeto S3:', err);
    }
  }
}

export default new S3StorageService();
