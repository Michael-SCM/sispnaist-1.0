"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const database_js_1 = __importDefault(require("./config/database.js"));
const config_js_1 = __importDefault(require("./config/config.js"));
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const acidentes_js_1 = __importDefault(require("./routes/acidentes.js"));
const doencas_js_1 = __importDefault(require("./routes/doencas.js"));
const vacinacoes_js_1 = __importDefault(require("./routes/vacinacoes.js"));
const trabalhadores_js_1 = __importDefault(require("./routes/trabalhadores.js"));
const empresas_js_1 = __importDefault(require("./routes/empresas.js"));
const unidades_js_1 = __importDefault(require("./routes/unidades.js"));
const usuarios_js_1 = __importDefault(require("./routes/usuarios.js"));
const analytics_js_1 = __importDefault(require("./routes/analytics.js"));
const reports_js_1 = __importDefault(require("./routes/reports.js"));
const audit_js_1 = __importDefault(require("./routes/audit.js"));
const catalogos_js_1 = __importDefault(require("./routes/catalogos.js"));
const submodulosTrabalhador_js_1 = __importDefault(require("./routes/submodulosTrabalhador.js"));
const questionarios_js_1 = __importDefault(require("./routes/questionarios.js"));
const uploads_js_1 = __importDefault(require("./routes/uploads.js"));
const emails_js_1 = __importDefault(require("./routes/emails.js"));
const parametros_js_1 = __importDefault(require("./routes/parametros.js"));
const preferencias_js_1 = __importDefault(require("./routes/preferencias.js"));
const servidores_js_1 = __importDefault(require("./routes/servidores.js"));
const videoAulas_js_1 = __importDefault(require("./routes/videoAulas.js"));
const atosMunicipais_js_1 = __importDefault(require("./routes/atosMunicipais.js"));
const enderecos_js_1 = __importDefault(require("./routes/enderecos.js"));
const export_js_1 = __importDefault(require("./routes/export.js"));
const materialBiologico_js_1 = __importDefault(require("./routes/materialBiologico.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const seedCatalogos_js_1 = require("./utils/seedCatalogos.js");
const app = (0, express_1.default)();
// Middleware de CORS (usa lista configurável via CORS_ORIGIN no .env)
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || config_js_1.default.corsOrigin.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
    credentials: true,
}));
// Middleware de segurança
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'"],
            frameSrc: ["'self'", "https://www.youtube.com", "https://*.youtube.com"],
            connectSrc: ["'self'"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'", "https://sispnaist-1-0.vercel.app", "http://localhost:5173"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
// Parser de requisições
app.use(express_1.default.json({ limit: '10mb', strict: false }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Conectar ao MongoDB e rodar seeds
(0, database_js_1.default)().then(() => {
    // Executa o seed apenas se o banco estiver vazio
    if (process.env.NODE_ENV !== 'test') {
        (0, seedCatalogos_js_1.seedCatalogos)();
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
app.use('/api/auth', auth_js_1.default);
app.use('/api/acidentes', acidentes_js_1.default);
app.use('/api/doencas', doencas_js_1.default);
app.use('/api/vacinacoes', vacinacoes_js_1.default);
app.use('/api/trabalhadores', trabalhadores_js_1.default);
app.use('/api/empresas', empresas_js_1.default);
app.use('/api/unidades', unidades_js_1.default);
app.use('/api/usuarios', usuarios_js_1.default);
app.use('/api/analytics', analytics_js_1.default);
app.use('/api/reports', reports_js_1.default);
app.use('/api/audit', audit_js_1.default);
app.use('/api/catalogos', catalogos_js_1.default);
app.use('/api/trabalhadores', submodulosTrabalhador_js_1.default);
app.use('/api/questionarios', questionarios_js_1.default);
app.use('/api/uploads', uploads_js_1.default);
app.use('/api/emails', emails_js_1.default);
app.use('/api/parametros', parametros_js_1.default);
app.use('/api/preferencias', preferencias_js_1.default);
app.use('/api/servidores', servidores_js_1.default);
app.use('/api/video-aulas', videoAulas_js_1.default);
app.use('/api/atos-municipais', atosMunicipais_js_1.default);
app.use('/api/enderecos', enderecos_js_1.default);
app.use('/api/export', export_js_1.default);
app.use('/api/material-biologico', materialBiologico_js_1.default);
// 404 handler
app.use(errorHandler_js_1.notFoundHandler);
// Error handler
app.use(errorHandler_js_1.errorHandler);
exports.default = app;
