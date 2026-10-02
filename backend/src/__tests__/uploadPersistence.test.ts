import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

jest.mock('../models/ArquivoUpload.js', () => {
  const mock: any = {
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    }),
    countDocuments: jest.fn().mockResolvedValue(0),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };
  return { __esModule: true, default: mock };
});

import ArquivoUpload from '../models/ArquivoUpload.js';
import {
  encryptBuffer,
  decryptBuffer,
  isEncryptionEnabled,
  resetKeyCache,
  checksumArquivo,
} from '../services/encryptionAtRest.js';
import uploadMaintenance, { UPLOAD_RETENTION_DAYS } from '../services/UploadMaintenanceService.js';

const KEY_HEX = 'a'.repeat(64);

const withKey = (key: string | undefined, fn: () => void) => {
  const previous = process.env.UPLOAD_ENCRYPTION_KEY;
  if (key === undefined) delete process.env.UPLOAD_ENCRYPTION_KEY;
  else process.env.UPLOAD_ENCRYPTION_KEY = key;
  resetKeyCache();
  try {
    fn();
  } finally {
    if (previous === undefined) delete process.env.UPLOAD_ENCRYPTION_KEY;
    else process.env.UPLOAD_ENCRYPTION_KEY = previous;
    resetKeyCache();
  }
};

describe('Criptografia em repouso (AES-256-GCM)', () => {
  it('deve ficar desabilitada quando UPLOAD_ENCRYPTION_KEY nao esta definida', () => {
    withKey(undefined, () => {
      expect(isEncryptionEnabled()).toBe(false);
    });
  });

  it('deve cifrar e decifrar preservando o conteudo original', () => {
    withKey(KEY_HEX, () => {
      expect(isEncryptionEnabled()).toBe(true);
      const original = Buffer.from('%PDF-1.4 conteudo sensivel de ASO e laudo medico');
      const cifrado = encryptBuffer(original);

      expect(cifrado.equals(original)).toBe(false);
      expect(cifrado.subarray(0, 14).toString('utf8')).toBe('SISPNAIST-ENC1');
      expect(decryptBuffer(cifrado).equals(original)).toBe(true);
    });
  });

  it('deve gerar ciphertext diferente a cada chamada (IV aleatorio)', () => {
    withKey(KEY_HEX, () => {
      const original = Buffer.from('conteudo identico');
      expect(encryptBuffer(original).equals(encryptBuffer(original))).toBe(false);
    });
  });

  it('deve rejeitar conteudo adulterado (autenticacao GCM)', () => {
    withKey(KEY_HEX, () => {
      const cifrado = encryptBuffer(Buffer.from('conteudo original'));
      cifrado[cifrado.length - 1] ^= 0xff;
      expect(() => decryptBuffer(cifrado)).toThrow();
    });
  });

  it('deve rejeitar a chave errada na descriptografia', () => {
    withKey(KEY_HEX, () => {
      const cifrado = encryptBuffer(Buffer.from('segredo'));
      try {
        process.env.UPLOAD_ENCRYPTION_KEY = 'b'.repeat(64);
        resetKeyCache();
        expect(() => decryptBuffer(cifrado)).toThrow();
      } finally {
        process.env.UPLOAD_ENCRYPTION_KEY = KEY_HEX;
        resetKeyCache();
      }
    });
  });

  it('deve ler arquivos legados em texto simples sem falhar (retrocompatibilidade)', () => {
    withKey(KEY_HEX, () => {
      const legado = Buffer.from('%PDF-1.4 arquivo gravado antes da criptografia');
      expect(decryptBuffer(legado).equals(legado)).toBe(true);
    });
  });

  it('deve recusar chave com formato invalido', () => {
    withKey('chave-curta-invalida', () => {
      expect(() => isEncryptionEnabled()).toThrow(/UPLOAD_ENCRYPTION_KEY/);
    });
  });

  it('checksumArquivo deve ignorar a camada de cifra e bater com o SHA-256 do conteudo logico', async () => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'sispna-enc-'));
    const file = path.join(dir, 'arquivo.bin');
    const conteudo = Buffer.from('conteudo integro para checksum');

    process.env.UPLOAD_ENCRYPTION_KEY = KEY_HEX;
    resetKeyCache();

    try {
      await fs.promises.writeFile(file, encryptBuffer(conteudo));
      const esperado = crypto.createHash('sha256').update(conteudo).digest('hex');
      expect(await checksumArquivo(file)).toBe(esperado);
    } finally {
      delete process.env.UPLOAD_ENCRYPTION_KEY;
      resetKeyCache();
      await fs.promises.rm(dir, { recursive: true, force: true });
    }
  });
});

describe('Retenção e integridade dos uploads', () => {
  it('retencao deve estar desabilitada por padrao (0 dias)', () => {
    expect(UPLOAD_RETENTION_DAYS).toBe(0);
  });

  it('aplicarRetencao nao deve remover nada quando desabilitada', async () => {
    const resultado = await uploadMaintenance.aplicarRetencao();
    expect(resultado.candidatos).toBe(0);
    expect(resultado.removidos).toBe(0);
    expect(ArquivoUpload.deleteOne).not.toHaveBeenCalled();
  });

  it('verificarIntegridade deve reportar total zero sem documentos', async () => {
    const relatorio = await uploadMaintenance.verificarIntegridade();
    expect(relatorio.totalDocumentos).toBe(0);
    expect(relatorio.comProblema).toBe(0);
    expect(relatorio.integros).toBe(0);
  });
});
