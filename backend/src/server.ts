import 'dotenv/config';
import dns from 'node:dns';

// Forçar a resolução de DNS a priorizar IPv4. 
// Isso resolve o erro ENETUNREACH no Render, pois a plataforma não possui suporte a IPv6 de saída.
dns.setDefaultResultOrder('ipv4first');

import mongoose from 'mongoose';
import app from './app.js';
import config from './config/config.js';


const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║    SISPNAIST Backend Server Started    ║
╚════════════════════════════════════════╝

🚀 Server running on: http://localhost:${PORT}
🗄️  Database: ${config.mongodbUri}
🌍 Environment: ${config.nodeEnv}
🔐 CORS enabled for: ${config.corsOrigin}

API Documentation:
  POST   /api/auth/register    - Criar conta
  POST   /api/auth/login       - Fazer login
  GET    /api/auth/me          - Dados do usuário
  PUT    /api/auth/profile     - Atualizar perfil
  GET    /health               - Health check
  `);
});

async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('✓ HTTP server closed');
  });
  await mongoose.disconnect();
  console.log('✓ MongoDB disconnected');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
