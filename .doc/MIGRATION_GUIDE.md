# Guia de Migração: PHP/MySQL → React/Node.js/MongoDB

## 📋 Visão Geral da Migração

Este documento descreve o processo de transformação do SISPNAIST de uma arquitetura PHP/MySQL tradicional para uma arquitetura moderna com React, Node.js e MongoDB.

## 🔄 Processo de Migração

### Fase 1: Preparação (Semana 1)
- ✅ **Backup de dados** - Fazer backup completo do MySQL
- ✅ **Análise de schema** - Revisar estrutura do banco MySQL
- ✅ **Mapeamento de entidades** - Mapear tabelas MySQL para documentos MongoDB
- ✅ **Inventário de funcionalidades** - Listar todas as features do sistema atual

### Fase 2: Configuração Backend (Semana 1-2)
- ✅ **Setup Node.js + Express** - Criar base do servidor
- ✅ **Configurar MongoDB** - Criar schemas e modelos
- ✅ **Implementar autenticação** - JWT e permissões
- ✅ **Criar API stubs** - Endpoints básicos
- ✅ **Testes unitários** - Testar serviços

### Fase 3: Configuração Frontend (Semana 2)
- ✅ **Setup React + TypeScript** - Criar base React
- ✅ **Configurar roteamento** - React Router
- ✅ **Integrar API** - Axios + Zustand
- ✅ **Componentes reutilizáveis** - Build component library
- ✅ **Layout base** - Header, Footer, Sidebar

### Fase 4: Migração de Dados (Semana 3)
- **Script de migração Python/Node.js** - Converter dados
- **Validação de integridade** - Verificar dados migrados
- **Testes de consistência** - Comparar antes/depois
- **Backup dos dados novos** - MongoDB backup

### Fase 5: Implementação de Features (Semana 3-4)
- **Gestão de Usuários** - CRUD de usuários
- **Gestão de Empresas** - CRUD de empresas
- **Gestão de Acidentes** - Sistema de registro de acidentes
- **Gestão de Doenças** - Histórico de doenças
- **Gestão de Vacinações** - Registro de vacinações
- **Dashboard** - Visualização de dados

### Fase 6: Testes & Deploy (Semana 4-5)
- **Testes de integração** - API + BD
- **Testes E2E** - Fluxos completos
- **Performance testing** - Otimização
- **Deploy staging** - Ambiente de teste
- **Deploy produção** - Lançamento

## 📊 Mapeamento de Entidades

### Tabelas MySQL → Collections MongoDB

```
MySQL Tabelas (76+)              MongoDB Collections (24)
├── usuarios                      → usuarios
├── empresas                      → empresas
├── unidades                      → unidades
├── acidentes_trabalho            → acidentes
├── acidentes_mat_biologico       → acidentes_mat_biologico
├── doencas                       → doencas
├── vacinacoes                    → vacinacoes
├── exposicoes                    → exposicoes
├── violencia                     → violencia
├── audit_log                     → audit_logs
└── configs                       → configs
```

## 🔑 Mudanças Principais

### Antes (PHP/MySQL)
```php
// DAO Pattern
class TrabalhadorDAO {
    public function obter($id) {
        $sql = "SELECT * FROM trabalhadores WHERE id = ?";
        $stmt = $conexao->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

// DTO
class TrabalhadorDTO {
    public $id;
    public $nome;
    public $cpf;
    // getters e setters...
}

// Apresentação
echo $trabalhador->getNome();
```

### Depois (React/Node.js/MongoDB)
```typescript
// Service (substitui DAO + DTO)
class UserService {
  async getUser(id: string): Promise<IUser> {
    return User.findById(id);
  }
}

// Type (define estrutura)
interface IUser {
  _id?: string;
  nome: string;
  cpf: string;
}

// React Component
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<IUser | null>(null);
  
  useEffect(() => {
    userService.getUser(userId).then(setUser);
  }, [userId]);
  
  return <div>{user?.nome}</div>;
}
```

## 🗄️ Modelos MongoDB

### User Collection
```javascript
{
  _id: ObjectId,
  cpf: String,           // Unique
  nome: String,
  email: String,         // Unique
  senha: String,         // Hash bcrypt
  matricula: String,
  dataNascimento: Date,
  sexo: String,          // 'M', 'F'
  telefone: String,
  endereco: {
    logradouro: String,
    numero: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String
  },
  empresa: ObjectId,     // Ref: Empresa
  unidade: ObjectId,     // Ref: Unidade
  departamento: String,
  cargo: String,
  dataAdmissao: Date,
  perfil: String,        // 'admin', 'gestor', 'trabalhador'
  ativo: Boolean,
  dataCriacao: Date,
  dataAtualizacao: Date
}
```

### Acidente Collection
```javascript
{
  _id: ObjectId,
  dataAcidente: Date,
  horario: String,
  trabalhadorId: ObjectId,   // Ref: User
  tipoAcidente: String,      // Enum
  descricao: String,
  local: String,
  lesoes: [String],
  feriado: Boolean,
  comunicado: Boolean,
  dataComunicacao: Date,
  status: String,            // 'Aberto', 'Em Análise', 'Fechado'
  dataCriacao: Date,
  dataAtualizacao: Date
}
```

## 🔀 Fluxo de Autenticação

### Antes (Sessions PHP)
```
1. Usuario faz login
2. PHP cria SESSION: $_SESSION['user_id']
3. Cookie PHPSESSID armazenado
4. Verificação em cada request
5. Logout limpa SESSION
```

### Depois (JWT)
```
1. Usuario faz login
2. Backend gera JWT token
3. Frontend armazena em localStorage
4. Cada request envia: Authorization: Bearer <token>
5. Backend valida signature
6. Logout remove token do localStorage
```

## 📁 Estrutura de Pastas

### Backend Node.js (MVC Moderno)
```
backend/src/
├── config/              # Configurações
│   ├── database.ts      # MongoDB connection
│   └── config.ts        # Env variables
├── models/              # Schemas Mongoose
│   ├── User.ts
│   ├── Acidente.ts
│   └── ...
├── controllers/         # HTTP logic
│   ├── authController.ts
│   └── ...
├── services/            # Business logic
│   ├── AuthService.ts
│   └── ...
├── routes/              # Route definitions
│   ├── auth.ts
│   └── ...
├── middleware/          # Middlewares
│   ├── auth.ts          # JWT verification
│   ├── errorHandler.ts
│   └── validation.ts
├── types/               # TypeScript interfaces
│   └── index.ts
├── utils/               # Utilities
│   ├── jwt.ts
│   └── validations.ts
├── scripts/             # Migration scripts
│   └── migrate.ts
├── app.ts               # Express setup
└── server.ts            # Server entry point
```

### Frontend React
```
frontend/src/
├── types/               # TypeScript interfaces
├── services/            # API calls
├── store/               # Zustand state
├── hooks/               # Custom hooks
├── components/          # Reusable components
├── pages/               # Page components
├── layouts/             # Layout components
├── utils/               # Utilities
├── styles/              # CSS/Tailwind
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

## 🚀 Deployment

### Backend (Node.js)
```bash
# Build e deploy
npm run build
npm start

# Usando PM2
pm2 start dist/server.js --name sispnaist-api

# Usando Docker
docker build -t sispnaist-api .
docker run -p 3001:3001 sispnaist-api
```

### Frontend (React)
```bash
# Build
npm run build

# Deploy em static hosting (Vercel, Netlify, S3)
npm run build
# Fazer upload da pasta 'dist/' para host

# Ou com Docker
docker build -t sispnaist-web .
docker run -p 3000:3000 sispnaist-web
```

## ⚡ Perfor Performance

### Otimizações Implementadas

1. **MongoDB Indexing**
   - Index em `cpf`, `email` para buscas rápidas
   - Compound indexes para queries comuns

2. **API Response Caching**
   - Redis para cache de dados frequentes
   - TTL configurável por endpoint

3. **Frontend Optimization**
   - Code splitting com React.lazy
   - Image optimization
   - Tree shaking com Vite

4. **Database Queries**
   - Pagination para listas grandes
   - Projection para retornar apenas campos necessários
   - Aggregation pipeline para relatórios

## 🔒 Segurança

### Implementações de Segurança

1. **Autenticação & Autorização**
   - JWT com expiração
   - Role-based access control (RBAC)
   - Rate limiting em endpoints críticos

2. **Validação de Dados**
   - Schema validation (Joi)
   - Type checking (TypeScript)
   - Sanitização de input

3. **Criptografia**
   - Hash bcrypt para passwords
   - HTTPS em produção
   - Secrets não em versão control

4. **Database Security**
   - Mongoose schema validation
   - Parameterized queries
   - MongoDB user roles

## 📈 Próximas Etapas Recomendadas

1. **Short Term (1-2 meses)**
   - Implementar todos os CRUD endpoints
   - Dashboard com gráficos
   - Relatórios em PDF
   - Email notifications

2. **Medium Term (2-3 meses)**
   - Mobile App (React Native)
   - Real-time notifications (WebSocket)
   - Advanced analytics
   - File upload/storage

3. **Long Term (3+ meses)**
   - Machine learning insights
   - Integração com ERPs
   - API publica para partners
   - Internacionalização (i18n)

## 📞 Suporte

Para dúvidas durante a migração:
- Documentação: `./docs/`
- Issues: `./issues/`
- Email: support@sispnaist.com

---

**Versão:** 1.0.0  
**Última atualização:** 2024
