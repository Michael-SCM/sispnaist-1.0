describe('config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret', MONGODB_URI: 'mongodb://localhost:27017/test' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('deve usar valores padrão para variáveis não definidas', async () => {
    const config = (await import('../../config/config')).default;
    expect(config.port).toBe(3001);
    expect(config.jwtExpire).toBe('15m');
  });

  it('deve usar valores das variáveis de ambiente', async () => {
    process.env.PORT = '5000';
    process.env.JWT_EXPIRE = '24h';

    const config = (await import('../../config/config')).default;
    expect(config.port).toBe('5000');
    expect(config.jwtExpire).toBe('24h');
  });

  it('deve carregar JWT_SECRET e MONGODB_URI do ambiente', async () => {
    const config = (await import('../../config/config')).default;
    expect(config.jwtSecret).toBe('test-secret');
    expect(config.mongodbUri).toBe('mongodb://localhost:27017/test');
  });

  it('deve fazer split do CORS_ORIGIN em array', async () => {
    process.env.CORS_ORIGIN = 'http://a.com,http://b.com';

    const config = (await import('../../config/config')).default;
    expect(config.corsOrigin).toEqual(['http://a.com', 'http://b.com']);
  });
});
