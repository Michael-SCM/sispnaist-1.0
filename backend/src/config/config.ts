import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sispatnaist',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
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
};

export default config;
