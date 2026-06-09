# RELATÓRIO COMPLETO DO PROJETO SISPNAIST

## Sistema de Gerenciamento de Segurança do Trabalhador

---

## 1. IDENTIFICAÇÃO DO PROJETO

| Campo | Valor |
|-------|-------|
| **Nome do Projeto** | SISPNAIST |
| **Nome Completo** | Sistema de Gerenciamento de Segurança do Trabalhador |
| **Versão** | 1.0.0 |
| **Tipo** | Aplicação Web Full-Stack (monorepo frontend + backend) |
| **Linguagem** | TypeScript (frontend e backend) |
| **Backend** | Node.js com Express |
| **Frontend** | React 18 com TypeScript |
| **Banco de Dados** | MongoDB (via Mongoose ODM) |
| **Estilização** | Tailwind CSS |
| **Deploy** | Frontend na Vercel, Backend no Render, Banco no MongoDB Atlas |

---

## 2. ESTRUTURA GERAL DO PROJETO

```
sispnaist 1.0/
├── backend/          # Servidor API Express.js
├── frontend/         # Interface React SPA
├── Doc/              # Documentação do projeto
├── .github/          # Workflows CI/CD do GitHub
├── .claude/          # Configurações locais do Claude AI
├── .git/             # Repositório Git
├── package.json      # Package.json raiz (dependência: mongodb)
├── package-lock.json
├── start-backend.bat # Script para iniciar backend na porta 3001
└── start-frontend.bat # Script para iniciar frontend na porta 3000
```

---

## 3. BACKEND (`/backend/`)

### 3.1. Visão Geral

API RESTful construída com **Node.js + Express + TypeScript**. Gerencia autenticação, operações CRUD, analytics, upload de arquivos, auditoria, envio de e-mails e geração de relatórios.

### 3.2. Configuração

| Arquivo | Finalidade |
|---------|-----------|
| `package.json` | Metadados, scripts e dependências do backend |
| `package.test.json` | Configuração de testes com Jest (cobertura mínima: 70% branches, 80% funções/linhas/statements) |
| `tsconfig.json` | TypeScript: alvo ES2020, módulos CommonJS, saída em `./dist` |
| `.env.example` | Template de variáveis de ambiente necessárias |
| `admin.txt` | Credenciais padrão do admin: `admin@sispnaist.com.br / admin123` |
| `Procfile` | Configuração para deploy no Render: `web: npm start` |
| `render.yaml` | Configuração do Render (plano free, Node, us-east-1, branch main) |
| `jest.config.ts` | Configuração do Jest com preset ts-jest, ambiente Node |

### 3.3. Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `MONGODB_URI` | String de conexão do MongoDB Atlas |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT |
| `JWT_REFRESH_SECRET` | Chave secreta para refresh tokens |
| `JWT_EXPIRE` | Tempo de expiração do token (padrão: 15m) |
| `JWT_REFRESH_EXPIRE` | Tempo de expiração do refresh token (padrão: 7d) |
| `CORS_ORIGIN` | Origens permitidas (separadas por vírgula) |
| `FRONTEND_URL` | URL do frontend para links em e-mails |
| `EMAIL_HOST/PORT/USER/PASS/FROM` | Configuração SMTP para envio de e-mails |
| `MAX_FILE_SIZE` | Limite de upload (padrão: 5MB) |
| `UPLOAD_DIR` | Diretório de upload (padrão: ./uploads) |

### 3.4. Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Desenvolvimento com hot-reload (tsx watch) |
| `npm run build` | Compilação TypeScript para dist/ |
| `npm start` | Servidor de produção compilado |
| `npm test` | Executar testes Jest |
| `npm run lint` | ESLint no diretório src/ |
| `npm run seed:catalogos` | Popular tabelas auxiliares (catálogos) |
| `npm run seed:trabalhadores` | Popular dados de teste de trabalhadores |
| `npm run seed:acidentes` | Popular acidentes, doenças e vacinações |
| `npm run seed:atosMunicipais` | Popular decretos municipais |
| `npm run seed` | Executar todos os seeds sequencialmente |

### 3.5. Arquitetura do Backend (`backend/src/`)

```
src/
├── server.ts                    # Ponto de entrada: inicia Express, conecta MongoDB, graceful shutdown
├── app.ts                       # Configuração do Express: CORS, helmet, rate-limit, CSRF, rotas, error handler
├── config/
│   ├── config.ts                # Carregador de configuração do ambiente (valida variáveis obrigatórias)
│   └── database.ts              # Conexão MongoDB com Mongoose (pool size 10, IPv4 forçado)
├── middleware/
│   ├── auth.ts                  # Middleware JWT + autorização por papéis (admin, gestor)
│   ├── csrf.ts                  # Proteção CSRF (padrão double-submit cookie)
│   ├── errorHandler.ts          # Classe AppError, tratadores de erros Mongoose (validação, cast, duplicatas), 404
│   ├── validation.ts            # Validação de schemas Joi para body/query + validação de ObjectId
│   └── asyncHandler.ts          # Wrapper para capturar erros em controllers assíncronos
├── controllers/                 # Lógica de controle (25 arquivos)
├── services/                    # Camada de negócio (14 arquivos)
├── routes/                      # Definição de rotas (25 arquivos)
├── models/                      # Schemas Mongoose (23 modelos + 2 extras)
├── types/
│   └── index.ts                 # Interfaces TypeScript (IUser, IAcidente, ITrabalhador, etc.)
├── utils/
│   ├── jwt.ts                   # Geração/verificação de tokens JWT
│   ├── validations.ts           # Schemas Joi para todas as entidades
│   ├── pagination.ts            # Helper de paginação para consultas MongoDB
│   ├── emailService.ts          # Serviço de envio de e-mail com Nodemailer
│   ├── auditLogger.ts           # Helper de registro de auditoria
│   ├── cpf.ts                   # Validação de CPF (cadastro de pessoa física brasileiro)
│   ├── seedCatalogos.ts         # Script para popular catálogos padrão
│   └── seedCatalogos.cjs        # Versão CommonJS do script de seed
├── scripts/
│   ├── seedTrabalhadores.ts     # Seed de 1000+ trabalhadores para teste
│   ├── seedAcidentesDoencasVacinacoes.ts  # Seed de acidentes, doenças e vacinações
│   ├── seedAtosMunicipais.ts    # Seed de decretos municipais
│   └── debugAbsenteismo.mjs     # Script de debug para dados de absenteísmo
└── __tests__/
    ├── utils/validations.test.ts    # Testes de validação
    └── config/config.test.ts        # Testes de configuração
```

### 3.6. Controllers (25 arquivos)

Cada controller gerencia as requisições HTTP de um módulo específico:

| Controller | Módulo | Funcionalidades |
|------------|--------|-----------------|
| `authController.ts` | Autenticação | Register, login, logout, refresh token, perfil, forgot/reset password, verificação de e-mail |
| `acidenteController.ts` | Acidentes | CRUD completo + estatísticas de acidentes de trabalho |
| `doencaController.ts` | Doenças | CRUD completo + estatísticas de doenças ocupacionais |
| `vacinacaoController.ts` | Vacinações | CRUD completo + estatísticas de vacinação |
| `materialBiologicoController.ts` | Material Biológico | CRUD de exposições a material biológico |
| `trabalhadorController.ts` | Trabalhadores | CRUD de funcionários/empregados |
| `TrabalhadorInformacaoController.ts` | Informações Adicionais | CRUD de informações complementares do trabalhador |
| `submoduloTrabalhadorController.ts` | Submódulos | CRUD unificado para afastamentos, dependentes, vínculos, readaptações, ocorrências de violência, processos de trabalho |
| `empresaController.ts` | Empresas | CRUD de empresas/organizações |
| `unidadeController.ts` | Unidades | CRUD de unidades/departamentos |
| `catalogoController.ts` | Catálogos | CRUD de tabelas auxiliares |
| `userController.ts` | Usuários | CRUD de usuários do sistema |
| `analyticsController.ts` | Analytics | KPIs do dashboard, gráficos e estatísticas |
| `reportController.ts` | Relatórios | Geração de relatórios |
| `auditController.ts` | Auditoria | Listagem de logs + estatísticas de auditoria |
| `ExportController.ts` | Exportação | Exportação de dados |
| `EnderecoController.ts` | Endereços | Gerenciamento de endereços |
| `emailController.ts` | E-mails | Gerenciamento de templates + envio de e-mails |
| `parametroController.ts` | Parâmetros | Configuração de parâmetros do sistema |
| `preferenciaController.ts` | Preferências | Preferências do usuário |
| `questionarioController.ts` | Questionários | Gerenciamento de questionários/avaliações |
| `servidorFuncionarioController.ts` | Servidores | Registros de servidores públicos |
| `uploadController.ts` | Uploads | Gerenciamento de upload/download de arquivos |
| `videoAulaController.ts` | Video Aulas | CRUD de videoaulas educativas |
| `AtoMunicipalInovacaoController.ts` | Atos Municipais | Decretos/regulamentações municipais |

### 3.7. Services (14 arquivos)

Camada de lógica de negócios que desacopla os controllers dos modelos:

| Service | Responsabilidade |
|---------|------------------|
| `AuthService.ts` | Lógica de autenticação (registro, login, tokens, senha) |
| `AcidenteService.ts` | Regras de negócio para acidentes de trabalho |
| `DoencaService.ts` | Regras de negócio para doenças ocupacionais |
| `VacinacaoService.ts` | Regras de negócio para vacinações |
| `MaterialBiologicoService.ts` | Regras de negócio para material biológico |
| `TrabalhadorService.ts` | Regras de negócio para trabalhadores |
| `TrabalhadorInformacaoService.ts` | Regras de negócio para informações adicionais do trabalhador |
| `EmpresaService.ts` | Regras de negócio para empresas |
| `UnidadeService.ts` | Regras de negócio para unidades |
| `CatalogoService.ts` | Regras de negócio para catálogos |
| `UserService.ts` | Regras de negócio para usuários do sistema |
| `AnalyticsService.ts` | Lógica de analytics (KPIs, gráficos do dashboard) |
| `AuditService.ts` | Consulta de logs e estatísticas de auditoria |
| `PdfService.ts` | Geração de relatórios em PDF (PDFKit) |

### 3.8. Models (23 schemas Mongoose)

Cada model representa uma coleção no MongoDB:

| Model | Collection | Finalidade |
|-------|-----------|------------|
| `User.ts` | `users` | Usuários do sistema com papéis (admin, gestor, user) |
| `Trabalhador.ts` | `trabalhadores` | Trabalhadores/funcionários com perfil completo |
| `Acidente.ts` | `acidentes` | Acidentes de trabalho (detalhados) |
| `Doenca.ts` | `doencas` | Doenças ocupacionais |
| `Vacinacao.ts` | `vacinacoes` | Registros de vacinação |
| `MaterialBiologico.ts` | `material_biologico` | Exposições a material biológico |
| `Empresa.ts` | `empresas` | Empresas/organizações |
| `Unidade.ts` | `unidades` | Unidades/departamentos |
| `Catalogo.ts` | `catalogos` | Tabelas auxiliares (sexo, gênero, raça, escolaridade, etc.) |
| `AtoMunicipalInovacao.ts` | `atos_municipais` | Decretos/regulamentações municipais |
| `TrabalhadorAfastamento.ts` | `trabalhador_afastamentos` | Afastamentos do trabalhador |
| `TrabalhadorDependente.ts` | `trabalhador_dependentes` | Dependentes do trabalhador |
| `TrabalhadorVinculo.ts` | `trabalhador_vinculos` | Vínculos empregatícios do trabalhador |
| `TrabalhadorOcorrenciaViolencia.ts` | `trabalhador_ocorrencias_violencia` | Incidentes de violência no trabalho |
| `TrabalhadorReadaptacao.ts` | `trabalhador_readaptacoes` | Readaptações funcionais do trabalhador |
| `TrabalhadorProcessoTrabalho.ts` | `trabalhador_processos_trabalho` | Processos de trabalho do trabalhador |
| `TrabalhadorInformacao.ts` | `trabalhador_informacoes` | Informações adicionais do trabalhador |
| `ServidorFuncionario.ts` | `servidores_funcionarios` | Registros de servidores públicos |
| `VideoAula.ts` | `video_aulas` | Videoaulas educativas |
| `Questionario.ts` | `questionarios` | Questionários/avaliações |
| `QuestionarioItem.ts` | `questionario_itens` | Itens de questionários |
| `AuditLog.ts` | `audit_logs` | Trilha de auditoria |
| `ArquivoUpload.ts` | `arquivo_uploads` | Metadados de upload de arquivos |
| `PadraoEmail.ts` | `padrao_emails` | Templates de e-mail |
| `Parametro.ts` | `parametros` | Parâmetros do sistema |
| `PreferenciaUsuario.ts` | `preferencia_usuarios` | Preferências do usuário |

### 3.9. Dependências do Backend

| Pacote | Versão | Finalidade |
|--------|--------|------------|
| `express` | ^4.18.2 | Framework HTTP |
| `mongoose` | ^8.0.0 | ODM para MongoDB |
| `jsonwebtoken` | ^9.0.2 | Tokens JWT |
| `bcryptjs` | ^2.4.3 | Hash de senhas |
| `cors` | ^2.8.5 | CORS |
| `helmet` | ^7.1.0 | Headers de segurança |
| `express-rate-limit` | ^7.5.0 | Limitação de taxa de requisições |
| `joi` | ^17.11.0 | Validação de schemas |
| `dotenv` | ^16.3.1 | Variáveis de ambiente |
| `nodemailer` | ^8.0.7 | Envio de e-mails |
| `multer` | ^1.4.5-lts.1 | Upload de arquivos |
| `pdfkit` | ^0.18.0 | Geração de PDF |
| `json2csv` | ^6.0.0-alpha.2 | Exportação CSV |
| `cookie-parser` | ^1.4.7 | Parse de cookies |
| `axios` | ^1.6.2 | Cliente HTTP |
| `tsx` | ^4.7.0 | Execução TypeScript em dev |
| `typescript` | ^5.9.3 | Compilador TS |
| `express-async-errors` | ^3.1.1 | Captura de erros assíncronos |

---

## 4. FRONTEND (`/frontend/`)

### 4.1. Visão Geral

Aplicação SPA (Single Page Application) construída com **React 18 + TypeScript + Vite**, estilizada com **Tailwind CSS**. Consome a API do backend para fornecer uma interface completa de gerenciamento.

### 4.2. Configuração

| Arquivo | Finalidade |
|---------|-----------|
| `package.json` | Metadados, scripts e dependências |
| `vite.config.ts` | Build Vite: plugin React, porta 3000, proxy API para localhost:3001 |
| `tsconfig.json` | TypeScript: ES2020, React JSX, strict mode, bundler module resolution |
| `tsconfig.node.json` | TypeScript para arquivos Node/Vite |
| `tailwind.config.js` | Tailwind CSS: cores primárias/secundárias personalizadas, classes safelisted |
| `postcss.config.js` | PostCSS com Tailwind e Autoprefixer |
| `vercel.json` | Deploy Vercel: framework Vite, SPA rewrites, cache headers |
| `index.html` | Ponto de entrada HTML (lang=pt-BR) |

### 4.3. Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento Vite (porta 3000) |
| `npm run build` | Build de produção para dist/ |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | ESLint em arquivos .ts/.tsx |
| `npm run format` | Formatação com Prettier |
| `npm run type-check` | Verificação de tipos TypeScript (sem emitir) |

### 4.4. Estrutura do Frontend (`frontend/src/`)

```
src/
├── main.tsx                    # Ponto de entrada React, renderiza App
├── App.tsx                     # Configuração de rotas com lazy loading
├── styles/
│   └── globals.css             # Diretivas Tailwind + classes customizadas (btn, card, input, label)
├── types/
│   └── index.ts                # Interfaces TypeScript (ITrabalhadorAfastamento, IAcidente, IDoenca, etc.)
├── services/                   # Serviços de API (20 arquivos)
├── store/                      # Stores de estado com Zustand (13 arquivos)
├── hooks/                      # Hooks React customizados (5 arquivos)
├── components/                 # Componentes compartilhados (12 arquivos)
├── pages/                      # Páginas organizadas por módulo (60+ arquivos)
├── utils/                      # Utilitários (4 arquivos)
└── __tests__/
    └── masks.test.ts           # Testes unitários de máscaras de input
```

### 4.5. Services (20 arquivos)

Camada de comunicação com a API backend:

| Service | Finalidade |
|---------|-----------|
| `api.ts` | Instância Axios com interceptors, refresh de token, fila de requisições |
| `authService.ts` | Login, register, logout, forgot/reset password, verify email, profile |
| `acidenteService.ts` | CRUD + estatísticas de acidentes |
| `doencaService.ts` | CRUD + estatísticas de doenças |
| `vacinacaoService.ts` | CRUD + estatísticas de vacinações |
| `materialBiologicoService.ts` | CRUD de material biológico |
| `trabalhadorService.ts` | CRUD de trabalhadores |
| `informacaoService.ts` | CRUD de informações adicionais do trabalhador |
| `submoduloTrabalhadorService.ts` | CRUD de submódulos do trabalhador (dinâmico) |
| `empresaService.ts` | CRUD de empresas |
| `unidadeService.ts` | CRUD de unidades |
| `catalogoService.ts` | CRUD de catálogos |
| `userService.ts` | CRUD de usuários do sistema |
| `analyticsService.ts` | Dados do dashboard |
| `atosService.ts` | CRUD de atos municipais |
| `videoAulaService.ts` | CRUD de videoaulas |
| `servidorService.ts` | CRUD de servidores públicos |
| `questionarioService.ts` | CRUD de questionários |
| `parametroService.ts` | CRUD de parâmetros do sistema |
| `preferenciaService.ts` | CRUD de preferências do usuário |
| `emailService.ts` | CRUD de templates de e-mail |
| `exportService.ts` | Exportação de dados |
| `uploadService.ts` | Upload/download de arquivos |
| `enderecoService.ts` | Gerenciamento de endereços |
| `monitoramentoService.ts` | Monitoramento do sistema |

### 4.6. Stores (13 arquivos - Zustand)

Gerenciamento de estado global do cliente:

| Store | Estado Gerenciado |
|-------|--------------------|
| `authStore.ts` | Autenticação do usuário, initializeAuth |
| `acidenteStore.ts` | Lista/CRUD de acidentes |
| `doencaStore.ts` | Lista/CRUD de doenças |
| `vacinacaoStore.ts` | Lista/CRUD de vacinações |
| `materialBiologicoStore.ts` | Estado de material biológico |
| `trabalhadorStore.ts` | Lista/CRUD de trabalhadores |
| `empresaStore.ts` | Lista/CRUD de empresas |
| `unidadeStore.ts` | Lista/CRUD de unidades |
| `catalogoStore.ts` | Estado de catálogos |
| `userStore.ts` | Estado de usuários do sistema |
| `analyticsStore.ts` | Estado do dashboard |
| `videoAulaStore.ts` | Estado de videoaulas |
| `questionarioStore.ts` | Estado de questionários |

### 4.7. Hooks Customizados (5 arquivos)

| Hook | Finalidade |
|------|-----------|
| `useAuth.ts` | Hook auxiliar de autenticação |
| `useForm.ts` | Gerenciamento de formulários com validação |
| `useCatalogo.ts` | Carregamento de dados de catálogo |
| `useDebounce.ts` | Hook de debounce para digitação |
| `useAsync.ts` | Manipulador de operações assíncronas (loading, erro, dados) |

### 4.8. Componentes Compartilhados (12 arquivos)

| Componente | Finalidade |
|-----------|-----------|
| `ProtectedRoute.tsx` | Guarda de rota com verificação de papel (admin, gestor) |
| `Header.tsx` | Cabeçalho de navegação |
| `Footer.tsx` | Rodapé da página |
| `DataTable.tsx` | Tabela de dados reutilizável com ordenação e paginação |
| `FormFields.tsx` | Componentes de formulário reutilizáveis |
| `KPICard.tsx` | Card de indicador KPI para dashboard |
| `HealthCheck.tsx` | Exibição de verificação de saúde do sistema |
| `AlertaOrientacaoMobile.tsx` | Alerta de orientação para mobile (landscape) |
| `charts/BarChartComponent.tsx` | Gráfico de barras (Recharts) |
| `charts/PieChartComponent.tsx` | Gráfico de pizza (Recharts) |
| `charts/AcidentesPorMes.tsx` | Gráfico de acidentes por mês |
| `charts/AbsenteismoChart.tsx` | Gráfico de absenteísmo |
| `charts/index.ts` | Exportação centralizada dos gráficos |

### 4.9. Módulos de Páginas

Organizadas por funcionalidade dentro de `pages/`:

#### Autenticação
- `Login.tsx` - Tela de login
- `Register.tsx` - Tela de cadastro
- `ForgotPassword.tsx` - Esqueci minha senha
- `ResetPassword.tsx` - Redefinir senha
- `VerifyEmail.tsx` - Verificação de e-mail

#### Dashboard
- `Home.tsx` - Página inicial
- `Dashboard.tsx` - Dashboard com KPIs e gráficos
- `Monitoramento.tsx` - Monitoramento do sistema

#### Acidentes de Trabalho
- `Acidentes/index.ts` - Página principal do módulo
- `Acidentes/ListaAcidentes.tsx` - Listagem de acidentes
- `Acidentes/NovoAcidente.tsx` - Cadastro de acidente
- `Acidentes/EditarAcidente.tsx` - Edição de acidente
- `Acidentes/DetalhesAcidente.tsx` - Detalhes do acidente

#### Material Biológico
- `Acidentes/MaterialBiologico/ListaMaterialBiologico.tsx` - Listagem
- `Acidentes/MaterialBiologico/NovoMaterialBiologico.tsx` - Cadastro
- `Acidentes/MaterialBiologico/EditarMaterialBiologico.tsx` - Edição
- `Acidentes/MaterialBiologico/VisualizarMaterialBiologico.tsx` - Visualização

#### Doenças Ocupacionais
- `Doencas/index.ts` - Página principal
- `Doencas/ListaDoencas.tsx` - Listagem
- `Doencas/NovaDoenca.tsx` - Cadastro
- `Doencas/EditarDoenca.tsx` - Edição
- `Doencas/DetalhesDoenca.tsx` - Detalhes

#### Vacinações
- `Vacinacoes/index.ts` - Página principal
- `Vacinacoes/ListaVacinacoes.tsx` - Listagem
- `Vacinacoes/NovaVacinacao.tsx` - Cadastro
- `Vacinacoes/EditarVacinacao.tsx` - Edição
- `Vacinacoes/DetalhesVacinacao.tsx` - Detalhes

#### Trabalhadores
- `Trabalhadores/index.ts` - Página principal
- `Trabalhadores/ListaTrabalhadores.tsx` - Listagem
- `Trabalhadores/NovoTrabalhador.tsx` - Cadastro
- `Trabalhadores/EditarTrabalhador.tsx` - Edição
- `Trabalhadores/DetalhesTrabalhador.tsx` - Detalhes
- `Trabalhadores/Afastamentos/` - Submódulo de afastamentos (Lista, Form)
- `Trabalhadores/Dependentes/` - Submódulo de dependentes (Lista, Form)
- `Trabalhadores/Vinculos/` - Submódulo de vínculos (Lista, Form)
- `Trabalhadores/OcorrenciasViolencia/` - Submódulo de violência (Lista, Form)
- `Trabalhadores/Readaptacoes/` - Submódulo de readaptações (Lista, Form)
- `Trabalhadores/ProcessosTrabalho/` - Submódulo de processos (Lista, Form)
- `Trabalhadores/Informacoes/` - Submódulo de informações (Lista, Form)

#### Videoaulas
- `VideoAulas/index.ts` - Página principal
- `VideoAulas/ListaVideoAulas.tsx` - Listagem
- `VideoAulas/FormVideoAula.tsx` - Cadastro/Edição
- `VideoAulas/VideoPlayer.tsx` - Player de vídeo

#### Atos Municipais
- `AtosMunicipais/ListaAtos.tsx` - Listagem
- `AtosMunicipais/FormAto.tsx` - Cadastro/Edição

#### Administração
- `Admin/Empresas/ListaEmpresas.tsx` - Listagem de empresas
- `Admin/Empresas/FormEmpresa.tsx` - Cadastro/Edição
- `Admin/Unidades/ListaUnidades.tsx` - Listagem de unidades
- `Admin/Unidades/FormUnidade.tsx` - Cadastro/Edição
- `Admin/Usuarios/ListaUsuarios.tsx` - Listagem de usuários
- `Admin/Usuarios/EditarUsuario.tsx` - Edição de usuário
- `Admin/Catalogos/ListaCatalogos.tsx` - Listagem de catálogos
- `Admin/Catalogos/ItensCatalogo.tsx` - Itens do catálogo
- `Admin/Auditoria.tsx` - Logs de auditoria

### 4.10. Dependências do Frontend

| Pacote | Versão | Finalidade |
|--------|--------|------------|
| `react` | ^18.2.0 | Biblioteca de UI |
| `react-dom` | ^18.2.0 | Renderização React DOM |
| `react-router-dom` | ^6.20.0 | Roteamento client-side |
| `@tanstack/react-query` | ^5.25.0 | Gerenciamento de estado do servidor |
| `zustand` | ^4.4.7 | Gerenciamento de estado do cliente |
| `axios` | ^1.6.2 | Cliente HTTP |
| `lucide-react` | ^1.8.0 | Biblioteca de ícones |
| `recharts` | ^2.10.3 | Biblioteca de gráficos |
| `date-fns` | ^2.30.0 | Formatação de datas |
| `react-hot-toast` | ^2.4.1 | Notificações toast |

### 4.11. Dev Dependencies do Frontend

| Pacote | Finalidade |
|--------|-----------|
| `vite` | Bundler e dev server |
| `tailwindcss` | Framework CSS utilitário |
| `typescript` | Compilador TypeScript |
| `eslint` | Linter |
| `prettier` | Formatador de código |
| `postcss` | Processador CSS |
| `autoprefixer` | Prefixos CSS automáticos |
| `@vitejs/plugin-react` | Plugin React para Vite |

---

## 5. ESTILIZAÇÃO E DESIGN

### 5.1. Tailwind CSS

O projeto utiliza **Tailwind CSS** como framework de estilização. A configuração personalizada está em `frontend/tailwind.config.js`:

**Cores personalizadas:**

```js
primary: {
  50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
  400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
  800: '#1e40af', 900: '#1e3a8a'
}
secondary: {
  50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
  400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
  800: '#1e293b', 900: '#0f172a'
}
```

### 5.2. Classes CSS Customizadas (em `globals.css`)

O arquivo `globals.css` define classes utilitárias reutilizáveis:

- `.btn` e variações (`.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-success`) - Botões estilizados
- `.card` e `.card-header`, `.card-body` - Cards de conteúdo
- `.input`, `.input-error` - Campos de formulário
- `.label` - Rótulos de formulário
- `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info` - Tags/status
- `.modal-overlay`, `.modal-content` - Modais
- `.sidebar`, `.sidebar-link`, `.sidebar-link-active` - Sidebar de navegação
- `.select` - Campos de seleção

### 5.3. Responsividade

A interface é responsiva com suporte a dispositivos móveis, incluindo:
- Menu adaptável para telas menores
- Componente `AlertaOrientacaoMobile.tsx` para alertar sobre orientação landscape
- Grid adaptável com Tailwind (sm:, md:, lg:, xl: breakpoints)

---

## 6. ROTEIRO DE API (ROTAS COMPLETAS)

| Prefixo | Módulo | Métodos |
|--------|--------|---------|
| `/api/auth` | Autenticação | POST register, login, logout, refresh-token, forgot-password, reset-password, verify-email; GET me; PUT profile |
| `/api/acidentes` | Acidentes | GET, POST, PUT, DELETE + `/trabalhador/:id` + `/stats/estatisticas` |
| `/api/doencas` | Doenças | GET, POST, PUT, DELETE + `/trabalhador/:id` + `/stats/estatisticas` |
| `/api/vacinacoes` | Vacinações | GET, POST, PUT, DELETE + `/trabalhador/:id` + `/stats/estatisticas` |
| `/api/material-biologico` | Material Biológico | GET, POST, PUT, DELETE |
| `/api/trabalhadores` | Trabalhadores | GET, POST, PUT, DELETE |
| `/api/trabalhadores/:id/:submodulo` | Submódulos | GET, POST, PUT, DELETE (submódulos dinâmicos) |
| `/api/empresas` | Empresas | GET, POST, PUT, DELETE |
| `/api/unidades` | Unidades | GET, POST, PUT, DELETE |
| `/api/catalogos/:entidade` | Catálogos | GET, POST, PUT, DELETE |
| `/api/usuarios` | Usuários | GET, POST, PUT, DELETE |
| `/api/analytics` | Analytics | GET kpis, acidentes, vacinacoes/proximas, dashboard |
| `/api/reports` | Relatórios | GET |
| `/api/audit` | Auditoria | GET /logs, /stats |
| `/api/export` | Exportação | GET |
| `/api/enderecos` | Endereços | GET, POST, PUT, DELETE |
| `/api/emails` | E-mails | CRUD /padroes + POST /enviar |
| `/api/parametros` | Parâmetros | GET, POST, PUT, DELETE |
| `/api/preferencias` | Preferências | GET/PUT /minhas, GET/PUT /usuario/:id |
| `/api/questionarios` | Questionários | CRUD + itens aninhados |
| `/api/servidores` | Servidores | GET, POST, PUT, DELETE |
| `/api/uploads` | Uploads | CRUD + download |
| `/api/video-aulas` | Videoaulas | CRUD |
| `/api/atos-municipais` | Atos Municipais | CRUD |
| `/api/csrf-token` | CSRF | GET |
| `/health` | Health Check | GET |
| `/api/health` | Health Check | GET |

---

## 7. RECURSOS DE SEGURANÇA

| Recurso | Descrição |
|---------|-----------|
| **Autenticação JWT** | Tokens de acesso + refresh tokens com versionamento para invalidação |
| **Autorização RBAC** | Controle por papéis: `admin` (acesso total), `gestor` (gerencial), `user` (básico) |
| **Proteção CSRF** | Padrão double-submit cookie para autenticação baseada em cookies |
| **Rate Limiting** | 200 requisições/15min global, 60 req/15min para operações de escrita |
| **Helmet** | Headers de segurança (CSP, XSS, frame ancestors, etc.) |
| **CORS** | Validação de origens por whitelist |
| **Validação de Input** | Schemas Joi em todos os endpoints |
| **Auditoria** | Logging automático via middleware + logging manual controlado com sanitização de dados sensíveis |
| **Hash de Senhas** | bcryptjs |
| **Scan de Segredos** | Pipeline CI/CD com TruffleHog |

---

## 8. CI/CD E DEPLOYMENT

### 8.1. GitHub Actions (`.github/workflows/ci-cd.yml`)

| Job | Descrição |
|-----|-----------|
| `test-backend` | Node 18, npm ci, build, testes, npm audit |
| `test-frontend` | Node 18, npm ci, type-check, build, npm audit |
| `security-check` | TruffleHog (scan de segredos) + grep por segredos hardcoded |
| `deploy-backend` | POST para webhook de deploy do Render |
| `deploy-frontend` | Deploy na Vercel via amondnet/vercel-action |

### 8.2. Alvos de Deploy

| Componente | Plataforma | URL |
|-----------|-----------|-----|
| **Backend** | Render (free tier, us-east-1) | `https://sispnaist-1-0.onrender.com` |
| **Frontend** | Vercel | `https://sispnaist-1-0.vercel.app` |
| **Banco de Dados** | MongoDB Atlas (nuvem) | - |

---

## 9. FUNCIONALIDADES PRINCIPAIS

1. **Gestão de Trabalhadores** - Cadastro completo com perfil, dados pessoais, contato, endereço, documentação
2. **Registro de Acidentes de Trabalho** - Detalhamento completo com tipo, local, consequências, testemunhas
3. **Registro de Doenças Ocupacionais** - Acompanhamento de doenças relacionadas ao trabalho
4. **Controle de Vacinação** - Registro e acompanhamento de vacinas dos trabalhadores
5. **Exposição a Material Biológico** - Registro de incidentes com material biológico
6. **Submódulos do Trabalhador** - Afastamentos, dependentes, vínculos, readaptações, ocorrências de violência, processos de trabalho
7. **Gestão de Empresas e Unidades** - Cadastro de organizações e departamentos
8. **Catálogos Dinâmicos** - Tabelas auxiliares configuráveis (sexo, gênero, raça, escolaridade, etc.)
9. **Dashboard Analítico** - KPIs, gráficos de acidentes, absenteísmo, vacinações próximas
10. **Relatórios** - Geração de relatórios em PDF
11. **Auditoria** - Trilha completa de todas as operações realizadas
12. **Videoaulas** - Conteúdo educativo em vídeo
13. **Questionários** - Avaliações e formulários dinâmicos
14. **Atos Municipais** - Registro de decretos e regulamentações municipais
15. **Gestão de Usuários** - Controle de acesso com papéis (admin, gestor, user)
16. **Upload de Arquivos** - Anexos e documentos
17. **Templates de E-mail** - Comunicação automatizada
18. **Parâmetros do Sistema** - Configurações globais
19. **Preferências do Usuário** - Personalização por usuário
20. **Exportação de Dados** - Exportação em formatos diversos

---

## 10. CONCEITOS E ARQUITETURA

### 10.1. Arquitetura em Camadas (Backend)

```
Rotas (routes/) → Middleware (auth, validation, csrf, rate-limit) → 
Controllers (controllers/) → Services (services/) → Models (models/) → MongoDB
```

Cada camada tem responsabilidades bem definidas:
- **Routes**: Definem os endpoints HTTP e aplicam middlewares
- **Middleware**: Interceptam requisições para autenticação, validação, segurança
- **Controllers**: Recebem a requisição, chamam services, formatam resposta
- **Services**: Contêm toda a lógica de negócio
- **Models**: Definem schemas e interagem com o MongoDB via Mongoose

### 10.2. Gerenciamento de Estado (Frontend)

- **Zustand**: Estado global do cliente (dados de formulário, listas, CRUD)
- **React Query (@tanstack/react-query)**: Estado do servidor (cache, refetch, mutações)
- **Axios Interceptors**: Tratamento centralizado de erros, refresh de token, fila de requisições

### 10.3. Autenticação e Sessão

Fluxo de autenticação:
1. Usuário faz login → recebe access token (15min) + refresh token (7d)
2. Access token é enviado em todas as requisições (Authorization header)
3. Quando access token expira, o interceptor do Axios usa o refresh token para obter um novo
4. Refresh tokens podem ser invalidados individualmente (token versioning)

### 10.4. Catálogos Dinâmicos

O sistema usa uma abordagem de "catálogos" para dados de referência (como listas de sexo, gênero, raça, escolaridade, etc.). Em vez de tabelas fixas no banco, usa-se uma única coleção `catalogos` com um campo `entidade` que categoriza os itens. Isso permite:
- Gerenciamento dinâmico via interface de administração
- Adição de novos valores sem alterar o código
- Consistência dos dados através de validação

### 10.5. Submódulos do Trabalhador

Implementação de roteamento dinâmico onde `/api/trabalhadores/:id/:submodulo` resolve o submódulo automaticamente, permitindo extensibilidade sem adicionar novas rotas para cada tipo de submódulo.

---

## 11. DOCUMENTAÇÃO

| Arquivo | Conteúdo |
|---------|----------|
| `Doc/AUDITORIA_IMPLEMENTACAO.md` | Análise completa do módulo de auditoria comparando a versão PHP legada com a nova implementação React. 507 linhas documentando arquitetura, schema, funcionalidades implementadas, segurança e instruções de teste. |

---

## 12. RESUMO FINAL

O **SISPNAIST** é um sistema completo de **Gestão de Segurança do Trabalhador**, desenvolvido como uma aplicação web full-stack moderna em **TypeScript**. Ele representa a reescrita de um sistema legado em PHP para uma arquitetura contemporânea com React + Node.js + MongoDB.

### Principais Características Técnicas:
- **Full-stack TypeScript**: Código tipado do banco à interface
- **MongoDB com Mongoose**: Migração de PostgreSQL para banco NoSQL
- **JWT com refresh tokens**: Autenticação segura com versionamento
- **RBAC**: Controle de acesso por papéis (admin, gestor, user)
- **CRUD completo**: Para todas as entidades com paginação e filtros
- **Dashboard analítico**: KPIs e gráficos com Recharts
- **Auditoria completa**: Trilha com logging automático e manual
- **Segurança em camadas**: CSRF, rate limiting, Helmet, validação Joi
- **CI/CD automatizado**: GitHub Actions → Vercel (frontend) + Render (backend)
- **Funcionalidades brasileiras**: Validação de CPF, catálogos dinâmicos, legislação trabalhista brasileira
- **Interface responsiva**: Adaptável para mobile e desktop

### Tamanho do Projeto:
- **~82 arquivos TypeScript** no backend
- **~75+ arquivos TypeScript/React** no frontend
- **23 modelos Mongoose** no banco de dados
- **25 módulos de API** diferentes
- **60+ páginas** na interface do usuário
- **~25 services** de comunicação com API

---

*Relatório gerado em Junho de 2026*
