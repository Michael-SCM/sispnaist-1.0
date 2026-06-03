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

---






### 3.5 Múltiplos `console.log` expondo dados sensíveis em produção

**Arquivos diversos do backend**

**Problema:** Diversos `console.log` no backend registram dados de requisições, corpos de requisições, e detalhes de erros em produção. Isso pode expor informações sensíveis nos logs do Render. Exemplos:
- Logging de corpo de requisição em validações
- Dados de erro de API de email (Brevo/Resend) com detalhes da resposta
- `[AUDIT]` e `[AUDIT-FALLBACK]` com dados de operações

**Solução:** Usar uma biblioteca de logging (Winston, Pino) com níveis configuráveis, ou ao menos guardar logs sensíveis com `if (process.env.NODE_ENV !== 'production')`.



### 3.8 Sem limite de tamanho para JSON bodies

**Arquivo:** `backend/src/app.ts:62`

```typescript
app.use(express.json({ limit: '10mb', strict: false }));
```

**Problema:** O limite de 10MB para bodies JSON é muito alto, e `strict: false` permite que arrays, strings e outros tipos sejam aceitos como JSON, em vez de apenas objetos. Isso pode ser explorado para ataques de negação de serviço (enviar payloads enormes).

**Solução:** Reduzir o limite para um valor mais adequado (ex: 1MB) e remover `strict: false` a menos que haja uma necessidade específica documentada.

---



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



### 4.5 Retry cego em erros 5xx pode causar loops

**Arquivo:** `frontend/src/services/api.ts:29-35`

**Problema:** O interceptor tenta retry automático até 3 vezes para erros 5xx. Porém, não há verificação de idempotência: se a requisição original era um `POST` (criação de recurso), o retry pode criar **múltiplos recursos** duplicados no servidor. Ações não-idempotentes (POST, PATCH) não devem ser repetidas automaticamente.

**Solução:** Implementar retry apenas para métodos idempotentes (GET, PUT, DELETE), ou usar um identificador de idempotência no header da requisição.


---

## 6. Problemas de Código e Boas Práticas

### 6.1 Inconsistência: imports com e sem `.js`

**Problema:** Alguns imports no backend usam extensão `.js` (ex: `'./app.js'`, `'../config/config.js'`), o que é correto para ESM com TypeScript compilado. Porém, alguns imports parecem não ter a extensão (a verificação precisa ser feita caso a caso). Se houver inconsistência, o Node.js pode não resolver os módulos corretamente em produção.

**Solução:** Padronizar todos os imports para usar `.js` (padrão para ESM/TypeScript com `"type": "module"`) ou remover a extensão se CommonJS.





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
