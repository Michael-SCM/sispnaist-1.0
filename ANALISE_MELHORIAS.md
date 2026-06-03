# Análise de Melhorias - SISPNAIST 1.0

> Data: 02/06/2026
> Projeto: Sistema de Gerenciamento de Segurança do Trabalhador
> Frontend: https://sispnaist-1-0.vercel.app
> Backend: https://sispnaist-1-0.onrender.com
> Stack: React + Vite (frontend) | Express + TypeScript + MongoDB (backend)

---

## Índice

- [1. Problemas de Segurança (Críticos)](#1-problemas-de-segurança-críticos)
- [2. Problemas de Configuração e Ambiente](#2-problemas-de-configuração-e-ambiente)
- [3. Problemas no Backend](#3-problemas-no-backend)
- [4. Problemas no Frontend](#4-problemas-no-frontend)
- [5. Problemas de Integração/Deploy](#5-problemas-de-integraçãodeploy)
- [6. Problemas de Código e Boas Práticas](#6-problemas-de-código-e-boas-práticas)
- [7. Funcionalidades Faltantes / Melhorias](#7-funcionalidades-faltantes--melhorias)

---

## 1. Problemas de Segurança (Críticos)

### 1.1 JWT_SECRET — servidor aceita iniciar sem ela configurada (falta fail-fast)

**Arquivo:** `backend/src/config/config.ts:9`

```typescript
jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here'
```

> ✅ **Nota:** A variável `JWT_SECRET` já está configurada no Render com uma senha real. Em produção este não é um problema ativo.

**Problema:** O fallback `'your-secret-key-here'` é uma string pública e conhecida. Se amanhã a env var for removida ou renomeada acidentalmente no Render, ou se um novo desenvolvedor clonar o projeto e rodar local sem `.env`, o servidor vai aceitar a chave pública **sem dar nenhum aviso** — qualquer pessoa pode forjar JWTs válidos.

**Solução:** Remover o fallback inseguro e fazer o servidor **falhar ao iniciar** (`process.exit(1)`) se `JWT_SECRET` não estiver definida. Criar uma função `validateConfig()` que verifica todas as variáveis obrigatórias no startup.

### 1.2 Content Security Policy (CSP) desabilitado

**Arquivo:** `backend/src/app.ts:57`

```typescript
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```

**Problema:** O CSP foi completamente desabilitado, o que reduz a proteção contra ataques de XSS (Cross-Site Scripting). Embora possa ser necessário para carregar recursos de múltiplas origens, a abordagem correta seria configurar uma política CSP adequada, não desabilitá-la totalmente.

**Solução:** Configurar uma política CSP que reflita as necessidades reais do projeto (por exemplo, permitindo carregar recursos do próprio domínio, da Vercel, e de serviços específicos como YouTube para vídeos).

### 1.3 Senha sem requisitos de complexidade

**Arquivo provável:** `backend/src/utils/validations.ts`

**Problema:** A validação Joi exige apenas 6 caracteres mínimos para a senha, sem exigir maiúsculas, minúsculas, números ou caracteres especiais. Em um sistema que gerencia dados de saúde ocupacional (dados sensíveis de trabalhadores), senhas fracas representam um risco significativo.

**Solução:** Implementar validação de senha forte com no mínimo 8 caracteres, contendo letra maiúscula, minúscula, número e caractere especial.

### 1.4 Serviço de email silenciosamente inoperante em produção

**Arquivo:** `backend/src/utils/emailService.ts:244-249`

```typescript
if (!config.email.user || !config.email.pass) {
  console.log('AVISO: ...');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Nenhum serviço de envio de e-mail configurado.');
  }
  return; // dev — continua sem enviar
}
```

**Problema:** Em produção no Render, se `BREVO_API_KEY` e `RESEND_API_KEY` não estiverem configuradas, o envio de e-mail lançará um erro. Porém, se o erro não for tratado adequadamente no controller de registro (`register`), o usuário pode ser cadastrado mas o e-mail de verificação nunca é enviado — a conta ficará inativa e o usuário não conseguirá fazer login. O erro estoura em produção, mas em dev ele simplesmente retorna silenciosamente sem enviar nada, dando a falsa impressão de que o cadastro foi concluído.

**Solução:** Configurar `BREVO_API_KEY` no Render para garantir o envio de e-mails, ou implementar um sistema de fallback mais robusto com logging claro e notificação ao usuário de que o e-mail não pôde ser enviado.

### 1.5 Validação de domínio de e-mail via DNS pode travar requisições

**Arquivo:** `backend/src/utils/emailService.ts:16-31`

**Problema:** A validação MX de domínio é chamada de forma síncrona/bloqueante. Em ambientes com DNS lento ou instável (comum no Render), isso pode causar timeouts e travar o cadastro de usuários.

**Solução:** Tornar a validação MX opcional, ou executá-la em background com timeout adequado, não bloqueando o fluxo de cadastro.

---

## 2. Problemas de Configuração e Ambiente

### 2.1 Scripts batch com caminhos incorretos

**Arquivo:** `start-backend.bat:3`
```batch
cd /d "C:\Users\Michael\Documents\Projeto-2026\sispnaist\backend"
```

**Arquivo:** `start-frontend.bat:3`
```batch
cd /d "C:\Users\Michael\Documents\Projeto-2026\sispnaist\frontend"
```

**Problema:** Ambos os scripts apontam para `C:\Users\Michael\Documents\Projeto-2026\sispnaist\...`, mas o diretório real do projeto é `C:\Users\Michael\Documents\Projeto-2026\Last Upgrades\sispnaist 1.0\...`. A diferença de nome de diretório faz com que os scripts não encontrem o caminho e falhem ao executar. Além disso, o nome contém espaços, que precisam ser tratados adequadamente.

**Solução:** Atualizar os caminhos nos dois arquivos `.bat` para corresponder ao diretório real do projeto.

### 2.2 vercel.json no backend com configuração incorreta para Render

**Arquivo:** `backend/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "startCommand": "npm start"
}
```

**Problema:** Este arquivo está na pasta `backend/` e está configurado com `"startCommand": "npm start"`, que é um comando de servidor longo (node dist/server.js). A Vercel não executa servidores persistentes — ela espera funções serverless. Este arquivo parece ser uma sobra de tentativa de deploy do backend na Vercel, mas hoje o backend roda no Render (via `Procfile`). A presença desse arquivo não causa erro, mas é enganosa e pode confundir futuras tentativas de deploy.

**Solução:** Remover ou esclarecer o propósito do `vercel.json` no backend, ou mover para um local apropriado com documentação.

### 2.3 Variáveis de ambiente críticas não validadas no startup

**Arquivo:** `backend/src/config/config.ts`

**Problema:** Nenhuma validação é feita para garantir que variáveis obrigatórias como `MONGODB_URI` e `JWT_SECRET` estejam definidas antes de iniciar o servidor. Em produção, se `MONGODB_URI` estiver faltando, o sistema tentará conectar a `localhost:27017` (que não existe no Render), e retentará a conexão infinitamente sem nunca falhar de forma clara.

**Solução:** Criar uma função `validateConfig()` que verifica todas as variáveis obrigatórias no startup e interrompe o processo com uma mensagem clara se alguma estiver faltando.

---

## 3. Problemas no Backend

### 3.1 Seed de catálogos executado em todo startup do servidor

**Arquivo:** `backend/src/app.ts:69-74`

```typescript
connectDB().then(() => {
  if (process.env.NODE_ENV !== 'test') {
    seedCatalogos().catch(err => console.error('Erro ao rodar seed de catálogos:', err));
  }
});
```

**Problema:** A função `seedCatalogos()` é executada **toda vez que o servidor inicia**. Isso significa:
- A cada deploy no Render (que reinicia o servidor), o seed é executado novamente.
- Se não houver verificação de duplicidade no seed, itens de catálogo serão duplicados a cada restart.
- Em serviços como o Render que podem reiniciar o servidor por diversos motivos (deploy, queda, escalonamento), isso acumula dados espúrios.

**Solução:** Modificar `seedCatalogos()` para verificar se os dados já existem antes de inserir (upsert), ou criar um script separado que execute manualmente.

### 3.2 Graceful shutdown não desconecta do MongoDB

**Arquivo:** `backend/src/server.ts:35-49`

```typescript
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});
```

**Problema:** Quando o servidor recebe SIGTERM (comum no Render durante deploys), o servidor HTTP é fechado mas a conexão com o MongoDB **não é fechada** (`mongoose.disconnect()` não é chamado). Isso pode causar:
- Conexões órfãs no MongoDB Atlas
- Possível corrupção de dados se operações estiverem em andamento
- Warning no log do servidor sobre conexões não encerradas

**Solução:** Adicionar `mongoose.disconnect()` dentro dos handlers `SIGTERM` e `SIGINT` antes do `process.exit()`.

### 3.3 Auditoria: middleware usa `_id` mas controllers usam `id`

**Arquivo:** `backend/src/middleware/auditMiddleware.ts:109`
```typescript
const usuarioId = req.user?._id || 'system';
```

**Arquivo:** `backend/src/utils/auditLogger.ts:42`
```typescript
const usuarioId = req.user?.id || req.user?._id || 'system';
```

**Problema:** O middleware de auditoria (fallback) acessa `req.user._id`, enquanto o utilitário de auditoria tenta `req.user.id` primeiro, depois `_id`. O tipo `IAuthRequest` em `backend/src/types/index.ts` usa `req.user.id` (não `_id`), porque o `id` é adicionado pelo middleware de autenticação JWT. Isso significa que:
- O middleware de auditoria **nunca encontra** `req.user._id` e sempre registra o usuário como `'system'`
- Os logs de auditoria criados pelo middleware sempre terão `usuarioId: 'system'`, mesmo para usuários autenticados

**Solução:** Padronizar o acesso ao ID do usuário. O middleware JWT adiciona `req.user.id` (baseado no `_id` do MongoDB). Usar `req.user?.id || req.user?._id || 'system'` em todos os lugares.

### 3.4 Risco de duplicação de auditoria (middleware + controller)

**Arquivo:** `backend/src/middleware/auditMiddleware.ts` + `backend/src/utils/auditLogger.ts`

**Problema:** O middleware de auditoria é um fallback automático que intercepta todas as requisições e registra CREATE/UPDATE/DELETE. Os controllers também chamam `logAction()` para registrar auditoria com dados mais completos. A flag `auditLogged` (`req.auditLogged = true`) tenta evitar duplicação, mas:
- Se o controller não definir `req.auditLogged = true` em todos os casos (erros, por exemplo), a duplicação acontece
- Se o middleware registrar primeiro (em respostas bem-sucedidas) mas o controller também registrar, haverá dois logs
- A lógica de "quem registra primeiro" é frágil e difícil de manter

**Solução:** Simplificar para usar **apenas** os controllers chamando `logAction()`, ou **apenas** o middleware de auditoria. A abordagem híbrida atual é propensa a bugs.

### 3.5 Múltiplos `console.log` expondo dados sensíveis em produção

**Arquivos diversos do backend**

**Problema:** Diversos `console.log` no backend registram dados de requisições, corpos de requisições, e detalhes de erros em produção. Isso pode expor informações sensíveis nos logs do Render. Exemplos:
- Logging de corpo de requisição em validações
- Dados de erro de API de email (Brevo/Resend) com detalhes da resposta
- `[AUDIT]` e `[AUDIT-FALLBACK]` com dados de operações

**Solução:** Usar uma biblioteca de logging (Winston, Pino) com níveis configuráveis, ou ao menos guardar logs sensíveis com `if (process.env.NODE_ENV !== 'production')`.

### 3.6 Nodemailer cria novo transporter a cada chamada

**Arquivo:** `backend/src/utils/emailService.ts:131-140` e `253-262`

**Problema:** `sendResetPasswordEmail()` e `sendVerificationEmail()` criam um novo `transporter` do Nodemailer **cada vez que são chamados**. Isso é ineficiente, pois cada instância precisa estabelecer uma nova conexão SMTP (handshake, autenticação). Em cenários com múltiplos envios, isso sobrecarrega desnecessariamente.

**Solução:** Criar o transporter uma única vez, fora das funções, e reutilizá-lo em todas as chamadas.

### 3.7 Conexão MongoDB não usa o URI da config

**Arquivo:** `backend/src/config/database.ts:7`

```typescript
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sispatnaist';
```

**Problema:** O arquivo `config.ts` já carrega e processa `MONGODB_URI`, mas `database.ts` lê diretamente de `process.env.MONGODB_URI` em vez de importar `config.mongodbUri`. Isso é redundante e pode levar a inconsistências se a lógica de carregamento mudar no `config.ts`.

**Solução:** Importar `config` de `../config/config.js` e usar `config.mongodbUri`.

### 3.8 Sem limite de tamanho para JSON bodies

**Arquivo:** `backend/src/app.ts:62`

```typescript
app.use(express.json({ limit: '10mb', strict: false }));
```

**Problema:** O limite de 10MB para bodies JSON é muito alto, e `strict: false` permite que arrays, strings e outros tipos sejam aceitos como JSON, em vez de apenas objetos. Isso pode ser explorado para ataques de negação de serviço (enviar payloads enormes).

**Solução:** Reduzir o limite para um valor mais adequado (ex: 1MB) e remover `strict: false` a menos que haja uma necessidade específica documentada.

---

## 4. Problemas no Frontend

### 4.1 CSS duplicado no globals.css

**Arquivo:** `frontend/src/styles/globals.css:21-45 e 47-71`

**Problema:** O bloco `@layer components` com as classes `.btn`, `.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.label` aparece **duas vezes** no arquivo, exatamente idêntico. Isso não causa erro de compilação, mas:
- Aumenta o tamanho do CSS final desnecessariamente
- Pode causar conflitos de especificidade ou comportamento inesperado
- Indica uma falha de edição (CTRL+C / CTRL+V sem limpeza)

**Solução:** Remover o bloco duplicado (linhas 47-71).

### 4.2 Token armazenado em localStorage sem proteção contra XSS

**Arquivo:** `frontend/src/store/authStore.ts`

```typescript
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
```

**Problema:** O token JWT e os dados do usuário são armazenados em `localStorage`, que é acessível por qualquer JavaScript executado na mesma origem. Se houver qualquer vulnerabilidade XSS no frontend (mesmo que pequena), o token pode ser roubado. A alternativa `httpOnly cookie` é mais segura porque não é acessível via JavaScript.

**Solução:** Migrar para armazenamento de token em cookie `httpOnly` (o que exige mudanças no backend para definir o cookie no login), ou ao menos implementar medidas mitigatórias como renovação periódica de token.

### 4.3 Sem validação de formulários no frontend (apenas Joi no backend)

**Problema:** Os formulários parecem depender apenas da validação no backend (Joi), sem validação no frontend. Isso resulta em:
- Experiência de usuário ruim (esperar ir ao servidor para saber que um campo é obrigatório)
- Chamadas de rede desnecessárias para erros que poderiam ser capturados localmente
- Possibilidade de enviar dados mal formatados

**Solução:** Implementar validação de formulários no frontend (com React Hook Form + Zod/Yup, ou ao menos validação nativa HTML5) antes de enviar ao servidor.

### 4.4 Tratamento de erro 401 redireciona sem aviso

**Arquivo:** `frontend/src/services/api.ts:23-25`

```typescript
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

**Problema:** Quando o token expira ou é inválido, o usuário é abruptamente redirecionado para `/login` sem nenhum aviso ou explicação. Todas as ações em andamento são perdidas. Além disso, `window.location.href` causa um hard reload, perdendo o estado da aplicação.

**Solução:** Usar o roteador do React (`useNavigate()` ou `<Navigate>`) para redirecionamento suave, e exibir um toast/notificação explicando que a sessão expirou.

### 4.5 Retry cego em erros 5xx pode causar loops

**Arquivo:** `frontend/src/services/api.ts:29-35`

**Problema:** O interceptor tenta retry automático até 3 vezes para erros 5xx. Porém, não há verificação de idempotência: se a requisição original era um `POST` (criação de recurso), o retry pode criar **múltiplos recursos** duplicados no servidor. Ações não-idempotentes (POST, PATCH) não devem ser repetidas automaticamente.

**Solução:** Implementar retry apenas para métodos idempotentes (GET, PUT, DELETE), ou usar um identificador de idempotência no header da requisição.

### 4.6 Vite define `VITE_API_URL` em build time de forma duplicada

**Arquivo:** `frontend/vite.config.ts:19-21`

```typescript
define: {
  'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://sispnaist-1-0.onrender.com/api'),
},
```

**Problema:** O Vite já substitui `import.meta.env.VITE_API_URL` pelo valor do arquivo `.env` (que também tem o fallback para produção). Ao usar `define`, o valor é substituído **em tempo de compilação** e não pode ser sobrescrito por variáveis de ambiente no servidor (Vercel) durante o runtime. Além disso, se o valor no `.env` for diferente, haverá conflito.

**Solução:** Remover a seção `define` do `vite.config.ts` e deixar que o Vite use o `.env` padrão. Configurar as env vars da Vercel no dashboard.

---

## 5. Problemas de Integração/Deploy

### 5.1 CORS hardcoded e incompleto para produção

**Arquivo:** `backend/src/app.ts:38-53`

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://sispnaist-1-0.vercel.app'
];
```

**Problema:** O CORS está hardcoded e não usa `config.corsOrigin`. Se o frontend for deployed em outro domínio (ex: preview da Vercel, ou domínio customizado), as requisições serão bloqueadas. Além disso, a verificação `origin.endsWith('.vercel.app')` é muito permissiva.

**Solução:** Usar `config.corsOrigin` (definido via variável de ambiente) e validar cada origem explicitamente, ou usar uma lista configurável.

### 5.2 CI/CD sem testes reais e com verificação de secrets frágil

**Arquivo:** `.github/workflows/ci-cd.yml`

**Problema:**
1. O comando `npm test` tem `|| echo "No tests configured"`, ou seja, testes podem falhar que o pipeline continua (falso positivo)
2. A verificação de secrets usa `grep -r "password\|secret\|key" backend/.env* || true` — além de ser frágil, o `|| true` ignora qualquer match encontrado
3. Não há deploy automático para Vercel nem Render no pipeline

**Solução:** Implementar testes reais de backend, remover o `|| true` dos testes, implementar deploy automático via GitHub Actions para Vercel e Render, e melhorar a verificação de secrets.

### 5.3 Backend não tem test suite

**Arquivo:** `backend/package.json:10`
```json
"test": "jest"
```

**Problema:** Jest está listado, mas não há configuração do Jest (jest.config.js), nem testes escritos. O comando `npm test` vai falhar ou executar zero testes. O pipeline de CI considera isso como sucesso (`|| echo "No tests configured"`).

**Solução:** Adicionar configuração Jest e testes para modelos, rotas (integração) e utilitários.

### 5.4 `netlify.toml` desnecessário

**Arquivo:** `frontend/netlify.toml`

**Problema:** Este arquivo indica configuração para deploy na Netlify, mas o frontend está na Vercel. Pode ser uma sobra de configuração anterior que causa confusão.

**Solução:** Remover se não for mais utilizado, ou documentar seu propósito.

---

## 6. Problemas de Código e Boas Práticas

### 6.1 Inconsistência: imports com e sem `.js`

**Problema:** Alguns imports no backend usam extensão `.js` (ex: `'./app.js'`, `'../config/config.js'`), o que é correto para ESM com TypeScript compilado. Porém, alguns imports parecem não ter a extensão (a verificação precisa ser feita caso a caso). Se houver inconsistência, o Node.js pode não resolver os módulos corretamente em produção.

**Solução:** Padronizar todos os imports para usar `.js` (padrão para ESM/TypeScript com `"type": "module"`) ou remover a extensão se CommonJS.

### 6.2 Variável de ambiente `MONGODB_URI` com nome do banco errado

**Arquivo:** `backend/src/config/config.ts:8`
```typescript
mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sispatnaist'
```

O nome do banco no fallback é **sispatnaist** (sem o segundo 'S'), enquanto o projeto chama-se **sispnaist**. Apenas um detalhe cosmético no fallback local, mas que pode causar confusão.

### 6.3 CORS error handler em app.ts pode retornar 500 genérico

**Arquivo:** `backend/src/app.ts:48-49`

```typescript
callback(new Error('Not allowed by CORS'));
```

**Problema:** Quando o CORS rejeita uma origem, o Express retorna um erro 500 (Internal Server Error) genérico, quando o correto seria 403 (Forbidden). Além disso, o erro não é tratado pelo errorHandler da aplicação de forma elegante.

**Solução:** Usar `callback(null, false)` para rejeitar com 403, ou tratar o erro no errorHandler para retornar uma mensagem amigável.

### 6.4 `express-async-errors` importado mas errorHandler pode não capturar todos

**Arquivo:** `backend/src/app.ts:2`

```typescript
import 'express-async-errors';
```

**Problema:** Esta biblioteca captura erros de rotas assíncronas, mas há também um `asyncHandler.ts` no middleware. Pode haver duplicação de funcionalidade ou inconsistência no tratamento de erros.

**Solução:** Escolher uma abordagem: ou usar `express-async-errors` globalmente, ou usar `asyncHandler` por rota, mas não ambos.

---

## 7. Funcionalidades Faltantes / Melhorias

### 7.1 Sem refresh token

**Problema:** O JWT tem duração de 12h (`JWT_EXPIRE`). Quando expira, o usuário é forçado a fazer login novamente. Não há mecanismo de refresh token para renovar a sessão silenciosamente. Isso impacta negativamente a experiência do usuário.

**Sugestão:** Implementar refresh token (token de longa duração armazenado em cookie httpOnly) para renovar o access token automaticamente.

### 7.2 Sem rate limiting na maioria das rotas

**Arquivo:** `backend/src/routes/auth.ts` (provavelmente)

**Problema:** Apenas as rotas de autenticação (register, login, forgot-password, verify-email) parecem ter rate limiting. O resto da API não tem proteção contra abuso. Um atacante pode fazer milhares de requisições para rotas como GET /api/trabalhadores ou POST /api/acidentes sem restrição.

**Sugestão:** Aplicar rate limiting global com limites mais generosos (ex: 100 req/min), e limites mais restritivos para operações de escrita (CRUD).

### 7.3 Sem índice TTL para logs de auditoria

**Problema:** Os logs de auditoria ficam acumulados no MongoDB sem nenhuma política de expiração. Com o tempo, a coleção `audit_logs` pode crescer indefinidamente, consumindo armazenamento e degradando performance de consultas.

**Sugestão:** Adicionar um índice TTL (Time-To-Live) no campo `createdAt` da coleção `audit_logs` para expirar logs mais antigos que X dias (ex: 90 ou 180 dias).

### 7.4 Sem testes (nem unitários, nem de integração)

**Problema:** Zero testes em todo o projeto. Não há como garantir que:
- Uma alteração não quebrou funcionalidades existentes
- As validações Joi funcionam corretamente
- Os controllers tratam erros adequadamente
- As queries do MongoDB retornam os dados esperados

**Sugestão:** Implementar testes unitários para utilitários (validação CPF, JWT, email) e testes de integração para as principais rotas da API, usando um banco de dados de teste separado (MongoDB Memory Server).

### 7.5 Sem paginação em listas de dados

**Problema:** As rotas que listam trabalhadores, acidentes, etc. provavelmente retornam todos os registros de uma vez. Conforme a base de dados cresce, isso se torna insustentável — páginas lentas, consumo excessivo de memória, e eventualmente timeouts.

**Sugestão:** Implementar paginação padronizada (`page`, `limit`, `total`, `totalPages`) em todas as rotas de listagem.

### 7.6 Sem logs estruturados (Winston/Pino)

**Problema:** Todo o logging é feito com `console.log`/`console.error`. Não há:
- Níveis de log (info, warn, error, debug)
- Formatação estruturada
- Rotação de logs
- Integração com sistemas de monitoramento

**Sugestão:** Migrar para Winston ou Pino com diferentes transportes para desenvolvimento e produção.

### 7.7 Sem monitoramento de saúde do banco de dados

**Arquivo:** `backend/src/app.ts:199-206`

**Problema:** O health check (`GET /health`) retorna `{ status: 'OK' }` mesmo se o banco de dados estiver desconectado. O health check não verifica a conexão com o MongoDB.

**Sugestão:** O health check deve verificar se `mongoose.connection.readyState === 1` (conectado) e retornar status diferente (ex: 503) se o banco estiver offline.

### 7.8 Sem cache para dados de catálogo

**Problema:** Catálogos (sexo, raça, escolaridade, etc.) são dados raramente alterados, mas são consultados frequentemente. Toda consulta aos catálogos faz uma query ao MongoDB. Isso gera carga desnecessária no banco.

**Sugestão:** Implementar cache em memória (ou Redis) para dados de catálogo, invalidando apenas quando um item é criado/editado/deletado.

### 7.9 Frontend sem lazy loading de rotas

**Problema:** `App.tsx` importa **todos** os componentes de página estaticamente no topo do arquivo. Isso significa que o bundle inicial contém o código de todas as páginas (acidentes, trabalhadores, admin, etc.), mesmo que o usuário nunca vá acessá-las. O bundle fica desnecessariamente grande.

**Sugestão:** Usar `React.lazy()` + `Suspense` para carregar páginas apenas quando a rota for acessada.

### 7.10 Sem tratamento para uploads em produção

**Problema:** O módulo de uploads (`multer`) salva arquivos em disco (`UPLOAD_DIR`). No Render, o sistema de arquivos é **efêmero** — qualquer arquivo salvo em disco será perdido quando o servidor for reiniciado (o que acontece frequentemente em deploys). Além disso, múltiplas instâncias do servidor não compartilham os mesmos arquivos.

**Sugestão:** Usar um serviço de armazenamento externo como Amazon S3, Cloudinary, ou o Uploadthing para persistência de arquivos, já que o Render (assim como a maioria dos PaaS) não oferece armazenamento persistente.

---

## Resumo de Prioridades

| Prioridade | Item | Impacto |
|---|---|---|
| 🔴 **Crítica** | Seed de catálogos executado em todo startup | Duplicação de dados a cada deploy |
| 🔴 **Crítica** | Serviço de email pode falhar silenciosamente | Usuários não conseguem verificar conta ou redefinir senha |
| 🟠 **Alta** | Auditoria sempre registra `system` como usuário | Logs de auditoria inúteis (não identificam quem fez a ação) |
| 🟠 **Alta** | Graceful shutdown não fecha MongoDB | Conexões órfãs no Atlas, possíveis dados corrompidos |
| 🟠 **Alta** | Scripts batch com caminhos errados | Desenvolvimento local quebrado |
| 🟠 **Alta** | Variáveis de ambiente obrigatórias não validadas | Falhas misteriosas em produção |
| 🟡 **Média** | JWT_SECRET sem fail-fast (já configurada no Render) | Risco futuro se env var for removida |
| 🟡 **Média** | CSS duplicado | Código poluído, CSS maior que o necessário |
| 🟡 **Média** | Token em localStorage | Vulnerabilidade a XSS |
| 🟡 **Média** | CORS hardcoded | Incompatível com previews/preprodução |
| 🟡 **Média** | Retry automático em POST | Duplicação de recursos |
| 🟡 **Média** | Upload salvo em disco efêmero | Arquivos perdidos em restart |
| 🔵 **Baixa** | CSP desabilitado | Proteção XSS reduzida |
| 🔵 **Baixa** | Sem lazy loading | Bundle grande |
| 🔵 **Baixa** | Sem paginação | Performance degrada com crescimento |
| 🔵 **Baixa** | vercel.json enganoso | Confusão em deploy |
| 🔵 **Baixa** | netlify.toml residual | Confusão |

---

> **Nota:** Este documento foi gerado por análise automatizada do código-fonte em 02/06/2026. Recomenda-se revisar cada item e priorizar as correções com base no ambiente atual de produção e nas necessidades do negócio.
