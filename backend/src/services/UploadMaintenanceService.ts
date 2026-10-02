import fs from 'fs';
import path from 'path';
import ArquivoUpload from '../models/ArquivoUpload.js';
import storageService, { STORAGE_BACKEND } from './StorageService.js';
import { checksumArquivo, isEncryptionEnabled } from './encryptionAtRest.js';

/**
 * Manutenção do armazenamento de uploads: retenção e verificação de integridade.
 *
 * O filesystem do Render free é efêmero — a cada deploy/restart os arquivos locais
 * desaparecem, mas os documentos em MongoDB/Atlas permanecem. Este módulo detecta
 * exatamente essa divergência (referências sem arquivo correspondente) e permite
 * aplicar uma política de retenção opcional.
 */

/** Dias após os quais uploads são removidos. 0 (default) = retenção desabilitada. */
export const UPLOAD_RETENTION_DAYS = Number(process.env.UPLOAD_RETENTION_DAYS) || 0;

/** Modo dry-run quando UPLOAD_RETENTION_DRY_RUN=1 (default em produção). */
export const RETENTION_DRY_RUN = process.env.UPLOAD_RETENTION_DRY_RUN === '1';

export type MotivoIntegridade =
  | 'arquivo_ausente'
  | 'checksum_divergente'
  | 'caminho_invalido';

export interface ItemIntegridade {
  uploadId: string;
  nomeArmazenado: string;
  entidade: string;
  motivo: MotivoIntegridade;
  detalhe?: string;
}

export interface RelatorioIntegridade {
  geradoEm: string;
  storageBackend: string;
  criptografiaAtiva: boolean;
  totalDocumentos: number;
  integros: number;
  comProblema: number;
  problemas: ItemIntegridade[];
}

export interface ResultadoRetencao {
  geradoEm: string;
  retencaoDias: number;
  dryRun: boolean;
  candidatos: number;
  removidos: number;
  erros: number;
  ids: string[];
}

function resolveLocalPath(doc: {
  caminhoArquivo?: string;
  nomeArmazenado: string;
}): string | null {
  try {
    // Caminho derivado do nome aleatorio: independente de host/cwd
    const primary = storageService.resolveFilePath(doc.nomeArmazenado);
    if (fs.existsSync(primary)) return primary;
  } catch {
    // segue para o fallback
  }

  // Fallback: caminho absoluto gravado no banco (pode estar obsoleto)
  if (doc.caminhoArquivo && path.isAbsolute(doc.caminhoArquivo)) {
    return doc.caminhoArquivo;
  }

  try {
    return storageService.resolveFilePath(doc.nomeArmazenado);
  } catch {
    return null;
  }
}

class UploadMaintenanceService {
  /**
   * Compara cada documento de upload com o arquivo físico correspondente.
   *
   * Backend disco: verifica existência e recomputa o SHA-256 do conteúdo lógico
   * (decifrado quando a criptografia em repouso está ativa).
   *
   * Backend S3: verifica apenas a existência do objeto (checagem de checksum
   * exigiria baixar o objeto inteiro; use a API de versionamento/replicação do
   * provedor para integridade contínua).
   */
  async verificarIntegridade(): Promise<RelatorioIntegridade> {
    const docs = await ArquivoUpload.find({})
      .select('nomeArmazenado caminhoArquivo storageBackend checksumSha256 entidade entidadeId')
      .lean();

    const problemas: ItemIntegridade[] = [];
    let integros = 0;

    for (const doc of docs as any[]) {
      const backend = doc.storageBackend || STORAGE_BACKEND;

      if (backend === 's3') {
        const s3Key = doc.caminhoArquivo || doc.nomeArmazenado;
        const { default: s3Service } = await import('./S3StorageService.js');
        const exists = await s3Service.fileExists(s3Key);
        if (!exists) {
          problemas.push({
            uploadId: String(doc._id),
            nomeArmazenado: doc.nomeArmazenado,
            entidade: doc.entidade,
            motivo: 'arquivo_ausente',
            detalhe: `chave S3: ${s3Key}`,
          });
          continue;
        }
        integros++;
        continue;
      }

      const filePath = resolveLocalPath(doc);
      if (!filePath) {
        problemas.push({
          uploadId: String(doc._id),
          nomeArmazenado: doc.nomeArmazenado,
          entidade: doc.entidade,
          motivo: 'caminho_invalido',
        });
        continue;
      }

      if (!fs.existsSync(filePath)) {
        problemas.push({
          uploadId: String(doc._id),
          nomeArmazenado: doc.nomeArmazenado,
          entidade: doc.entidade,
          motivo: 'arquivo_ausente',
          detalhe: filePath,
        });
        continue;
      }

      if (doc.checksumSha256) {
        try {
          const atual = await checksumArquivo(filePath);
          if (atual !== doc.checksumSha256) {
            problemas.push({
              uploadId: String(doc._id),
              nomeArmazenado: doc.nomeArmazenado,
              entidade: doc.entidade,
              motivo: 'checksum_divergente',
              detalhe: `esperado ${doc.checksumSha256.slice(0, 12)}…, atual ${atual.slice(0, 12)}…`,
            });
            continue;
          }
        } catch (err: any) {
          problemas.push({
            uploadId: String(doc._id),
            nomeArmazenado: doc.nomeArmazenado,
            entidade: doc.entidade,
            motivo: 'checksum_divergente',
            detalhe: err?.message,
          });
          continue;
        }
      }

      integros++;
    }

    return {
      geradoEm: new Date().toISOString(),
      storageBackend: STORAGE_BACKEND,
      criptografiaAtiva: isEncryptionEnabled(),
      totalDocumentos: docs.length,
      integros,
      comProblema: problemas.length,
      problemas,
    };
  }

  /**
   * Remove uploads mais antigos que UPLOAD_RETENTION_DAYS.
   *
   * Desabilitada por padrão (UPLOAD_RETENTION_DAYS=0). Antes de habilitar,
   * confirme a exigência legal de guarda de documentos de saúde ocupacional
   * (NR-1/GRO exige conservação por até 20 anos) e de prazos de defesa trabalhista.
   */
  async aplicarRetencao(): Promise<ResultadoRetencao> {
    const resultado: ResultadoRetencao = {
      geradoEm: new Date().toISOString(),
      retencaoDias: UPLOAD_RETENTION_DAYS,
      dryRun: RETENTION_DRY_RUN,
      candidatos: 0,
      removidos: 0,
      erros: 0,
      ids: [],
    };

    if (UPLOAD_RETENTION_DAYS <= 0) return resultado;

    const limite = new Date(Date.now() - UPLOAD_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const candidatos = await ArquivoUpload.find({ dataCriacao: { $lt: limite } })
      .select('nomeArmazenado caminhoArquivo storageBackend entidade')
      .lean();

    resultado.candidatos = candidatos.length;
    if (candidatos.length === 0) return resultado;

    if (RETENTION_DRY_RUN) {
      resultado.ids = candidatos.map((c: any) => String(c._id));
      return resultado;
    }

    for (const doc of candidatos as any[]) {
      try {
        await storageService.removeFile(
          doc.caminhoArquivo || doc.nomeArmazenado,
          doc.storageBackend
        );
        await ArquivoUpload.deleteOne({ _id: doc._id });
        resultado.removidos++;
        resultado.ids.push(String(doc._id));
      } catch (err) {
        resultado.erros++;
        console.error('[Retenção] Falha ao remover upload', doc._id, err);
      }
    }

    return resultado;
  }

  /**
   * Remove arquivos órfãos do diretório privado em disco, ou seja, arquivos
   * físicos sem documento correspondente no banco (sobras de deploys anteriores).
   */
  async limparOrfaoEmDisco(dryRun = RETENTION_DRY_RUN): Promise<{ removidos: number; erros: number }> {
    if (STORAGE_BACKEND !== 'disk') return { removidos: 0, erros: 0 };

    const dir = storageService.getPrivateStorageDir();
    if (!fs.existsSync(dir)) return { removidos: 0, erros: 0 };

    const nomes = await fs.promises.readdir(dir);
    const conhecidos = new Set(
      (await ArquivoUpload.find({ storageBackend: 'disk' }).select('nomeArmazenado').lean()).map(
        (d: any) => d.nomeArmazenado
      )
    );

    let removidos = 0;
    let erros = 0;

    for (const nome of nomes) {
      if (nome.startsWith('.')) continue;
      if (conhecidos.has(nome)) continue;

      try {
        if (!dryRun) {
          await fs.promises.unlink(path.join(dir, nome));
        }
        removidos++;
      } catch (err) {
        erros++;
        console.error('[Órfãos] Falha ao remover', nome, err);
      }
    }

    return { removidos, erros };
  }
}

export default new UploadMaintenanceService();
