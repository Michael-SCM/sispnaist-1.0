import 'dotenv/config';
import app from './app.js';
import config from './config/config.js';


const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════╗
║    SISPNAIST Backend Server Started    ║
╚════════════════════════════════════════╝

🚀 Server running on: http://localhost:${PORT}
🗄️  Database: ${config.mongodbUri}
🌍 Environment: ${config.nodeEnv}
🔐 CORS enabled for: ${config.corsOrigin}
`);

  // Executar seeders apenas em development ou se variável definida
  if (config.nodeEnv === 'development' || process.env.RUN_SEEDERS === 'true') {
    try {
      console.log('🌱 Executando seeders iniciais...');
      const { seedCatalogos } = await import('./utils/seedCatalogos.js');
      await seedCatalogos();
      console.log('✅ Seeders executados com sucesso!');
    } catch (error) {
      console.error('⚠️ Erro nos seeders:', error);
    }
  }

  console.log(`
API Documentation:
  POST   /api/auth/register    - Criar conta
  POST   /api/auth/login       - Fazer login
  GET    /api/auth/me          - Dados do usuário
  PUT    /api/auth/profile     - Atualizar perfil
  GET    /health               - Health check
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
