# 🧪 Guia de Testes e Validação

## ✅ Checklist Pré-Deployment

### Backend (Render)

- [ ] **Passo 1: Instalar Dependência**
  ```bash
  cd backend
  npm install pdfkit @types/pdfkit
  npm list pdfkit  # Verificar instalação
  ```

- [ ] **Passo 2: Compilar TypeScript**
  ```bash
  npm run build
  npm start  # Testar localmente
  ```

- [ ] **Passo 3: Testar Rota com cURL**
  ```bash
  # Com token válido
  curl -X GET \
    'http://localhost:3000/api/export/trabalhadores/pdf' \
    -H 'Authorization: Bearer seu_token_aqui' \
    -H 'Accept: application/pdf' \
    --output teste.pdf
  
  # Verificar se arquivo foi criado
  ls -lh teste.pdf
  ```

- [ ] **Passo 4: Testar com Postman/Insomnia**
  - URL: `http://localhost:3000/api/export/trabalhadores/pdf`
  - Método: GET
  - Header: `Authorization: Bearer token`
  - Header: `Accept: application/pdf`
  - Response: Preview/PDF viewer

- [ ] **Passo 5: Verificar Logs**
  ```bash
  # Terminal deve mostrar
  GET /api/export/trabalhadores/pdf 200 1234ms
  ```

- [ ] **Passo 6: Testar Sem Dados**
  - Se MongoDB vazio, verificar resposta 404
  - Mensagem: "Nenhum trabalhador encontrado"

### Frontend (Vercel)

- [ ] **Passo 1: Importar Componente**
  ```tsx
  import PainelExportacaoRelatorios from '@/components/PainelExportacaoRelatorios';
  
  // Em alguma página
  <PainelExportacaoRelatorios />
  ```

- [ ] **Passo 2: Verificar Variáveis de Ambiente**
  ```bash
  # .env.local (desenvolvimento)
  VITE_API_URL=http://localhost:3000/api
  
  # .env.production (produção)
  VITE_API_URL=https://seu-render-url.com/api
  ```

- [ ] **Passo 3: Testar Localmente**
  ```bash
  cd frontend
  npm run dev
  # Abrir http://localhost:5173
  # Clicar no botão de download
  ```

- [ ] **Passo 4: Verificar Console do Navegador**
  - F12 → Console → Procurar por erros
  - Network → Verificar requisição GET
  - Status: 200 (sucesso) ou 401 (autenticação)

- [ ] **Passo 5: Testar Autenticação**
  - Sem token: Deve dar erro 401
  - Com token expirado: Deve dar erro 401
  - Com token válido: Deve fazer download

---

## 🔍 Testes Detalhados

### Teste 1: Conectividade Backend-Frontend

```javascript
// Abrir console do navegador e testar fetch
const token = localStorage.getItem('token');
const baseURL = 'https://seu-render-url.com/api';

fetch(`${baseURL}/export/trabalhadores/pdf`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/pdf'
  }
})
  .then(res => {
    console.log('Status:', res.status);
    console.log('Headers:', res.headers.get('content-type'));
    return res.blob();
  })
  .then(blob => {
    console.log('Blob size:', blob.size, 'bytes');
    console.log('Blob type:', blob.type);
    
    // Criar download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teste.pdf';
    a.click();
  })
  .catch(err => console.error('Erro:', err));
```

### Teste 2: Verificar Tamanho do PDF

```javascript
// PDFs devem ter tamanho > 10KB mínimo
// Verificar no Network Tab do navegador
// Content-Length: (ver bytes)

// Ou no terminal do servidor
// Size: 123456 bytes (verificar se aumenta com dados)
```

### Teste 3: Validar Estrutura PDF

```bash
# Linux/Mac
file teste.pdf
# Output: teste.pdf: PDF document, version 1.4

# Windows PowerShell
$sig = [byte[]](0x25, 0x50, 0x44, 0x46)  # %PDF
Get-Content teste.pdf -Encoding byte -TotalCount 4
```

### Teste 4: Abrir PDF

```bash
# Linux
evince teste.pdf

# Mac
open teste.pdf

# Windows
start teste.pdf
```

Verificar:
- ✓ Cabeçalho SISPNAIST visível
- ✓ Data de emissão correta
- ✓ Tabela com dados
- ✓ Rodapé com "Página 1 de X"

### Teste 5: Performance

```javascript
// Medir tempo de download
const inicio = performance.now();

fetch(`${baseURL}/export/trabalhadores/pdf`, {...})
  .then(async res => {
    const blob = await res.blob();
    const fim = performance.now();
    console.log(`Tempo total: ${(fim - inicio).toFixed(2)}ms`);
    console.log(`Tamanho: ${(blob.size / 1024).toFixed(2)}KB`);
  });

// Esperado:
// Tempo total: 2000-5000ms (2-5 segundos)
// Tamanho: 50-200KB (conforme dados)
```

### Teste 6: Múltiplos Downloads Simultâneos

```javascript
// Simular 3 downloads ao mesmo tempo
Promise.all([
  fetch(`${baseURL}/export/trabalhadores/pdf`, {...}).then(r => r.blob()),
  fetch(`${baseURL}/export/acidentes/pdf`, {...}).then(r => r.blob()),
  fetch(`${baseURL}/export/material-biologico/pdf`, {...}).then(r => r.blob())
])
  .then(blobs => {
    console.log('✅ Todos os 3 PDFs foram gerados com sucesso');
    blobs.forEach((blob, i) => {
      console.log(`PDF ${i + 1}: ${(blob.size / 1024).toFixed(2)}KB`);
    });
  })
  .catch(err => console.error('❌ Erro:', err));
```

### Teste 7: Erro de Autenticação

```javascript
// Testar sem token
fetch(`${baseURL}/export/trabalhadores/pdf`)
  .then(res => {
    console.log('Status:', res.status);  // Deve ser 401
    return res.json();
  })
  .then(data => console.log(data));  // Deve ter erro de auth
```

---

## 📊 Checklist de Monitoramento (Depois de Deploy)

### No Render Dashboard

- [ ] **Memory Usage**
  - Ao gerar PDF: <200MB
  - Sem gerar: <100MB

- [ ] **CPU**
  - Ao gerar PDF: <50%
  - Resposta: <5 segundos

- [ ] **Logs**
  ```
  GET /api/export/trabalhadores/pdf 200 2345ms
  GET /api/export/acidentes/pdf 200 1234ms
  GET /api/export/material-biologico/pdf 200 3456ms
  ```

- [ ] **Errors**
  - Procurar por: "Cannot find module", "TypeError", "Promise rejected"

### No Google Analytics / Sentry (se usar)

- [ ] Rastrear eventos de download
- [ ] Monitorar erros de cliente
- [ ] Registrar tempo de geração

---

## 🐛 Troubleshooting

### ❌ Erro: "Cannot find module 'pdfkit'"

**Solução:**
```bash
npm install pdfkit @types/pdfkit
npm run build
npm start
```

### ❌ Erro: "401 Unauthorized"

**Checklist:**
- ✓ Token no localStorage?
- ✓ Token expirado?
- ✓ Usuário é admin/gestor?
- ✓ Header "Authorization: Bearer token" está correto?

**Teste:**
```javascript
console.log('Token:', localStorage.getItem('token'));
```

### ❌ PDF vazio/corrompido

**Checklist:**
- ✓ Há dados no MongoDB?
- ✓ Conexão com BD está ativa?
- ✓ Query retorna algo?

**Teste:**
```bash
# No terminal do backend
db.trabalhadores.count()  # Deve retornar > 0
```

### ❌ Download não inicia

**Possíveis causas:**
1. Blob size = 0
2. CORS bloqueando
3. Navegador bloqueando download

**Solução:**
```javascript
// Verificar CORS no Network tab
// Response Headers devem ter:
// Access-Control-Allow-Origin: *
// Content-Type: application/pdf
// Content-Disposition: attachment
```

### ❌ PDF lento (>10 segundos)

**Soluções:**
1. Aumentar recursos do Render (usar plano superior)
2. Reduzir número de registros (paginação)
3. Adicionar índices no MongoDB

```bash
# Adicionar índice no MongoDB
db.trabalhadores.createIndex({ "cpf": 1 })
db.trabalhadores.createIndex({ "email": 1 })
```

### ❌ CORS Error no Console

**Erro típico:**
```
Access to XMLHttpRequest at 'https://...' from origin 'https://vercel.app' 
has been blocked by CORS policy
```

**Solução:**
```typescript
// Em backend/src/app.ts
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://seu-vercel-url.vercel.app',
    'https://seu-dominio.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📝 Relatório de Teste

Use este template para documentar seus testes:

```markdown
# Relatório de Teste - Exportação PDF

**Data:** 22/05/2026
**Testador:** [Seu Nome]
**Ambiente:** [Dev/Staging/Prod]

## Testes Executados

### Backend
- [ ] PDFKit instalado corretamente
- [ ] Rota `/api/export/trabalhadores/pdf` retorna 200
- [ ] Rota `/api/export/acidentes/pdf` retorna 200
- [ ] Rota `/api/export/material-biologico/pdf` retorna 200
- [ ] PDF tem cabeçalho correto
- [ ] PDF tem tabela com dados
- [ ] PDF tem rodapé com paginação

### Frontend
- [ ] Componente `PainelExportacaoRelatorios` renderiza
- [ ] Botão de download funciona
- [ ] PDF é baixado com nome correto
- [ ] Erro é mostrado quando autenticação falha
- [ ] Loading spinner aparece durante geração

### Performance
- [ ] Tempo de geração: _____ ms
- [ ] Tamanho do PDF: _____ KB
- [ ] Múltiplos downloads funcionam

## Observações

[Descrever qualquer problema encontrado]

## Assinatura

Data: _______________
Testador: ____________
```

---

## 🎯 Resumo Final

Quando todos os testes passarem, seu sistema de exportação PDF estará pronto para produção! 🚀
