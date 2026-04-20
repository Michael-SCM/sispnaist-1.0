# SISPNAIST - React + Node.js + MongoDB

Sistema de Gerenciamento de Segurança e Saúde do Trabalhador - Versão Moderna com React, Node.js/Express e MongoDB.

## 📋 Índice

- [Arquitetura](#arquitetura)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Execução](#execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Migração de Dados](#migração-de-dados)

## 🏗️ Arquitetura

### Stack Tecnológico

**Backend:**
- Node.js com Express
- TypeScript
- MongoDB + Mongoose
- JWT para autenticação
- Validação com Joi

**Frontend:**
- React 18 com TypeScript
- Vite como bundler
- React Router para navegação
- Zustand para state management
- Axios para requisições HTTP
- TailwindCSS para estilização
- React Hot Toast para notificações

### Estrutura de Pastas

```
sispatnaist-react-modern/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (DB, env)
│   │   ├── models/          # Schemas MongoDB
│   │   ├── controllers/     # Lógica de requisições HTTP
│   │   ├── services/        # Lógica de negócio
│   │   ├── routes/          # Definição de rotas
│   │   ├── middleware/      # Autenticação, validação, erro
│   │   ├── types/           # Tipos TypeScript
│   │   ├── utils/           # Utilitários (JWT, validações)
│   │   ├── scripts/         # Scripts de migração
│   │   ├── app.ts           # Configuração Express
│   │   └── server.ts        # Inicialização servidor
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── types/           # Tipos TypeScript
    │   ├── services/        # Chamadas API
    │   ├── store/           # Estado global (Zustand)
    │   ├── hooks/           # Custom hooks
    │   ├── components/      # Componentes reutilizáveis
    │   ├── pages/           # Páginas da aplicação
    │   ├── layouts/         # Layouts
    │   ├── utils/           # Utilitários
    │   ├── styles/          # CSS/Tailwind
    │   ├── App.tsx          # Componente raiz
    │   └── main.tsx         # Ponto de entrada
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── .gitignore
```

## 📦 Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0 ou yarn >= 3.0.0
- MongoDB >= 5.0 (local ou Atlas)

## 🚀 Instalação

### 1. Clone o repositório



### 2. Backend Setup

```bash
cd backend

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env



### 3. Frontend Setup

```bash
cd ../frontend

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env

# Edite .env se necessário
# VITE_API_URL=http://localhost:3001/api
```

## ▶️ Execução

### MongoDB Local (Opcional)

Se usando MongoDB localmente:

```bash
# Windows (se instalado via chocolatey ou MSI)
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Backend

```bash
cd backend

# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Executar servidor produção
npm start
```

O servidor estará em: `http://localhost:3001`

### Frontend

Em outro terminal:

```bash
cd frontend

# Desenvolvimento (com Vite)
npm run dev

# Build para produção
npm run build

# Preview produção localmente
npm run preview
```

A aplicação estará em: `http://localhost:3000`

## 📡 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Criar nova conta |
| POST | `/api/auth/login` | Fazer login |
| GET | `/api/auth/me` | Obter dados do usuário logado |
| PUT | `/api/auth/profile` | Atualizar perfil |

## 🔄 Migração de Dados

### De MySQL para MongoDB

Para migrar dados do PHP/MySQL para o novo sistema:

```bash
cd backend

# Execute o script de migração
npm run migrate

# Siga as instruções do script
```

**Pré-requisitos para migração:**
- Backup dos dados MySQL existentes
- Acesso ao banco de dados MySQL anterior
- MongoDB rodando

## 🔐 Autenticação & Segurança

- Senhas com hash bcryptjs (10 rounds)
- JWT para autenticação stateless
- CORS configurável
- Helmet para headers de segurança
- Validação de entrada com Joi
- SQL/NoSQL injection protection via Mongoose
- Rate limiting (recomendado para produção)

## 📝 Variáveis de Ambiente

### Backend (.env)

```
MONGODB_URI=
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRE=7d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3001/api
```

## 🛠️ Desenvolvimento

### Scripts Úteis

**Backend:**
```bash
npm run dev      # Executar em desenvolvimento
npm run build    # Compilar TypeScript
npm run lint     # Verificar linting
npm run migrate  # Migração de dados
```

**Frontend:**
```bash
npm run dev        # Executar dev server
npm run build      # Build produção
npm run preview    # Preview build
npm run lint       # Linting
npm run type-check # Type checking
```

## 📚 Documentação Adicional

- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Migration Guide](./MIGRATION.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solução:
- Verifique se MongoDB está rodando
- Verifique se MONGODB_URI está correto em .env
- Para Atlas remoto, adicione IP à whitelist
```

### CORS Error

```
Access to XMLHttpRequest blocked by CORS

Solução:
- Verifique CORS_ORIGIN no backend .env
- Certifique-se que frontend está em porta correta
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3001

Solução:
npm run dev -- --port 3002
```

## 📄 Licença

ISC

## 👥 Contribuing

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes.

## 📞 Suporte

Para suporte, abra uma issue ou entre em contato via email.

---

**Versão:** 1.0.0  
**Data:** 2024  
**Status:** Em desenvolvimento
