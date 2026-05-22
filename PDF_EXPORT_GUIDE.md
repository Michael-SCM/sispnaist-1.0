# 🎉 Guia Completo: Exportação de PDF Corporativo - SISPNAIST

## 📋 Resumo da Implementação

Você possui agora um sistema completo de exportação de PDFs corporativos bem-estruturados com:
- ✅ Backend Node.js + TypeScript com PDFKit
- ✅ Gerador de PDFs reutilizável com padrão corporativo
- ✅ Frontend React com hooks customizados
- ✅ Componentes prontos para uso
- ✅ Autenticação e autorização integrada

---

## 🚀 Como Começar

### 1. **Instalar Dependências**

```bash
# No diretório do backend
cd backend
npm install
```

Verifique se `pdfkit` e `@types/pdfkit` foram instalados:

```bash
npm list pdfkit
```

### 2. **Verificar Variáveis de Ambiente**

Certifique-se de que seu `.env` do backend possui:

```env
# Backend (Render)
MONGODB_URI=seu_string_conexao_mongodb_atlas
JWT_SECRET=sua_chave_secreta
PORT=3000
NODE_ENV=production
```

Para o frontend (Vercel):

```env
VITE_API_URL=https://seu-backend.render.com/api
```

### 3. **Testando Localmente**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Acesse: `http://localhost:5173` (Vite)

---

## 📁 Estrutura de Arquivos Criados

### Backend
```
backend/
├── src/
│   ├── utils/
│   │   └── pdfGenerator.ts          ← Classe geradora de PDF
│   ├── controllers/
│   │   └── ExportController.ts      ← Modificado: +3 métodos de PDF
│   └── routes/
│       └── export.ts                ← Modificado: +3 novas rotas
└── package.json                      ← Modificado: +pdfkit
```

### Frontend
```
frontend/
├── src/
│   ├── hooks/
│   │   └── usePDFDownload.ts        ← Hook customizado para download
│   └── components/
│       ├── BotaoBaixarPDF.tsx       ← Botão reutilizável
│       └── PainelExportacaoRelatorios.tsx  ← Painel completo
```

---

## 🔌 Rotas Disponíveis

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/export/trabalhadores/pdf` | Relatório de trabalhadores | Admin/Gestor |
| GET | `/api/export/acidentes/pdf` | Relatório de acidentes | Admin/Gestor |
| GET | `/api/export/material-biologico/pdf` | Relatório de material biológico | Admin/Gestor |

**Headers necessários:**
```javascript
{
  'Authorization': 'Bearer seu_token_jwt',
  'Accept': 'application/pdf'
}
```

---

## 💻 Exemplos de Uso

### Opção 1: Usar o Hook Customizado

```tsx
import { usePDFDownload } from '@/hooks/usePDFDownload';

function MeuComponente() {
  const { baixarPDF, carregando, erro } = usePDFDownload();

  const handleBaixar = async () => {
    const resultado = await baixarPDF(
      'http://localhost:3000/api/export/trabalhadores/pdf',
      'trabalhadores.pdf'
    );
    
    if (resultado.sucesso) {
      console.log('✅ Download realizado!');
    } else {
      console.error('❌ Erro:', resultado.mensagem);
    }
  };

  return (
    <button onClick={handleBaixar} disabled={carregando}>
      {carregando ? 'Baixando...' : 'Baixar PDF'}
    </button>
  );
}
```

### Opção 2: Usar o Botão Pronto

```tsx
import BotaoBaixarPDF from '@/components/BotaoBaixarPDF';

function MeuComponente() {
  return (
    <BotaoBaixarPDF
      url="/api/export/trabalhadores/pdf"
      label="Exportar Trabalhadores"
      nomeArquivo="trabalhadores_relatorio.pdf"
      onSucesso={(msg) => console.log(msg)}
      onErro={(msg) => alert(msg)}
      variante="primary"
    />
  );
}
```

### Opção 3: Usar o Painel Completo

```tsx
import PainelExportacaoRelatorios from '@/components/PainelExportacaoRelatorios';

function MeuComponente() {
  return <PainelExportacaoRelatorios />;
}
```

---

## 📊 Estrutura do PDF Gerado

Cada PDF inclui:

```
┌─────────────────────────────────────────┐
│         [LOGO]    SISPNAIST             │ ← Cabeçalho
│                   Relatório de ...      │
│         Emitido em: 22/05/2026          │
├─────────────────────────────────────────┤
│ Objetivo do Relatório                   │ ← Introdução
│ Este relatório apresenta...             │
├─────────────────────────────────────────┤
│ ┌──────────────┬──────────────┐         │ ← Indicadores
│ │ Total: 150   │ Status: OK   │         │
│ └──────────────┴──────────────┘         │
├─────────────────────────────────────────┤
│ Nome    │ CPF         │ Email    │ ...  │ ← Tabela Zebrada
├─────────────────────────────────────────┤
│ João    │ 123.456.789 │ john@... │ ...  │
├─────────────────────────────────────────┤
│ Maria   │ 987.654.321 │ mary@... │ ...  │
├─────────────────────────────────────────┤
│ Total de Registros: 150                 │
├─────────────────────────────────────────┤
│ SISPNAIST - Confidencial  Página 1 de 5 │ ← Rodapé
└─────────────────────────────────────────┘
```

---

## 🔒 Autenticação e Segurança

### Backend (Express)

A middleware `authMiddleware` valida o JWT:

```typescript
// Em export.ts
router.use(authMiddleware);
router.use(authorize('admin', 'gestor'));

// Apenas admins e gestores podem acessar
```

### Frontend (React)

```typescript
// O token é lido do localStorage
const token = localStorage.getItem('token');

// Ou da sessão/Redux:
const token = useSelector(state => state.auth.token);
```

**Ajuste conforme seu sistema de autenticação:**

```typescript
// Em usePDFDownload.ts, linha ~38
headers: {
  'Authorization': `Bearer ${seuToken}`,
  // ou
  'Cookie': document.cookie,
  // ou outro método
}
```

---

## 🎨 Customização

### Mudar Cores do PDF

Edite [pdfGenerator.ts](backend/src/utils/pdfGenerator.ts):

```typescript
private corPrincipal: string = '#1e40af';    // Azul
private corZebrada: string = '#f5f5f5';      // Cinza claro
private corTexto: string = '#333333';        // Cinza escuro
private corCinza: string = '#666666';        // Cinza médio
```

### Adicionar Logo Real

Substitua o placeholder em `adicionarCabecalho()`:

```typescript
// Ao invés de:
this.doc.text('[LOGO]', ...);

// Use:
this.doc.image('caminho/para/logo.png', x, y, { width: 80 });
```

### Personalizar Tabelas

```typescript
const colunas: TabelaColuna[] = [
  {
    chave: 'nome',
    titulo: 'Nome Completo',
    largura: 200,
    alinhamento: 'left',
    formatador: (val) => val.toUpperCase()
  },
  // ... mais colunas
];
```

---

## ⚡ Performance

### Render (Backend)

O streaming do PDF é otimizado:

```typescript
// Não carrega tudo na memória
const doc = pdfGen.getDocument();
doc.pipe(res);  // ← Streaming direto
```

### Limites

- **Máximo de registros por requisição:** 1.000 (configurável em cada método)
- **Registros por página:** 12-15 (conforme tipo de documento)
- **Timeout recomendado:** 30-60 segundos

### Monitoramento

No Render dashboard:
```
Logs → Procurar por "exportar*PDF"
Memory → Monitorar uso durante geração
```

---

## 🐛 Troubleshooting

### ❌ Erro: "Cannot find module 'pdfkit'"

```bash
npm install pdfkit @types/pdfkit
npm run build
```

### ❌ Erro: "401 Unauthorized"

Verifique:
- ✓ Token JWT válido
- ✓ Usuário possui role 'admin' ou 'gestor'
- ✓ Token não expirou

### ❌ Erro: "PDF vazio recebido"

Verificar:
- ✓ Há dados no MongoDB
- ✓ Query de busca não retorna vazio
- ✓ Conexão com MongoDB ativa

### ❌ PDF lento para gerar

Soluções:
1. Reduzir número de registros (usar filtros/paginação)
2. Aumentar recursos do Render
3. Usar cache para relatórios frequentes

### ❌ Erro: CORS no Frontend

Adicione ao backend (app.ts):

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## 📱 Responsividade

O Painel de Exportação é responsivo:

- **Desktop:** 3 colunas
- **Tablet:** 2 colunas
- **Mobile:** 1 coluna

```tsx
{/* Classe Tailwind */}
grid grid-cols-1 md:grid-cols-3 gap-6
```

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────┐
│ Usuário clica em "Baixar PDF"          │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ React: usePDFDownload.baixarPDF()      │
├─────────────────────────────────────────┤
│ • Valida token                          │
│ • Faz fetch GET para /api/export/.../pdf│
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Express: ExportController               │
├─────────────────────────────────────────┤
│ • authMiddleware (valida JWT)           │
│ • authorize (verifica role)             │
│ • Busca dados do MongoDB                │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ PDFGenerator: Cria documento            │
├─────────────────────────────────────────┤
│ • Cabeçalho                             │
│ • Introdução                            │
│ • Indicadores                           │
│ • Tabela com dados                      │
│ • Rodapé com paginação                  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Express: Faz stream do PDF              │
├─────────────────────────────────────────┤
│ Content-Type: application/pdf           │
│ Content-Disposition: attachment         │
│ Cache-Control: no-cache                 │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ React: Recebe blob                      │
├─────────────────────────────────────────┤
│ • Cria URL temporária                   │
│ • Cria elemento <a>                     │
│ • Dispara download no navegador         │
│ • Libera memória                        │
└──────────────┬──────────────────────────┘
               ↓
       ✅ PDF no computador do usuário
```

---

## 📚 Referências

- [PDFKit Documentation](http://pdfkit.org/)
- [Express Stream Response](https://expressjs.com/en/api/response.html#res.pipe)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Blob Download](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

---

## ✅ Checklist de Implementação

- [ ] PDFKit instalado (`npm install pdfkit`)
- [ ] Backend compilado (`npm run build`)
- [ ] Rotas de exportação testadas com Postman/Insomnia
- [ ] Frontend com token JWT válido
- [ ] Componentes importados corretamente
- [ ] Variáveis de ambiente configuradas
- [ ] CORS habilitado para URL do Vercel
- [ ] Testes de carga no Render
- [ ] Documentação compartilhada com time
- [ ] Botão de exportação integrado na UI

---

## 🎯 Próximos Passos Opcionais

1. **Filtros avançados:** Permitir usuário escolher data/período
2. **Assinatura digital:** Adicionar hash de validação
3. **Cache:** Memoizar PDFs frequentes
4. **Email:** Enviar PDF por email automaticamente
5. **Webhook:** Notificar quando PDF está pronto
6. **Dashboard:** Gráficos antes das tabelas

---

**Desenvolvido com ❤️ para SISPNAIST**

Data: 22 de maio de 2026
Versão: 1.0.0
