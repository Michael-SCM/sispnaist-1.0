# 📋 ROADMAP DE IMPLEMENTAÇÃO - Sprint by Sprint

## 🎯 Visão Geral

Este documento serve como guia prático passo-a-passo para implementar as funcionalidades ainda faltantes no SISPNAIST.

**Tempo Estimado Total:** 4-6 semanas  
**Equipe Recomendada:** 2-3 desenvolvedores  
**Start Recomendado:** Depois de validar auth flow no dev

---

## **SPRINT 1 - Semana 1 (CRUD de Acidentes)**

### 🎯 Objetivo
Implementar CRUD completo de acidentes (backend + frontend) para validar padrão de desenvolvimento.

### ✅ Checklist Backend

```
□ Criar acidenteController.ts
  └─ register = asyncHandler(async (req, res) => {
       const acidente = await acidenteService.criar(req.body);
       res.status(201).json({ status: 'success', data: { acidente } });
     })
  └─ listar = asyncHandler(async (req, res) => { ... })
  └─ obter = asyncHandler(async (req, res) => { ... })
  └─ atualizar = asyncHandler(async (req, res) => { ... })
  └─ deletar = asyncHandler(async (req, res) => { ... })
  └─ obterPorTrabalhador = asyncHandler(async (req, res) => { ... })

□ Criar acidenteService.ts (ou copiar de EXEMPLOS_IMPLEMENTACAO.md)
  └─ criar(data) - persiste e retorna
  └─ obter(id) - busca por ID com populate
  └─ listar(filtros, opcoes) - com paginação
  └─ atualizar(id, data) - atualiza campos
  └─ deletar(id) - remove documento
  └─ obterPorTrabalhador(id) - busca por filtro

□ Criar routes/acidentes.ts
  └─ POST   /api/acidentes (criar)
  └─ GET    /api/acidentes (listar)
  └─ GET    /api/acidentes/:id (obter)
  └─ PUT    /api/acidentes/:id (atualizar)
  └─ DELETE /api/acidentes/:id (deletar)
  └─ GET    /api/acidentes/trabalhador/:id (por trabalhador)
  └─ Proteger com authMiddleware
  └─ Validar com Joi schema

□ Adicionar rotas no app.ts
  └─ import acidentesRouter from './routes/acidentes.js'
  └─ app.use('/api/acidentes', acidentesRouter)

□ Criar joi schema para acidentes
  └─ criarSchema: dataAcidente, tipoAcidente (enum), descricao required
  └─ atualizarSchema: campos opcionais
  └─ Validação de enum e datas

□ Testar no Postman/Insomnia
  └─ POST /api/acidentes (criar teste)
  └─ GET /api/acidentes (listar)
  └─ GET /api/acidentes/:id (obter)
  └─ PUT /api/acidentes/:id (atualizar)
  └─ DELETE /api/acidentes/:id (deletar)
  └─ Validar tokens JWT
```

### ✅ Checklist Frontend

```
□ Criar acidenteService.ts em services/
  └─ classe AcidenteService {
  └─   criar(data) → POST /acidentes
  └─   listar(page, limit, filtros) → GET /acidentes?...
  └─   obter(id) → GET /acidentes/:id
  └─   atualizar(id, data) → PUT /acidentes/:id
  └─   deletar(id) → DELETE /acidentes/:id
  └─ }

□ Criar store para acidentes em store/acidenteStore.ts
  └─ State:
  └─   acidentes: IAcidente[]
  └─   totalAcidentes: number
  └─   currentPage: number
  └─   filtroTipo: string
  └─   filtroData: [Date, Date]
  └─ Actions:
  └─   setAcidentes(list)
  └─   adicionarAcidente(acidente)
  └─   atualizarAcidente(id, data)
  └─   removerAcidente(id)
  └─   setFiltros(...)

□ Criar página pages/Acidentes/ListaAcidentes.tsx
  └─ MainLayout wrapper
  └─ Header com título + botão "Novo Acidente"
  └─ Filtros:
  └─   Select para tipo (Típico, Trajeto, Doença, etc)
  └─   DateRange picker (data início/fim)
  └─   Search por trabalhador (nome/CPF)
  └─ DataTable:
  └─   Colunas: Data, Tipo, Trabalhador, Status, Ações
  └─   Paginação: página, limit dropdown
  └─   Sorting por data, tipo, status
  └─   Ações: Ver, Editar, Deletar
  └─ Loading state (skeleton loaders)
  └─ Empty state (nenhum acidente)
  └─ Error state (erro ao carregar)

□ Criar página pages/Acidentes/NovoAcidente.tsx
  └─ Formulário com campos:
  └─   Data do Acidente (DatePicker)
  └─   Horário (TimePicker)
  └─   Tipo de Acidente (Select enum)
  └─   Descrição (Textarea)
  └─   Local (Input)
  └─   Lesões (Multi-select ou tags)
  └─   Feriado (Checkbox)
  └─   Status (Select)
  └─ Validação:
  └─   Data não pode ser no futuro
  └─   Descrição mínimo 10 caracteres
  └─   Tipo é obrigatório
  └─   Feedback de erro em tempo real
  └─ Submit:
  └─   Desabilita botão enquanto envia
  └─   Toast de sucesso/erro
  └─   Redireciona para lista após sucesso
  └─ Cancel button

□ Criar página pages/Acidentes/EditarAcidente.tsx
  └─ Similar ao NovoAcidente
  └─ Carrega dados iniciais por GET /acidentes/:id
  └─ Popula form com valores
  └─ Submit faz PUT em vez de POST
  └─ Confirmação antes de deletar

□ Criar componente DataTable reutilizável
  └─ Aceita: columns[], data[], isLoading, onSort, onPaginate
  └─ Features:
  └─   Sorting por clique no header
  └─   Paginação com prev/next
  └─   Linha clicável para detalhe
  └─   Checkbox para multi-select
  └─   Actions column
  └─ Styling: Tailwind

□ Criar componente Form reutilizável
  └─ FormField wrapper:
  └─   Label + Input + Error
  └─   Componentes específicos: TextInput, Select, DatePicker, TextArea, Checkbox
  └─   Integração com useForm hook
  └─   Validação inline

□ Atualizar routes no App.tsx
  └─ <Route path="/acidentes" element={<ProtectedRoute><ListaAcidentes /></ProtectedRoute>} />
  └─ <Route path="/acidentes/novo" element={<ProtectedRoute><NovoAcidente /></ProtectedRoute>} />
  └─ <Route path="/acidentes/:id" element={<ProtectedRoute><EditarAcidente /></ProtectedRoute>} />

□ Atualizar Header.tsx
  └─ Adicionar link para /acidentes no menu
  └─ Menu: Home | Acidentes | Doenças | Vacinações | Perfil | Logout

□ Testar E2E
  └─ Login como trabalhador
  └─ Navegar para acidentes (lista vazia?)
  └─ Criar novo acidente
  └─ Validar não pode submeter inválido
  └─ Editar acidente criado
  └─ Deletar acidente
  └─ Verificar lista atualiza em tempo real
```

### 📦 Arquivos a Criar/Modificar

```
CRIAR:
├── backend/src/controllers/acidenteController.ts
├── backend/src/services/AcidenteService.ts
├── backend/src/routes/acidentes.ts
├── backend/src/utils/acidenteValidations.ts (Joi schemas)
├── frontend/src/services/acidenteService.ts
├── frontend/src/store/acidenteStore.ts
├── frontend/src/pages/Acidentes/
│   ├── ListaAcidentes.tsx
│   ├── NovoAcidente.tsx
│   ├── EditarAcidente.tsx
│   └── index.ts
├── frontend/src/components/DataTable/
│   ├── DataTable.tsx
│   └── TableHeader.tsx
└── frontend/src/components/Form/
    ├── FormField.tsx
    ├── TextInput.tsx
    ├── Select.tsx
    ├── DatePicker.tsx
    └── TextArea.tsx

MODIFICAR:
├── backend/src/app.ts (adicionar rota acidentes)
├── backend/src/types/index.ts (adicionar tipos IAcidente)
├── frontend/src/App.tsx (adicionar routes)
├── frontend/src/components/Header.tsx (adicionar links)
└── frontend/src/pages/Dashboard.tsx (adicionar link quick-start)
```

### ⏱️ Tempo Estimado
- Backend Controllers/Services/Routes: **2-4 horas**
- Backend Testing: **1 hora**
- Frontend Pages/Components: **6-8 horas**
- Frontend Testing/Integration: **2 horas**
- **Total: 11-15 horas** (1 dev, 2-3 dias)

### 🧪 Testes Manuais

```
Backend:
curl -X POST http://localhost:3001/api/acidentes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "dataAcidente": "2024-04-08",
    "tipoAcidente": "Típico",
    "descricao": "Queda do trabalhador",
    "trabalhadorId": "<user_id>"
  }'

curl -X GET http://localhost:3001/api/acidentes?page=1&limit=10 \
  -H "Authorization: Bearer <token>"

Frontend:
- Abrir http://localhost:3000/acidentes
- Verificar login
- Testar filtros
- Novo acidente
- Editar
- Deletar
```

---

## **SPRINT 2 - Semana 2 (CRUD de Doenças + Vacinações)**

### 🎯 Objetivo
Replicar padrão CRUD (copiar, adaptar) para Doenças e Vacinações.

### ✅ Checklist

```
□ DOENÇAS
  Backend:
  □ Copiar acidenteController → doencaController.ts
  □ Adaptar métodos para Doenca model
  □ Criar doencaService.ts com filtros por trabalhador
  □ Criar routes/doencas.ts
  □ Adicionar em app.ts
  
  Frontend:
  □ doencaService.ts
  □ doencaStore.ts
  □ ListaDoencas.tsx
  □ NovaDoenca.tsx
  □ EditarDoenca.tsx
  □ Adicionar links no Header

□ VACINAÇÕES
  Backend:
  □ Copiar acidenteController → vacinacaoController.ts
  □ Adaptar para Vacinacao model
  □ Criar vacinacaoService.ts
  □ Feature especial: lógica de proximoDose
  □ Criar routes/vacinacoes.ts
  □ Adicionar em app.ts
  
  Frontend:
  □ vacinacaoService.ts
  □ vacinacaoStore.ts
  □ ListaVacinacoes.tsx (com calendário visual)
  □ NovaVacinacao.tsx
  □ EditarVacinacao.tsx
  □ Adicionar links

□ Testes E2E completo
```

### ⏱️ Tempo Estimado
- **16-20 horas** (2-3 dias, 1 dev ou 1.5 dias 2 devs)

---

## **SPRINT 3 - Semana 3 (Admin: Empresas + Unidades + Usuários)**

### 🎯 Objetivo
Implementar CRUD para entidades administrativas com role-based access control.

### ✅ Checklist

```
□ ROLE-BASED ACCESS CONTROL (Backend)
  □ Middleware para verificar perfil: requireRole('admin', 'gestor')
  □ Aplicar em routes de admin
  □ Lógica: Admin vê tudo, Gestor vê sua unidade, Trabalhador só seus dados

□ EMPRESAS
  Backend:
  □ empresaController.ts
  □ empresaService.ts com validação CNPJ
  □ routes/empresas.ts (apenas admin)
  □ Endpoints: listar, criar, editar, deletar
  
  Frontend:
  □ Página /admin/empresas
  □ Table com RAZÃO SOCIAL | CNPJ | EMAIL | TELEFONE | AÇÕES
  □ New/Edit Modal
  □ CNPJ mask em input

□ UNIDADES
  Backend:
  □ unidadeController.ts
  □ unidadeService.ts
  □ routes/unidades.ts
  □ GET /unidades?empresaId=x (filtrado)
  
  Frontend:
  □ Página /admin/unidades
  □ Select empresa para filtrar
  □ Table com NOME | EMPRESA | CIDADE | GESTOR | AÇÕES
  □ New/Edit Modal

□ USUÁRIOS (Admin)
  Backend:
  □ usersController.ts (admin endpoints only)
  □ Endpoints: listar, obter, editar perfil, deletar, ativar/desativar
  □ Não permitir editar senha aqui
  
  Frontend:
  □ Página /admin/usuarios
  □ Filtros: perfil, ativo/inativo
  □ Table com CPF | NOME | EMAIL | PERFIL | STATUS | AÇÕES
  □ Modal para editar dados
  □ Botão toggle ativar/desativar

□ Layout Admin
  □ Sidebar com menu: Dashboard | Empresas | Unidades | Usuários | Log
  □ Proteção: só admin vê essas rotas
  □ Breadcrumb de navegação

□ Role-based tests
  □ Admin consegue acessar todas pages
  □ Gestor consegue acessar só sua unidade
  □ Trabalhador recebe 403 em admin pages
```

### ⏱️ Tempo Estimado
- **20-25 horas** (3-4 dias)

---

## **SPRINT 4 - Semana 4 (Dashboard + Relatórios + Gráficos)**

### 🎯 Objetivo
Implementar dashboard com analytics e relatórios.

### ✅ Checklist

```
□ Dashboard Admin
  Frontend Components:
  □ Card KPI: Total Acidentes, Total Trabalhadores, Acidentes Abertos, Taxa Resolvimento
  □ Gráfico: Acidentes por mês (LineChart com recharts)
  □ Gráfico: Acidentes por tipo (PieChart)
  □ Gráfico: Trabalhadores por empresa (BarChart)
  □ Tabela: Últimos acidentes (5 mais recentes)
  □ Tabela: Vacinações próximas vencer

□ Dashboard Trabalhador
  □ Resumo pessoal: Acidentes registrados, Doenças, Vacinações
  □ Próxima vacinação (alert se vencida)
  □ Últimas atividades

□ Novos Endpoints Backend (Analytics)
  □ GET /api/analytics/acidentes (count, por tipo, por período)
  □ GET /api/analytics/vacinacoes (próximas vencer)
  □ GET /api/analytics/dashboard (tudo junto para admin)
  □ Todos protegidos por role

□ Novo Store Analytics
  □ analyticsStore.ts (Zustand)
  □ Estado: kpis, chartData, loading
  □ Cache de 5 minutos

□ Exportação
  □ Botão "Exportar PDF" em relatórios
  □ Usar library: pdfkit ou html2pdf
  □ Exportar XLS de tabelas
  □ Usar library: xlsx

□ Print-friendly version
  □ CSS @media print
  □ Hide botões, mostrar dados completos
  □ Ctrl+P funciona bem
```

### ⏱️ Tempo Estimado
- **18-22 horas** (2.5-3 dias)

---

## **SPRINT 5 - Semana 5 (Melhorias e Polish)**

### 🎯 Objetivo
Melhorar performance, adicionar features que faltam e polir UX.

### ✅ Checklist

```
□ RESPONSIVIDADE MOBILE
  □ Testar em iPhone SE / Android 6"
  □ Mobile menu (hamburger)
  □ DataTable em mobile (scroll horizontal ou expandable rows)
  □ Forms em mobile (stack vertical)
  □ Touch-friendly buttons (min 44x44px)

□ BUSCA E FILTROS AVANÇADOS
  □ Search com debounce (500ms)
  □ Filtro por intervalo de data
  □ Filtro multi-select
  □ Salvar filtros em localStorage
  □ "Limpar filtros" button

□ VALIDAÇÕES MELHORADAS
  □ Mask para CPF: 000.000.000-00
  □ Mask para CNPJ: 00.000.000/0000-00
  □ Mask para CEP: 00000-000
  □ Mask para Telefone: (00) 00000-0000
  □ Validação de CEP com API ViaCEP
  □ Real-time feedback

□ NOTIFICAÇÕES
  □ Toast melhorado (posição, duração, ação)
  □ Badge de notificações no Header
  □ Histórico de notificações
  □ Dismiss/undo actions

□ PERFORMANCE
  □ Code splitting com React.lazy()
  □ Lazy load images
  □ Compress images em build
  □ Cache de API calls (5-10 min)
  □ Virtual scrolling em tabelas longas
  □ Lighthouse score > 80

□ SECURITY
  □ HTTPS em produção
  □ CORS configurado corretamente
  □ Rate limiting no backend
  □ SQL injection prevention (Joi)
  □ XSS prevention (React escape automático)
  □ CSRF protection se usar session cookies

□ DOCUMENTAÇÃO
  □ Setup.md para nova dev
  □ API docs com exemplos curl
  □ Component storybook
  □ Video tutorial de features principais

□ TESTES
  □ Unit tests: Services, Hooks, Utils (>80% coverage)
  □ Integration tests: Auth flow completo
  □ E2E tests: Happy path (login → criar → editar → deletar)
  □ Performance benchmarks
```

### ⏱️ Tempo Estimado
- **20-24 horas** (3 dias)

---

## **SPRINT 6 - Semana 6 (Deploy + Monitoring)**

### 🎯 Objetivo
Preparar para produção.

### ✅ Checklist

```
□ BACKEND DEPLOYMENT
  □ Escolher host: Render, Railway, Heroku, AWS, DigitalOcean
  □ Configurar variáveis de ambiente
  □ Setup MongoDB Atlas (cloud)
  □ Backup automático
  □ SSL/TLS certificate
  □ Domain + DNS
  □ Monitoramento: Sentry, LogRocket
  □ CI/CD (GitHub Actions, GitLab CI)

□ FRONTEND DEPLOYMENT
  □ Build otimizado: npm run build
  □ Deploy em: Vercel, Netlify, GitHub Pages, AWS S3
  □ Setup CDN se necessário
  □ Cache busting em assets
  □ 301 redirects
  □ robots.txt e sitemap.xml

□ ENVIRONMENT VARIABLES
  □ .env.production
  □ .env.staging
  □ .env.development (já tem)
  □ Secrets gerenciados

□ MONITORING & LOGGING
  □ Error tracking (Sentry)
  □ Performance monitoring (New Relic, DataDog)
  □ Log aggregation (CloudWatch, LogRocket)
  □ Uptime monitoring
  □ Alert rules

□ BACKUP & DISASTER RECOVERY
  □ MongoDB backups automáticos (Atlas)
  □ Database replication
  □ Recovery test
  □ Runbook de emergência

□ SEO (para landing page pública)
  □ Meta tags (title, description)
  □ Open Graph tags
  □ Structured data (schema.org)
  □ Sitemap.xml
  □ robots.txt
  □ Google Analytics

□ COMPLIANCE
  □ Política de Privacidade
  □ Terms of Service
  □ LGPD compliance (se Brasil)
  □ Data retention policy
  □ Audit logs de acesso

□ PERFORMANCE FINAL
  □ Lighthouse Audit
  □ PageSpeed Insights
  □ Load testing (k6, Apache JMeter)
  □ Stress testing
  □ Database query optimization
  
□ HANDOFF
  □ Documentação técnica completa
  □ Troubleshooting guide
  □ Onboarding para ops team
  □ Training session com cliente/equipe
```

### ⏱️ Tempo Estimado
- **16-20 horas** (2-3 dias)

---

## **TEMPO TOTAL**

```
SPRINT 1: 11-15 horas (Acidentes)
SPRINT 2: 16-20 horas (Doenças + Vacinações)
SPRINT 3: 20-25 horas (Admin)
SPRINT 4: 18-22 horas (Dashboard + Relatórios)
SPRINT 5: 20-24 horas (Polish)
SPRINT 6: 16-20 horas (Deploy)
─────────────────────────────
TOTAL:   101-126 horas

Cenários:
• 1 Dev em tempo integral: 5-6 semanas
• 2 Devs em paralelo: 2.5-3 semanas
• 3 Devs (+ frontend/backend overlap): 2-2.5 semanas
```

---

## **Dependências Entre Sprints**

```
SPRINT 1 → Estabelece padrão
   ↓
SPRINT 2 → Replica padrão (pode fazer paralelo com 1)
   ↓ (precisa do CRUD funcionando)
SPRINT 3 → Admin (precisa de usuários e empresas setup)
   ↓ (precisa de dados para fazer gráficos)
SPRINT 4 → Dashboard (usa dados de 1-3)
   ↓
SPRINT 5 → Polish (refinamento geral)
   ↓
SPRINT 6 → Deploy (final)

POSSÍVEL PARALELIZAR:
• SPRINT 1 Backend + SPRINT 1 Frontend diferentes devs
• SPRINT 2 enquanto testa SPRINT 1
• SPRINT 3 Admin paralelo com SPRINT 2 features
```

---

## **Monitoramento de Progresso**

### Depois de cada Sprint, verificar:

```
□ Todos testes passando (unit + integration)
□ Sem console.errors ou warnings
□ Performance OK (Lighthouse > 80)
□ Documentação atualizada
□ Code review aprovado
□ Testes E2E passando
□ Merge para main branch
□ Tag de release (v0.1, v0.2, etc)
□ Deploy em staging para cliente testar
```

---

## **Dúvidas Frequentes Durante Implementação**

```
P: Como conectar novo endpoint do backend ao frontend?
R: 1. Criar acidenteService.ts com método
   2. Usar em página/componente
   3. Actualizar store Zustand se necessário
   4. Adicionar loading/error states

P: Como fazer validação que funciona front+back?
R: 1. Backend: Joi schema na rota
   2. Frontend: useForm hook + validação local
   3. Feedback imediato no frontend
   4. Servidor ainda valida (nunca confiar clients)

P: Como adicionar nova página?
R: 1. Criar arquivo .tsx em pages/
   2. Envolver com MainLayout ou específico
   3. Proteger com ProtectedRoute se necessário
   4. Adicionar route em App.tsx
   5. Adicionar link em Header ou Menu

P: Como fazer store Zustand?
R: 1. import { create } from 'zustand'
   2. create((set) => ({ estado, métodos }))
   3. useXXXStore() em componentes
   4. Automático reactivity

P: Como fazer chamada API com token?
R: 1. Usar axiosInstance de api.ts (já tem interceptor)
   2. Token adicionado automaticamente ao Bearer
   3. Se 401, usuario faz logout automático
   4. Tratamento de erro centralizado
```

---

**Documento finalizado em:** 08/04/2026  
**Próxima ação:** Começar SPRINT 1 com um dev  
**Check-in recomendado:** Fim de cada sprint para ajustes 
