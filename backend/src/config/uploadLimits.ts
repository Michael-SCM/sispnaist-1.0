import config from './config.js';

/**
 * Limites de segurança do multer 2.x (defesa contra DoS multipart).
 *
 * Ref: aviso oficial do Express/OpenJS de 31/08/2026 — versões anteriores a
 * 2.3.0 são vulneráveis a nomes de campo multipart especialmente construídos,
 * com possibilidade de crash do processo.
 *
 * Todos os valores precisam ser inteiros não-negativos ou Infinity:
 * `multer/lib/validate-limits.js` lança TypeError caso contrário.
 */
export const UPLOAD_FILE_LIMITS = {
  fileSize: config.maxFileSize || 5 * 1024 * 1024, // tamanho máximo por arquivo
  files: 1,                // quantidade de arquivos por requisição
  fields: 5,               // quantidade de campos de texto não-arquivo
  fieldNameSize: 100,      // tamanho do nome do campo (bytes)
  fieldSize: 2048,         // tamanho do valor do campo (bytes)
  parts: 6,                // total de partes multipart (fields + files)
  headerPairs: 100,        // pares de header MIME por parte
  fieldNestingDepth: 2,    // a[0] aceito, a[0][0] rejeitado
  fieldArrayIndexLimit: 0, // nenhum índice numérico de array aceito (a[3] bloqueado)
} as const;

/**
 * Timeout total do envio do arquivo (ms).
 * O multer não expõe timeout próprio, então é aplicado por middleware.
 */
export const UPLOAD_TIMEOUT_MS = Number(process.env.UPLOAD_TIMEOUT_MS) || 30 * 1000;
