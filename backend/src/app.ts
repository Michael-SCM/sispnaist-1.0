import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
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
import quizzesRoutes from './routes/quizzes.js';
import treinamentoProgressoRoutes from './routes/treinamentoProgresso.js';
import atosMunicipaisRoutes from './routes/atosMunicipais.js';
import enderecosRoutes from './routes/enderecos.js';
import municipiosRoutes from './routes/municipios.js';
import exportRoutes from './routes/export.js';
import materialBiologicoRoutes from './routes/materialBiologico.js';
import publicReportsRoutes from './routes/publicReports.js';
import csrfRoutes from './routes/csrf.js';
import parametrosUfRoutes from './routes/parametrosUf.js';
import regrasValidacaoRoutes from './routes/regrasValidacao.js';
import indicadoresRoutes from './routes/indicadores.js';
import { csrfProtection } from './middleware/csrf.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { seedCatalogos } from './utils/seedCatalogos.js';
import { seedRegrasValidacao } from './utils/seedRegrasValidacao.js';

const app = express();

// Render/Proxies: confiar no X-Forwarded-For para rate-limit e req.ip
app.set('trust proxy', 1);

// Middleware de CORS (usa lista configurável via CORS_ORIGIN no .env)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || config.corsOrigin.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://*.youtube.com"],
      connectSrc: ["'self'", "https://sispnaist-1-0.onrender.com", "https://sispnaist-1-0.vercel.app"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'", "https://sispnaist-1-0.vercel.app", "http://localhost:5173"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xXssProtection: true,
}));



// Parser de requisições
app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Rate limiting global
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { status: 'error', message: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { status: 'error', message: 'Muitas requisições de escrita. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  next();
});

// Proteção CSRF para todas as rotas de escrita
app.use('/api', csrfProtection);

// Conectar ao MongoDB e rodar seeds
connectDB().then(() => {
  // Executa o seed apenas se o banco estiver vazio
  if (process.env.NODE_ENV !== 'test') {
    seedCatalogos();
    seedRegrasValidacao();
  }
});

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
app.use('/api/csrf-token', csrfRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/lgpd', authRoutes);
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
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/treinamento', treinamentoProgressoRoutes);
app.use('/api/atos-municipais', atosMunicipaisRoutes);
app.use('/api/municipios', municipiosRoutes);
app.use('/api/enderecos', enderecosRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/material-biologico', materialBiologicoRoutes);
app.use('/api/parametros-uf', parametrosUfRoutes);
app.use('/api/regras-validacao', regrasValidacaoRoutes);
app.use('/api/indicadores', indicadoresRoutes);
app.use('/api/public/reports', publicReportsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
