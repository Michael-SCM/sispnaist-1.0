# Análise Completa do Projeto SISPNAIST

> Data: 02/06/2026
> Versão analisada: 1.0.0
> Frontend: `https://sispnaist-1-0.vercel.app`
> Backend: `https://sispnaist-1-0.onrender.com`
> Banco: MongoDB Atlas

---

## Resumo Executivo

O projeto SISPNAIST é um sistema completo de gerenciamento de segurança e saúde do trabalhador. A arquitetura é bem estruturada (monorepo com frontend React + Vite, backend Express + Mongoose, MongoDB Atlas, Vercel + Render), mas foram identificados **vários problemas críticos** que precisam ser corrigidos para garantir o funcionamento perfeito em produção, incluindo **exposição de credenciais**, **bugs de runtime**, **validações incorretas** e **configurações de ambiente ausentes**.

---

## 🔴 CRÍTICOS (Corrigir Imediatamente)

### 1. Credenciais Expostas no Repositório (backend/.env)

**Arquivo:** `backend/.env`
**Problema:** O arquivo `.env` contém credenciais reais do MongoDB Atlas e do Gmail e está versionado no repositório Git.
Linhas expostas:
- `MONGODB_URI` — contém usuário/senha do banco de produção/desenvolvimento
- `EMAIL_PASS` — App Password do Gmail (`ngcq tnut ixgn ganj`)

**Risco:** EXTREMO — qualquer pessoa com acesso ao repositório pode conectar no banco e enviar e-mails como se fosse o sistema.

**Correção:**
1. Remover o arquivo do versionamento:
```bash
git rm --cached backend/.env
```
2. Adicionar `backend/.env` ao `.gitignore`
3. Revogar as credenciais expostas (senha do MongoDB, App Password do Gmail) e gerar novas
4. Usar apenas variáveis de ambiente na plataforma (Render Dashboard > Environment Variables)

---

---

### 3. Schema de Atualização de Acidente com Campos Obrigatórios

**Arquivo:** `backend/src/utils/validations.ts` (linhas 216-245)
**Problema:** O `atualizarAcidenteSchema` define `tipoTrauma`, `agenteCausador`, `parteCorpo`, `local` e `lesoes` como `required()`. Isso impede atualizações parciais (PATCH). Se o frontend enviar apenas o campo que mudou, a validação vai falhar.

```typescript
tipoTrauma: Joi.string().trim().max(100).required().messages({
  'any.required': 'Tipo de trauma é obrigatório',
}),
```

**Correção:** Mudar esses campos para `.optional()` no schema de atualização.

---

### 4. Erro de Runtime no `obterPorTrabalhador` do AcidenteService

**Arquivo:** `backend/src/services/AcidenteService.ts` (linha 271)
**Problema:**
```typescript
acidentes.map(a => ({ ...a.toObject(), _id: a._id?.toString() })) as IAcidente[],
```

O método `find()` é chamado sem `.lean()`, mas `a` pode ser um plain object (dependendo da versão do Mongoose). Se `.lean()` não foi usado, `toObject()` existe, mas se foi, vai lançar `TypeError: a.toObject is not a function`.

**Correção:** Simplificar para:
```typescript
acidentes.map(a => ({ ...a, _id: a._id?.toString() })) as IAcidente[],
```

---

## 🟠 ALTOS (Corrigir o Quanto Antes)

### 5. Variáveis de Ambiente do Backend Não Configuradas no Render

**Arquivo:** `backend/src/config/config.ts`
**Problema:** Se as variáveis de ambiente não forem configuradas no painel do Render, o backend usará defaults inadequados para produção:

| Variável | Default | Problema |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/sispatnaist` | Tenta conectar em MongoDB local (falha no Render) |
| `JWT_SECRET` | `'your-secret-key-here'` | Qualquer um pode forjar tokens JWT |
| `FRONTEND_URL` | `'http://localhost:5173'` | Links de e-mail (reset/verify) apontam para localhost |
| `CORS_ORIGIN` | `['http://localhost:3000', 'https://sispnaist-1-0.vercel.app']` | Pode funcionar, mas precisa do domínio correto |

**Verificação necessária no Render Dashboard:**
- [ ] `MONGODB_URI` — string de conexão do Atlas
- [ ] `JWT_SECRET` — chave forte (mínimo 32 caracteres aleatórios)
- [ ] `FRONTEND_URL` — `https://sispnaist-1-0.vercel.app`
- [ ] `NODE_ENV` — `production`
- [ ] `CORS_ORIGIN` — `https://sispnaist-1-0.vercel.app`
- [ ] `BREVO_API_KEY` ou `RESEND_API_KEY` (para envio de e-mails)

---

### 6. Interceptadores Duplicados no Axios (api.ts)

**Arquivo:** `frontend/src/services/api.ts`
**Problema:** Existem **três** `interceptors.response.use()` registrados:
1. Retry logic (linha 14-41) — tenta novamente em 5xx/network errors
2. Auth token injection (linha 44-50) — request interceptor ✅
3. Auth error handler (linha 53-77) — redireciona para `/login` em 401

O problema principal: o interceptor #1 (retry) é registrado primeiro, depois o #3 (auth). A ordem de execução é FIFO, então o retry pode tentar reprocessar uma requisição que deveria limpar o token. Além disso, quando o retry entra em ação, ele chama `axiosInstance(config)` novamente, que passa por todos os interceptors de novo — incluindo o de auth error, que pode redirecionar antes do retry completar.

**Correção:** Consolidar em um único interceptor de resposta:
```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const config = error.config as any;
    if (config && config.retryCount < 3 && (!error.response || error.response.status >= 500)) {
      config.retryCount = (config.retryCount || 0) + 1;
      await new Promise(r => setTimeout(r, config.retryCount * 1000));
      return axiosInstance(config);
    }

    return Promise.reject(error);
  }
);
```

---

### 7. Senha do Gmail App Password Exposta

**Arquivo:** `backend/.env` (linha 14)
**Problema:** O App Password do Gmail (`ngcq tnut ixgn ganj`) está em texto plano no repositório no .env.

**Correção:** Revogar imediatamente essa senha nas configurações de segurança do Google (https://myaccount.google.com/apppasswords) e gerar uma nova. Depois configurar apenas via variável de ambiente no Render.

---

## 🟡 MÉDIOS

### 8. Tailwind CSS com Classes Dinâmicas

**Arquivo:** `frontend/src/pages/Dashboard.tsx` (múltiplas linhas)
**Problema:** Uso de classes Tailwind via template literals:
```tsx
className={`text-center py-2 px-4 bg-${action.color}-600 text-white rounded hover:bg-${action.color}-700 transition`}
```

O Tailwind usa **static extraction** (escaneia o código em busca de strings completas como `bg-blue-600`). Strings dinâmicas como `` bg-${action.color}-600 `` **não são reconhecidas** e os estilos não serão aplicados em produção (build purga classes não encontradas).

**Correção:** Mapear cores manualmente:
```tsx
const colorMap: Record<string, string> = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  red: 'bg-red-600 hover:bg-red-700',
  green: 'bg-green-600 hover:bg-green-700',
  // ...
};
className={`... ${colorMap[action.color]}`}
```

---

### 9. Frontend Vite Proxy Aponta para Produção

**Arquivo:** `frontend/vite.config.ts`
**Problema:**
```typescript
proxy: {
  '/api': {
    target: 'https://sispnaist-1-0.onrender.com',
    changeOrigin: true,
  },
}
```

Durante desenvolvimento local, o proxy do Vite encaminha `/api` para o backend **de produção no Render**. Se você estiver rodando o backend localmente (porta 3001), as requisições vão para produção e não para seu backend local.

**Correção:** Usar variável de ambiente no proxy:
```typescript
proxy: {
  '/api': {
    target: process.env.VITE_PROXY_TARGET || 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

---

### 10. Login Não Redireciona se Já Autenticado

**Arquivo:** `frontend/src/pages/Login.tsx`
**Problema:** Se o usuário já está logado e navega para `/login`, ele continua vendo o formulário de login. O ideal seria redirecionar automaticamente para `/dashboard`.

**Correção:** Adicionar um `useEffect` ou `useNavigate` condicional:
```tsx
const { isAuthenticated } = useAuthStore();
useEffect(() => {
  if (isAuthenticated) navigate('/dashboard', { replace: true });
}, [isAuthenticated, navigate]);
```

---

### 11. Variável `FRONTEND_URL` Aponta para Localhost no .env

**Arquivo:** `backend/.env` (linha 17)
**Problema:**
```
FRONTEND_URL=http://localhost:5173
```

Isso significa que todos os e-mails de recuperação de senha e verificação conterão links para `http://localhost:5173/reset-password?token=...` — que não funciona em produção.

**Correção:** No Render Dashboard, configurar:
```
FRONTEND_URL=https://sispnaist-1-0.vercel.app
```

---

### 12. Sem Logout Endpoint no Backend

**Arquivo:** `backend/src/routes/auth.ts`
**Problema:** Não existe rota `POST /api/auth/logout`. O frontend apenas limpa o localStorage, mas não invalida o token no servidor. Isso significa que tokens JWT continuam válidos até expirarem (7 dias), mesmo após o usuário "sair".

**Correção (opcional para JWT stateless):** Para JWT, isso geralmente não é um problema crítico (tokens expiram). Mas se quiser invalidar, pode-se implementar uma blacklist de tokens no Redis ou no MongoDB. Alternativa mais simples: reduzir `JWT_EXPIRE` para 24h.

---

### 13. Redefinição de Senha Usa Mesmo JWT Secret

**Arquivo:** `backend/src/services/AuthService.ts` (linhas 30-34, 160-164)
**Problema:** O `forgotPassword` e `verifyEmail` usam o mesmo `config.jwtSecret` para assinar tokens de redefinição/verificação. Se o JWT_SECRET for o default fraco (`'your-secret-key-here'`), um atacante pode forjar tokens de redefinição de senha.

**Correção:** Usar um segredo diferente para tokens de email/reset:
```typescript
const verificationToken = jwt.sign(
  { email: userData.email, type: 'verify' },
  process.env.EMAIL_JWT_SECRET || config.jwtSecret, // ideal: EMAIL_JWT_SECRET separado
  { expiresIn: '24h' }
);
```

---

## 🟢 BAIXOS

### 14. Arquivos Duplicados/Obsoletos

**Arquivos:**
- `frontend/src/hooks/useAsync-fixed.ts` vs `useAsync.ts`
- `frontend/src/components/FormFields-fixed.tsx` vs `FormFields.tsx`

**Problema:** Arquivos com sufixo `-fixed` foram deixados no código, sugerindo que houve bugs que foram corrigidos em versões paralelas. Isso causa confusão sobre qual arquivo está sendo usado.

**Correção:** Remover os arquivos `-fixed` após confirmar que o conteúdo foi incorporado nos arquivos originais.

---

### 15. `authService.login` Armazena Token Duas Vezes

**Arquivo:** `frontend/src/services/authService.ts` (linhas 11-14)
**Problema:**
```typescript
login: async (email: string, senha: string): Promise<IAuthResponse> => {
  const response = await api.post<{ data: IAuthResponse }>('/auth/login', { email, senha });
  const { token, user } = response.data.data;
  localStorage.setItem('token', token);       // ← armazena aqui
  localStorage.setItem('user', JSON.stringify(user)); // ← armazena aqui
  return response.data.data;
},
```

E no Login.tsx (linhas 31-32):
```typescript
const { user, token } = await authService.login(values.email, values.senha);
setAuth(user, token); // ← armazena NOVAMENTE no localStorage via authStore
```

**Impacto:** Nenhum erro funcional, mas é código duplicado/messy.

**Correção:** Remover os `localStorage.setItem` do `authService.login` e deixar apenas o `setAuth` no componente ou store.

---

### 16. Nenhum Rate Limiting nos Endpoints de Autenticação

**Problema:** As rotas `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password` não possuem rate limiting, permitindo ataques de brute-force.

**Correção:** Adicionar `express-rate-limit`:
```typescript
import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: { status: 'error', message: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});
app.use('/api/auth/login', loginLimiter);
```

---

### 17. Frontend Register: Campo `confirmaSenha` com Possível Typo

**Arquivo:** `frontend/src/pages/Register.tsx`
**Problema:** O campo `confirmaSenha` está sem a letra 'r' (o correto seria `confirmaSenha` ou `confirmacaoSenha`). A validação é:
```tsx
if (values.senha !== values.confirmaSenha) {
```

Funciona, mas o nome do campo está inconsistente. O backend usa `confirmarSenha` no schema de reset de senha.

---

### 18. JSON2CSV é Dependência em Versionamento Alpha

**Arquivo:** `backend/package.json` (linha 39)
**Problema:**
```json
"json2csv": "^6.0.0-alpha.2"
```

Uma versão alpha em produção pode conter bugs. A versão 5.x é estável.

**Correção:** Mudar para `json2csv@^5.0.7` ou verificar se a versão 6 alpha é realmente necessária.

---

### 19. TypeScript Strict Mode Desabilitado

**Arquivo:** `backend/tsconfig.json`
**Problema:**
```json
"strict": false,
"noImplicitAny": false,
"strictNullChecks": false
```

Isso permite diversos tipos de bugs que o TypeScript pegaria: `any` implícitos, `null` não verificados, etc. O código atual tem vários `as any` que seriam desnecessários com strict mode.

**Correção:** Gradualmente habilitar strict mode e corrigir os tipos. Pelo menos `noImplicitAny: true` e `strictNullChecks: true`.

---

### 20. Helmet Configuração Padrão Pode Bloquear Recursos do Frontend

**Arquivo:** `backend/src/app.ts` (linha 56)
**Problema:**
```typescript
app.use(helmet());
```

A configuração padrão do Helmet pode bloquear:
- Conexões WebSocket se forem usadas
- Carregamento de imagens/fontes de URLs externas (CDN)
- Iframes (Content-Security-Policy)

**Correção:** Configurar Helmet explicitamente:
```typescript
app.use(helmet({
  contentSecurityPolicy: false, // se não precisa de CSP estrita
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```

---

## 📋 Checklist de Configuração no Render

Antes de considerar o projeto funcional, verifique cada item no Dashboard do Render:

- [ ] **MONGODB_URI** — String de conexão do Atlas MongoDB
- [ ] **JWT_SECRET** — Pelo menos 32 caracteres aleatórios
- [ ] **FRONTEND_URL** — `https://sispnaist-1-0.vercel.app`
- [ ] **CORS_ORIGIN** — `https://sispnaist-1-0.vercel.app`
- [ ] **NODE_ENV** — `production`
- [ ] **BREVO_API_KEY** — Para envio de e-mails (recomendado) OU **RESEND_API_KEY**
- [ ] **EMAIL_HOST / EMAIL_USER / EMAIL_PASS** — Se for usar SMTP (não recomendado no Render)
- [ ] **EMAIL_FROM** — `"SISPNAIST" <noreply@seudominio.com>`

---

## ✅ O Que Está Funcionando Bem

Apesar dos problemas listados, muitos aspectos estão muito bons:

1. **Arquitetura limpa** — Separação clara entre routes, controllers, services, e models
2. **Express async errors** — Uso de `express-async-errors` e `asyncHandler` para evitar try/catch repetitivos
3. **Validação com Joi** — Schemas de validação bem definidos e mensagens em português
4. **Auditoria** — Sistema de audit logging completo (middleware + logger manual)
5. **CORS flexível** — Configuração que funciona para múltiplos origins
6. **Tratamento de erros do Mongoose** — Cobertura para ValidationError, CastError, duplicate key (11000)
7. **Email service híbrido** — Suporte a Brevo, Resend e Gmail SMTP com fallback
8. **Frontend bem componentizado** — Stores, hooks, serviços, componentes separados
9. **Zustand** — State management leve e eficiente
10. **SPA routing** — Vercel configurado com rewrites para SPA
11. **Health check** — Endpoint de saúde e componente no frontend
12. **Proteção de rotas** — `ProtectedRoute` com verificação de perfil admin/gestor

---

## 🔧 Plano de Ação Recomendado

### Urgente (fazer hoje)
1. Remover `.env` do Git e revogar credenciais expostas
2. Configurar variáveis de ambiente no Render (especialmente `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`)
3. Corrigir `atualizarAcidenteSchema` — remover `required()` dos campos de update
4. Corrigir `AcidenteService.obterPorTrabalhador` — remover `.toObject()` de resultados lean
5. Corrigir aggregation de `diasAfastamento` em `AnalyticsService.obterKPIs()`
6. Consolidar interceptadores duplicados no `api.ts`

### Curto prazo (esta semana)
7. Corrigir classes Tailwind dinâmicas no Dashboard
8. Adicionar rate limiting nos endpoints de auth
9. Configurar Helmet adequadamente
10. Ajustar FRONTEND_URL no .env e no Render

### Médio prazo (próximo mês)
11. Habilitar TypeScript strict mode gradualmente
12. Adicionar testes automatizados (backend e frontend)
13. Remover arquivos `-fixed` obsoletos
14. Trocar `json2csv` para versão estável

---

> **Nota:** Após corrigir os itens críticos #1 e #5, o sistema já deve funcionar em produção. Itens #2, #3 e #4 causam erros de runtime que impedem ou comprometem o uso completo do sistema.
