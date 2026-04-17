# 🚀 Quick Start - Começar em 5 Minutos

## 1️⃣ Abra o Projeto no VS Code

```bash
code c:\Users\aluno2025\Documents\sispatnaist-react-modern
```

Ou manualmente:
- Abra VS Code
- File → Open Folder
- Navegue para: `c:\Users\aluno2025\Documents\sispatnaist-react-modern`
- Clique "Select Folder"

## 2️⃣ Terminal 1 - MongoDB (se não tiver Atlas)

Se você tem MongoDB instalado localmente:

```bash
mongod
```

Se não tem, crie uma conta gratuita em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) e use uma URL como:
```
mongodb+srv://usuario:senha@cluster.mongodb.net/sispatnaist?retryWrites=true&w=majority
```

## 3️⃣ Terminal 2 - Backend

```bash
cd backend
npm install
cp .env.example .env

# Edite .env se necessário (já vem com boas configurações padrão)
# MONGODB_URI=mongodb://localhost:27017/sispatnaist

npm run dev
```

Deve ver algo como:
```
╔════════════════════════════════════════╗
║   SISPATNAIST Backend Server Started   ║
╚════════════════════════════════════════╝

🚀 Server running on: http://localhost:3001
```

### Testar Backend
```bash
# Em outro terminal ou no navegador
curl http://localhost:3001/health

# Resposta:
# {"status":"OK","timestamp":"2024-04-06T10:30:00.000Z"}
```

## 4️⃣ Terminal 3 - Frontend

```bash
cd frontend
npm install
cp .env.example .env

npm run dev
```

Deve ver algo como:
```
  VITE v5.0.7  ready in 456 ms

  ➜  Local:   http://localhost:3000/
  ➜  Press q to quit
```

## 5️⃣ Acesse a Aplicação

Abra no navegador: **http://localhost:3000**

Você verá:
1. Home page (pública)
2. Link para login
3. Link para registro

## 🧪 Testar o Fluxo Completo

### 1. Registre um novo usuário
- Clique em "Cadastro"
- Preencha os dados:
  - Nome: Alberto Silva
  - Email: alberto@email.com
  - CPF: 123.456.789-00
  - Senha: Password123
- Clique "Cadastrar"
- Será redirecionado automaticamente para Dashboard

### 2. Faça login novamente
- Logout desde o dashboard
- Clique "Login"
- E-mail: alberto@email.com
- Senha: Password123
- Clique "Entrar"

### 3. Visualize seu Dashboard
- Verá informações de seu perfil
- Seção de "Início Rápido"
- Navegação top funcional

## 📁 Estrutura de Arquivos - Onde Trabalhar

### Backend (Principais)
```
backend/src/
├── models/          👈 Adicione novos schemas aqui
├── services/        👈 Lógica de negócio aqui
├── controllers/     👈 Handlers HTTP aqui
├── routes/          👈 Defina rotas aqui
└── middleware/      👈 Autenticação, validação aqui
```

### Frontend (Principais)
```
frontend/src/
├── pages/           👈 Novas páginas aqui
├── components/      👈 Componentes reutilizáveis
├── services/        👈 Chamadas API aqui
├── store/           👈 Estado global aqui
└── hooks/           👈 Custom hooks aqui
```

## 💻 Comandos Úteis

### Backend
```bash
cd backend

npm run dev        # Inicia em desenvolvimento (hot reload)
npm run build      # Compila TypeScript
npm run lint       # Verifica linting

# Testar endpoints
npm install -g thunder-client
# Ou usar: curl, Postman, Insomnia
```

### Frontend
```bash
cd frontend

npm run dev        # Inicia dev server (hot reload)
npm run build      # Cria build de produção
npm run preview    # Visualiza build
npm run lint       # Verifica linting
npm run type-check # Verifica tipos TypeScript
```

## 🔍 Debugar com VS Code

### Backend

Crie `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend Debug",
      "program": "${workspaceFolder}/backend/dist/server.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

Depois pressione F5 para debugar.

### Frontend

Instale a extensão "Debugger for Chrome" e use devtools do navegador (F12).

## 🐛 Problemas Comuns

### ❌ "Cannot find module 'express'"
```bash
# Solução
cd backend
npm install
```

### ❌ "MONGODB_URI is required"
```bash
# Solução
cd backend
cp .env.example .env

# Certifique-se que .env tem:
MONGODB_URI=mongodb://localhost:27017/sispatnaist
```

### ❌ "Port 3001 already in use"
```bash
# Solução alternativa
cd backend
# Edite .env
PORT=3002
npm run dev
```

### ❌ "localhost:3001 refused to connect"
MongoDB não está rodando. Verifique:
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### ❌ CORS Error no console
Verifique se:
- Backend está em http://localhost:3001
- Frontend está em http://localhost:3000
- Ambos estão rodando

## 📊 Verificar Status

### No Terminal Backend
Deve ver logs como:
```
✓ MongoDB connected successfully
GET /health - 200 - 1ms
POST /api/auth/register - 201 - 45ms
```

### No Terminal Frontend
Deve ver:
```
✓ 26 modules transformed.
App running at:
  - Local: http://localhost:3000/
```

### No Browser (DevTools - F12)
Network tab deve mostrar requests para `/api/auth/*`

## 📝 Próximos Passos Após Tudo Funcionar

1. **Explorar os arquivos** - Leia os comentários no código
2. **Ler a documentação** - `README.md`, `MIGRATION_GUIDE.md`
3. **Implementar novos endpoints** - Siga `EXEMPLOS_IMPLEMENTACAO.md`
4. **Adicionar componentes** - Baseado nos exemplos
5. **Testar a API** - Com Postman/Thunder Client

## 🎯 Metas de Hoje

- [ ] Projeto aberto no VS Code
- [ ] Backend e Frontend rodando
- [ ] Conseguir fazer login/logout
- [ ] Ver dados no Dashboard
- [ ] Entender a estrutura de pastas
- [ ] Implementar primeiro endpoint novo

## 🆘 Ajuda Rápida

| Problema | Solução |
|----------|---------|
| Modulo não encontrado | `npm install` no diretório certo |
| Porta em uso | Mude `PORT` no `.env` |
| Conexão DB falha | Verifique `MONGODB_URI` no `.env` |
| CORS error | Verifique URL do frontend/backend |
| TypeScript error | `npm run type-check` para ver detalhes |
| Hot reload não funciona | Reinicie o servidor |

## 📞 Referências Úteis

- 📖 [Node.js Docs](https://nodejs.org/docs/)
- 📖 [Express Docs](https://expressjs.com/)
- 📖 [React Docs](https://react.dev/)
- 📖 [MongoDB Docs](https://docs.mongodb.com/)
- 📖 [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

**Tudo pronto? Comece a codificar! 🎉**

Se tiver dúvidas, consulte os outros arquivos:
- `README.md` - Documentação completa
- `MIGRATION_GUIDE.md` - Guia de migração
- `EXEMPLOS_IMPLEMENTACAO.md` - Exemplos práticos
- `SETUP_SUMMARY.md` - Resumo do setup
