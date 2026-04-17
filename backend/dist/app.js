import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database.js';
import config from './config/config.js';
import authRoutes from './routes/auth.js';
import acidentesRoutes from './routes/acidentes.js';
import doencasRoutes from './routes/doencas.js';
import vacinacoesRoutes from './routes/vacinacoes.js';
import trabalhadoresRoutes from './routes/trabalhadores.js';
import empresasRoutes from './routes/empresas.js';
import unidadesRoutes from './routes/unidades.js';
import usuariosRoutes from './routes/usuarios.js';
import analyticsRoutes from './routes/analytics.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
const app = express();
// Middleware de segurança
app.use(helmet());
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));
// Parser de requisições
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Conectar ao MongoDB
connectDB();
// Root route
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'SISPATNAIST Backend API',
        version: '1.0.0',
        documentation: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me',
                updateProfile: 'PUT /api/auth/profile'
            },
            acidentes: {
                criar: 'POST /api/acidentes',
                listar: 'GET /api/acidentes',
                obter: 'GET /api/acidentes/:id',
                atualizar: 'PUT /api/acidentes/:id',
                deletar: 'DELETE /api/acidentes/:id',
                porTrabalhador: 'GET /api/acidentes/trabalhador/:id',
                estatisticas: 'GET /api/acidentes/stats/estatisticas'
            },
            doencas: {
                criar: 'POST /api/doencas',
                listar: 'GET /api/doencas',
                obter: 'GET /api/doencas/:id',
                atualizar: 'PUT /api/doencas/:id',
                deletar: 'DELETE /api/doencas/:id',
                porTrabalhador: 'GET /api/doencas/trabalhador/:id',
                estatisticas: 'GET /api/doencas/stats/estatisticas'
            },
            vacinacoes: {
                criar: 'POST /api/vacinacoes',
                listar: 'GET /api/vacinacoes',
                obter: 'GET /api/vacinacoes/:id',
                atualizar: 'PUT /api/vacinacoes/:id',
                deletar: 'DELETE /api/vacinacoes/:id',
                porTrabalhador: 'GET /api/vacinacoes/trabalhador/:id',
                estatisticas: 'GET /api/vacinacoes/stats/estatisticas'
            },
            trabalhadores: {
                criar: 'POST /api/trabalhadores',
                listar: 'GET /api/trabalhadores',
                obter: 'GET /api/trabalhadores/:id',
                atualizar: 'PUT /api/trabalhadores/:id',
                deletar: 'DELETE /api/trabalhadores/:id'
            },
            analytics: {
                kpis: 'GET /api/analytics/kpis',
                dadosAcidentes: 'GET /api/analytics/acidentes',
                proximasVacinacoes: 'GET /api/analytics/vacinacoes/proximas',
                ultimosAcidentes: 'GET /api/analytics/acidentes/ultimos',
                dashboardAdmin: 'GET /api/analytics/dashboard (admin/gestor)',
                dashboardTrabalhador: 'GET /api/analytics/dashboard/trabalhador'
            },
            health: 'GET /health'
        }
    });
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Health check com /api prefix (para ser consistente com outras rotas)
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/acidentes', acidentesRoutes);
app.use('/api/doencas', doencasRoutes);
app.use('/api/vacinacoes', vacinacoesRoutes);
app.use('/api/trabalhadores', trabalhadoresRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/unidades', unidadesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/analytics', analyticsRoutes);
// 404 handler
app.use(notFoundHandler);
// Error handler
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map