import {
  validateMagicBytes,
  sanitizeAndValidateExtension,
  generateSecureFilename,
  scanFileForMalware,
} from '../utils/fileValidation.js';
import storageService, { MAX_FILES_PER_ENTITY } from '../services/StorageService.js';
import ArquivoUpload from '../models/ArquivoUpload.js';
import { AppError } from '../middleware/errorHandler.js';

jest.mock('../models/ArquivoUpload.js');

describe('Upload Security — Validação de Magic Bytes, Formatos e URLs Assinadas', () => {
  describe('Validação de Magic Bytes (Assinaturas Binárias)', () => {
    it('deve aceitar PDF com magic bytes legítimos (%PDF-)', () => {
      const validPdfBuffer = Buffer.from('%PDF-1.4 header content here for test');
      const result = validateMagicBytes(validPdfBuffer);
      expect(result.mime).toBe('application/pdf');
      expect(result.extension).toBe('pdf');
    });

    it('deve aceitar JPEG com magic bytes legítimos (FF D8 FF)', () => {
      const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      const result = validateMagicBytes(validJpegBuffer);
      expect(result.mime).toBe('image/jpeg');
      expect(result.extension).toBe('jpg');
    });

    it('deve aceitar PNG com magic bytes legítimos (89 50 4E 47 0D 0A 1A 0A)', () => {
      const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
      const result = validateMagicBytes(validPngBuffer);
      expect(result.mime).toBe('image/png');
      expect(result.extension).toBe('png');
    });

    it('deve BLOQUEAR SVG mesmo que disfarçado (risco de XSS/XXE)', () => {
      const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      expect(() => validateMagicBytes(svgBuffer)).toThrow(AppError);
      expect(() => validateMagicBytes(svgBuffer)).toThrow(/SVG.*proibidos por segurança/);
    });

    it('deve BLOQUEAR scripts ou HTML disfarçados', () => {
      const htmlBuffer = Buffer.from('<html><script>stealData()</script></html>');
      expect(() => validateMagicBytes(htmlBuffer)).toThrow(AppError);
    });

    it('deve rejeitar arquivo com extensão .pdf mas conteúdo falso/texto plano', () => {
      const fakeBuffer = Buffer.from('Este é apenas um texto e não é um PDF válido');
      expect(() => validateMagicBytes(fakeBuffer)).toThrow(AppError);
      expect(() => validateMagicBytes(fakeBuffer)).toThrow(/Assinatura de arquivo inválida/);
    });
  });

  describe('Sanitização e Validação de Extensão Declarada', () => {
    it('deve aceitar extensões permitidas (pdf, jpg, jpeg, png)', () => {
      expect(sanitizeAndValidateExtension('laudo_medico.pdf')).toBe('pdf');
      expect(sanitizeAndValidateExtension('foto_cat.jpg')).toBe('jpg');
      expect(sanitizeAndValidateExtension('imagem.jpeg')).toBe('jpg');
      expect(sanitizeAndValidateExtension('raio_x.png')).toBe('png');
    });

    it('deve rejeitar explicitamente SVG', () => {
      expect(() => sanitizeAndValidateExtension('icone.svg')).toThrow(AppError);
      expect(() => sanitizeAndValidateExtension('icone.svg')).toThrow(/SVG foi desativado/);
    });

    it('deve rejeitar executáveis, scripts e macros (exe, bat, php, docm)', () => {
      expect(() => sanitizeAndValidateExtension('malware.exe')).toThrow(AppError);
      expect(() => sanitizeAndValidateExtension('script.bat')).toThrow(AppError);
      expect(() => sanitizeAndValidateExtension('shell.php')).toThrow(AppError);
    });

    it('deve prevenir Directory Traversal em nomes de arquivo', () => {
      expect(sanitizeAndValidateExtension('../../../etc/passwd.pdf')).toBe('pdf');
    });
  });

  describe('Geração de Nomes Seguros e Antivírus', () => {
    it('deve gerar nome aleatório seguro sem usar o nome do cliente', () => {
      const nome1 = generateSecureFilename('pdf');
      const nome2 = generateSecureFilename('pdf');
      expect(nome1).not.toBe(nome2);
      expect(nome1).toMatch(/^\d+-[a-f0-9]{32}\.pdf$/);
    });

    it('deve detectar arquivo de teste de malware padrão (EICAR)', async () => {
      const eicarBuffer = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
      const result = await scanFileForMalware(eicarBuffer);
      expect(result.clean).toBe(false);
      expect(result.reason).toContain('EICAR');
    });

    it('deve detectar executáveis binários DOS/PE disfarçados (MZ header)', async () => {
      const peBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
      const result = await scanFileForMalware(peBuffer);
      expect(result.clean).toBe(false);
      expect(result.reason).toContain('executável disfarçado');
    });

    it('deve aprovar arquivo limpo', async () => {
      const cleanBuffer = Buffer.from('%PDF-1.4 clean content without virus');
      const result = await scanFileForMalware(cleanBuffer);
      expect(result.clean).toBe(true);
    });
  });

  describe('StorageService — URLs Assinadas e Cotas', () => {
    it('deve gerar e validar link de download assinado temporário com HMAC-SHA256', () => {
      const token = storageService.generateSignedDownloadToken('file123', 'user456', 15);
      const verified = storageService.verifySignedDownloadToken(token);
      expect(verified.fileId).toBe('file123');
      expect(verified.userId).toBe('user456');
    });

    it('deve rejeitar link assinado expirado (status 410)', () => {
      // Gera token expirado (expiresInMinutes = -1)
      const token = storageService.generateSignedDownloadToken('file123', 'user456', -1);
      expect(() => storageService.verifySignedDownloadToken(token)).toThrow(AppError);
      expect(() => storageService.verifySignedDownloadToken(token)).toThrow(/expirou/);
    });

    it('deve rejeitar link assinado adulterado/falsificado (status 403)', () => {
      const token = storageService.generateSignedDownloadToken('file123', 'user456', 15);
      const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
      decoded.fileId = 'file_tampered'; // Adulteração do payload
      const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString('base64url');

      expect(() => storageService.verifySignedDownloadToken(tamperedToken)).toThrow(AppError);
      expect(() => storageService.verifySignedDownloadToken(tamperedToken)).toThrow(/Assinatura.*inválida/);
    });

    it('deve limitar quantidade máxima de arquivos por entidade', async () => {
      (ArquivoUpload.countDocuments as jest.Mock).mockResolvedValue(MAX_FILES_PER_ENTITY);
      await expect(
        storageService.assertEntityUploadLimit('acidente', '60c72b2f9b1d8b2bad000001')
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('deve permitir upload quando cota da entidade não foi excedida', async () => {
      (ArquivoUpload.countDocuments as jest.Mock).mockResolvedValue(2);
      await expect(
        storageService.assertEntityUploadLimit('acidente', '60c72b2f9b1d8b2bad000001')
      ).resolves.toBeUndefined();
    });
  });
});
