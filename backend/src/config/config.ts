import dotenv from 'dotenv';

dotenv.config();

function validateConfig() {
  const required = {
    JWT_SECRET: process.env.JWT_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('❌ Configurações obrigatórias ausentes:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('O servidor não pode iniciar sem essas variáveis de ambiente.');
    process.exit(1);
  }
}

validateConfig();

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'https://sispnaist-1-0.vercel.app'],
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || '"SISPNAIST" <noreply@sispnaist.com>',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  msCadsusApiUrl: process.env.MS_CADSUS_API_URL || '',
  msCadsusToken: process.env.MS_CADSUS_TOKEN || '',
  msCadsusApiKey: process.env.MS_CADSUS_API_KEY || '',
  msSihApiUrl: process.env.MS_SIH_API_URL || '',
  msSihToken: process.env.MS_SIH_TOKEN || '',
  msSihApiKey: process.env.MS_SIH_API_KEY || '',
  msCnesApiUrl: process.env.MS_CNES_API_URL || '',
  msCnesToken: process.env.MS_CNES_TOKEN || '',
  msCnesApiKey: process.env.MS_CNES_API_KEY || '',
  msEsocialApiUrl: process.env.MS_ESOCIAL_API_URL || '',
  msEsocialToken: process.env.MS_ESOCIAL_TOKEN || '',
  msEsocialApiKey: process.env.MS_ESOCIAL_API_KEY || '',
  msSinanApiUrl: process.env.MS_SINAN_API_URL || '',
  msSinanToken: process.env.MS_SINAN_TOKEN || '',
  msSinanApiKey: process.env.MS_SINAN_API_KEY || '',
};

export default config;
