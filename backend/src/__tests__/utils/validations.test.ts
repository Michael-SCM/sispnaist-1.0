import { registerSchema, loginSchema, resetPasswordSchema } from '../../utils/validations';

describe('registerSchema', () => {
  const validData = {
    cpf: '123.456.789-00',
    nome: 'João Silva',
    email: 'joao@email.com',
    senha: 'Abc@1234',
    dataNascimento: '1990-01-01',
    consentimentoLGPD: true,
  };

  it('deve aceitar dados válidos', () => {
    const { error } = registerSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  it('deve rejeitar senha com menos de 8 caracteres', () => {
    const { error } = registerSchema.validate({ ...validData, senha: 'Ab@1' });
    expect(error).toBeDefined();
    expect(error!.message).toContain('8 caracteres');
  });

  it('deve rejeitar senha sem maiúscula', () => {
    const { error } = registerSchema.validate({ ...validData, senha: 'abc@1234' });
    expect(error).toBeDefined();
    expect(error!.message).toContain('maiúscula');
  });

  it('deve rejeitar senha sem minúscula', () => {
    const { error } = registerSchema.validate({ ...validData, senha: 'ABC@1234' });
    expect(error).toBeDefined();
    expect(error!.message).toContain('minúscula');
  });

  it('deve rejeitar senha sem número', () => {
    const { error } = registerSchema.validate({ ...validData, senha: 'Abcd@#$%' });
    expect(error).toBeDefined();
    expect(error!.message).toContain('número');
  });

  it('deve rejeitar senha sem caractere especial', () => {
    const { error } = registerSchema.validate({ ...validData, senha: 'Abcd1234' });
    expect(error).toBeDefined();
    expect(error!.message).toContain('especial');
  });

  it('deve rejeitar CPF com formato inválido', () => {
    const { error } = registerSchema.validate({ ...validData, cpf: '12345678900' });
    expect(error).toBeDefined();
    expect(error!.message).toContain('CPF');
  });

  it('deve rejeitar email inválido', () => {
    const { error } = registerSchema.validate({ ...validData, email: 'invalido' });
    expect(error).toBeDefined();
    expect(error!.message).toContain('Email');
  });
});

describe('loginSchema', () => {
  it('deve aceitar email e senha válidos', () => {
    const { error } = loginSchema.validate({ email: 'joao@email.com', senha: 'abc123' });
    expect(error).toBeUndefined();
  });

  it('deve rejeitar email vazio', () => {
    const { error } = loginSchema.validate({ email: '', senha: 'abc123' });
    expect(error).toBeDefined();
  });
});

describe('resetPasswordSchema', () => {
  it('deve aceitar senha forte', () => {
    const { error } = resetPasswordSchema.validate({
      token: 'abc123',
      novaSenha: 'Abc@1234',
      confirmarSenha: 'Abc@1234',
    });
    expect(error).toBeUndefined();
  });

  it('deve rejeitar senhas diferentes', () => {
    const { error } = resetPasswordSchema.validate({
      token: 'abc123',
      novaSenha: 'Abc@1234',
      confirmarSenha: 'Xyz@9876',
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('não conferem');
  });
});
