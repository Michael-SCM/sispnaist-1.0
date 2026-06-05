"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_dns_1 = __importDefault(require("node:dns"));
// Forçar a resolução de DNS a priorizar IPv4. 
// Isso resolve o erro ENETUNREACH no Render, pois a plataforma não possui suporte a IPv6 de saída.
node_dns_1.default.setDefaultResultOrder('ipv4first');
const mongoose_1 = __importDefault(require("mongoose"));
const app_js_1 = __importDefault(require("./app.js"));
const config_js_1 = __importDefault(require("./config/config.js"));
const PORT = config_js_1.default.port;
const server = app_js_1.default.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║    SISPNAIST Backend Server Started    ║
╚════════════════════════════════════════╝

🚀 Server running on: http://localhost:${PORT}
🗄️  Database: ${config_js_1.default.mongodbUri}
🌍 Environment: ${config_js_1.default.nodeEnv}
🔐 CORS enabled for: ${config_js_1.default.corsOrigin}

API Documentation:
  POST   /api/auth/register    - Criar conta
  POST   /api/auth/login       - Fazer login
  GET    /api/auth/me          - Dados do usuário
  PUT    /api/auth/profile     - Atualizar perfil
  GET    /health               - Health check
  `);
});
async function gracefulShutdown(signal) {
    console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
    server.close(() => {
        console.log('✓ HTTP server closed');
    });
    await mongoose_1.default.disconnect();
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
