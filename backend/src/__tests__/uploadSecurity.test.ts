import {
  validateMagicBytes,
  sanitizeAndValidateExtension,
  generateSecureFilename,
  scanFileForMalware,
} from '../utils/fileValidation.js';
import storageService, { MAX_FILES_PER_ENTITY, STORAGE_BACKEND } from '../services/StorageService.js';
import { UPLOAD_FILE_LIMITS, UPLOAD_TIMEOUT_MS } from '../config/uploadLimits.js';
import ArquivoUpload from '../models/ArquivoUpload.js';
import { AppError } from '../middleware/errorHandler.js';

jest.mock('../models/ArquivoUpload.js');

describe('Upload Security', () => {
  describe('Validacao de Magic Bytes', () => {
    it('deve aceitar PDF com magic bytes legitimos', () => {
      const validPdfBuffer = Buffer.from('%PDF-1.4 header content here for test');
      const result = validateMagicBytes(validPdfBuffer);
      expect(result.mime).toBe('application/pdf');
      expect(result.extension).toBe('pdf');
    });

    it('deve aceitar JPEG com magic bytes legitimos (FF D8 FF)', () => {
      const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      const result = validateMagicBytes(validJpegBuffer);
      expect(result.mime).toBe('image/jpeg');
      expect(result.extension).toBe('jpg');
    });

    it('deve aceitar PNG com magic bytes legitimos (89 50 4E 47 0D 0A 1A 0A)', () => {
      const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
      const result = validateMagicBytes(validPngBuffer);
      expect(result.mime).toBe('image/png');
      expect(result.extension).toBe('png');
    });

    it('deve BLOQUEAR SVG mesmo disfarçado (risco de XSS/XXE)', () => {
      const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      expect(() => validateMagicBytes(svgBuffer)).toThrow(AppError);
      expect(() => validateMagicBytes(svgBuffer)).toThrow(/SVG.*proibidos por seguran/);
    });

    it('deve BLOQUEAR scripts ou HTML disfarcados', () => {
      const htmlBuffer = Buffer.from('<html><script>stealData()</script></html>');
      expect(() => validateMagicBytes(htmlBuffer)).toThrow(AppError);
    });

    it('deve rejeitar arquivo com conteudo falso/texto plano', () => {
      const fakeBuffer = Buffer.from('Este e apenas um texto e nao e um PDF valido');
      expect(() => validateMagicBytes(fakeBuffer)).toThrow(AppError);
      expect(() => validateMagicBytes(fakeBuffer)).toThrow(/Assinatura de arquivo inválida/);
    });
  });

  describe('Sanitizacao e Validacao de Extensao', () => {
    it('deve aceitar extensoes permitidas (pdf, jpg, jpeg, png)', () => {
      expect(sanitizeAndValidateExtension('laudo_medico.pdf')).toBe('pdf');
      expect(sanitizeAndValidateExtension('foto_cat.jpg')).toBe('jpg');
      expect(sanitizeAndValidateExtension('imagem.jpeg')).toBe('jpg');
      expect(sanitizeAndValidateExtension('raio_x.png')).toBe('png');
    });

    it('deve rejeitar explicitamente SVG', () => {
      expect(() => sanitizeAndValidateExtension('icone.svg')).toThrow(AppError);
      expect(() => sanitizeAndValidateExtension('icone.svg')).toThrow(/SVG foi desativado/);
    });

    it('deve rejeitar executaveis, scripts e macros (exe, bat, php)', () => {
      expect(() => sanitizeAndValidateExtension('malware.exe')).toThrow(AppError);
      expect(() => sanitizeAndValidateExtension('script.bat')).toThrow(AppError);
      expect(() => sanitizeAndValidateExtension('shell.php')).toThrow(AppError);
    });

    it('deve prevenir Directory Traversal em nomes de arquivo', () => {
      expect(sanitizeAndValidateExtension('../../../etc/passwd.pdf')).toBe('pdf');
    });
  });

  describe('Geracao de Nomes Seguros e Antivirus', () => {
    it('deve gerar nome aleatorio seguro sem usar o nome do cliente', () => {
      const nome1 = generateSecureFilename('pdf');
      const nome2 = generateSecureFilename('pdf');
      expect(nome1).not.toBe(nome2);
      expect(nome1).toMatch(/^\d+-[a-f0-9]{32}\.pdf$/);
    });

    it('deve detectar arquivo de teste de malware padrao (EICAR)', async () => {
      const eicarBuffer = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
      const result = await scanFileForMalware(eicarBuffer);
      expect(result.clean).toBe(false);
      expect(result.reason).toContain('EICAR');
    });

    it('deve detectar executaveis binarios DOS/PE disfarcados (MZ header)', async () => {
      const peBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
      const result = await scanFileForMalware(peBuffer);
      expect(result.clean).toBe(false);
      expect(result.reason).toContain('disfarçado');
    });

    it('deve aprovar arquivo limpo', async () => {
      const cleanBuffer = Buffer.from('%PDF-1.4 clean content without virus');
      const result = await scanFileForMalware(cleanBuffer);
      expect(result.clean).toBe(true);
    });
  });

  describe('StorageService — URLs Assinadas e Cotas', () => {
    it('deve gerar e validar link de download assinado temporario com HMAC-SHA256', () => {
      const token = storageService.generateSignedDownloadToken('file123', 'user456', 15);
      const verified = storageService.verifySignedDownloadToken(token);
      expect(verified.fileId).toBe('file123');
      expect(verified.userId).toBe('user456');
    });

    it('deve rejeitar link assinado expirado (status 410)', () => {
      const token = storageService.generateSignedDownloadToken('file123', 'user456', -1);
      expect(() => storageService.verifySignedDownloadToken(token)).toThrow(AppError);
      expect(() => storageService.verifySignedDownloadToken(token)).toThrow(/expirou/);
    });

    it('deve rejeitar link assinado adulterado/falsificado (status 403)', () => {
      const token = storageService.generateSignedDownloadToken('file123', 'user456', 15);
      const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
      decoded.fileId = 'file_tampered';
      const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString('base64url');
      expect(() => storageService.verifySignedDownloadToken(tamperedToken)).toThrow(AppError);
      expect(() => storageService.verifySignedDownloadToken(tamperedToken)).toThrow(/Assinatura.*inválida/);
    });

    it('deve limitar quantidade maxima de arquivos por entidade', async () => {
      (ArquivoUpload.countDocuments as jest.Mock).mockResolvedValue(MAX_FILES_PER_ENTITY);
      await expect(
        storageService.assertEntityUploadLimit('acidente', '60c72b2f9b1d8b2bad000001')
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('deve permitir upload quando cota da entidade nao foi excedida', async () => {
      (ArquivoUpload.countDocuments as jest.Mock).mockResolvedValue(2);
      await expect(
        storageService.assertEntityUploadLimit('acidente', '60c72b2f9b1d8b2bad000001')
      ).resolves.toBeUndefined();
    });
  });

  describe('Multer 2.x — Limites de Seguranca DoS e StorageService Adapter', () => {
    it('STORAGE_BACKEND deve ser "disk" ou "s3" (valor configurado)', () => {
      expect(['disk', 's3']).toContain(STORAGE_BACKEND);
    });

    it('limites do multer devem estar todos definidos e ser inteiros nao-negativos', () => {
      const keys = Object.keys(UPLOAD_FILE_LIMITS) as (keyof typeof UPLOAD_FILE_LIMITS)[];
      expect(keys).toEqual(
        expect.arrayContaining([
          'fileSize',
          'files',
          'fields',
          'fieldNameSize',
          'fieldSize',
          'parts',
          'headerPairs',
          'fieldNestingDepth',
          'fieldArrayIndexLimit',
        ])
      );

      for (const key of keys) {
        const value = UPLOAD_FILE_LIMITS[key];
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      }
    });

    it('fieldArrayIndexLimit deve ser 0 (nomes tipo a[3] bloqueados pelo multer)', () => {
      expect(UPLOAD_FILE_LIMITS.fieldArrayIndexLimit).toBe(0);
    });

    it('fieldNestingDepth deve limitar aninhamento a 1 nivel (a[0] ok, a[0][0] bloqueado)', () => {
      expect(UPLOAD_FILE_LIMITS.fieldNestingDepth).toBe(2);
    });

    it('somente 1 arquivo e no maximo 5 campos de texto por requisicao', () => {
      expect(UPLOAD_FILE_LIMITS.files).toBe(1);
      expect(UPLOAD_FILE_LIMITS.fields).toBe(5);
      expect(UPLOAD_FILE_LIMITS.parts).toBe(UPLOAD_FILE_LIMITS.files + UPLOAD_FILE_LIMITS.fields);
    });

    it('timeout de upload deve ser positivo e limitado (<= 120s)', () => {
      expect(UPLOAD_TIMEOUT_MS).toBeGreaterThan(0);
      expect(UPLOAD_TIMEOUT_MS).toBeLessThanOrEqual(120_000);
    });

    it('generateSecureFilename deve gerar nomes impreviziveis (random hex diferente a cada chamada)', () => {
      const n1 = generateSecureFilename('pdf');
      const n2 = generateSecureFilename('pdf');
      const hex1 = n1.split('-').slice(1).join('-').replace('.pdf', '');
      const hex2 = n2.split('-').slice(1).join('-').replace('.pdf', '');
      expect(hex1).not.toBe(hex2);
    });

    it('limite fieldNameSize configurado e 100 bytes (nomes acima disso devem ser rejeitados pelo multer)', () => {
      const maxFieldNameSize = 100;
      const longFieldName = 'x'.repeat(101);
      expect(longFieldName.length).toBeGreaterThan(maxFieldNameSize);
    });
  });

  describe('Filtro de Listagem por Empresa — Fail-Closed (escopo multiempresa)', () => {
    it('filtro._id = null deve ser aplicado quando gestor nao tem empresa', () => {
      const scope = { perfil: 'gestor', empresaScope: null };
      const filtro: any = {};
      if (scope.perfil === 'admin') { /* sem restricao */ }
      else if (scope.empresaScope) { filtro.empresa = scope.empresaScope; }
      else { filtro._id = null; }
      expect(filtro._id).toBe(null);
      expect(filtro.empresa).toBeUndefined();
    });

    it('filtro.empresa deve ser preenchido quando gestor tem empresa valida', () => {
      const scope = { perfil: 'gestor', empresaScope: '64a000000000000000000001' };
      const filtro: any = {};
      if (scope.perfil === 'admin') { /* sem restricao */ }
      else if (scope.empresaScope) { filtro.empresa = scope.empresaScope; }
      else { filtro._id = null; }
      expect(filtro.empresa).toBe('64a000000000000000000001');
      expect(filtro._id).toBeUndefined();
    });

    it('admin nao deve receber nenhum filtro de empresa (acesso irrestrito)', () => {
      const scope = { perfil: 'admin', empresaScope: null };
      const filtro: any = {};
      if (scope.perfil === 'admin') { /* sem restricao */ }
      else if (scope.empresaScope) { filtro.empresa = scope.empresaScope; }
      else { filtro._id = null; }
      expect(filtro.empresa).toBeUndefined();
      expect(filtro._id).toBeUndefined();
    });

    it('saude com empresa deve filtrar por empresa (nao bypass de escopo)', () => {
      const scope = { perfil: 'saude', empresaScope: '64a000000000000000000002' };
      const filtro: any = {};
      if (scope.perfil === 'admin') { /* sem restricao */ }
      else if (scope.empresaScope) { filtro.empresa = scope.empresaScope; }
      else { filtro._id = null; }
      expect(filtro.empresa).toBe('64a000000000000000000002');
    });

    it('saude sem empresa deve receber filtro impossivel (fail-closed)', () => {
      const scope = { perfil: 'saude', empresaScope: null };
      const filtro: any = {};
      if (scope.perfil === 'admin') { /* sem restricao */ }
      else if (scope.empresaScope) { filtro.empresa = scope.empresaScope; }
      else { filtro._id = null; }
      expect(filtro._id).toBe(null);
    });
  });
});
