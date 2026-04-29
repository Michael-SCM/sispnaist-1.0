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
import reportsRoutes from './routes/reports.js';
import auditRoutes from './routes/audit.js';
import catalogosRoutes from './routes/catalogos.js';
import submodulosTrabalhadorRoutes from './routes/submodulosTrabalhador.js';
import questionariosRoutes from './routes/questionarios.js';
import uploadsRoutes from './routes/uploads.js';
import emailsRoutes from './routes/emails.js';
import parametrosRoutes from './routes/parametros.js';
import preferenciasRoutes from './routes/preferencias.js';
import servidoresRoutes from './routes/servidores.js';
import videoAulasRoutes from './routes/videoAulas.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Parser de requisições
app.use(express.json({ limit: '10mb', strict: false })); app.use((req, res, next) => { if (req.body) console.log('Body:', JSON.stringify(req.body)); next(); });
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Conectar ao MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'SISPNAIST Backend API',
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
      catalogos: {
        listarTodos: 'GET /api/catalogos/listar-todos',
        listar: 'GET /api/catalogos/:entidade',
        ativos: 'GET /api/catalogos/:entidade/ativos (equivale ao getdados.php)',
        obter: 'GET /api/catalogos/:entidade/:id',
        criar: 'POST /api/catalogos/:entidade',
        atualizar: 'PUT /api/catalogos/:entidade/:id',
        deletar: 'DELETE /api/catalogos/:entidade/:id',
        entidades: 'sexo, genero, racaCor, escolaridade, estadoCivil, tipoSanguineo, etc.'
      },
      submodulosTrabalhador: {
        listar: 'GET /api/trabalhadores/:id/:submodulo (dependentes|afastamentos|ocorrenciasViolencia|readaptacoes|processosTrabalho)',
        obter: 'GET /api/trabalhadores/:id/:submodulo/:itemId',
        criar: 'POST /api/trabalhadores/:id/:submodulo',
        atualizar: 'PUT /api/trabalhadores/:id/:submodulo/:itemId',
        deletar: 'DELETE /api/trabalhadores/:id/:submodulo/:itemId'
      },
      questionarios: {
        listar: 'GET /api/questionarios',
        obter: 'GET /api/questionarios/:id (inclui itens)',
        criar: 'POST /api/questionarios',
        atualizar: 'PUT /api/questionarios/:id',
        deletar: 'DELETE /api/questionarios/:id',
        itens: 'POST/PUT/DELETE /api/questionarios/:id/itens[/:itemId]'
      },
      uploads: {
        listar: 'GET /api/uploads',
        obter: 'GET /api/uploads/:id',
        criar: 'POST /api/uploads (multipart/form-data)',
        download: 'GET /api/uploads/:id/download',
        deletar: 'DELETE /api/uploads/:id'
      },
      emails: {
        padroes: 'GET/POST/PUT/DELETE /api/emails/padroes[/:id]',
        enviar: 'POST /api/emails/enviar (requer Nodemailer/SendGrid)'
      },
      parametros: {
        listar: 'GET /api/parametros',
        obterPorChave: 'GET /api/parametros/chave/:chave',
        obter: 'GET /api/parametros/:id',
        criar: 'POST /api/parametros (admin)',
        atualizar: 'PUT /api/parametros/:id (admin)',
        deletar: 'DELETE /api/parametros/:id (admin)'
      },
      preferencias: {
        minhas: 'GET/PUT /api/preferencias/minhas',
        usuario: 'GET/PUT /api/preferencias/usuario/:usuarioId'
      },
      servidores: {
        listar: 'GET /api/servidores',
        obter: 'GET /api/servidores/:id',
        criar: 'POST /api/servidores',
        atualizar: 'PUT /api/servidores/:id',
        deletar: 'DELETE /api/servidores/:id'
      },
      videoAulas: {
        listar: 'GET /api/video-aulas',
        obter: 'GET /api/video-aulas/:id',
        criar: 'POST /api/video-aulas (admin)',
        atualizar: 'PUT /api/video-aulas/:id (admin)',
        deletar: 'DELETE /api/video-aulas/:id (admin)'
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
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/trabalhadores', submodulosTrabalhadorRoutes);
app.use('/api/questionarios', questionariosRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/emails', emailsRoutes);
app.use('/api/parametros', parametrosRoutes);
app.use('/api/preferencias', preferenciasRoutes);
app.use('/api/servidores', servidoresRoutes);
app.use('/api/video-aulas', videoAulasRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
