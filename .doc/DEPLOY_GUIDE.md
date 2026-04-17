# 🚀 Guia Completo de Deploy - SISPATNAIST

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no MongoDB Atlas (gratuito)
- Conta no Render ou Railway (backend)
- Conta no Vercel ou Netlify (frontend)
- Node.js 18+ instalado localmente

---

## 🗄️ 1. MongoDB Atlas Setup

### Passo a Passo:

1. **Criar conta** em https://www.mongodb.com/cloud/atlas/register
2. **Criar cluster** gratuito (M0 Shared)
3. **Configurar acesso:**
   - Database Access → Criar usuário com senha
   - Network Access → Adicionar IP 0.0.0.0/0 (ou IPs específicos)
4. **Obter connection string:**
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/sispatnaist?retryWrites=true&w=majority
   ```
5. **Testar conexão:**
   ```bash
   mongosh "mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/sispatnaist"
   ```

### 🔒 Security Best Practices:
- ✅ Usar senha forte (16+ caracteres)
- ✅ Restringir IPs quando possível
- ✅ Ativar encryption at rest
- ✅ Configurar backups automáticos

---

## 🔧 2. Backend Deploy

### Opção A: Render (Recomendado)

1. **Criar conta** em https://render.com
2. **Conectar repositório GitHub**
3. **Criar Web Service:**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance: Free (ou Starter $7/mês)

4. **Configurar Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=<sua connection string do Atlas>
   JWT_SECRET=<chave secreta longa e aleatória>
   JWT_EXPIRE=7d
   CORS_ORIGIN=https://seu-frontend-domain.vercel.app
   ```

5. **Deploy!**
   - Render fará deploy automático a cada push na branch main

### Opção B: Railway

1. **Criar conta** em https://railway.app
2. **New Project → Deploy from GitHub repo**
3. **Selecionar diretório `backend`**
4. **Configurar variáveis de ambiente** (mesmas do Render)
5. **Deploy automático**

### Opção C: Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Configurar variáveis no dashboard Vercel**

---

## 🎨 3. Frontend Deploy

### Opção A: Vercel (Recomendado)

1. **Criar conta** em https://vercel.com
2. **Importar repositório GitHub**
3. **Configurar settings:**
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables:**
   ```
   VITE_API_URL=https://seu-backend-domain.onrender.com/api
   VITE_NODE_ENV=production
   ```

5. **Deploy!**

### Opção B: Netlify

1. **Criar conta** em https://netlify.com
2. **New site from Git**
3. **Configurar build:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Environment variables** (mesmas do Vercel)

5. **Deploy automático**

### Opção C: GitHub Pages

1. **Instalar gh-pages:**
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Adicionar ao package.json:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   },
   "homepage": "https://seu-usuario.github.io/sispatnaist-frontend"
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

---

## 🔗 4. Conectar Frontend → Backend

### Atualizar URLs:

**Frontend .env.production:**
```env
VITE_API_URL=https://backend-domain.onrender.com/api
```

**Backend CORS:**
```env
CORS_ORIGIN=https://frontend-domain.vercel.app
```

### Testar conexão:
```bash
curl https://backend-domain.onrender.com/health
# Deve retornar: {"status":"OK","timestamp":"..."}
```

---

## 📊 5. Monitoring Setup

### Sentry (Error Tracking)

**Backend:**
```bash
cd backend
npm install @sentry/node
```

**Configurar em server.ts:**
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://seu-dsn@sentry.io/project-id",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

**Frontend:**
```bash
cd frontend
npm install @sentry/react @sentry/tracing
```

**Configurar em main.tsx:**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://seu-dsn@sentry.io/project-id",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### Uptime Monitoring

**Opções gratuitas:**
- UptimeRobot (https://uptimerobot.com)
- Better Uptime (https://betterstack.com/uptime)
- Cron-job.org

**Configurar monitors:**
- Backend: `GET https://backend-domain.onrender.com/health`
- Frontend: `GET https://frontend-domain.vercel.app`
- Interval: 5 minutos

### Performance Monitoring

**Render/Railway já incluem:**
- CPU usage
- Memory usage
- Response times
- Error rates

**New Relic (gratuito até 100GB):**
```bash
npm install newrelic
```

---

## 🔐 6. Security Checklist

### Backend:
- [x] JWT_SECRET forte e único
- [x] MongoDB URI seguro (não commitar!)
- [x] HTTPS ativado (automático no Render/Vercel)
- [x] CORS configurado para domínio específico
- [x] Helmet middleware ativado
- [x] Rate limiting (opcional)
- [ ] Input validation (Joi já configurado)
- [ ] SQL injection prevention (MongoDB usa BSON)

### Frontend:
- [x] API URL em variáveis de ambiente
- [x] Tokens em localStorage (considerar cookies httpOnly)
- [x] HTTPS ativado
- [ ] XSS protection (React já faz escape)
- [ ] CSP headers

### MongoDB:
- [x] Senha forte
- [x] IPs restritos (quando possível)
- [x] Backups automátos
- [ ] Audit logs (future)

---

## 🔄 7. CI/CD Pipeline

### GitHub Actions (Opcional)

**Criar `.github/workflows/deploy.yml`:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd backend && npm install && npm test
      - run: cd frontend && npm install && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📈 8. Post-Deploy Checklist

### Após deploy do backend:
- [ ] Testar health check: `GET /health`
- [ ] Testar registro de usuário
- [ ] Testar login e token JWT
- [ ] Testar CRUD básico (acidentes)
- [ ] Verificar logs no Render/Railway
- [ ] Configurar monitoring (Sentry, Uptime)

### Após deploy do frontend:
- [ ] Testar carregamento da página
- [ ] Testar login
- [ ] Verificar conexão com backend
- [ ] Testar CRUD completo
- [ ] Verificar responsividade mobile
- [ ] Testar em diferentes navegadores

### Monitoring:
- [ ] Sentry configurado e recebendo eventos
- [ ] Uptime monitoring ativo
- [ ] Alerts configurados (email/SMS)
- [ ] Dashboard de performance criado

---

## 🐛 9. Troubleshooting

### Backend não inicia:
```bash
# Ver logs
render logs -f

# Testar localmente
NODE_ENV=production npm start

# Verificar variáveis de ambiente
echo $MONGODB_URI
echo $JWT_SECRET
```

### Frontend não conecta ao backend:
```bash
# Verificar CORS
# Backend deve ter CORS_ORIGIN correto

# Verificar URL
console.log(import.meta.env.VITE_API_URL)

# Testar CORS com curl
curl -X OPTIONS https://backend-domain/api/acidentes \
  -H "Origin: https://frontend-domain" \
  -H "Access-Control-Request-Method: GET"
```

### MongoDB connection error:
```bash
# Testar conexão
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/sispatnaist"

# Verificar whitelist de IPs
# MongoDB Atlas → Network Access
```

---

## 💰 10. Cost Estimation

### Free Tier (Desenvolvimento):
- MongoDB Atlas: 512MB (grátis)
- Render: 750 hours/mês (grátis)
- Vercel: 100GB bandwidth (grátis)
- Sentry: 5000 events/mês (grátis)
- **Total: $0/mês**

### Production (Baixo volume):
- MongoDB Atlas: M10 ($57/mês)
- Render: Starter ($7/mês)
- Vercel: Pro ($20/mês)
- Sentry: Team ($26/mês)
- **Total: ~$110/mês**

---

## 📞 11. Suporte

- **Documentação Render:** https://render.com/docs
- **Documentação Vercel:** https://vercel.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **Sentry:** https://docs.sentry.io

---

**Última atualização:** 13/04/2026  
**Status:** Pronto para deploy em produção!
