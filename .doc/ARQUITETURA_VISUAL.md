# 🏗️ ARQUITETURA VISUAL - SISPATNAIST

## Fluxo Geral da Aplicação

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUÁRIO FINAL                            │
│                   (Browser + Mobile Web)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                   ┌───────▼────────┐
                   │   FRONTEND     │
                   │    (React)     │
                   └───────┬────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │  • Pages (Login, Register, Dashboard)
        │  • Components (Header, Footer)
        │  • Hooks (useAuth, useForm, useAsync)
        │  • Store (Zustand authStore)
        │  • Services (axios api calls)
        │  • TypeScript Types
        │  • Tailwind CSS
        └──────────────────┬──────────────────┘
                           │
                ┌──────────▼──────────┐
                │  HTTP REST API      │
                │  (Express Routes)   │
                └──────────┬──────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │        BACKEND (Node.js)           │
        │                                    │
        │  ┌─────────────────────────────┐  │
        │  │  Controllers                │  │
        │  │  • authController           │  │
        │  │  • acidenteController*      │  │
        │  │  • doencaController*        │  │
        │  │  • vacinacaoController*     │  │
        │  └─────────────────────────────┘  │
        │                                    │
        │  ┌─────────────────────────────┐  │
        │  │  Services                   │  │
        │  │  • AuthService              │  │
        │  │  • AcidenteService*         │  │
        │  │  • DoencaService*           │  │
        │  │  • VacinacaoService*        │  │
        │  └─────────────────────────────┘  │
        │             ▲       │              │
        │             │       ▼              │
        │  ┌─────────────────────────────┐  │
        │  │  Middleware                 │  │
        │  │  • auth (JWT validation)    │  │
        │  │  • validation (Joi schemas) │  │
        │  │  • errorHandler             │  │
        │  └─────────────────────────────┘  │
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │   PERSISTENCE LAYER                   │
        │                                       │
        │  ┌──────────────────────────────┐   │
        │  │  Mongoose Models             │   │
        │  │  • User                      │   │
        │  │  • Acidente                  │   │
        │  │  • Doenca                    │   │
        │  │  • Empresa                   │   │
        │  │  • Unidade                   │   │
        │  │  • Vacinacao                 │   │
        │  └──────────────────────────────┘   │
        │                │                     │
        │                ▼                     │
        │  ┌──────────────────────────────┐   │
        │  │  MongoDB Database            │   │
        │  │  • Collections (6+)          │   │
        │  │  • Indexes                   │   │
        │  │  • Validations               │   │
        │  └──────────────────────────────┘   │
        └────────────────────────────────────┘

* Controllers/Services com star = em progresso, exemplos disponíveis
```

---

## Arquitetura Detalhada - Backend

```
REQUEST HTTP
    │
    ▼
┌──────────────────────────┐
│  Express Server          │
│  app.ts                  │
└──────────┬───────────────┘
           │
    ┌──────▼──────┐
    │  Router     │
    │  routes/    │
    └──────┬──────┘
           │
    ┌──────▼──────────────────────────┐
    │  Middleware Chain               │
    │  ├─ errorHandler (wrapper)      │
    │  ├─ auth (verify JWT)           │
    │  ├─ validate (Joi schema)       │
    │  └─ asyncHandler (try/catch)   │
    └──────┬────────────────────────┬─┘
           │                        │
      protegido               público
           │                        │
    ┌──────▼────────┐      ┌────────▼────────┐
    │ authController│      │ publicController│
    │ (JWT required)│      │                 │
    └──────┬────────┘      └────────┬────────┘
           │                        │
    ┌──────▼────────────────────────▼────────┐
    │  Services                              │
    │  ├─ AuthService                        │
    │  ├─ AcidenteService (exemplo)         │
    │  ├─ DoencaService (exemplo)           │
    │  └─ VacinacaoService (exemplo)        │
    └──────┬──────────────────────────────┬──┘
           │                              │
    ┌──────▼─────────┐            ┌───────▼────────┐
    │ Mongoose Model │            │ Validações     │
    │                │            │ (utils/joi)    │
    │ ├─ User        │            └────────────────┘
    │ ├─ Acidente    │
    │ ├─ Doenca      │
    │ ├─ Empresa     │
    │ ├─ Unidade     │
    │ └─ Vacinacao   │
    └──────┬─────────┘
           │
    ┌──────▼──────────────┐
    │ MongoDB Connection  │
    │ config/db.ts        │
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │ MongoDB Instance    │
    │ (Local/Atlas)       │
    │                     │
    │ Collections:        │
    │ ├─ users           │
    │ ├─ acidentes       │
    │ ├─ doencas         │
    │ ├─ empresas        │
    │ ├─ unidades        │
    │ └─ vacinacoes      │
    └─────────────────────┘

RESPONSE JSON
    │
    └─ Back to Client
```

### Fluxo de Autenticação JWT

```
LOGIN REQUEST
    │
    ├─ POST /api/auth/login
    │  Body: { email, senha }
    │
    ▼
┌─────────────────────┐
│ authController.login│
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ AuthService.login(email, pwd)    │
│                                  │
│ 1. Find user by email            │
│ 2. bcryptjs.compare(pwd, hash)  │
│ 3. generateToken() if valid      │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ generateToken(payload)           │
│ jwt.sign(payload, SECRET)        │
│ Returns: "eyJhbGc..."            │
└──────┬───────────────────────────┘
       │
       ▼
RESPONSE 200
{
  "status": "success",
  "data": {
    "user": { id, nome, email, perfil },
    "token": "eyJhbGc..."
  }
}
       │
       ▼
   CLIENT STORES:
   ├─ localStorage.setItem('token', token)
   ├─ localStorage.setItem('user', user)
   └─ Zustand store.setAuth(user, token)
       │
       ▼
   FUTURE REQUESTS:
   ├─ Authorization: Bearer eyJhbGc...
   │
   ▼
   ┌──────────────────────┐
   │ authMiddleware       │
   │ jwt.verify(token)    │
   └────────┬─────────────┘
            │
       ├─ Valid ✅ → attach req.user → continue
       └─ Invalid ❌ → throw 401 Unauthorized
```

---

## Arquitetura Frontend React

```
┌─────────────────────────────────────┐
│  App.tsx (Root Component)           │
│  • Router setup                     │
│  • Initialize auth on mount         │
│  • Toaster notifications            │
└──────────────┬──────────────────────┘
               │
     ┌─────────▼────────────┐
     │  React Router v6     │
     │  <Routes>            │
     └─────────┬────────────┘
               │
       ┌───────┴───────┬──────────┬────────────┬──────────┐
       │               │          │            │          │
    Home           Login      Register     Dashboard    NotFound
    (/)          (/login)   (/register)   (/dashboard) (*all)
       │               │          │            │
       ▼               ▼          ▼            ▼
   ┌────────────────────────────────────────────────────┐
   │  Component Logic                                   │
   │  ├─ useForm hook (form state)                     │
   │  ├─ useAsync hook (API calls)                     │
   │  ├─ useAuth hook (Zustand store)                  │
   │  ├─ authService calls                            │
   │  └─ Toast notifications                          │
   │                                                  │
   │  ├─ Form Validation                              │
   │  ├─ Error Handling                               │
   │  └─ Loading States                               │
   └────────────────────────────────────────────────────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
 LAYOUT WRAPPER        PROTECTED ROUTE
 <MainLayout>          <ProtectedRoute>
 ├─ Header             ├─ Check auth
 ├─ Main (children)    ├─ Check role
 └─ Footer             └─ Redirect if fail

State Management Layer
│
▼
┌────────────────────────────────────────┐
│  Zustand (authStore)                   │
│                                        │
│  State:                                │
│  ├─ user: IUser | null                │
│  ├─ token: string | null              │
│  └─ isAuthenticated: boolean          │
│                                        │
│  Actions:                              │
│  ├─ setAuth(user, token)              │
│  ├─ clearAuth()                       │
│  ├─ initializeAuth()                  │
│  └─ persistence: localStorage         │
│                                        │
│  Usage: const auth = useAuth()        │
└────────────────────────────────────────┘
       │
       ▼
     localStorage
     ├─ 'token'
     └─ 'user'

API Service Layer
│
▼
┌────────────────────────────────────────┐
│  services/api.ts (Axios instance)      │
│                                        │
│  Create:                               │
│  └─ baseURL: /api (mapeado no .env)  │
│                                        │
│  Interceptors:                         │
│  ├─ Request: adiciona Bearer token    │
│  ├─ Response: trata 401 → logout      │
│  └─ Error: parse error messages       │
└──────┬─────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│  services/authService.ts               │
│                                        │
│  Methods:                              │
│  ├─ login(email, pwd)                 │
│  ├─ register(data)                    │
│  ├─ getMe()                           │
│  └─ updateProfile(data)               │
└────────────────────────────────────────┘

HTTP Requests
│
▼
http://localhost:3001/api
```

---

## Stack Tecnológico - Visão Geral

```
┌───────────────────────────────────────────────────────────────┐
│                        FRONTEND (Port 3000)                   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  React 18 + TypeScript + Vite                                │
│  ├─ Components (Header, Footer, ProtectedRoute)             │
│  ├─ Pages (Home, Login, Register, Dashboard)                │
│  ├─ Hooks (useAuth, useForm, useAsync)                      │
│  ├─ Store (Zustand)                                         │
│  ├─ Services (Axios)                                        │
│  └─ Styling (Tailwind CSS + postcss)                        │
│                                                               │
│  Dev Tools:                                                   │
│  ├─ TypeScript 5.3                                          │
│  ├─ Vite 5.0 (hot reload)                                   │
│  ├─ ESLint 8.55                                             │
│  └─ Prettier 3.1 (formatting)                               │
│                                                               │
│  Libraries:                                                   │
│  ├─ React Router 6.20                                       │
│  ├─ React Query 5.25                                        │
│  ├─ React Hot Toast 2.4                                     │
│  ├─ date-fns 2.30                                           │
│  └─ Recharts 2.10                                           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                            △
                            │ HTTP (JSON)
                            │
┌───────────────────────────────────────────────────────────────┐
│                      BACKEND API (Port 3001)                  │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Node.js + Express + TypeScript                             │
│  ├─ Controllers (auth, acidentes*, doenças*, etc)           │
│  ├─ Services (business logic)                               │
│  ├─ Models (Mongoose schemas)                               │
│  ├─ Routes (REST endpoints)                                 │
│  ├─ Middleware (auth, validation, errors)                   │
│  ├─ Utils (JWT, validations)                                │
│  └─ Types (TypeScript interfaces)                           │
│                                                               │
│  Dev Tools:                                                   │
│  ├─ TypeScript 5.3                                          │
│  ├─ tsx 4.7 (dev hot reload)                                │
│  ├─ ts-node 10.9 (migration scripts)                        │
│  ├─ ESLint 8.55                                             │
│  └─ Jest (testing ready)                                    │
│                                                               │
│  Libraries:                                                   │
│  ├─ Express 4.18                                            │
│  ├─ Mongoose 8.0                                            │
│  ├─ bcryptjs 2.4                                            │
│  ├─ jsonwebtoken 9.0                                        │
│  ├─ Joi 17.11 (validation)                                  │
│  ├─ Multer 1.4 (file uploads)                               │
│  ├─ Helmet 7.1 (security)                                   │
│  ├─ CORS 2.8                                                │
│  └─ Axios 1.6                                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                            △
                            │ MongoDB Protocol
                            │
        ┌───────────────────────────────────┐
        │  MONGODB DATABASE (Port 27017)    │
        ├───────────────────────────────────┤
        │                                   │
        │  Collections:                     │
        │  ├─ users (auth data)            │
        │  ├─ acidentes                    │
        │  ├─ doencas                      │
        │  ├─ empresas                     │
        │  ├─ unidades                     │
        │  └─ vacinacoes                   │
        │                                   │
        │  Features:                        │
        │  ├─ Indexes (performance)        │
        │  ├─ Validations (Mongoose)       │
        │  ├─ Relationships (populate)     │
        │  └─ Timestamps (created/updated) │
        │                                   │
        │  Options:                         │
        │  ├─ MongoDB Local                │
        │  └─ MongoDB Atlas (Cloud)        │
        │                                   │
        └───────────────────────────────────┘
```

---

## Fluxo Típico de Uso - Registro e Primeiro Login

```
1. USUÁRIO ACESSA APP
   http://localhost:3000
   │
   ▼
2. HOME PAGE CARREGA (Public)
   ├─ Header com logo
   ├─ Links para Login/Register
   └─ App.tsx chama initializeAuth()
   
3. CLICA EM "CADASTRE-SE"
   → Navega para /register (Register component)
   │
   ▼
4. PREENCHE FORM
   ├─ Nome: Alberto Silva
   ├─ Email: alberto@email.com
   ├─ CPF: 123.456.789-00
   ├─ Senha: Password123
   └─ Confirma Senha: Password123
   
5. CLICA "CADASTRAR"
   │
   ▼ useForm hook
   
6. VALIDAÇÃO UX (client-side)
   ├─ Senha === ConfirmaSenha ✓
   ├─ Email válido ✓
   ├─ CPF formato válido ✓
   └─ Continue...
   
7. ENVIA REQUEST
   POST http://localhost:3001/api/auth/register
   Body: {
     "nome": "Alberto Silva",
     "email": "alberto@email.com",
     "cpf": "123.456.789-00",
     "senha": "Password123"
   }
   
8. BACKEND PROCESSA
   │
   ├─ authController.register()
   │  └─ chama authService.register()
   │
   ├─ AuthService.register()
   │  ├─ Verifica se email existente → ✓ não existe
   │  ├─ Verifica se cpf existente → ✓ não existe
   │  ├─ Cria novo User em RAM
   │  ├─ Hash senha com bcryptjs → $2b$10$...
   │  ├─ Salva em MongoDB → {_id, nome, email, cpf, senha_hash}
   │  ├─ Gera JWT token
   │  │  jwt.sign(
   │  │    {id, cpf, email, perfil},
   │  │    SECRET_KEY,
   │  │    {expiresIn: "7d"}
   │  │  )
   │  │  → "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   │  └─ Retorna { user, token }
   │
   ├─ authController retorna 201
   │  Response: {
   │    "status": "success",
   │    "data": {
   │      "user": {
   │        "_id": "507f1f77bcf86cd799439011",
   │        "nome": "Alberto Silva",
   │        "email": "alberto@email.com",
   │        "cpf": "123.456.789-00",
   │        "perfil": "trabalhador",
   │        "ativo": true
   │      },
   │      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   │    }
   │  }

9. FRONTEND RECEBE Response
   │
   └─ authService.register() resolve com { user, token }

10. ZUSTAND STORE ATUALIZA
    │
    └─ useAuthStore.setAuth(user, token)
       ├─ Salva user em localStorage
       ├─ Salva token em localStorage
       ├─ Atualiza estado Zustand
       └─ isAuthenticated = true
   
11. TOAST NOTIFICATION
    ✓ "Cadastro realizado com sucesso!"
    
12. REDIRECIONA PARA /dashboard
    │
    ▼
13. ProtectedRoute verifica:
    ├─ isAuthenticated = true ✓
    ├─ user existe ✓
    └─ Permite acesso
    
14. DASHBOARD CARREGA
    ├─ MainLayout
    │  ├─ Header (logo, user name, logout button)
    │  ├─ Main content
    │  └─ Footer
    ├─ Cards de boas-vindas
    ├─ Informações do usuário
    └─ Próximos passos / Quick start links

15. USUÁRIO FAZ LOGOUT
    │
    ├─ Clica no botão "Logout" no Header
    │  └─ Header.tsx dispara handleLogout()
    │  │  └─ useAuthStore.clearAuth()
    │
    ├─ clearAuth() faz:
    │  ├─ localStorage.removeItem('user')
    │  ├─ localStorage.removeItem('token')
    │  └─ Zustand: user=null, token=null, isAuth=false
    
    └─ Redireciona para /login

16. PRÓXIMO LOGIN (mesmo usuário)
    │
    POST /api/auth/login
    ├─ Find user by email → Encontra
    ├─ bcryptjs.compare(pwd_Digite, pwd_Hash no DB)
    ├─ Senhas conferem ✓
    ├─ Gera novo token
    └─ Login bem-sucedido!
```

---

## Próximas Etapas - Fluxo de Acidentes (Exemplo)

```
QUANDO IMPLEMENTADO, O FLUXO SERÁ:

1. USUÁRIO ACESSA /acidentes
   │
   ├─ ProtectedRoute valida auth
   └─ AcidentesPage carrega
   
2. Page dispara useEffect
   │
   └─ acidenteService.listar(
       { page: 1, limit: 10 }
     )
   
3. Axios envia:
   GET /api/acidentes?page=1&limit=10
   Headers: { Authorization: "Bearer token..." }
   │
   ▼ Backend Middleware
   
4. authMiddleware.verify(token)
   ├─ jwt.verify(token, SECRET)
   ├─ Valida assinatura e expiração ✓
   ├─ Attach user dados em req.user
   └─ Continua pro controller
   
5. acidenteController.listar()
   │
   └─ acidenteService.listar(filtros)
   
6. AcidenteService.listar()
   │
   ├─ Acidente.find(query)
   │  .populate('trabalhadorId')
   │  .skip(skip)
   │  .limit(limit)
   │  .sort()
   │
   └─ Retorna { data: [...], total, page, totalPages }
   
7. Backend Retorna 200
   Response: {
     "status": "success",
     "data": {
       "data": [
         {
           "_id": "...",
           "dataAcidente": "2024-04-08",
           "tipoAcidente": "Típico",
           "trabalhador": {
             "_id": "...",
             "nome": "Alberto Silva",
             "cpf": "..."
           },
           "status": "Aberto"
         },
         ...
       ],
       "total": 47,
       "page": 1,
       "limit": 10,
       "totalPages": 5
     }
   }
   
8. Frontend Recebe e Renderiza
   │
   ├─ DataTable component mostra lista
   │  ├─ Colunas: Data, Tipo, Trabalhador, Status
   │  ├─ Paginação: Página 1 de 5
   │  └─ Ações: Ver, Editar, Deletar
   │
   └─ Estado atualiza em Zustand store
   
9. USUÁRIO CLICA EM "EDITAR" num acidente
   │
   ├─ Navega para /acidentes/:id/editar
   ├─ Page dispara GET /api/acidentes/:id
   └─ Popula form com dados
   
10. USUÁRIO EDITA DADOS
    │
    └─ handleSubmit dispara PUT /api/acidentes/:id
       Body: { tipoAcidente, descricao, status, ... }
       │
       ▼ Backend
       
11. acidenteService.atualizar(id, data)
    │
    ├─ Validator valida dados com Joi
    ├─ Acidente.findByIdAndUpdate(id, data)
    ├─ MongoDB atualiza documento
    └─ Retorna documento atualizado
    
12. Frontend Recebe sucesso
    │
    ├─ Toast: ✓ "Acidente atualizado!"
    ├─ Fecha modal/form
    └─ Re-fetch lista de acidentes
    
13. Lista recarrega com dados novos
    │
    └─ Usuário vê mudança em tempo real
```

---

**Documento gerado:** 08/04/2026  
**Versão:** 1.0  
**Status:** Completo e Pronto para Implementação
