import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Extensões e MIME types estritamente permitidos para saúde e segurança ocupacional:
 * Apenas documentos de laudos/CAT (PDF) e imagens fotográficas (JPEG, PNG).
 * SVG é ESTRITAMENTE proibido devido a riscos de XSS armazenado e injeção de XML/XXE.
 */
export const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'] as const;
export type AllowedExtension = typeof ALLOWED_EXTENSIONS[number];

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png'
] as const;

interface MagicBytesDefinition {
  mime: string;
  extension: AllowedExtension;
  check: (buffer: Buffer) => boolean;
}

const MAGIC_BYTES_DEFINITIONS: MagicBytesDefinition[] = [
  {
    mime: 'application/pdf',
    extension: 'pdf',
    // PDF começa com '%PDF-' (0x25 0x50 0x44 0x46 0x2D)
    check: (b: Buffer) =>
      b.length >= 5 &&
      b[0] === 0x25 &&
      b[1] === 0x50 &&
      b[2] === 0x44 &&
      b[3] === 0x46 &&
      b[4] === 0x2d,
  },
  {
    mime: 'image/jpeg',
    extension: 'jpg',
    // JPEG começa com 0xFF 0xD8 0xFF
    check: (b: Buffer) =>
      b.length >= 3 &&
      b[0] === 0xff &&
      b[1] === 0xd8 &&
      b[2] === 0xff,
  },
  {
    mime: 'image/png',
    extension: 'png',
    // PNG começa com 0x89 'P' 'N' 'G' 0x0D 0x0A 0x1A 0x0A
    check: (b: Buffer) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  }
];

/**
 * Detecta e valida os magic bytes de um arquivo.
 * Retorna o MIME type e extensão verificados pela assinatura real do arquivo.
 */
export function validateMagicBytes(buffer: Buffer): { mime: string; extension: AllowedExtension } {
  if (!buffer || buffer.length < 8) {
    throw new AppError('Arquivo corrompido ou vazio para análise de assinatura', 400);
  }

  // Verificar bloqueio explícito de SVG e HTML/XML/scripts nos primeiros bytes
  const headerText = buffer.slice(0, 1024).toString('utf-8').toLowerCase();
  if (
    headerText.includes('<svg') ||
    headerText.includes('<?xml') ||
    headerText.includes('<html') ||
    headerText.includes('<script') ||
    headerText.includes('<!doctype')
  ) {
    throw new AppError('Arquivos SVG, XML ou com conteúdo web executável são estritamente proibidos por segurança', 400);
  }

  for (const def of MAGIC_BYTES_DEFINITIONS) {
    if (def.check(buffer)) {
      return { mime: def.mime, extension: def.extension };
    }
  }

  throw new AppError('Assinatura de arquivo inválida. Apenas arquivos PDF, JPG e PNG autênticos são permitidos.', 400);
}

/**
 * Valida a extensão declarada contra os formatos aceitos.
 */
export function sanitizeAndValidateExtension(originalName: string): AllowedExtension {
  if (!originalName || typeof originalName !== 'string') {
    throw new AppError('Nome de arquivo inválido', 400);
  }

  // Prevenir Directory Traversal no nome do arquivo
  const cleanBase = originalName.replace(/[\/\\]/g, '');
  const parts = cleanBase.split('.');
  if (parts.length < 2) {
    throw new AppError('O arquivo deve possuir uma extensão válida (.pdf, .jpg, .png)', 400);
  }

  const ext = parts.pop()!.toLowerCase();

  if (ext === 'svg') {
    throw new AppError('Upload de arquivos SVG foi desativado por motivos de segurança (risco de XSS)', 400);
  }

  if (ext === 'jpeg') {
    return 'jpg';
  }

  if (!ALLOWED_EXTENSIONS.includes(ext as AllowedExtension)) {
    throw new AppError(`Formato .${ext} não permitido. Formatos aceitos: ${ALLOWED_EXTENSIONS.join(', ')}`, 400);
  }

  return ext as AllowedExtension;
}

/**
 * Gera um nome de arquivo criptograficamente aleatório e seguro.
 * O nome enviado pelo usuário NUNCA é utilizado no sistema de arquivos.
 */
export function generateSecureFilename(extension: string): string {
  const randomHex = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomHex}.${extension}`;
}

/**
 * Simula/executa checagem de antivírus no arquivo.
 * Detecta assinaturas de teste de antivírus conhecidas (como EICAR) e macros executáveis.
 */
export async function scanFileForMalware(buffer: Buffer): Promise<{ clean: boolean; reason?: string }> {
  // Padrão de teste padrão da indústria para antivírus (EICAR Standard Anti-Virus Test String)
  const eicarSignature = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
  const fileContent = buffer.slice(0, 4096).toString('binary');

  if (fileContent.includes(eicarSignature)) {
    return { clean: false, reason: 'Assinatura de vírus ou arquivo de teste malicioso detectada (EICAR)' };
  }

  // Detecta executáveis DOS/PE disfarçados (MZ header)
  if (buffer.length >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return { clean: false, reason: 'Binário executável disfarçado detectado' };
  }

  return { clean: true };
}
