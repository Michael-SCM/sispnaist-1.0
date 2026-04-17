# 🧪 Guia de Testes - SISPATNAIST

## Estrutura de Testes

### Backend (Jest + Supertest)

```
backend/
├── src/
│   ├── __tests__/
│   │   ├── unit/
│   │   │   ├── masks.test.ts
│   │   │   ├── jwt.test.ts
│   │   │   └── validations.test.ts
│   │   ├── integration/
│   │   │   ├── auth.test.ts
│   │   │   ├── acidentes.test.ts
│   │   │   └── analytics.test.ts
│   │   └── e2e/
│   │       └── crud-flow.test.ts
```

### Frontend (Jest + React Testing Library)

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── unit/
│   │   │   ├── masks.test.ts
│   │   │   ├── hooks.test.ts
│   │   │   └── services.test.ts
│   │   ├── components/
│   │   │   ├── DataTable.test.tsx
│   │   │   ├── FormFields.test.tsx
│   │   │   └── KPICard.test.tsx
│   │   └── e2e/
│   │       └── auth-flow.test.tsx
```

---

## 📋 Como Rodar os Testes

### Backend

```bash
# Instalar dependências de teste
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest

# Rodar todos os testes
npm test

# Rodar testes com coverage
npm run test:coverage

# Rodar em modo watch
npm run test:watch
```

### Frontend

```bash
# Instalar dependências de teste
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Rodar todos os testes
npm test

# Rodar com coverage
npm run test:coverage
```

---

## ✅ Testes Prioritários

### 1. **Testes Unitários (Rápidos, isolados)**

**Backend:**
- ✅ Utilitários (máscaras, validações)
- ✅ JWT (generate/verify token)
- ✅ Services (lógica de negócio)

**Frontend:**
- ✅ Utilitários (máscaras, hooks)
- ✅ Componentes simples (KPICard, Buttons)
- ✅ Services (API calls mockadas)

### 2. **Testes de Integração (API + DB)**

**Backend:**
- Auth flow (register → login → me)
- CRUD completo (criar → listar → obter → atualizar → deletar)
- Analytics endpoints

### 3. **Testes E2E (Fluxo completo)**

**Frontend:**
- Login → Dashboard → CRUD → Logout
- Filtros e busca
- Formulários com validação

---

## 📊 Coverage Target

```
Backend:
├── Statements: 80%
├── Branches: 70%
├── Functions: 80%
└── Lines: 80%

Frontend:
├── Components: 70%
├── Utils: 90%
├── Services: 85%
└── Hooks: 80%
```

---

## 🚀 Exemplo de Teste Completo

### Teste de Integração - Auth Flow

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Auth Integration', () => {
  const testUser = {
    cpf: '123.456.789-09',
    nome: 'Test User',
    email: 'test@example.com',
    senha: 'password123',
  };

  it('deve registrar novo usuário', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.nome).toBe(testUser.nome);
  });

  it('deve fazer login e retornar token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        senha: testUser.senha,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('token');
  });
});
```

---

## 📝 Checklist de Testes

### Backend Unit Tests
- [x] Máscaras e formatações
- [ ] JWT utilities
- [ ] Joi validations
- [ ] Services methods

### Backend Integration Tests
- [ ] Auth endpoints
- [ ] Acidentes CRUD
- [ ] Analytics endpoints

### Frontend Unit Tests
- [x] Máscaras utilities
- [ ] Custom hooks (useDebounce, useLocalStorage)
- [ ] API services

### Frontend Component Tests
- [ ] KPICard
- [ ] DataTable
- [ ] FormFields (all inputs)
- [ ] Charts components

### E2E Tests
- [ ] Auth flow
- [ ] CRUD flow
- [ ] Dashboard loading

---

**Status:** Infraestrutura de testes criada e guia documentado  
**Próximo:** Implementar testes específicos conforme necessidade
