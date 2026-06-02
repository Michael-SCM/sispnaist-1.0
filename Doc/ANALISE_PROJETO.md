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


---

### 7. Senha do Gmail App Password Exposta

**Arquivo:** `backend/.env` (linha 14)
**Problema:** O App Password do Gmail (`ngcq tnut ixgn ganj`) está em texto plano no repositório no .env.

**Correção:** Revogar imediatamente essa senha nas configurações de segurança do Google (https://myaccount.google.com/apppasswords) e gerar uma nova. Depois configurar apenas via variável de ambiente no Render.


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


## 16. Nenhum Rate Limiting nos Endpoints de Autenticação

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
