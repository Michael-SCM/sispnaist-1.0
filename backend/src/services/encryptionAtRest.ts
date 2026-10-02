import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Readable } from 'stream';
import config from '../config/config.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Criptografia em repouso (AES-256-GCM) para o backend de storage em disco.
 *
 * O backend S3 usa ServerSideEncryption do próprio provedor; este módulo cobre
 * o backend 'disk', que no Render free persiste em um filesystem efêmero.
 *
 * Ativação: defina UPLOAD_ENCRYPTION_KEY com 32 bytes em hex (64 chars) ou base64.
 * Sem a chave, os arquivos são gravados em texto simples (compatibilidade retroativa).
 *
 * Formato do arquivo cifrado:
 *   MAGIC (14) || IV (12) || AUTH_TAG (16) || CIPHERTEXT
 *
 * AVISO: a perda da chave torna TODOS os arquivos cifrados irrecuperáveis.
 * Guarde-a em um gerenciador de segredos, não no repositório.
 */

const ENC_MAGIC = Buffer.from('SISPNAIST-ENC1', 'utf8');
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

let cachedKey: Buffer | null | undefined;

function loadKey(): Buffer | null {
  if (cachedKey !== undefined) return cachedKey;

  const raw = (process.env.UPLOAD_ENCRYPTION_KEY || '').trim();

  if (!raw) {
    cachedKey = null;
    return null;
  }

  let key: Buffer | null = null;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, 'hex');
  } else {
    try {
      const decoded = Buffer.from(raw, 'base64');
      if (decoded.length === 32) key = decoded;
    } catch {
      key = null;
    }
  }

  if (!key || key.length !== 32) {
    throw new AppError(
      'UPLOAD_ENCRYPTION_KEY invalida: use 32 bytes em hex (64 caracteres) ou base64.',
      500
    );
  }

  cachedKey = key;
  return key;
}

/** True quando a criptografia em repouso está habilitada. */
export function isEncryptionEnabled(): boolean {
  return loadKey() !== null;
}

/** Cifra um buffer com AES-256-GCM e aplica o cabeçalho mágico. */
export function encryptBuffer(plain: Buffer): Buffer {
  const key = loadKey();
  if (!key) return plain;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([ENC_MAGIC, iv, tag, ciphertext]);
}

/**
 * Decifra um buffer. Se não possuir o cabeçalho mágico, devolve o conteúdo
 * original (arquivo legado gravado antes da ativação da criptografia).
 */
export function decryptBuffer(data: Buffer): Buffer {
  if (data.length < ENC_MAGIC.length || !data.subarray(0, ENC_MAGIC.length).equals(ENC_MAGIC)) {
    return data;
  }

  const key = loadKey();
  if (!key) {
    throw new AppError(
      'Arquivo cifrado encontrado mas UPLOAD_ENCRYPTION_KEY nao esta configurada.',
      500
    );
  }

  const ivStart = ENC_MAGIC.length;
  const tagStart = ivStart + IV_LENGTH;
  const dataStart = tagStart + TAG_LENGTH;

  if (data.length < dataStart) {
    throw new AppError('Arquivo cifrado corrompido (cabecalho incompleto).', 500);
  }

  const iv = data.subarray(ivStart, tagStart);
  const tag = data.subarray(tagStart, dataStart);
  const ciphertext = data.subarray(dataStart);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new AppError(
      'Falha na autenticacao do arquivo cifrado (chave incorreta ou dados adulterados).',
      500
    );
  }
}

/**
 * Lê um arquivo do disco decifrando-o quando necessário e devolve um stream.
 */
export async function createDecryptedReadStream(filePath: string): Promise<NodeJS.ReadableStream> {
  const raw = await fs.promises.readFile(filePath);
  return Readable.from([decryptBuffer(raw)]);
}

/** SHA-256 do conteúdo lógico (decifrado) de um arquivo em disco. */
export async function checksumArquivo(filePath: string): Promise<string> {
  const raw = await fs.promises.readFile(filePath);
  return crypto.createHash('sha256').update(decryptBuffer(raw)).digest('hex');
}

/** Caminho absoluto do diretório privado de storage em disco. */
export function privateStorageDir(): string {
  return path.resolve(process.cwd(), config.uploadDir || './uploads', 'private');
}

/** Limpa o cache de chave (usado em testes). */
export function resetKeyCache(): void {
  cachedKey = undefined;
}
